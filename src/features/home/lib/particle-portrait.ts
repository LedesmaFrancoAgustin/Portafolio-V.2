/* Dust/sparkle halo for the hero portrait: the photo underneath is never touched —
   this only paints a fine field of glints and hacker-green code glyphs shaped as a soft
   circle centred on the photo, spilling out beyond the photo's own pixel box into the
   surrounding hero area, and almost never directly over the face/torso (the photo's own
   alpha channel keeps that area clear regardless of the circle). Drifts gently at rest,
   scatters away from the pointer on hover. Canvas 2D, screen blend mode so only the
   bright specks read against the photo and the sky scene behind it.

   The canvas element is deliberately larger than the photo (see home.css) so the halo
   isn't clipped at the photo's own edges; particle positions stay normalised by the
   photo's own width (matching the convention used by scene/lib/interactive-cloud.js),
   with a separate origin offset locating the photo inside the larger canvas. */

const CODE_GLYPHS = [
  '0', '1', '{', '}', '<', '>', '/', '=', ';', '(', ')', '+', '-', '*', '&', '|', '#',
] as const

const GLYPH_CHANCE = 0.18
const ALPHA_THRESHOLD = 90
const SPRING_K = 55
const SPRING_DAMP = 9.2
const PUSH_STRENGTH = 7.4
const INFLUENCE_RADIUS = 0.2
const DRIFT_AMPLITUDE = 0.006

// halo shaping: probability a candidate point spawns a particle. The field is a soft
// circle centred on the photo — dense-ish near the middle, fading smoothly to a thin
// bleed past its edge — with the photo itself still kept mostly clear.
const ON_BODY_CHANCE = 0.004
const CIRCLE_MAX_CHANCE = 0.1
const STRAY_CHANCE = 0.007
const CIRCLE_INNER_RADIUS = 0.3
const CIRCLE_OUTER_RADIUS = 0.62

const clamp = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

interface Particle {
  ox: number
  oy: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  alpha: number
  glyph: string | null
  phase: number
  freq: number
}

interface PointerState {
  nx: number
  ny: number
  active: boolean
}

export interface ParticlePortraitOptions {
  onReady?: () => void
}

export interface ParticlePortraitController {
  destroy(): void
}

function buildParticles(img: HTMLImageElement): Particle[] {
  const w = img.naturalWidth
  const h = img.naturalHeight
  if (!w || !h) return []

  const sample = document.createElement('canvas')
  sample.width = w
  sample.height = h
  const sampleCtx = sample.getContext('2d', { willReadFrequently: true })
  if (!sampleCtx) return []
  sampleCtx.drawImage(img, 0, 0)

  let data: Uint8ClampedArray
  try {
    data = sampleCtx.getImageData(0, 0, w, h).data
  } catch {
    return []
  }

  const isBodyAt = (px: number, py: number) =>
    px >= 0 && py >= 0 && px < w && py < h && data[(py * w + px) * 4 + 3] > ALPHA_THRESHOLD

  // circle centred on the photo itself, in the same ox/oy space particles live in
  const centerX = 0.5
  const centerY = h / w / 2

  // sample well past the photo's own pixel bounds — the circle spills out into the
  // surrounding margin, not just the transparent fringe inside the photo itself
  const marginX = w * 0.4
  const marginTop = h * 0.12
  const marginBottom = h * 0.04
  const step = 20

  const particles: Particle[] = []
  for (let gy = -marginTop + step * 0.5; gy < h + marginBottom; gy += step) {
    for (let gx = -marginX + step * 0.5; gx < w + marginX; gx += step) {
      const x = Math.round(gx + (Math.random() - 0.5) * step)
      const y = Math.round(gy + (Math.random() - 0.5) * step)

      const onBody = isBodyAt(x, y)
      let chance = ON_BODY_CHANCE
      if (!onBody) {
        const dist = Math.hypot(x / w - centerX, y / w - centerY)
        const falloff = 1 - smoothstep(CIRCLE_INNER_RADIUS, CIRCLE_OUTER_RADIUS, dist)
        chance = STRAY_CHANCE + (CIRCLE_MAX_CHANCE - STRAY_CHANCE) * falloff
      }
      if (Math.random() > chance) continue

      const isGlyph = Math.random() < GLYPH_CHANCE
      const ox = x / w
      const oy = y / w
      const t = Math.random()

      // dust stays a soft near-white sparkle; glyphs go full hacker-green — both are
      // screen-blended onto the photo, so a dim colour would simply vanish
      const color = isGlyph
        ? `rgb(${Math.round(40 + 20 * t)},${Math.round(200 + 55 * t)},${Math.round(70 + 30 * t)})`
        : `rgb(${Math.round(255 - 23 * t)},${Math.round(238 - 14 * t)},${Math.round(222 + 33 * t)})`

      particles.push({
        ox,
        oy,
        x: ox,
        y: oy,
        vx: 0,
        vy: 0,
        color,
        size: (step / w) * (0.22 + Math.random() * 0.26),
        alpha: isGlyph ? 0.45 + Math.random() * 0.2 : 0.5 + Math.random() * 0.5,
        glyph: isGlyph ? CODE_GLYPHS[Math.floor(Math.random() * CODE_GLYPHS.length)] : null,
        phase: Math.random() * Math.PI * 2,
        freq: 0.4 + Math.random() * 0.5,
      })
    }
  }
  return particles
}

