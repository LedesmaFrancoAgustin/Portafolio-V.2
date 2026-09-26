/* Glassmorphic 3D technology ecosystem — ported from the "Tech Ecosystem"
   Claude Design prototype (tech-ecosystem.js, three.js UMD custom element)
   to a plain mount/destroy controller driving an imported `three` module,
   attached to a container div instead of a custom element. Internal
   structure (single engine class owning canvas + label, raycasted hover,
   bloom/DOF post chain) is kept close to the original — it already fits a
   canvas-ref-based React component.

   Adapted to sit inside the site's own compact glass panel instead of the
   prototype's full-viewport hero: the canvas renders with an alpha
   background and skips the prototype's own starfield/nebula backdrop (kept
   only as an invisible env-map for the glass tiles' reflections) so the
   page's real background shows through instead of a second, competing
   "space" scene. */
import * as T from 'three'
import { categoryIdForTech, LIGHT_LOGOS, LINKS, TECH, type CategoryId, type TechDef, type TechId } from './tech-data'
import { LOGOS } from './tech-logos'
import { TECH_ICON_SVGS } from './tech-icon-svgs'

const TAU = Math.PI * 2
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`

export interface TechEcosystemOptions {
  glow: number
  dof: number
  pulse: number
  parallax: number
  /** Fired whenever the raycasted hover target changes (including to
   *  null on hover-out), so the host page can sync other UI to it. */
  onHoverChange?: (id: TechId | null) => void
}

export const DEFAULT_TECH_ECOSYSTEM_OPTIONS: TechEcosystemOptions = {
  glow: 0.75,
  dof: 0,
  pulse: 1.45,
  parallax: 0.8,
}

export interface TechEcosystemController {
  setOptions(options: Partial<TechEcosystemOptions>): void
  /** Highlights every tile (and their links) in a category — the reverse of
   *  hovering a tile: driven by hovering that category's card instead. */
  setHighlightCategory(category: CategoryId | null): void
  destroy(): void
}

interface TileState {
  def: TechDef
  group: T.Group
  body: T.Mesh
  edge: T.Line
  logo: T.Mesh
  logoGlow: T.Mesh
  halo: T.Sprite
  baseRot: T.Euler
  glowMul: number
  haloMul: number
  basePos: T.Vector3
  /** Precomputed — a tile's category never changes, so no per-frame lookup. */
  category: CategoryId | null
  phase: number
  speed: number
  amp: number
  lift: number
  liftT: number
}

interface LinkState {
  a: TechId
  b: TechId
  line: T.Line
  node: T.Sprite
  catA: CategoryId | null
  catB: CategoryId | null
  baseOp: number
  baseNode: number
  phase: number
  hl: number
  hlT: number
}

export function mountTechEcosystem(
  container: HTMLElement,
  initial: Partial<TechEcosystemOptions> = {},
): TechEcosystemController {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let glowAmt = initial.glow ?? DEFAULT_TECH_ECOSYSTEM_OPTIONS.glow
  let dofAmt = initial.dof ?? DEFAULT_TECH_ECOSYSTEM_OPTIONS.dof
  // Decided once at mount: with DOF off (the default) the depth texture and
  // the composite's depth/blur reads are skipped entirely — they only ever
  // multiplied into a zero. setOptions({ dof }) therefore only takes effect
  // on a scene mounted with dof > 0.
  const dofEnabled = dofAmt > 0
  let pulseAmt = initial.pulse ?? DEFAULT_TECH_ECOSYSTEM_OPTIONS.pulse
  let parallaxAmt = reducedMotion ? 0 : initial.parallax ?? DEFAULT_TECH_ECOSYSTEM_OPTIONS.parallax
  const onHoverChange = initial.onHoverChange

  Object.assign(container.style, {
    display: 'block',
    position: container.style.position || 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    background: 'transparent',
  } satisfies Partial<CSSStyleDeclaration>)

  const canvas = document.createElement('canvas')
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    display: 'block',
  } satisfies Partial<CSSStyleDeclaration>)
  container.appendChild(canvas)

  const label = document.createElement('div')
  Object.assign(label.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'opacity .22s ease',
    padding: '7px 14px 8px',
    borderRadius: '999px',
    whiteSpace: 'nowrap',
    font: '500 14px/1 "Space Grotesk", system-ui, sans-serif',
    letterSpacing: '.02em',
    color: '#EAF2FF',
    background: 'rgba(10,14,32,0.62)',
    backdropFilter: 'blur(14px)',
    border: '1px solid rgba(255,255,255,0.14)',
    boxShadow: '0 8px 30px rgba(0,0,0,.45)',
    zIndex: '3',
  } satisfies Partial<CSSStyleDeclaration>)
  container.appendChild(label)

  // - antialias off: the scene is drawn into `rt` and only a fullscreen quad
  //   reaches the canvas, so canvas MSAA never touched a single edge.
  // - no preserveDrawingBuffer: nothing reads the canvas back, and keeping it
  //   blocks the browser's cheaper buffer swap.
  // - default powerPreference: 'high-performance' woke the discrete GPU on
  //   dual-GPU laptops for the whole session just for this panel.
  const renderer = new T.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
  })
  renderer.setClearColor(0x000000, 0)
  const isMobileViewport = window.matchMedia('(max-width: 900px)').matches
  // Phones have dense screens but far less GPU per pixel — 1.5 is visually
  // near-identical at that size and ~44% fewer pixels than 2.
  const maxDpr = isMobileViewport ? 1.5 : 2
  // On a narrow/portrait container the camera's horizontal FOV is much
  // tighter than on desktop (same vertical FOV, smaller aspect), so the
  // outermost tiles (react/vite/eslint/codex...) clip past the frustum
  // edges even after resize()'s own fit/scale. Pulling every tile's base
  // X position toward the origin (Y/Z stay put — see buildTiles) tightens
  // only the horizontal spread, leaving the vertical spread (and icon
  // size, driven by `size` alone) untouched so tiles fill the card's real
  // height instead of bunching up.
  const POS_COMPACT_X = isMobileViewport ? 0.46 : 1
  // The hover/tap "lift" pops a tile toward the camera and scales it up
  // (see the frame loop) — on the compact mobile card that growth pushes an
  // edge tile (e.g. vite, pulled furthest toward ±X by POS_COMPACT_X above)
  // past the container's own clipped bounds, cutting it off mid-select.
  // Desktop has enough margin around the cluster not to need this.
  const LIFT_Z = isMobileViewport ? 0.55 : 1.5
  const LIFT_SCALE = isMobileViewport ? 0.035 : 0.09
  // A flat Z lift pops a tile already close to the camera (claude, at
  // pos.z 2.6 — closer than every other tile) disproportionately more than
  // one further back, because perspective growth is steeper the nearer an
  // object already is. That's what pushed it past the card's clipped edge
  // even on desktop, where every other tile has enough margin to absorb the
  // same flat lift. Capping how close *any* tile's lifted position may get
  // only ever kicks in for that one outlier — everything else lifts by its
  // full LIFT_Z as before.
  const MAX_LIFTED_Z = 3.3
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr))
  const w0 = container.clientWidth || 1200
  const h0 = container.clientHeight || 700
  renderer.setSize(w0, h0, false)
  renderer.outputEncoding = T.sRGBEncoding
  renderer.toneMapping = T.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0

  const scene = new T.Scene()
  scene.background = null
  const camera = new T.PerspectiveCamera(42, w0 / h0, 0.1, 100)
  camera.position.set(0, 0, 13.2)

  const world = new T.Group()
  scene.add(world)

  let envMap: T.Texture | null = null
  let haloTex: T.CanvasTexture | null = null
  const brandIconCache: Partial<Record<TechId, HTMLImageElement>> = {}

  function sprite(color: number, opacity: number, size: number): T.Sprite {
    if (!haloTex) {
      const c = document.createElement('canvas')
      c.width = c.height = 256
      const x = c.getContext('2d')!
      const g = x.createRadialGradient(128, 128, 0, 128, 128, 128)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(0.22, 'rgba(255,255,255,0.55)')
      g.addColorStop(0.55, 'rgba(255,255,255,0.14)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      x.fillStyle = g
      x.fillRect(0, 0, 256, 256)
      haloTex = new T.CanvasTexture(c)
    }
    const s = new T.Sprite(
      new T.SpriteMaterial({
        map: haloTex,
        color,
        transparent: true,
        opacity,
        blending: T.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      }),
    )
    s.scale.setScalar(size)
    return s
  }

  function buildEnv() {
    const c = document.createElement('canvas')
    c.width = 1024
    c.height = 512
    const x = c.getContext('2d')!
    const g = x.createLinearGradient(0, 0, 0, 512)
    g.addColorStop(0, '#1b2a6b')
    g.addColorStop(0.45, '#101638')
    g.addColorStop(1, '#05070f')
    x.fillStyle = g
    x.fillRect(0, 0, 1024, 512)
    const blobs: [string, number, number, number][] = [
      ['#3f6bff', 240, 150, 260],
      ['#7b4bff', 720, 120, 300],
      ['#18c7c7', 500, 380, 220],
      ['#ff5fa8', 900, 360, 180],
    ]
    blobs.forEach(([col, bx, by, r]) => {
      const rg = x.createRadialGradient(bx, by, 0, bx, by, r)
      rg.addColorStop(0, col)
      rg.addColorStop(1, 'rgba(0,0,0,0)')
      x.globalAlpha = 0.55
      x.fillStyle = rg
      x.beginPath()
      x.arc(bx, by, r, 0, TAU)
      x.fill()
    })
    x.globalAlpha = 1
    const tex = new T.CanvasTexture(c)
    tex.mapping = T.EquirectangularReflectionMapping
    tex.encoding = T.sRGBEncoding
    const pmrem = new T.PMREMGenerator(renderer)
    envMap = pmrem.fromEquirectangular(tex).texture
    pmrem.dispose()
    scene.environment = envMap
    // scene.background intentionally left null: the nebula texture only
    // feeds the tiles' glass reflections, it never paints a visible backdrop.
    tex.dispose()
  }

  function buildLights() {
    scene.add(new T.AmbientLight(0x2a3a7a, 0.7))
    const k = new T.DirectionalLight(0xbfd6ff, 0.22)
    k.position.set(-4, 6, 8)
    scene.add(k)
    const c1 = new T.PointLight(0x38bdf8, 4.5, 30)
    c1.position.set(-8, 3, 6)
    scene.add(c1)
    const c2 = new T.PointLight(0xa855f7, 4.5, 30)
    c2.position.set(9, -2, 5)
    scene.add(c2)
    const c3 = new T.PointLight(0x34d399, 4, 26)
    c3.position.set(2, -7, 4)
    scene.add(c3)
  }

  function tileGeo(size: number) {
    const r = size * 0.24
    const half = size / 2
    const k = half - r
    const sh = new T.Shape()
    sh.moveTo(-k, -half)
    sh.lineTo(k, -half)
    sh.quadraticCurveTo(half, -half, half, -k)
    sh.lineTo(half, k)
    sh.quadraticCurveTo(half, half, k, half)
    sh.lineTo(-k, half)
    sh.quadraticCurveTo(-half, half, -half, k)
    sh.lineTo(-half, -k)
    sh.quadraticCurveTo(-half, -half, -k, -half)
    const geo = new T.ExtrudeGeometry(sh, {
      depth: size * 0.14,
      bevelEnabled: true,
      bevelThickness: size * 0.03,
      bevelSize: size * 0.028,
      bevelSegments: 3,
      curveSegments: 14,
    })
    geo.center()
    return { geo, shape: sh }
  }

  function logoTex(id: TechId) {
    const S = 512
    const c = document.createElement('canvas')
    c.width = c.height = S
    const x = c.getContext('2d')!
    const brandIcon = brandIconCache[id]
    if (brandIcon) {
      x.drawImage(brandIcon, 0, 0, S, S)
    } else {
      ;(LOGOS[id] || (() => {}))(x, S)
    }
    const tex = new T.CanvasTexture(c)
    tex.encoding = T.sRGBEncoding
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
    return tex
  }

  // Most downloaded brand SVGs (tech-icon-svgs.ts) ship with a flat neutral
  // card background (fill #F4F2ED, as either a <rect> or a <path>) — strip
  // just that shape so the mark lands on the glass tile instead of a second
  // opaque card. A few (typescript, mongo, prisma) have no light variant and
  // ship their own brand-colored background instead, which we keep as-is —
  // matching by exact fill color (rather than tag name) avoids also
  // stripping unrelated shapes, like a clipPath's defining <rect>.
  function loadBrandIcon(id: TechId, raw: string): Promise<void> {
    const stripped = raw.replace(/<(?:rect|path)[^>]*fill="#F4F2ED"[^>]*\/>/, '')
    const img = new Image()
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(stripped)))
    return img.decode().then(
      () => {
        brandIconCache[id] = img
      },
      // A broken icon just keeps its hand-drawn fallback.
      () => {},
    )
  }

  const tiles: Record<string, TileState> = {}
  // Same tiles as an array, built once — the frame loop used to allocate a
  // fresh one with Object.values(tiles) every frame.
  const tileList: TileState[] = []
  const faces: T.Mesh[] = []
  let tileGroup: T.Group
  let rebuildLogos: (ids: TechId[]) => void = () => {}

  function buildTiles() {
    tileGroup = new T.Group()
    world.add(tileGroup)

    TECH.forEach((t) => {
      const g = new T.Group()
      g.position.set(t.pos[0] * POS_COMPACT_X, t.pos[1], t.pos[2])
      const { geo, shape } = tileGeo(t.size)
      // Glass look without `transmission`. Transmission refracts a buffer of
      // the scene's *opaque* objects — and this scene has none, so it only
      // ever sampled an empty (0,0,0,0) target, yet still cost three a
      // 1024² 4×MSAA render pass + mipmap generation every frame. With that
      // sample, three's shader resolves to exactly: diffuse × (1 − 0.6) and
      // alpha × (1 − 0.6 + 0.1) — reproduced here directly. renderOrder −1
      // keeps the bodies drawn before every other transparent object, as the
      // transmissive pass did (halos/links blend over them, not under).
      const body = new T.Mesh(
        geo,
        new T.MeshPhysicalMaterial({
          color: new T.Color(0x060a18).multiplyScalar(0.4),
          metalness: 0.0,
          roughness: 0.3,
          ior: 1.46,
          clearcoat: 0.45,
          clearcoatRoughness: 0.42,
          envMap: envMap ?? undefined,
          envMapIntensity: 0.38,
          transparent: true,
          opacity: 0.5,
        }),
      )
      body.renderOrder = -1
      g.add(body)

      const pts = shape.getPoints(64).map((p) => new T.Vector3(p.x, p.y, t.size * 0.125))
      const eg = new T.BufferGeometry().setFromPoints(pts.concat([pts[0]]))
      const edge = new T.Line(
        eg,
        new T.LineBasicMaterial({ color: t.color, transparent: true, opacity: 0.42, blending: T.AdditiveBlending, depthWrite: false }),
      )
      g.add(edge)

      const tex = logoTex(t.id)
      const lp = new T.Mesh(
        new T.PlaneGeometry(t.size * 0.92, t.size * 0.92),
        new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 1, depthWrite: false }),
      )
      lp.position.z = t.size * 0.19
      g.add(lp)
      const lg = new T.Mesh(
        new T.PlaneGeometry(t.size * 0.98, t.size * 0.98),
        new T.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: LIGHT_LOGOS.has(t.id) ? 0 : 0.14,
          blending: T.AdditiveBlending,
          depthWrite: false,
        }),
      )
      lg.position.z = t.size * 0.205
      g.add(lg)

      const halo = sprite(t.color, 0.13, t.size * 2.5)
      halo.position.z = -t.size * 0.45
      g.add(halo)

      const face = new T.Mesh(new T.PlaneGeometry(t.size * 1.02, t.size * 1.02), new T.MeshBasicMaterial({ visible: false }))
      face.position.z = t.size * 0.22
      face.userData.id = t.id
      faces.push(face)

      g.rotation.set((Math.random() - 0.5) * 0.42, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.2)
      const base = g.rotation.clone()

      // The pick face lives in its own group, frozen at the tile's resting
      // pose, instead of inside `g` (which bobs/drifts every frame and pops
      // forward on hover — see the frame loop). Raycasting against a moving
      // face meant the hit boundary drifted across the cursor near a tile's
      // edge, flickering hover on/off as it crossed. This proxy still turns
      // with the shared camera parallax (it's a sibling under the same
      // static tileGroup), just not with any one tile's own idle animation.
      const hitGroup = new T.Group()
      hitGroup.position.copy(g.position)
      hitGroup.rotation.copy(base)
      hitGroup.add(face)
      tileGroup.add(hitGroup)

      tiles[t.id] = {
        def: t,
        group: g,
        body,
        edge,
        logo: lp,
        logoGlow: lg,
        halo,
        baseRot: base,
        glowMul: LIGHT_LOGOS.has(t.id) ? 0 : 1,
        haloMul: LIGHT_LOGOS.has(t.id) ? 0.55 : 1,
        basePos: g.position.clone(),
        category: categoryIdForTech(t.id),
        phase: Math.random() * TAU,
        speed: 0.22 + Math.random() * 0.3,
        amp: 0.1 + Math.random() * 0.14,
        lift: 0,
        liftT: 0,
      }
      tileGroup.add(g)
      tileList.push(tiles[t.id])
    })

    // Redraws only the given tiles' logos. logo and logoGlow share one
    // texture, so the previous one is disposed once both stop using it —
    // otherwise every rebuild leaked a 512×512 texture per tile on the GPU.
    rebuildLogos = (ids) => {
      ids.forEach((id) => {
        const tl = tiles[id]
        if (!tl) return
        const logoMat = tl.logo.material as T.MeshBasicMaterial
        const glowMat = tl.logoGlow.material as T.MeshBasicMaterial
        const prev = logoMat.map
        const tex = logoTex(id)
        logoMat.map = tex
        logoMat.needsUpdate = true
        glowMat.map = tex
        glowMat.needsUpdate = true
        prev?.dispose()
      })
    }
  }

  const links: LinkState[] = []
  let linkGroup: T.Group

  function buildLinks() {
    linkGroup = new T.Group()
    world.add(linkGroup)

    LINKS.forEach(([a, b, strength]) => {
      const ta = tiles[a]
      const tb = tiles[b]
      if (!ta || !tb) return
      const pa = ta.basePos
      const pb = tb.basePos
      const mid = pa.clone().add(pb).multiplyScalar(0.5)
      const off = mid.clone().normalize().multiplyScalar(0.5 + Math.random() * 0.5)
      off.z += (Math.random() - 0.5) * 0.7
      const curve = new T.QuadraticBezierCurve3(pa, mid.clone().add(off), pb)
      const pts = curve.getPoints(30)
      const col = new T.Color(ta.def.color).lerp(new T.Color(tb.def.color), 0.5)
      const baseOp = 0.17 * strength + 0.07
      const line = new T.Line(
        new T.BufferGeometry().setFromPoints(pts),
        new T.LineBasicMaterial({ color: col, transparent: true, opacity: baseOp, blending: T.AdditiveBlending, depthWrite: false }),
      )
      linkGroup.add(line)

      const node = sprite(col.getHex(), 0.4 * strength, 0.5)
      node.position.copy(curve.getPoint(0.5))
      linkGroup.add(node)

      links.push({ a, b, line, node, catA: ta.category, catB: tb.category, baseOp, baseNode: 0.38 * strength, phase: Math.random() * TAU, hl: 0, hlT: 0 })
    })
  }

  let rt: T.WebGLRenderTarget
  let rtA: T.WebGLRenderTarget
  let rtB: T.WebGLRenderTarget
  let rtC: T.WebGLRenderTarget
  let rtD: T.WebGLRenderTarget
  let pScene: T.Scene
  let pCam: T.OrthographicCamera
  let pQuad: T.Mesh
  let blurMat: T.ShaderMaterial
  let compMat: T.ShaderMaterial
  let depthTex: T.DepthTexture | null = null

  function buildPost(w: number, h: number) {
    const dpr = renderer.getPixelRatio()
    const W = Math.max(2, Math.round(w * dpr))
    const H = Math.max(2, Math.round(h * dpr))
    if (dofEnabled) {
      depthTex = new T.DepthTexture(W, H)
      depthTex.type = T.UnsignedShortType
    }
    rt = new T.WebGLRenderTarget(W, H, {
      minFilter: T.LinearFilter,
      magFilter: T.LinearFilter,
      type: T.HalfFloatType,
      depthTexture: depthTex ?? undefined,
      depthBuffer: true,
    })
    const half = (d: number) =>
      new T.WebGLRenderTarget(Math.max(2, Math.round(W / d)), Math.max(2, Math.round(H / d)), {
        minFilter: T.LinearFilter,
        magFilter: T.LinearFilter,
        type: T.HalfFloatType,
        depthBuffer: false,
      })
    // rtA/rtB aren't only DOF: they're the first half of the bloom chain
    // (rt → A → B → C → D), so they stay even with DOF off.
    rtA = half(2)
    rtB = half(2)
    rtC = half(4)
    rtD = half(4)

    pScene = new T.Scene()
    pCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    pQuad = new T.Mesh(new T.PlaneGeometry(2, 2))
    pScene.add(pQuad)

    blurMat = new T.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, uDir: { value: new T.Vector2() } },
      vertexShader: VERT,
      fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 uDir; varying vec2 vUv;
          void main(){
            vec4 s = texture2D(tDiffuse, vUv) * 0.227;
            s += (texture2D(tDiffuse, vUv + uDir*1.385) + texture2D(tDiffuse, vUv - uDir*1.385)) * 0.316;
            s += (texture2D(tDiffuse, vUv + uDir*3.253) + texture2D(tDiffuse, vUv - uDir*3.253)) * 0.070;
            gl_FragColor = s; }`,
      depthTest: false,
      depthWrite: false,
    })

    compMat = new T.ShaderMaterial({
      defines: dofEnabled ? { USE_DOF: '' } : {},
      uniforms: {
        tSharp: { value: rt.texture },
        tBlur: { value: rtB.texture },
        tWide: { value: rtD.texture },
        tDepth: { value: depthTex },
        uNear: { value: 0.1 },
        uFar: { value: 100 },
        uFocus: { value: 13.2 },
        uRange: { value: 3.2 },
        uDof: { value: 1 },
        uGlow: { value: 1 },
        uTime: { value: 0 },
      },
      vertexShader: VERT,
      fragmentShader: `
          uniform sampler2D tSharp, tBlur, tWide, tDepth;
          uniform float uNear, uFar, uFocus, uRange, uDof, uGlow, uTime;
          varying vec2 vUv;
          #ifdef USE_DOF
          float viewZ(vec2 uv){
            float d = texture2D(tDepth, uv).x;
            float ndc = d * 2.0 - 1.0;
            return (2.0 * uNear * uFar) / (uFar + uNear - ndc * (uFar - uNear));
          }
          #endif
          void main(){
            vec4 sharpT = texture2D(tSharp, vUv);
            vec3 sharp = sharpT.rgb;
            vec3 wide = texture2D(tWide, vUv).rgb;
            #ifdef USE_DOF
            vec3 blur = texture2D(tBlur, vUv).rgb;
            float z = viewZ(vUv);
            float range = z < uFocus ? uRange : uRange * 8.0;
            float coc = clamp(abs(z - uFocus) / range, 0.0, 1.0);
            coc = pow(coc, 1.45) * uDof;
            vec3 col = mix(sharp, blur, min(coc, 0.7));
            #else
            vec3 col = sharp;
            #endif
            vec3 bloom = max(wide - 0.86, 0.0) * 0.7;
            col += bloom * uGlow;
            float g = fract(sin(dot(vUv * vec2(1.0, 1.3) + uTime * 0.02, vec2(12.9898, 78.233))) * 43758.5453);
            col += (g - 0.5) * 0.012;
            /* No painted backdrop behind the tiles anymore — carry the sharp
               render's own coverage plus a bit of the bloom's glow so halos
               fade out into transparency instead of the canvas going flat
               opaque black wherever nothing was drawn. */
            float bloomA = clamp(max(bloom.r, max(bloom.g, bloom.b)) * uGlow, 0.0, 1.0);
            float a = clamp(sharpT.a + bloomA, 0.0, 1.0);
            gl_FragColor = vec4(col, a); }`,
      depthTest: false,
      depthWrite: false,
    })
  }

  function pass(mat: T.Material, target: T.WebGLRenderTarget | null) {
    pQuad.material = mat
    renderer.setRenderTarget(target)
    renderer.render(pScene, pCam)
  }

  // Container size cached here (resize() runs from a ResizeObserver) — reading
  // clientWidth/Height inside the frame loop forced a layout whenever the
  // label had been moved the frame before.
  let viewW = w0
  let viewH = h0

  function resize() {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    viewW = w
    viewH = h
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // Reference size is the prototype's near-fullscreen hero; this now lives
    // in a compact card, so whichever dimension is more constrained (usually
    // height) drives the scale-down. On the mobile card the width ratio is
    // always the tighter one (narrow portrait card vs. a 1280-wide desktop
    // reference) and would keep the whole cluster small with empty space
    // above/below, so height alone drives the fit there instead, filling the
    // card's real vertical room.
    const fit = isMobileViewport ? h / 720 : Math.min(w / 1280, h / 720)
    const scale = Math.min(1.2, Math.max(0.68, fit * 0.75 + 0.55))
    world.scale.setScalar(scale)
    camera.updateProjectionMatrix()
    const dpr = renderer.getPixelRatio()
    const W = Math.round(w * dpr)
    const H = Math.round(h * dpr)
    rt.setSize(W, H)
    if (depthTex?.image) {
      depthTex.image.width = W
      depthTex.image.height = H
    }
    rtA.setSize(Math.round(W / 2), Math.round(H / 2))
    rtB.setSize(Math.round(W / 2), Math.round(H / 2))
    rtC.setSize(Math.round(W / 4), Math.round(H / 4))
    rtD.setSize(Math.round(W / 4), Math.round(H / 4))
  }

  buildEnv()
  buildLights()
  buildTiles()
  buildLinks()
  buildPost(w0, h0)

  // Brand icons: wait for all of them and swap them in a single pass, instead
  // of rebuilding every tile's texture once per icon as each one decodes.
  const brandIds = Object.keys(TECH_ICON_SVGS) as TechId[]
  Promise.all(brandIds.map((id) => loadBrandIcon(id, TECH_ICON_SVGS[id]!))).then(() => {
    if (!destroyed) rebuildLogos(brandIds.filter((id) => brandIconCache[id]))
  })

  const mouse = new T.Vector2(0, 0)
  const mouseT = new T.Vector2(0, 0)
  const ndc = new T.Vector2(-2, -2)
  const tapNdc = new T.Vector2()
  const ray = new T.Raycaster()
  let hover: TechId | null = null
  let highlightCategory: CategoryId | null = null
  // Touch has no hover: a tap fires pointerdown/pointerup with no pointermove
  // in between, so the continuous raycast below never sees it. `selected`
  // is the tap equivalent of `hover` — set on tap, cleared by tapping the
  // same tile again or an empty spot — and falls back into the same
  // hover/label/dim pipeline every frame (see the `id ?? selected` below).
  let selected: TechId | null = null
  let tapStartX = 0
  let tapStartY = 0
  let tapStartT = 0

  const onMove = (e: PointerEvent) => {
    const r = container.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    mouseT.set(x * 2 - 1, y * 2 - 1)
    ndc.set(x * 2 - 1, -(y * 2 - 1))
  }
  const onLeave = () => {
    mouseT.set(0, 0)
    ndc.set(-2, -2)
  }
  container.addEventListener('pointermove', onMove)
  container.addEventListener('pointerleave', onLeave)

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return
    tapStartX = e.clientX
    tapStartY = e.clientY
    tapStartT = performance.now()
  }
  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return
    // A drag (rotating the scene via parallax) shouldn't also select a tile.
    const moved = Math.hypot(e.clientX - tapStartX, e.clientY - tapStartY)
    if (moved > 12 || performance.now() - tapStartT > 500) return
    const r = container.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    tapNdc.set(x * 2 - 1, -(y * 2 - 1))
    ray.setFromCamera(tapNdc, camera)
    const hit = ray.intersectObjects(faces, false)[0]
    const id = (hit?.object.userData.id as TechId | undefined) ?? null
    selected = id && id === selected ? null : id
  }
  container.addEventListener('pointerdown', onPointerDown)
  container.addEventListener('pointerup', onPointerUp)

  const resizeObserver = new ResizeObserver(() => resize())
  resizeObserver.observe(container)

  const clock = new T.Clock()
  let raf = 0
  let destroyed = false
  // Animation time only advances while running, so a paused scene resumes
  // exactly where it left off instead of every tile jumping forward.
  let elapsed = 0
  let inView = false
  let pageVisible = !document.hidden

  // Scratch objects for placeLabel — reused every frame instead of the ~25
  // Vector3s plus arrays/objects it used to allocate while hovering.
  const LABEL_H = 32
  let labelW = 96
  const tmpV = new T.Vector3()
  const otherX = new Float64Array(TECH.length)
  const otherY = new Float64Array(TECH.length)
  let otherCount = 0
  const ctr = { x: 0, y: 0 }
  const edgePt = { x: 0, y: 0 }
  const cands = [0, 1, 2, 3].map(() => ({ x: 0, y: 0 }))

  /** Projects a world-group-local point to container pixels, into `out`. */
  function projInto(x: number, y: number, z: number, out: { x: number; y: number }) {
    tmpV.set(x, y, z).applyMatrix4(world.matrixWorld).project(camera)
    out.x = (tmpV.x * 0.5 + 0.5) * viewW
    out.y = (-tmpV.y * 0.5 + 0.5) * viewH
  }

  function clearance(p: { x: number; y: number }) {
    let m = 1e5
    for (let i = 0; i < otherCount; i++) m = Math.min(m, Math.hypot(otherX[i] - p.x, otherY[i] - (p.y + 16)))
    return m
  }

  // Puts the hover label below the tile, or — if another tile is in the way —
  // on whichever side (below/above/right/left) has the most clearance.
  function placeLabel(tl: TileState) {
    const p = tl.group.position
    const reach = tl.def.size * 0.66
    projInto(p.x, p.y, p.z, ctr)

    otherCount = 0
    for (const o of tileList) {
      if (o === tl) continue
      projInto(o.group.position.x, o.group.position.y, o.group.position.z, edgePt)
      otherX[otherCount] = edgePt.x
      otherY[otherCount] = edgePt.y
      otherCount++
    }

    projInto(p.x, p.y - reach, p.z, edgePt)
    cands[0].x = ctr.x
    cands[0].y = edgePt.y + 16
    projInto(p.x, p.y + reach, p.z, edgePt)
    cands[1].x = ctr.x
    cands[1].y = edgePt.y - 16 - LABEL_H
    projInto(p.x + reach, p.y, p.z, edgePt)
    const halfW = Math.abs(edgePt.x - ctr.x)
    cands[2].x = ctr.x + halfW + labelW / 2 + 16
    cands[2].y = ctr.y - LABEL_H / 2
    cands[3].x = ctr.x - halfW - labelW / 2 - 16
    cands[3].y = ctr.y - LABEL_H / 2

    let pick = cands[0]
    if (clearance(cands[0]) < 112) {
      let best = clearance(pick)
      for (let i = 1; i < cands.length; i++) {
        const c = clearance(cands[i])
        if (c > best) {
          best = c
          pick = cands[i]
        }
      }
    }
    const cx = Math.max(labelW / 2 + 10, Math.min(viewW - labelW / 2 - 10, pick.x))
    const cy = Math.max(10, Math.min(viewH - LABEL_H - 10, pick.y))
    // transform instead of left/top: moving it this way skips layout entirely.
    // Whole pixels keep the text crisp on its composited layer.
    label.style.transform = `translate3d(${Math.round(cx - labelW / 2)}px, ${Math.round(cy)}px, 0)`
  }

  function frame() {
    if (destroyed) return
    raf = requestAnimationFrame(frame)
    elapsed += Math.min(clock.getDelta(), 0.1)
    const t = elapsed

    mouse.lerp(mouseT, 0.05)
    const px = mouse.x * parallaxAmt
    const py = mouse.y * parallaxAmt
    world.rotation.y = lerp(world.rotation.y, px * 0.085, 0.08)
    world.rotation.x = lerp(world.rotation.x, py * 0.06, 0.08)
    camera.position.x = lerp(camera.position.x, -px * 0.55, 0.05)
    camera.position.y = lerp(camera.position.y, py * 0.4, 0.05)
    camera.lookAt(0, 0, 0)

    // ndc is parked at (-2,-2) while the pointer is outside the scene.
    let id: TechId | null = null
    if (ndc.x !== -2) {
      ray.setFromCamera(ndc, camera)
      const hit = ray.intersectObjects(faces, false)[0]
      id = (hit?.object.userData.id as TechId | undefined) ?? null
    }
    // No live hover (e.g. touch, which has none) falls back to the tapped tile.
    if (!id) id = selected
    if (id !== hover) {
      hover = id
      onHoverChange?.(id)
      if (id) {
        const d = tiles[id].def
        label.textContent = d.label
        label.style.opacity = '1'
        label.style.borderColor = 'rgba(255,255,255,0.18)'
        label.style.boxShadow = `0 8px 30px rgba(0,0,0,.45), 0 0 26px #${d.color.toString(16).padStart(6, '0')}44`
        // Measured once per text change, not every frame: reading the size
        // right after moving the label forced a synchronous layout each frame.
        labelW = label.getBoundingClientRect().width || 96
      } else {
        label.style.opacity = '0'
      }
      container.style.cursor = id ? 'pointer' : 'default'
    }

    const anyEmphasis = !!hover || highlightCategory !== null
    tileList.forEach((tl) => {
      const isH = tl.def.id === hover
      // Category-wide highlight (from hovering its card) brightens the whole
      // group but — unlike single-tile hover — never triggers the physical
      // lift/flatten below, so it reads as a group glow, not four tiles all
      // fighting to pop toward the camera at once.
      const emphasized = isH || (highlightCategory !== null && tl.category === highlightCategory)
      tl.liftT = isH ? 1 : 0
      tl.lift = lerp(tl.lift, tl.liftT, 0.09)
      const float = Math.sin(t * tl.speed + tl.phase) * tl.amp
      const drift = Math.cos(t * tl.speed * 0.7 + tl.phase) * tl.amp * 0.5
      const liftedZ = Math.min(tl.basePos.z + tl.lift * LIFT_Z, MAX_LIFTED_Z)
      tl.group.position.set(tl.basePos.x + drift, tl.basePos.y + float, liftedZ)
      const s = 1 + tl.lift * LIFT_SCALE
      tl.group.scale.setScalar(s)
      tl.group.rotation.x = tl.baseRot.x + Math.sin(t * tl.speed * 0.6 + tl.phase) * 0.05 - tl.lift * (tl.baseRot.x * 0.8)
      tl.group.rotation.y = tl.baseRot.y + Math.cos(t * tl.speed * 0.5 + tl.phase) * 0.06 - tl.lift * (tl.baseRot.y * 0.8)
      tl.group.rotation.z = tl.baseRot.z + Math.sin(t * tl.speed * 0.35 + tl.phase) * 0.02

      const dim = anyEmphasis && !emphasized ? 0.55 : 1
      ;(tl.edge.material as T.LineBasicMaterial).opacity = (0.38 + tl.lift * 0.45) * dim * (0.7 + 0.3 * glowAmt)
      ;(tl.halo.material as T.SpriteMaterial).opacity = (0.12 + tl.lift * 0.2) * dim * glowAmt * tl.haloMul
      ;(tl.logo.material as T.MeshBasicMaterial).opacity = anyEmphasis && !emphasized ? 0.72 : 1
      ;(tl.logoGlow.material as T.MeshBasicMaterial).opacity = (0.1 + tl.lift * 0.22) * dim * glowAmt * tl.glowMul
    })

    if (hover) placeLabel(tiles[hover])

    links.forEach((l) => {
      const inHighlightedCategory =
        highlightCategory !== null &&
        (l.catA === highlightCategory || l.catB === highlightCategory)
      const on = (!!hover && (l.a === hover || l.b === hover)) || inHighlightedCategory
      l.hlT = on ? 1 : 0
      l.hl = lerp(l.hl, l.hlT, 0.1)
      const pulse = 0.72 + 0.28 * Math.sin(t * 1.15 + l.phase) * pulseAmt
      const dim = anyEmphasis && !on ? 0.4 : 1
      ;(l.line.material as T.LineBasicMaterial).opacity = (l.baseOp * pulse * dim + l.hl * 0.42) * (0.6 + 0.4 * glowAmt)
      ;(l.node.material as T.SpriteMaterial).opacity = (l.baseNode * pulse * dim + l.hl * 0.5) * glowAmt
      l.node.scale.setScalar(0.5 + l.hl * 0.45)
    })

    renderer.setRenderTarget(rt)
    renderer.clear()
    renderer.render(scene, camera)

    blurMat.uniforms.tDiffuse.value = rt.texture
    blurMat.uniforms.uDir.value.set(1 / rtA.width, 0)
    pass(blurMat, rtA)
    blurMat.uniforms.tDiffuse.value = rtA.texture
    blurMat.uniforms.uDir.value.set(0, 1 / rtA.height)
    pass(blurMat, rtB)
    blurMat.uniforms.tDiffuse.value = rtB.texture
    blurMat.uniforms.uDir.value.set(1 / rtC.width, 0)
    pass(blurMat, rtC)
    blurMat.uniforms.tDiffuse.value = rtC.texture
    blurMat.uniforms.uDir.value.set(0, 1 / rtC.height)
    pass(blurMat, rtD)

    compMat.uniforms.uNear.value = camera.near
    compMat.uniforms.uFar.value = camera.far
    compMat.uniforms.uFocus.value = camera.position.z
    compMat.uniforms.uDof.value = dofAmt
    compMat.uniforms.uGlow.value = glowAmt
    compMat.uniforms.uTime.value = t
    pass(compMat, null)
  }

  // Runs the render loop only while the scene is on screen and the tab is
  // visible — otherwise it kept rendering (5 passes + raycast) every frame
  // even while the user was reading another section.
  function updateLoop() {
    const shouldRun = inView && pageVisible && !destroyed
    if (shouldRun && !raf) {
      clock.getDelta() // drop the time spent paused
      raf = requestAnimationFrame(frame)
    } else if (!shouldRun && raf) {
      cancelAnimationFrame(raf)
      raf = 0
      // pointerleave doesn't always fire when scrolling away mid-hover, so
      // clear any hover state here instead of leaving a card stuck active.
      onLeave()
      if (hover) {
        hover = null
        onHoverChange?.(null)
        label.style.opacity = '0'
        container.style.cursor = 'default'
      }
    }
  }

  const visibilityObserver = new IntersectionObserver((entries) => {
    inView = entries[entries.length - 1].isIntersecting
    updateLoop()
  })
  visibilityObserver.observe(container)

  const onVisibilityChange = () => {
    pageVisible = !document.hidden
    updateLoop()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

  resize()
  // Only the hand-drawn logos use web fonts — brand icons are images.
  document.fonts?.ready.then(() => {
    if (!destroyed) rebuildLogos(TECH.map((t) => t.id).filter((id) => !TECH_ICON_SVGS[id]))
  })
  // Mount happens ahead of the viewport (see useTechEcosystem), so compiling
  // the shaders now moves that hitch off the first visible frame.
  renderer.compile(scene, camera)

  return {
    setOptions(options) {
      if (options.glow !== undefined) glowAmt = options.glow
      if (options.dof !== undefined) dofAmt = options.dof
      if (options.pulse !== undefined) pulseAmt = options.pulse
      if (options.parallax !== undefined) parallaxAmt = reducedMotion ? 0 : options.parallax
    },
    setHighlightCategory(category) {
      highlightCategory = category
    },
    destroy() {
      destroyed = true
      cancelAnimationFrame(raf)
      raf = 0
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      container.removeEventListener('pointermove', onMove)
      container.removeEventListener('pointerleave', onLeave)
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointerup', onPointerUp)

      // renderer.dispose() alone doesn't free what the scene uploaded to the
      // GPU — geometries, materials and textures have to be released one by
      // one (a Set, since logo/logoGlow share textures and tiles share haloTex).
      const disposables = new Set<{ dispose(): void }>()
      scene.traverse((obj) => {
        const mesh = obj as T.Mesh
        if (mesh.geometry) disposables.add(mesh.geometry)
        const materials = mesh.material ? ([] as T.Material[]).concat(mesh.material) : []
        materials.forEach((mat) => {
          disposables.add(mat)
          const map = (mat as T.MeshBasicMaterial).map
          if (map) disposables.add(map)
        })
      })
      disposables.add(pQuad.geometry)
      ;[blurMat, compMat, rt, rtA, rtB, rtC, rtD].forEach((d) => disposables.add(d))
      if (depthTex) disposables.add(depthTex)
      if (envMap) disposables.add(envMap)
      if (haloTex) disposables.add(haloTex)
      disposables.forEach((d) => d.dispose())

      renderer.dispose()
      // Releases the WebGL context right away instead of waiting for GC —
      // browsers cap live contexts (~16) and the page's clouds use their own.
      renderer.forceContextLoss()
      container.removeChild(canvas)
      container.removeChild(label)
    },
  }
}
