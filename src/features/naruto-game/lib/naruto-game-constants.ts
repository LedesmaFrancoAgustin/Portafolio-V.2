export type Direction = 'up' | 'down' | 'left' | 'right'

export const ARENA_WIDTH = 800
export const ARENA_HEIGHT = 600

export const PLAYER_SIZE = 30
// 5 px/tick en el original, calibrado a un loop de ~60 ticks/s.
export const PLAYER_SPEED = 300
export const PLAYER_START = { x: 100, y: 580 }

export const NINJA_SIZE = 30
// 2 px/tick en el original, misma calibración que el jugador.
export const NINJA_SPEED = 120

// Corredores portados de Juego.java: calleA-D (verticales, x=100/300/500/700) y
// calle1-3 (horizontales, y=100/300/500). El ancho caminable real surge de
// (calleA.ancho - sakura.ancho) / 2 = (50-30)/2 = 10 a cada lado del centro.
export const VERTICAL_STREETS = [100, 300, 500, 700]
export const HORIZONTAL_STREETS = [100, 300, 500]
export const STREET_HALF_WIDTH = 10
export const STREET_VISUAL_WIDTH = 50

export interface NinjaSpawn {
  x: number
  y: number
  axis: 'vertical' | 'horizontal'
}

// Coordenadas y velocidad portadas 1:1 de EnemigoNinjaV/EnemigoNinjaH en Juego.java.
export const NINJA_SPAWNS: readonly NinjaSpawn[] = [
  { x: 100, y: 200, axis: 'vertical' },
  { x: 300, y: 100, axis: 'vertical' },
  { x: 500, y: 500, axis: 'vertical' },
  { x: 700, y: 300, axis: 'vertical' },
  { x: 500, y: 100, axis: 'horizontal' },
  { x: 750, y: 300, axis: 'horizontal' },
  { x: 100, y: 500, axis: 'horizontal' },
]

// Casas decorativas entre calles, sin interacción (fuera del alcance mínimo).
export const HOUSE_SPOTS: readonly { x: number; y: number }[] = [
  { x: 190, y: 40 },
  { x: 390, y: 40 },
  { x: 590, y: 40 },
  { x: 190, y: 200 },
  { x: 590, y: 200 },
  { x: 190, y: 400 },
  { x: 590, y: 400 },
]

export const WALK_FRAME_INTERVAL = 0.18