export function mountParticlePortrait(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  imageSrc: string,
  { onReady }: ParticlePortraitOptions = {},
): ParticlePortraitController {
  const ctx = canvas.getContext('2d')
  if (!ctx) return { destroy() {} }

  let particles: Particle[] = []
  // photoW is the scale unit ox/oy are normalised by (the photo's own rendered width).
  // canvasW/canvasH are the sparkle canvas's own box, which is larger than the photo
  // (see .home-hero__portrait-sparkles) — originX/Y locate the photo's top-left inside
  // that larger box, in canvas-local css px.
  let photoW = 0
  let canvasW = 0
  let canvasH = 0
  let originX = 0
  let originY = 0
  let dpr = Math.min(window.devicePixelRatio || 1, 2)
  let raf = 0
  let last = 0
  let elapsed = 0
  let destroyed = false

  const pointer: PointerState = { nx: -10, ny: -10, active: false }

  function resizeCanvas() {
    const hostRect = host.getBoundingClientRect()
    const canvasRect = canvas.getBoundingClientRect()
    photoW = hostRect.width
    canvasW = canvasRect.width
    canvasH = canvasRect.height
    originX = hostRect.left - canvasRect.left
    originY = hostRect.top - canvasRect.top
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(1, Math.round(canvasW * dpr))
    canvas.height = Math.max(1, Math.round(canvasH * dpr))
  }

  // The photo determines the wrap's box height via its intrinsic aspect ratio, which is
  // only known once it decodes — so the very first measurement can land before that
  // layout settles. Re-checking each frame (cheap: two rect reads, buffer only
  // reallocated when the size actually changed) makes sizing self-healing instead of
  // depending on a single ResizeObserver callback firing at the right time.
  function syncSize() {
    const rect = canvas.getBoundingClientRect()
    if (Math.abs(rect.width - canvasW) > 0.5 || Math.abs(rect.height - canvasH) > 0.5) {
      resizeCanvas()
    }
  }

  function draw() {
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, canvasW, canvasH)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowBlur = 1.5
    ctx.shadowColor = 'rgba(120, 255, 150, 0.55)'

    for (const p of particles) {
      const px = originX + p.x * photoW
      const py = originY + p.y * photoW
      ctx.fillStyle = p.color
      ctx.globalAlpha = p.alpha
      if (p.glyph) {
        ctx.font = `${Math.max(11, p.size * photoW * 3.3)}px ui-monospace, SFMono-Regular, Menlo, monospace`
        ctx.fillText(p.glyph, px, py)
      } else {
        const r = Math.max(0.5, (p.size * photoW) / 2)
        ctx.beginPath()
        ctx.arc(px, py, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  }

  function step(dt: number) {
    elapsed += dt
    const radius = pointer.active ? INFLUENCE_RADIUS : -1
    for (const p of particles) {
      // gentle ambient wander around the home position, so the field reads as living
      // dust rather than a coat of static specks when the pointer is away
      const targetX = p.ox + Math.sin(elapsed * p.freq + p.phase) * DRIFT_AMPLITUDE
      const targetY = p.oy + Math.cos(elapsed * p.freq * 1.3 + p.phase) * DRIFT_AMPLITUDE

      const dx0 = p.x - targetX
      const dy0 = p.y - targetY
      let ax = -SPRING_K * dx0 - SPRING_DAMP * p.vx
      let ay = -SPRING_K * dy0 - SPRING_DAMP * p.vy

      if (radius > 0) {
        const ddx = p.ox - pointer.nx
        const ddy = p.oy - pointer.ny
        const d = Math.hypot(ddx, ddy)
        if (d < radius) {
          const f = 1 - smoothstep(0, radius, d)
          const inv = 1 / Math.max(d, 1e-4)
          const ff = PUSH_STRENGTH * f * f
          ax += ddx * inv * ff
          ay += ddy * inv * ff
        }
      }

      p.vx += ax * dt
      p.vy += ay * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
    }
  }

  function frame(now: number) {
    if (destroyed) return
    syncSize()
    const dt = Math.min(0.033, (now - last) / 1000) || 0.016
    last = now
    step(dt)
    draw()
    raf = requestAnimationFrame(frame)
  }

  function onPointerMove(e: PointerEvent) {
    const rect = host.getBoundingClientRect()
    pointer.nx = (e.clientX - rect.left) / rect.width
    pointer.ny = (e.clientY - rect.top) / rect.width
    pointer.active = true
  }

  function onPointerLeave() {
    pointer.active = false
  }

  const resizeObserver = new ResizeObserver(() => resizeCanvas())
  resizeObserver.observe(host)
  resizeObserver.observe(canvas)
  resizeCanvas()

  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerdown', onPointerMove)
  canvas.addEventListener('pointerleave', onPointerLeave)
  canvas.addEventListener('pointercancel', onPointerLeave)

  const img = new Image()
  img.decoding = 'async'
  img.onload = () => {
    if (destroyed) return
    syncSize()
    particles = buildParticles(img)
    if (!particles.length) return
    draw()
    onReady?.()
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }
  img.src = imageSrc

  return {
    destroy() {
      destroyed = true
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerdown', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('pointercancel', onPointerLeave)
    },
  }
}
