import { useMemo, type CSSProperties } from 'react'

type Star = {
  id: number
  left: number
  top: number
  size: number
  duration: number
  delay: number
  peak: number
  glow: boolean
}

const STAR_COUNT = 70
const STAR_COUNT_NIGHT = 160

function makeStars(night: boolean): Star[] {
  const stars: Star[] = []
  const count = night ? STAR_COUNT_NIGHT : STAR_COUNT
  // by day the painted stars in the sky artwork sit in its upper, darker band —
  // bias placement there so these blend in rather than floating over the sunset glow.
  // at night the whole sky reads dark, so stars can spread across its full height
  const topSpread = night ? 100 : 56
  for (let i = 0; i < count; i++) {
    const top = Math.pow(Math.random(), 1.4) * topSpread
    const glow = Math.random() < (night ? 0.22 : 0.16)
    stars.push({
      id: i,
      left: Math.random() * 100,
      top,
      size: glow ? 2.4 + Math.random() * 1.4 : 1 + Math.random() * 1.4,
      duration: 2.2 + Math.random() * 3.2,
      delay: -Math.random() * 6,
      peak: (night ? 0.7 : 0.55) + Math.random() * 0.45,
      glow,
    })
  }
  return stars
}

export function StarField({ night = false }: { night?: boolean }) {
  const stars = useMemo(() => makeStars(night), [night])

  return (
    <div className="scene-stars">
      {stars.map((star) => (
        <span
          key={star.id}
          className={star.glow ? 'scene-star scene-star--glow' : 'scene-star'}
          style={
            {
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
              '--star-peak': star.peak,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
