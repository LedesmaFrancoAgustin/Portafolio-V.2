(()=>{if(customElements.get("interactive-cloud"))return;const J=`
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
  }`,K=`
  attribute vec2 aUnit;
  uniform vec2 uOrigin, uSpan, uRes;
  uniform float uH;
  varying vec2 vUv, vPos;
  void main(){
    vUv = aUnit;
    vPos = vec2(aUnit.x, aUnit.y * uH);
    vec2 px = uOrigin + aUnit * uSpan;
    gl_Position = vec4(px.x / uRes.x * 2.0 - 1.0, 1.0 - px.y / uRes.y * 2.0, 0.0, 1.0);
  }`,$=`
  precision highp float;
  varying vec2 vUv, vPos;
  uniform sampler2D uTex;
  uniform vec2 uCursor, uCVel;
  uniform float uAct, uRad, uTime, uStr, uBreathe, uGlow, uErode;
  ${J}
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
  }`,Z=`
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
  }`,tt=`
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;
  void main(){
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = 1.0 - smoothstep(0.12, 1.0, d);
    a = a * a * vAlpha;
    if (a <= 0.002) discard;
    gl_FragColor = vec4(vColor * a, a);
  }`,O=(v,e,t)=>v<e?e:v>t?t:v,N=(v,e,t)=>(t=O((t-v)/(e-v),0,1),t*t*(3-2*t)),H=(v,e)=>{const t=Math.sin(v*127.1+e*311.7)*43758.5453123;return t-Math.floor(t)},X=(v,e)=>{const t=Math.floor(v),i=Math.floor(e);let r=v-t,a=e-i;r=r*r*(3-2*r),a=a*a*(3-2*a);const o=H(t,i),u=H(t+1,i),m=H(t,i+1),l=H(t+1,i+1);return o+(u-o)*r+(m+(l-m)*r-(o+(u-o)*r))*a};class S extends HTMLElement{static get observedAttributes(){return["src","density","influence","strength","glow","erode","breathe"]}constructor(){super(),this.o={src:"assets/cloud-alpha.png",density:1,influence:.22,strength:1,glow:1,erode:1,breathe:1},this.act=0,this.targetAct=0,this._settled=!1,this.cur=[.5,.2],this.curRaw=[.5,.2],this.cvel=[0,0],this.origin=[0,0],this.span=[1,1],this.H=.4,this.dpr=1,this.reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;const e=this.attachShadow({mode:"open"});e.innerHTML=`<style>
        :host{ display:block; position:relative; width:100%; height:100%; background:transparent; pointer-events:none; }
        canvas{ display:block; width:100%; height:100%; background:transparent; }
      </style><canvas></canvas>`,this.canvas=e.querySelector("canvas")}attributeChangedCallback(e,t,i){if(i===null)return;if(e==="src"){this.o.src=i,this.gl&&this.load();return}const r=parseFloat(i);if(!isFinite(r))return;const a=this.o[e];this.o[e]=r,e==="density"&&this.img&&a!==r&&this.buildParticles()}connectedCallback(){for(const e of S.observedAttributes)if(Object.prototype.hasOwnProperty.call(this,e)){const t=this[e];delete this[e],this[e]=t}this._inited?this.gl&&!this._raf&&(this._ro&&this._ro.observe(this),this.resize(),this.last=performance.now(),this._raf=requestAnimationFrame(e=>this.frame(e)),this.addPointerListeners()):(this._inited=!0,this.setup())}disconnectedCallback(){cancelAnimationFrame(this._raf),this._raf=null,this._ro&&this._ro.disconnect(),this.removePointerListeners()}addPointerListeners(){this._onWindowPointer||(this._onWindowPointer=e=>this.onPointer(e),window.addEventListener("pointermove",this._onWindowPointer,{passive:!0}),window.addEventListener("pointerdown",this._onWindowPointer,{passive:!0}))}removePointerListeners(){this._onWindowPointer&&(window.removeEventListener("pointermove",this._onWindowPointer),window.removeEventListener("pointerdown",this._onWindowPointer),this._onWindowPointer=null)}setup(){const e=this.canvas.getContext("webgl",{alpha:!0,premultipliedAlpha:!0,antialias:!0,depth:!1});e&&(this.gl=e,e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.clearColor(0,0,0,0),this.pQuad=this.program(K,$),this.pPt=this.program(Z,tt),this.quadBuf=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,this.quadBuf),e.bufferData(e.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]),e.STATIC_DRAW),this.dynBuf=e.createBuffer(),this.statBuf=e.createBuffer(),this._ro=new ResizeObserver(()=>this.resize()),this._ro.observe(this),this.resize(),this.addPointerListeners(),this.load(),this.t0=performance.now(),this.last=this.t0,this._raf=requestAnimationFrame(t=>this.frame(t)))}program(e,t){const i=this.gl,r=(l,p)=>{const f=i.createShader(l);return i.shaderSource(f,p),i.compileShader(f),i.getShaderParameter(f,i.COMPILE_STATUS)||console.warn(i.getShaderInfoLog(f),p),f},a=i.createProgram();i.attachShader(a,r(i.VERTEX_SHADER,e)),i.attachShader(a,r(i.FRAGMENT_SHADER,t)),i.linkProgram(a),i.getProgramParameter(a,i.LINK_STATUS)||console.warn(i.getProgramInfoLog(a));const o={p:a,u:{},a:{}},u=i.getProgramParameter(a,i.ACTIVE_UNIFORMS);for(let l=0;l<u;l++){const p=i.getActiveUniform(a,l).name;o.u[p]=i.getUniformLocation(a,p)}const m=i.getProgramParameter(a,i.ACTIVE_ATTRIBUTES);for(let l=0;l<m;l++){const p=i.getActiveAttrib(a,l).name;o.a[p]=i.getAttribLocation(a,p)}return o}load(){const e=this.gl,t=new Image;t.crossOrigin="anonymous",t.onload=()=>{this.img=t,this.H=t.height/t.width,this.tex=this.tex||e.createTexture(),e.bindTexture(e.TEXTURE_2D,this.tex),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),this.resize(),this.buildParticles()},t.src=this.o.src}buildParticles(){const e=this.img,t=this.gl,i=e.width,r=e.height;let a=this._scratch;a||(a=this._scratch=document.createElement("canvas"),a.width=i,a.height=r);const o=a.getContext("2d",{willReadFrequently:!0});o.clearRect(0,0,i,r),o.drawImage(e,0,0);let u;try{u=o.getImageData(0,0,i,r).data}catch{this.n=0,this.dispatchEvent(new CustomEvent("cloudready",{bubbles:!0}));return}const m=new Uint8Array(i*r);for(let n=0,c=3;n<m.length;n++,c+=4)m[n]=u[c];this.alphaMap=m,this.alphaW=i,this.alphaH=r;let l=0;for(let n=3;n<u.length;n+=4)u[n]>90&&l++;const p=O(Math.round(18e3*(this.o.density||1)),1200,26e3),f=Math.max(2,Math.sqrt(l/p)),_=[],R=[],E=[],b=[],h=(n,c)=>u[(c*i+n<<2)+3];for(let n=f*.5;n<r;n+=f)for(let c=f*.5;c<i;c+=f){const A=Math.round(c+(Math.random()-.5)*f*1.1),x=Math.round(n+(Math.random()-.5)*f*1.1);if(A<1||x<1||A>=i-1||x>=r-1)continue;const U=h(A,x);if(U<38||U<150&&Math.random()>U/190)continue;let C=0,s=0,L=0,M=0;for(let T=-1;T<=1;T++)for(let F=-1;F<=1;F++){const y=(x+T)*i+(A+F)<<2,P=u[y+3]/255;C+=u[y]*P,s+=u[y+1]*P,L+=u[y+2]*P,M+=P}const B=M>.001?1/M:0;_.push(A/i),R.push(x/i),E.push(C*B/255,s*B/255,L*B/255);const W=(h(A-2,x)+h(A+2,x)+h(A,x-2)+h(A,x+2))/1020;let D=f/i*(1.35+1.2*Math.random())*(.7+.9*W);Math.random()<.18&&(D*=2),b.push(D)}const d=b.length,g=Array.from({length:d},(n,c)=>c).sort((n,c)=>b[c]-b[n]);this.n=d,this.ox=new Float32Array(d),this.oy=new Float32Array(d),this.px=new Float32Array(d),this.py=new Float32Array(d),this.vx=new Float32Array(d),this.vy=new Float32Array(d),this.seed=new Float32Array(d),this.rj=new Float32Array(d),this.gain=new Float32Array(d),this.vt=new Float32Array(d),this.dyn=new Float32Array(d*3);const w=new Float32Array(d*4);for(let n=0;n<d;n++){const c=g[n];this.ox[n]=this.px[n]=_[c],this.oy[n]=this.py[n]=R[c],this.seed[n]=Math.random()*100;const A=X(_[c]*13,R[c]*13)*.65+X(_[c]*31,R[c]*31)*.35,x=Math.random();this.rj[n]=.34+1.05*A+.22*x,this.gain[n]=.35+1.15*(A*.7+x*.3),this.vt[n]=.62+1.05*(x*.55+A*.45),w[n*4]=E[c*3],w[n*4+1]=E[c*3+1],w[n*4+2]=E[c*3+2],w[n*4+3]=b[c],this.dyn[n*3]=_[c],this.dyn[n*3+1]=R[c]}t.bindBuffer(t.ARRAY_BUFFER,this.statBuf),t.bufferData(t.ARRAY_BUFFER,w,t.STATIC_DRAW),this.dispatchEvent(new CustomEvent("cloudready",{bubbles:!0}))}resize(){const e=this.gl,t=this._rect=this.getBoundingClientRect(),i=this.dpr=Math.min(2,window.devicePixelRatio||1),r=Math.max(1,Math.round(t.width*i)),a=Math.max(1,Math.round(t.height*i));(this.canvas.width!==r||this.canvas.height!==a)&&(this.canvas.width=r,this.canvas.height=a);const o=Math.min(r,a/this.H)*.99;this.span=[o,o*this.H],this.origin=[(r-o)/2,(a-o*this.H)/2],e.viewport(0,0,r,a)}onPointer(e){this._rectStamp!==this.last&&(this._rect=this.getBoundingClientRect(),this._rectStamp=this.last);const t=this._rect,i=this.dpr,r=((e.clientX-t.left)*i-this.origin[0])/this.span[0],a=((e.clientY-t.top)*i-this.origin[1])/this.span[0];this.curRaw=[r,a];const o=this.H>0?a/this.H:0;let u=!1;if(r>=0&&r<=1&&o>=0&&o<=1&&this.alphaMap){const m=Math.min(this.alphaW-1,Math.max(0,Math.floor(r*this.alphaW))),l=Math.min(this.alphaH-1,Math.max(0,Math.floor(o*this.alphaH)));u=this.alphaMap[l*this.alphaW+m]>24}this.targetAct=u?1:0}frame(e){this._raf=requestAnimationFrame(w=>this.frame(w));const t=this.gl,i=Math.min(.033,(e-this.last)/1e3)||.016;this.last=e;const r=(e-this.t0)/1e3,a=this.reduced,o=this.o.strength*(a?.14:1),u=this.o.erode*(a?.18:1),m=this.o.breathe*(a?.45:1),l=Math.max(.04,this.o.influence);this.act+=(this.targetAct-this.act)*Math.min(1,i*(this.targetAct>this.act?7:4));const p=this.cur[0],f=this.cur[1],_=Math.min(1,i*14);this.cur[0]+=(this.curRaw[0]-this.cur[0])*_,this.cur[1]+=(this.curRaw[1]-this.cur[1])*_;const R=(this.cur[0]-p)/i,E=(this.cur[1]-f)/i;this.cvel[0]+=(O(R,-3,3)-this.cvel[0])*Math.min(1,i*8),this.cvel[1]+=(O(E,-3,3)-this.cvel[1])*Math.min(1,i*8);const b=Math.min(1.6,Math.hypot(this.cvel[0],this.cvel[1]));if(t.clear(t.COLOR_BUFFER_BIT),!this.tex)return;const h=this.pQuad;if(t.useProgram(h.p),t.bindBuffer(t.ARRAY_BUFFER,this.quadBuf),t.enableVertexAttribArray(h.a.aUnit),t.vertexAttribPointer(h.a.aUnit,2,t.FLOAT,!1,0,0),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.tex),t.uniform1i(h.u.uTex,0),t.uniform2f(h.u.uOrigin,this.origin[0],this.origin[1]),t.uniform2f(h.u.uSpan,this.span[0],this.span[1]),t.uniform2f(h.u.uRes,this.canvas.width,this.canvas.height),t.uniform1f(h.u.uH,this.H),t.uniform2f(h.u.uCursor,this.cur[0],this.cur[1]),t.uniform2f(h.u.uCVel,this.cvel[0],this.cvel[1]),t.uniform1f(h.u.uAct,this.act),t.uniform1f(h.u.uRad,l),t.uniform1f(h.u.uTime,r),t.uniform1f(h.u.uStr,o),t.uniform1f(h.u.uBreathe,m),t.uniform1f(h.u.uGlow,this.o.glow*this.act),t.uniform1f(h.u.uErode,u),t.drawArrays(t.TRIANGLE_STRIP,0,4),!this.n||this._settled&&this.act<1e-4&&this.targetAct===0)return;const d=this.simulate(i,r,l,o,b);this._settled=d===0;const g=this.pPt;t.useProgram(g.p),t.bindBuffer(t.ARRAY_BUFFER,this.dynBuf),t.bufferData(t.ARRAY_BUFFER,this.dyn,t.DYNAMIC_DRAW),t.enableVertexAttribArray(g.a.aPos),t.vertexAttribPointer(g.a.aPos,2,t.FLOAT,!1,12,0),t.enableVertexAttribArray(g.a.aAlpha),t.vertexAttribPointer(g.a.aAlpha,1,t.FLOAT,!1,12,8),t.bindBuffer(t.ARRAY_BUFFER,this.statBuf),t.enableVertexAttribArray(g.a.aColor),t.vertexAttribPointer(g.a.aColor,3,t.FLOAT,!1,16,0),t.enableVertexAttribArray(g.a.aSize),t.vertexAttribPointer(g.a.aSize,1,t.FLOAT,!1,16,12),t.uniform2f(g.u.uOrigin,this.origin[0],this.origin[1]),t.uniform2f(g.u.uSpan,this.span[0],this.span[1]),t.uniform2f(g.u.uRes,this.canvas.width,this.canvas.height),t.drawArrays(t.POINTS,0,this.n)}simulate(e,t,i,r,a){const{ox:o,oy:u,px:m,py:l,vx:p,vy:f,seed:_,rj:R,gain:E,vt:b,dyn:h,n:d}=this,g=this.cur[0],w=this.cur[1],n=this.act,c=9.2,A=6.8*r*(.75+.45*a),x=this.cvel[0],U=this.cvel[1];let C=0;for(let s=0;s<d;s++){const L=m[s]-o[s],M=l[s]-u[s],B=Math.hypot(L,M),W=o[s]-g,D=u[s]-w,T=Math.hypot(W,D),F=i*R[s];let y=T<F?(1-N(0,F,T))*E[s]:0;if(y*=n,y<.002&&B<2e-4&&Math.abs(p[s])+Math.abs(f[s])<.002){h[s*3+2]!==0&&(m[s]=o[s],l[s]=u[s],h[s*3]=o[s],h[s*3+1]=u[s],h[s*3+2]=0);continue}C++;let P=-55*L-c*p[s],k=-55*M-c*f[s];if(y>.002){const G=1/Math.max(T,1e-4),Y=W*G,q=D*G,I=A*y*y,j=_[s],Q=Math.sin(u[s]*21+j+t*.9)*.45+Math.cos(o[s]*17-j+t*.6)*.35;P+=Y*I-q*Q*I*.5+x*y*2.2,k+=q*I+Y*Q*I*.5+U*y*2.2-y*I*.06}p[s]+=P*e,f[s]+=k*e,m[s]+=p[s]*e,l[s]+=f[s]*e;const V=Math.hypot(m[s]-o[s],l[s]-u[s]),z=.01*b[s],et=N(z,z+.03*b[s],V)*(1-N(.19,.44,V));h[s*3]=m[s],h[s*3+1]=l[s],h[s*3+2]=et*.4}return C}}for(const v of S.observedAttributes)Object.defineProperty(S.prototype,v,{get(){return this.o[v]},set(e){if(e==null)return;if(v==="src"){this.o.src=String(e),this.gl&&this.load();return}const t=parseFloat(e);if(!isFinite(t))return;const i=this.o[v];this.o[v]=t,v==="density"&&this.img&&i!==t&&this.buildParticles()}});customElements.define("interactive-cloud",S)})();
