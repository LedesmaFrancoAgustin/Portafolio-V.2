/* <interactive-cloud> — painterly cloud that disperses into vapour around the pointer.
   WebGL: one warped/eroded texture quad + a particle field sampled from the image itself.
   Transparent background, responsive, pointer + touch, honours prefers-reduced-motion. */
(() => {
  if (customElements.get('interactive-cloud')) return;

  const NOISE = `
  float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i), b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float fbm(vec2 p){
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++){ s += a * vnoise(p); p *= 2.03; a *= 0.5; }
    return s;
  }`;

  const VS_QUAD = `
  attribute vec2 aUnit;
  uniform vec2 uOrigin, uSpan, uRes;
  uniform float uH;
  varying vec2 vUv, vPos;
  void main(){
    vUv = aUnit;
    vPos = vec2(aUnit.x, aUnit.y * uH);
    vec2 px = uOrigin + aUnit * uSpan;
    gl_Position = vec4(px.x / uRes.x * 2.0 - 1.0, 1.0 - px.y / uRes.y * 2.0, 0.0, 1.0);
  }`;

  const FS_QUAD = `
  precision highp float;
  varying vec2 vUv, vPos;
  uniform sampler2D uTex;
  uniform vec2 uCursor, uCVel;
  uniform float uAct, uRad, uTime, uStr, uBreathe, uGlow, uErode;
  ${NOISE}
  void main(){
    float t = uTime;
    vec2 uv = vUv;
    uv += vec2(sin(t * 0.31 + vUv.y * 7.0), cos(t * 0.24 + vUv.x * 5.5)) * 0.0024 * uBreathe;
    uv.y += sin(t * 0.17 + vUv.x * 2.2) * 0.0034 * uBreathe;

    vec2 dv = vPos - uCursor;
    float dist = length(dv);
    vec2 dir = dv / max(dist, 1e-4);
    vec2 tang = vec2(-dir.y, dir.x);

    // the influence area is dissolved by noise at the scale of the painted puffs,
    // so its boundary never reads as a circle
    float nLo = fbm(vUv * 11.0 + vec2(t * 0.22, -t * 0.18));
    float nHi = fbm(vUv * 34.0 - vec2(t * 0.13, t * 0.16));
    float radJ = uRad * (0.42 + 1.05 * nLo);
    float f = (1.0 - smoothstep(0.0, radJ, dist)) * uAct;
    f *= clamp(0.30 + 1.05 * nHi + 0.45 * nLo, 0.0, 1.3);

    uv += dir * (f * f) * 0.030 * uStr
        + tang * (nLo - 0.5) * f * 0.03 * uStr
        - uCVel * f * 0.014 * uStr;

    vec4 c = texture2D(uTex, uv);

    // erosion follows the artwork's own structure: puff rims and lit crests thin out
    // first, deep bodies hold together
    float e = 0.0022;
    float ax = texture2D(uTex, uv + vec2(e, 0.0)).a - texture2D(uTex, uv - vec2(e, 0.0)).a;
    float ay = texture2D(uTex, uv + vec2(0.0, e)).a - texture2D(uTex, uv - vec2(0.0, e)).a;
    float rim = clamp(length(vec2(ax, ay)) * 5.0, 0.0, 1.0);
    float lum = dot(c.rgb, vec3(0.34, 0.33, 0.33)) / max(c.a, 0.04);
    float m = fbm(uv * 46.0 + vec2(-t * 0.21, t * 0.25)) * 0.6
            + fbm(uv * 96.0 - t * 0.12) * 0.4;
    float bias = 0.42 * rim + 0.26 * lum + 0.72 * (m - 0.5);
    float hole = smoothstep(0.42, 1.02, f * f * 0.9 + bias) * uErode;
    c *= 1.0 - hole * 0.8;
    c.rgb += vec3(1.0, 0.44, 0.32) * f * (0.55 + 0.7 * nHi) * uGlow * 0.3 * c.a;
    gl_FragColor = c;
  }`;

  const VS_PT = `
  attribute vec2 aPos;
  attribute float aAlpha;
  attribute vec3 aColor;
  attribute float aSize;
  uniform vec2 uOrigin, uSpan, uRes;
  varying vec3 vColor;
  varying float vAlpha;
  void main(){
    vColor = aColor;
    vAlpha = aAlpha;
    vec2 px = uOrigin + aPos * uSpan.x;
    gl_PointSize = max(2.0, aSize * uSpan.x);
    gl_Position = vec4(px.x / uRes.x * 2.0 - 1.0, 1.0 - px.y / uRes.y * 2.0, 0.0, 1.0);
  }`;

  const FS_PT = `
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;
  void main(){
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = 1.0 - smoothstep(0.12, 1.0, d);
    a = a * a * vAlpha;
    if (a <= 0.002) discard;
    gl_FragColor = vec4(vColor * a, a);
  }`;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const sstep = (a, b, t) => { t = clamp((t - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const h21 = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123; return s - Math.floor(s); };
  const vnoise = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    let fx = x - ix, fy = y - iy;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    const a = h21(ix, iy), b = h21(ix + 1, iy), c = h21(ix, iy + 1), d = h21(ix + 1, iy + 1);
    return (a + (b - a) * fx) + ((c + (d - c) * fx) - (a + (b - a) * fx)) * fy;
  };

  class InteractiveCloud extends HTMLElement {
    static get observedAttributes(){
      return ['src', 'density', 'influence', 'strength', 'glow', 'erode', 'breathe'];
    }

    constructor(){
      super();
      this.o = { src: 'assets/cloud-alpha.png', density: 1, influence: 0.22, strength: 1, glow: 1, erode: 1, breathe: 1 };
      this.act = 0; this.targetAct = 0;
      this._settled = false; // true once every particle is back at rest and nothing is nearby to disturb it
      this.cur = [0.5, 0.2]; this.curRaw = [0.5, 0.2]; this.cvel = [0, 0];
      this.origin = [0, 0]; this.span = [1, 1];
      this.H = 0.4; this.dpr = 1;
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `<style>
        :host{ display:block; position:relative; width:100%; height:100%; background:transparent; pointer-events:none; }
        canvas{ display:block; width:100%; height:100%; background:transparent; }
      </style><canvas></canvas>`;
      this.canvas = root.querySelector('canvas');
    }

    attributeChangedCallback(name, _o, v){
      if (v === null) return;
      if (name === 'src') { this.o.src = v; if (this.gl) this.load(); return; }
      const n = parseFloat(v);
      if (!isFinite(n)) return;
      const was = this.o[name];
      this.o[name] = n;
      if (name === 'density' && this.img && was !== n) this.buildParticles();
    }

    connectedCallback(){
      for (const k of InteractiveCloud.observedAttributes){
        if (Object.prototype.hasOwnProperty.call(this, k)) { const v = this[k]; delete this[k]; this[k] = v; }
      }
      if (!this._inited){ this._inited = true; this.setup(); }
      else if (this.gl && !this._raf) {
        // re-entering the document after a disconnect (e.g. React StrictMode's
        // dev-mode mount/unmount probe): resume without rebuilding GL state
        this._ro && this._ro.observe(this);
        this.resize();
        this.last = performance.now();
        this._raf = requestAnimationFrame(t => this.frame(t));
        this.addPointerListeners();
      }
    }

    disconnectedCallback(){
      cancelAnimationFrame(this._raf);
      this._raf = null;
      this._ro && this._ro.disconnect();
      this.removePointerListeners();
    }

    /* The host is pointer-events:none — overlapping clouds share the same screen
       rectangle, and only the topmost box would ever see events otherwise. Instead
       each instance watches the pointer globally and tests its own alpha, so a
       cloud beneath another only reacts where it is actually visible. */
    addPointerListeners(){
      if (this._onWindowPointer) return;
      this._onWindowPointer = e => this.onPointer(e);
      window.addEventListener('pointermove', this._onWindowPointer, { passive: true });
      window.addEventListener('pointerdown', this._onWindowPointer, { passive: true });
    }

    removePointerListeners(){
      if (!this._onWindowPointer) return;
      window.removeEventListener('pointermove', this._onWindowPointer);
      window.removeEventListener('pointerdown', this._onWindowPointer);
      this._onWindowPointer = null;
    }

    setup(){
      const gl = this.canvas.getContext('webgl', {
        alpha: true, premultipliedAlpha: true, antialias: true, depth: false
      });
      if (!gl) return;
      this.gl = gl;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);

      this.pQuad = this.program(VS_QUAD, FS_QUAD);
      this.pPt = this.program(VS_PT, FS_PT);
      this.quadBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 1,0, 0,1, 1,1]), gl.STATIC_DRAW);
      this.dynBuf = gl.createBuffer();
      this.statBuf = gl.createBuffer();

      this._ro = new ResizeObserver(() => this.resize());
      this._ro.observe(this);
      this.resize();

      this.addPointerListeners();

      this.load();
      this.t0 = performance.now();
      this.last = this.t0;
      this._raf = requestAnimationFrame(t => this.frame(t));
    }

    program(vs, fs){
      const gl = this.gl;
      const mk = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s), src);
        return s;
      };
      const p = gl.createProgram();
      gl.attachShader(p, mk(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.warn(gl.getProgramInfoLog(p));
      const o = { p, u: {}, a: {} };
      const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < nu; i++){ const n = gl.getActiveUniform(p, i).name; o.u[n] = gl.getUniformLocation(p, n); }
      const na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
      for (let i = 0; i < na; i++){ const n = gl.getActiveAttrib(p, i).name; o.a[n] = gl.getAttribLocation(p, n); }
      return o;
    }

    load(){
      const gl = this.gl;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.img = img;
        this.H = img.height / img.width;
        this.tex = this.tex || gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.resize();
        this.buildParticles();
      };
      img.src = this.o.src;
    }

    /* Sample the artwork: every particle keeps the colour and size of the volume it came from. */
    buildParticles(){
      const img = this.img, gl = this.gl;
      const w = img.width, h = img.height;
      let cv = this._scratch;
      if (!cv){ cv = this._scratch = document.createElement('canvas'); cv.width = w; cv.height = h; }
      const cx = cv.getContext('2d', { willReadFrequently: true });
      cx.clearRect(0, 0, w, h);
      cx.drawImage(img, 0, 0);
      let data;
      try { data = cx.getImageData(0, 0, w, h).data; } catch (e) { this.n = 0; return; }

      // compact alpha-only lookup for pointer hit-testing (see onPointer)
      const alphaMap = new Uint8Array(w * h);
      for (let i = 0, p = 3; i < alphaMap.length; i++, p += 4) alphaMap[i] = data[p];
      this.alphaMap = alphaMap; this.alphaW = w; this.alphaH = h;

      let area = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 90) area++;
      const target = clamp(Math.round(18000 * (this.o.density || 1)), 1200, 26000);
      const step = Math.max(2, Math.sqrt(area / target));

      const ox = [], oy = [], col = [], sz = [];
      const at = (x, y) => data[((y * w + x) << 2) + 3];
      for (let gy = step * 0.5; gy < h; gy += step){
        for (let gx = step * 0.5; gx < w; gx += step){
          const x = Math.round(gx + (Math.random() - 0.5) * step * 1.1);
          const y = Math.round(gy + (Math.random() - 0.5) * step * 1.1);
          if (x < 1 || y < 1 || x >= w - 1 || y >= h - 1) continue;
          const a = at(x, y);
          if (a < 38) continue;
          if (a < 150 && Math.random() > a / 190) continue;
          let r = 0, g = 0, b = 0, aa = 0, cnt = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
            const i = (((y + dy) * w + (x + dx)) << 2);
            const al = data[i + 3] / 255;
            r += data[i] * al; g += data[i + 1] * al; b += data[i + 2] * al; aa += al; cnt++;
          }
          const k = aa > 0.001 ? 1 / aa : 0;
          ox.push(x / w); oy.push(y / w);
          col.push(r * k / 255, g * k / 255, b * k / 255);
          // interior volumes read as larger, softer puffs; rim wisps stay small
          const interior = (at(x - 2, y) + at(x + 2, y) + at(x, y - 2) + at(x, y + 2)) / 1020;
          let s = (step / w) * (1.35 + 1.2 * Math.random()) * (0.7 + 0.9 * interior);
          if (Math.random() < 0.18) s *= 2.0;
          sz.push(s);
        }
      }

      const n = sz.length;
      const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => sz[b] - sz[a]);
      this.n = n;
      this.ox = new Float32Array(n); this.oy = new Float32Array(n);
      this.px = new Float32Array(n); this.py = new Float32Array(n);
      this.vx = new Float32Array(n); this.vy = new Float32Array(n);
      this.seed = new Float32Array(n);
      this.rj = new Float32Array(n);      // per-particle reach: dissolves the circular boundary
      this.gain = new Float32Array(n);    // how readily this puff lets go
      this.vt = new Float32Array(n);      // staggered visibility threshold
      this.dyn = new Float32Array(n * 3);
      const stat = new Float32Array(n * 4);
      for (let j = 0; j < n; j++){
        const i = idx[j];
        this.ox[j] = this.px[j] = ox[i];
        this.oy[j] = this.py[j] = oy[i];
        this.seed[j] = Math.random() * 100;
        // coherent per-volume variation, so whole mechones drift rather than a flat disc
        const cn = vnoise(ox[i] * 13, oy[i] * 13) * 0.65 + vnoise(ox[i] * 31, oy[i] * 31) * 0.35;
        const rn = Math.random();
        this.rj[j] = 0.34 + 1.05 * cn + 0.22 * rn;
        this.gain[j] = 0.35 + 1.15 * (cn * 0.7 + rn * 0.3);
        this.vt[j] = 0.62 + 1.05 * (rn * 0.55 + cn * 0.45);
        stat[j * 4] = col[i * 3]; stat[j * 4 + 1] = col[i * 3 + 1]; stat[j * 4 + 2] = col[i * 3 + 2];
        stat[j * 4 + 3] = sz[i];
        this.dyn[j * 3] = ox[i]; this.dyn[j * 3 + 1] = oy[i];
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.statBuf);
      gl.bufferData(gl.ARRAY_BUFFER, stat, gl.STATIC_DRAW);
    }

    resize(){
      const gl = this.gl;
      const r = this._rect = this.getBoundingClientRect();
      const dpr = this.dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = Math.max(1, Math.round(r.width * dpr));
      const Hpx = Math.max(1, Math.round(r.height * dpr));
      if (this.canvas.width !== W || this.canvas.height !== Hpx){
        this.canvas.width = W; this.canvas.height = Hpx;
      }
      const scale = Math.min(W, Hpx / this.H) * 0.99;
      this.span = [scale, scale * this.H];
      this.origin = [(W - scale) / 2, (Hpx - scale * this.H) / 2];
      gl.viewport(0, 0, W, Hpx);
    }

    onPointer(e){
      // listens on window (the host is pointer-events:none), so every move must be
      // tested locally: only react when the pointer sits over this cloud's own
      // opaque pixels, not just inside its rectangular bounding box.
      // getBoundingClientRect() is only re-queried once per rendered frame (a
      // burst of pointermove events between two rAF ticks reuses the same
      // reading) rather than on every single event; this.last is the current
      // frame's timestamp, so comparing against it detects a new frame cheaply.
      if (this._rectStamp !== this.last) {
        this._rect = this.getBoundingClientRect();
        this._rectStamp = this.last;
      }
      const r = this._rect;
      const dpr = this.dpr;
      const x = ((e.clientX - r.left) * dpr - this.origin[0]) / this.span[0];
      const y = ((e.clientY - r.top) * dpr - this.origin[1]) / this.span[0];
      this.curRaw = [x, y];

      const v = this.H > 0 ? y / this.H : 0;
      let hit = false;
      if (x >= 0 && x <= 1 && v >= 0 && v <= 1 && this.alphaMap){
        const px = Math.min(this.alphaW - 1, Math.max(0, Math.floor(x * this.alphaW)));
        const py = Math.min(this.alphaH - 1, Math.max(0, Math.floor(v * this.alphaH)));
        hit = this.alphaMap[py * this.alphaW + px] > 24;
      }
      this.targetAct = hit ? 1 : 0;
    }

    frame(now){
      this._raf = requestAnimationFrame(t => this.frame(t));
      const gl = this.gl;
      const dt = Math.min(0.033, (now - this.last) / 1000) || 0.016;
      this.last = now;
      const time = (now - this.t0) / 1000;
      const rm = this.reduced;
      const str = this.o.strength * (rm ? 0.14 : 1);
      const erode = this.o.erode * (rm ? 0.18 : 1);
      const breathe = this.o.breathe * (rm ? 0.45 : 1);
      const rad = Math.max(0.04, this.o.influence);

      this.act += (this.targetAct - this.act) * Math.min(1, dt * (this.targetAct > this.act ? 7 : 4));
      const pcx = this.cur[0], pcy = this.cur[1];
      const lerp = Math.min(1, dt * 14);
      this.cur[0] += (this.curRaw[0] - this.cur[0]) * lerp;
      this.cur[1] += (this.curRaw[1] - this.cur[1]) * lerp;
      const vxr = (this.cur[0] - pcx) / dt, vyr = (this.cur[1] - pcy) / dt;
      this.cvel[0] += (clamp(vxr, -3, 3) - this.cvel[0]) * Math.min(1, dt * 8);
      this.cvel[1] += (clamp(vyr, -3, 3) - this.cvel[1]) * Math.min(1, dt * 8);
      const speed = Math.min(1.6, Math.hypot(this.cvel[0], this.cvel[1]));

      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!this.tex) return;

      // painted cloud: ambient drift, local warp + erosion near the pointer
      const q = this.pQuad;
      gl.useProgram(q.p);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf);
      gl.enableVertexAttribArray(q.a.aUnit);
      gl.vertexAttribPointer(q.a.aUnit, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.uniform1i(q.u.uTex, 0);
      gl.uniform2f(q.u.uOrigin, this.origin[0], this.origin[1]);
      gl.uniform2f(q.u.uSpan, this.span[0], this.span[1]);
      gl.uniform2f(q.u.uRes, this.canvas.width, this.canvas.height);
      gl.uniform1f(q.u.uH, this.H);
      gl.uniform2f(q.u.uCursor, this.cur[0], this.cur[1]);
      gl.uniform2f(q.u.uCVel, this.cvel[0], this.cvel[1]);
      gl.uniform1f(q.u.uAct, this.act);
      gl.uniform1f(q.u.uRad, rad);
      gl.uniform1f(q.u.uTime, time);
      gl.uniform1f(q.u.uStr, str);
      gl.uniform1f(q.u.uBreathe, breathe);
      gl.uniform1f(q.u.uGlow, this.o.glow * this.act);
      gl.uniform1f(q.u.uErode, erode);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (!this.n) return;

      // fully at rest: nothing displaced and no pointer nearby to disturb it.
      // Skip the whole per-particle simulation and point draw instead of
      // paying their cost every frame regardless of activity.
      if (this._settled && this.act < 1e-4 && this.targetAct === 0) return;

      const active = this.simulate(dt, time, rad, str, speed);
      this._settled = active === 0;

      const p = this.pPt;
      gl.useProgram(p.p);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.dynBuf);
      gl.bufferData(gl.ARRAY_BUFFER, this.dyn, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(p.a.aPos);
      gl.vertexAttribPointer(p.a.aPos, 2, gl.FLOAT, false, 12, 0);
      gl.enableVertexAttribArray(p.a.aAlpha);
      gl.vertexAttribPointer(p.a.aAlpha, 1, gl.FLOAT, false, 12, 8);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.statBuf);
      gl.enableVertexAttribArray(p.a.aColor);
      gl.vertexAttribPointer(p.a.aColor, 3, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(p.a.aSize);
      gl.vertexAttribPointer(p.a.aSize, 1, gl.FLOAT, false, 16, 12);
      gl.uniform2f(p.u.uOrigin, this.origin[0], this.origin[1]);
      gl.uniform2f(p.u.uSpan, this.span[0], this.span[1]);
      gl.uniform2f(p.u.uRes, this.canvas.width, this.canvas.height);
      gl.drawArrays(gl.POINTS, 0, this.n);
    }

    /* Spring-damped vapour: pushed away from the pointer, drawn elastically home in ~1.2 s. */
    simulate(dt, time, rad, str, speed){
      const { ox, oy, px, py, vx, vy, seed, rj, gain, vt, dyn, n } = this;
      const cx = this.cur[0], cy = this.cur[1];
      const act = this.act;
      const K = 55, C = 9.2;
      const push = 6.8 * str * (0.75 + 0.45 * speed);
      const cvx = this.cvel[0], cvy = this.cvel[1];
      let active = 0;
      for (let i = 0; i < n; i++){
        const dx0 = px[i] - ox[i], dy0 = py[i] - oy[i];
        const disp = Math.hypot(dx0, dy0);
        const ddx = ox[i] - cx, ddy = oy[i] - cy;
        const d = Math.hypot(ddx, ddy);
        const ri = rad * rj[i];
        let f = d < ri ? (1 - sstep(0, ri, d)) * gain[i] : 0;
        f *= act;
        if (f < 0.002 && disp < 2e-4 && Math.abs(vx[i]) + Math.abs(vy[i]) < 2e-3){
          if (dyn[i * 3 + 2] !== 0){ px[i] = ox[i]; py[i] = oy[i]; dyn[i * 3] = ox[i]; dyn[i * 3 + 1] = oy[i]; dyn[i * 3 + 2] = 0; }
          continue;
        }
        active++;
        let ax = -K * dx0 - C * vx[i];
        let ay = -K * dy0 - C * vy[i];
        if (f > 0.002){
          const inv = 1 / Math.max(d, 1e-4);
          const nx = ddx * inv, ny = ddy * inv;
          const ff = push * f * f;
          const s = seed[i];
          const curl = Math.sin(oy[i] * 21.0 + s + time * 0.9) * 0.45 + Math.cos(ox[i] * 17.0 - s + time * 0.6) * 0.35;
          ax += nx * ff - ny * curl * ff * 0.5 + cvx * f * 2.2;
          ay += ny * ff + nx * curl * ff * 0.5 + cvy * f * 2.2 - f * ff * 0.06;
        }
        vx[i] += ax * dt; vy[i] += ay * dt;
        px[i] += vx[i] * dt; py[i] += vy[i] * dt;
        const nd = Math.hypot(px[i] - ox[i], py[i] - oy[i]);
        const th = 0.010 * vt[i];
        const vis = sstep(th, th + 0.030 * vt[i], nd) * (1 - sstep(0.19, 0.44, nd));
        dyn[i * 3] = px[i]; dyn[i * 3 + 1] = py[i];
        dyn[i * 3 + 2] = vis * 0.4;
      }
      return active;
    }
  }

  for (const k of InteractiveCloud.observedAttributes){
    Object.defineProperty(InteractiveCloud.prototype, k, {
      get(){ return this.o[k]; },
      set(v){
        if (v == null) return;
        if (k === 'src') { this.o.src = String(v); if (this.gl) this.load(); return; }
        const n = parseFloat(v);
        if (!isFinite(n)) return;
        const was = this.o[k];
        this.o[k] = n;
        if (k === 'density' && this.img && was !== n) this.buildParticles();
      }
    });
  }

  customElements.define('interactive-cloud', InteractiveCloud);
})();
