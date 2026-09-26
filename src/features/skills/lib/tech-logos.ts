/* Canvas2D logo drawing, ported verbatim from the "Tech Ecosystem" Claude
   Design prototype (tech-ecosystem.js) — each function paints one tech's
   mark onto a transparent S×S canvas that's then used as a Three.js texture. */
import type { TechId } from './tech-data'

const TAU = Math.PI * 2
const FONT = (w: number, s: number, f?: string) =>
  `${w} ${s}px ${f || '"Space Grotesk", "Segoe UI", system-ui, sans-serif'}`

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function poly(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, n: number, rot: number) {
  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * TAU
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
  }
  ctx.closePath()
}

function txt(
  ctx: CanvasRenderingContext2D,
  s: string,
  cx: number,
  cy: number,
  size: number,
  color: string,
  weight?: number,
  font?: string,
) {
  ctx.fillStyle = color
  ctx.font = FONT(weight || 700, size, font)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(s, cx, cy)
}

type LogoFn = (ctx: CanvasRenderingContext2D, size: number) => void

export const LOGOS: Record<TechId, LogoFn> = {
  react(c, S) {
    const cx = S / 2
    const cy = S / 2
    c.strokeStyle = '#61DAFB'
    c.lineWidth = S * 0.035
    for (let i = 0; i < 3; i++) {
      c.save()
      c.translate(cx, cy)
      c.rotate(((i * 60) * Math.PI) / 180)
      c.beginPath()
      c.ellipse(0, 0, S * 0.4, S * 0.152, 0, 0, TAU)
      c.stroke()
      c.restore()
    }
    c.fillStyle = '#61DAFB'
    c.beginPath()
    c.arc(cx, cy, S * 0.072, 0, TAU)
    c.fill()
  },
  typescript(c, S) {
    c.fillStyle = '#3178C6'
    rr(c, S * 0.1, S * 0.1, S * 0.8, S * 0.8, S * 0.1)
    c.fill()
    txt(c, 'TS', S * 0.53, S * 0.56, S * 0.46, '#ffffff', 800)
  },
  vite(c, S) {
    const g = c.createLinearGradient(S * 0.2, S * 0.1, S * 0.8, S * 0.9)
    g.addColorStop(0, '#41D1FF')
    g.addColorStop(0.55, '#8A5CF6')
    g.addColorStop(1, '#BD34FE')
    c.fillStyle = g
    c.beginPath()
    c.moveTo(S * 0.5, S * 0.06)
    c.lineTo(S * 0.94, S * 0.24)
    c.lineTo(S * 0.52, S * 0.95)
    c.lineTo(S * 0.06, S * 0.24)
    c.closePath()
    c.fill()
    c.fillStyle = '#FFD62E'
    c.beginPath()
    c.moveTo(S * 0.6, S * 0.2)
    c.lineTo(S * 0.37, S * 0.24)
    c.lineTo(S * 0.46, S * 0.44)
    c.lineTo(S * 0.33, S * 0.47)
    c.lineTo(S * 0.4, S * 0.6)
    c.lineTo(S * 0.28, S * 0.63)
    c.lineTo(S * 0.56, S * 0.86)
    c.lineTo(S * 0.5, S * 0.58)
    c.lineTo(S * 0.64, S * 0.55)
    c.closePath()
    c.fill()
  },
  tailwind(c, S) {
    const g = c.createLinearGradient(S * 0.1, S * 0.2, S * 0.9, S * 0.8)
    g.addColorStop(0, '#38BDF8')
    g.addColorStop(1, '#0EA5E9')
    c.fillStyle = g
    c.beginPath()
    c.moveTo(S * 0.5, S * 0.28)
    c.bezierCurveTo(S * 0.5, S * 0.16, S * 0.6, S * 0.1, S * 0.72, S * 0.1)
    c.bezierCurveTo(S * 0.84, S * 0.1, S * 0.92, S * 0.18, S * 0.92, S * 0.3)
    c.bezierCurveTo(S * 0.86, S * 0.24, S * 0.79, S * 0.24, S * 0.74, S * 0.3)
    c.bezierCurveTo(S * 0.69, S * 0.36, S * 0.69, S * 0.44, S * 0.74, S * 0.5)
    c.bezierCurveTo(S * 0.62, S * 0.5, S * 0.5, S * 0.42, S * 0.5, S * 0.28)
    c.closePath()
    c.fill()
    c.beginPath()
    c.moveTo(S * 0.08, S * 0.62)
    c.bezierCurveTo(S * 0.08, S * 0.5, S * 0.18, S * 0.44, S * 0.3, S * 0.44)
    c.bezierCurveTo(S * 0.42, S * 0.44, S * 0.5, S * 0.52, S * 0.5, S * 0.64)
    c.bezierCurveTo(S * 0.44, S * 0.58, S * 0.37, S * 0.58, S * 0.32, S * 0.64)
    c.bezierCurveTo(S * 0.27, S * 0.7, S * 0.27, S * 0.78, S * 0.32, S * 0.84)
    c.bezierCurveTo(S * 0.2, S * 0.84, S * 0.08, S * 0.76, S * 0.08, S * 0.62)
    c.closePath()
    c.fill()
  },
  claude(c, S) {
    const cx = S / 2
    const cy = S / 2
    c.fillStyle = '#DA7756'
    const points = 8
    const rOuter = S * 0.4
    const rInner = S * 0.13
    for (let i = 0; i < points; i++) {
      c.save()
      c.translate(cx, cy)
      c.rotate((i / points) * TAU)
      c.beginPath()
      c.moveTo(0, -rInner)
      c.quadraticCurveTo(rOuter * 0.16, -rOuter * 0.55, 0, -rOuter)
      c.quadraticCurveTo(-rOuter * 0.16, -rOuter * 0.55, 0, -rInner)
      c.closePath()
      c.fill()
      c.restore()
    }
  },
  node(c, S) {
    c.strokeStyle = '#5FA04E'
    c.lineWidth = S * 0.045
    poly(c, S / 2, S / 2, S * 0.44, 6, -Math.PI / 2)
    c.stroke()
    txt(c, 'JS', S * 0.5, S * 0.55, S * 0.34, '#8CC84B', 800)
  },
  express(c, S) {
    txt(c, 'ex', S * 0.5, S * 0.42, S * 0.5, '#F2F4F8', 400, '"Space Grotesk", system-ui, sans-serif')
    txt(c, 'press', S * 0.5, S * 0.74, S * 0.24, 'rgba(242,244,248,0.9)', 400)
  },
  rest(c, S) {
    c.strokeStyle = '#22D3EE'
    c.lineWidth = S * 0.05
    c.lineCap = 'round'
    c.beginPath()
    c.moveTo(S * 0.34, S * 0.2)
    c.quadraticCurveTo(S * 0.18, S * 0.5, S * 0.34, S * 0.8)
    c.stroke()
    c.beginPath()
    c.moveTo(S * 0.66, S * 0.2)
    c.quadraticCurveTo(S * 0.82, S * 0.5, S * 0.66, S * 0.8)
    c.stroke()
    c.fillStyle = '#22D3EE'
    ;[0.36, 0.5, 0.64].forEach((x) => {
      c.beginPath()
      c.arc(S * x, S * 0.5, S * 0.048, 0, TAU)
      c.fill()
    })
  },
  prisma(c, S) {
    c.fillStyle = 'rgba(90,103,216,0.25)'
    c.strokeStyle = '#5A67D8'
    c.lineWidth = S * 0.045
    c.beginPath()
    c.moveTo(S * 0.5, S * 0.06)
    c.lineTo(S * 0.82, S * 0.32)
    c.lineTo(S * 0.68, S * 0.94)
    c.lineTo(S * 0.32, S * 0.94)
    c.lineTo(S * 0.18, S * 0.32)
    c.closePath()
    c.fill()
    c.stroke()
    c.strokeStyle = 'rgba(199,210,254,0.85)'
    c.lineWidth = S * 0.022
    c.beginPath()
    c.moveTo(S * 0.5, S * 0.06)
    c.lineTo(S * 0.5, S * 0.94)
    c.moveTo(S * 0.18, S * 0.32)
    c.lineTo(S * 0.82, S * 0.32)
    c.stroke()
  },
  postgres(c, S) {
    c.strokeStyle = '#6E9FD6'
    c.fillStyle = 'rgba(76,127,184,0.35)'
    c.lineWidth = S * 0.045
    for (let i = 2; i >= 0; i--) {
      const y = S * (0.3 + i * 0.2)
      c.beginPath()
      c.moveTo(S * 0.2, y)
      c.bezierCurveTo(S * 0.2, y + S * 0.075, S * 0.8, y + S * 0.075, S * 0.8, y)
      c.bezierCurveTo(S * 0.8, y - S * 0.075, S * 0.2, y - S * 0.075, S * 0.2, y)
      c.closePath()
      c.fill()
      c.stroke()
    }
    c.beginPath()
    c.moveTo(S * 0.2, S * 0.3)
    c.lineTo(S * 0.2, S * 0.7)
    c.moveTo(S * 0.8, S * 0.3)
    c.lineTo(S * 0.8, S * 0.7)
    c.stroke()
  },
  mongo(c, S) {
    c.fillStyle = '#4DB33D'
    c.beginPath()
    c.moveTo(S * 0.5, S * 0.05)
    c.bezierCurveTo(S * 0.8, S * 0.28, S * 0.8, S * 0.66, S * 0.53, S * 0.86)
    c.bezierCurveTo(S * 0.22, S * 0.66, S * 0.22, S * 0.28, S * 0.5, S * 0.05)
    c.closePath()
    c.fill()
    c.fillStyle = '#3F9C35'
    c.beginPath()
    c.moveTo(S * 0.5, S * 0.05)
    c.bezierCurveTo(S * 0.22, S * 0.28, S * 0.22, S * 0.66, S * 0.53, S * 0.86)
    c.lineTo(S * 0.5, S * 0.05)
    c.closePath()
    c.fill()
    c.strokeStyle = '#A8E59E'
    c.lineWidth = S * 0.028
    c.lineCap = 'round'
    c.beginPath()
    c.moveTo(S * 0.52, S * 0.24)
    c.lineTo(S * 0.53, S * 0.95)
    c.stroke()
  },
  rls(c, S) {
    c.strokeStyle = '#F472B6'
    c.lineWidth = S * 0.042
    c.beginPath()
    c.moveTo(S * 0.5, S * 0.08)
    c.lineTo(S * 0.86, S * 0.22)
    c.lineTo(S * 0.86, S * 0.54)
    c.bezierCurveTo(S * 0.86, S * 0.76, S * 0.68, S * 0.88, S * 0.5, S * 0.94)
    c.bezierCurveTo(S * 0.32, S * 0.88, S * 0.14, S * 0.76, S * 0.14, S * 0.54)
    c.lineTo(S * 0.14, S * 0.22)
    c.closePath()
    c.stroke()
    c.fillStyle = 'rgba(244,114,182,0.30)'
    c.fill()
    c.fillStyle = '#FBCFE8'
    ;[0.4, 0.55, 0.7].forEach((y, i) => {
      rr(c, S * (0.28 + i * 0.03), S * y, S * (0.44 - i * 0.06), S * 0.06, S * 0.03)
      c.fill()
    })
  },
  tenant(c, S) {
    c.strokeStyle = '#A78BFA'
    c.lineWidth = S * 0.04
    c.fillStyle = 'rgba(167,139,250,0.22)'
    rr(c, S * 0.1, S * 0.3, S * 0.34, S * 0.6, S * 0.06)
    c.fill()
    c.stroke()
    rr(c, S * 0.52, S * 0.14, S * 0.38, S * 0.76, S * 0.06)
    c.fill()
    c.stroke()
    c.fillStyle = '#DDD6FE'
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 2; j++) {
        c.beginPath()
        c.arc(S * (0.2 + j * 0.14), S * (0.44 + i * 0.16), S * 0.026, 0, TAU)
        c.fill()
      }
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 2; j++) {
        c.beginPath()
        c.arc(S * (0.62 + j * 0.16), S * (0.28 + i * 0.16), S * 0.026, 0, TAU)
        c.fill()
      }
  },
  git(c, S) {
    c.strokeStyle = '#F05032'
    c.lineWidth = S * 0.05
    c.lineCap = 'round'
    c.beginPath()
    c.moveTo(S * 0.28, S * 0.84)
    c.lineTo(S * 0.28, S * 0.26)
    c.stroke()
    c.beginPath()
    c.moveTo(S * 0.28, S * 0.52)
    c.quadraticCurveTo(S * 0.28, S * 0.3, S * 0.7, S * 0.3)
    c.stroke()
    c.fillStyle = '#0B0F1E'
    ;([
      [0.28, 0.2],
      [0.28, 0.86],
      [0.74, 0.3],
    ] as [number, number][]).forEach((p) => {
      c.beginPath()
      c.arc(S * p[0], S * p[1], S * 0.105, 0, TAU)
      c.fill()
      c.strokeStyle = '#F05032'
      c.lineWidth = S * 0.05
      c.beginPath()
      c.arc(S * p[0], S * p[1], S * 0.105, 0, TAU)
      c.stroke()
    })
  },
  vitest(c, S) {
    c.strokeStyle = '#729B1B'
    c.lineWidth = S * 0.05
    c.beginPath()
    c.arc(S * 0.5, S * 0.5, S * 0.4, 0, TAU)
    c.stroke()
    c.fillStyle = '#FCC72B'
    c.beginPath()
    c.moveTo(S * 0.6, S * 0.16)
    c.lineTo(S * 0.34, S * 0.54)
    c.lineTo(S * 0.49, S * 0.54)
    c.lineTo(S * 0.42, S * 0.86)
    c.lineTo(S * 0.7, S * 0.44)
    c.lineTo(S * 0.54, S * 0.44)
    c.closePath()
    c.fill()
  },
  eslint(c, S) {
    c.strokeStyle = '#8B7CF6'
    c.lineWidth = S * 0.045
    poly(c, S / 2, S / 2, S * 0.42, 6, 0)
    c.stroke()
    c.fillStyle = 'rgba(75,50,195,0.28)'
    c.fill()
    c.strokeStyle = '#EDE9FE'
    c.lineWidth = S * 0.05
    c.lineCap = 'round'
    c.beginPath()
    c.moveTo(S * 0.44, S * 0.3)
    c.lineTo(S * 0.28, S * 0.5)
    c.lineTo(S * 0.44, S * 0.7)
    c.stroke()
    c.beginPath()
    c.moveTo(S * 0.58, S * 0.3)
    c.lineTo(S * 0.74, S * 0.5)
    c.lineTo(S * 0.58, S * 0.7)
    c.stroke()
  },
  claudecode(c, S) {
    c.fillStyle = 'rgba(201,100,66,0.18)'
    rr(c, S * 0.1, S * 0.14, S * 0.8, S * 0.72, S * 0.12)
    c.fill()
    c.strokeStyle = '#C96442'
    c.lineWidth = S * 0.05
    rr(c, S * 0.1, S * 0.14, S * 0.8, S * 0.72, S * 0.12)
    c.stroke()
    c.strokeStyle = '#F3B79B'
    c.lineWidth = S * 0.055
    c.lineCap = 'round'
    c.lineJoin = 'round'
    c.beginPath()
    c.moveTo(S * 0.28, S * 0.36)
    c.lineTo(S * 0.42, S * 0.5)
    c.lineTo(S * 0.28, S * 0.64)
    c.stroke()
    c.beginPath()
    c.moveTo(S * 0.5, S * 0.66)
    c.lineTo(S * 0.72, S * 0.66)
    c.stroke()
  },
  codex(c, S) {
    c.strokeStyle = '#94A3B8'
    c.lineWidth = S * 0.06
    c.lineCap = 'round'
    c.beginPath()
    c.moveTo(S * 0.42, S * 0.14)
    c.quadraticCurveTo(S * 0.28, S * 0.14, S * 0.28, S * 0.3)
    c.lineTo(S * 0.28, S * 0.42)
    c.quadraticCurveTo(S * 0.28, S * 0.5, S * 0.18, S * 0.5)
    c.quadraticCurveTo(S * 0.28, S * 0.5, S * 0.28, S * 0.58)
    c.lineTo(S * 0.28, S * 0.7)
    c.quadraticCurveTo(S * 0.28, S * 0.86, S * 0.42, S * 0.86)
    c.stroke()
    c.beginPath()
    c.moveTo(S * 0.58, S * 0.14)
    c.quadraticCurveTo(S * 0.72, S * 0.14, S * 0.72, S * 0.3)
    c.lineTo(S * 0.72, S * 0.42)
    c.quadraticCurveTo(S * 0.72, S * 0.5, S * 0.82, S * 0.5)
    c.quadraticCurveTo(S * 0.72, S * 0.5, S * 0.72, S * 0.58)
    c.lineTo(S * 0.72, S * 0.7)
    c.quadraticCurveTo(S * 0.72, S * 0.86, S * 0.58, S * 0.86)
    c.stroke()
  },
  deploy(c, S) {
    c.fillStyle = 'rgba(224,57,62,0.16)'
    rr(c, S * 0.18, S * 0.5, S * 0.64, S * 0.34, S * 0.08)
    c.fill()
    c.strokeStyle = '#E0393E'
    c.lineWidth = S * 0.045
    rr(c, S * 0.18, S * 0.5, S * 0.64, S * 0.34, S * 0.08)
    c.stroke()
    c.fillStyle = '#E0393E'
    ;[0.6, 0.73].forEach((y) => {
      c.beginPath()
      c.arc(S * 0.28, S * y, S * 0.028, 0, TAU)
      c.fill()
    })
    c.strokeStyle = '#F3A5A7'
    c.lineWidth = S * 0.05
    c.lineCap = 'round'
    c.lineJoin = 'round'
    c.beginPath()
    c.moveTo(S * 0.5, S * 0.42)
    c.lineTo(S * 0.5, S * 0.14)
    c.moveTo(S * 0.38, S * 0.26)
    c.lineTo(S * 0.5, S * 0.14)
    c.lineTo(S * 0.62, S * 0.26)
    c.stroke()
  },
}
