import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  HORIZONTAL_STREETS,
  HOUSE_SPOTS,
  NINJA_SIZE,
  NINJA_SPAWNS,
  NINJA_SPEED,
  PLAYER_SIZE,
  PLAYER_SPEED,
  PLAYER_START,
  STREET_HALF_WIDTH,
  STREET_VISUAL_WIDTH,
  VERTICAL_STREETS,
  WALK_FRAME_INTERVAL,
  type Direction,
} from './naruto-game-constants'
import { NARUTO_GAME_ASSETS } from './naruto-game-assets'

export interface NarutoGameOptions {
  onGameOver?: () => void
}

export interface NarutoGameController {
  start(): void
  restart(): void
  setDirectionPressed(direction: Direction, pressed: boolean): void
  destroy(): void
}

interface PlayerState {
  x: number
  y: number
  facing: Direction
  moving: boolean
  walkFrame: 0 | 1
  walkTimer: number
}

interface NinjaState {
  x: number
  y: number
  axis: 'vertical' | 'horizontal'
}

// El jugador puede moverse mientras esté alineado con algún corredor: portado de
// Juego.estaEnRangoX/estaEnRangoY (los casos límite "==inicio/fin" del original colapsan
// acá a "dentro del corredor", equivalente para movimiento continuo).
const onVerticalStreet = (x: number) =>
  VERTICAL_STREETS.some((center) => x > center - STREET_HALF_WIDTH && x < center + STREET_HALF_WIDTH)
const onHorizontalStreet = (y: number) =>
  HORIZONTAL_STREETS.some((center) => y > center - STREET_HALF_WIDTH && y < center + STREET_HALF_WIDTH)
const canStandAt = (x: number, y: number) => onVerticalStreet(x) || onHorizontalStreet(y)

function aabbOverlap(ax: number, ay: number, aSize: number, bx: number, by: number, bSize: number) {
  return Math.abs(ax - bx) < (aSize + bSize) / 2 && Math.abs(ay - by) < (aSize + bSize) / 2
}

interface TrimmedSprite {
  img: HTMLImageElement
  sx: number
  sy: number
  sw: number
  sh: number
}

// Los sprites originales (screenshots de la ventana Swing del juego) traen el personaje
// como un recorte diminuto dentro de un lienzo casi todo transparente — sin recortar al
// contenido real, drawImage lo dibuja casi invisible. Se recorta al bounding box de
// píxeles no transparentes una sola vez, al cargar (en un JPG sin alfa da la imagen
// completa, así que es seguro aplicarlo a todos los sprites por igual).
function trimSprite(img: HTMLImageElement): TrimmedSprite {
  const w = img.naturalWidth
  const h = img.naturalHeight
  const offscreen = document.createElement('canvas')
  offscreen.width = w
  offscreen.height = h
  const offCtx = offscreen.getContext('2d')
  if (!offCtx) return { img, sx: 0, sy: 0, sw: w, sh: h }

  offCtx.drawImage(img, 0, 0)
  const { data } = offCtx.getImageData(0, 0, w, h)
  let minX = w
  let minY = h
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 10) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < minX || maxY < minY) return { img, sx: 0, sy: 0, sw: w, sh: h }
  return { img, sx: minX, sy: minY, sw: maxX - minX + 1, sh: maxY - minY + 1 }
}

function loadSprite(src: string): Promise<TrimmedSprite> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(trimSprite(img))
    img.onerror = () => reject(new Error(`No se pudo cargar ${src}`))
    img.src = src
  })
}

function drawSprite(ctx: CanvasRenderingContext2D, sprite: TrimmedSprite, cx: number, cy: number, targetH: number) {
  const w = (sprite.sw / sprite.sh) * targetH
  ctx.drawImage(sprite.img, sprite.sx, sprite.sy, sprite.sw, sprite.sh, cx - w / 2, cy - targetH / 2, w, targetH)
}

export function mountNarutoGame(
  canvas: HTMLCanvasElement,
  { onGameOver }: NarutoGameOptions = {},
): NarutoGameController {
  const ctx = canvas.getContext('2d')
  canvas.width = ARENA_WIDTH
  canvas.height = ARENA_HEIGHT

  let destroyed = false
  let started = false
  let gameOver = false
  let ready = false
  let raf = 0
  let last = 0

  const pressed: Record<Direction, boolean> = { up: false, down: false, left: false, right: false }

  const player: PlayerState = {
    x: PLAYER_START.x,
    y: PLAYER_START.y,
    facing: 'down',
    moving: false,
    walkFrame: 0,
    walkTimer: 0,
  }
  const ninjas: NinjaState[] = NINJA_SPAWNS.map((spawn) => ({ ...spawn }))

  const sprites: Partial<Record<string, TrimmedSprite>> = {}

  Promise.all([
    loadSprite(NARUTO_GAME_ASSETS.background).then((sprite) => (sprites.background = sprite)),
    loadSprite(NARUTO_GAME_ASSETS.house).then((sprite) => (sprites.house = sprite)),
    loadSprite(NARUTO_GAME_ASSETS.ninja).then((sprite) => (sprites.ninja = sprite)),
    loadSprite(NARUTO_GAME_ASSETS.playerIdle).then((sprite) => (sprites.playerIdle = sprite)),
    ...(Object.keys(NARUTO_GAME_ASSETS.playerWalk) as Direction[]).flatMap((direction) =>
      NARUTO_GAME_ASSETS.playerWalk[direction].map((src, frame) =>
        loadSprite(src).then((sprite) => (sprites[`walk-${direction}-${frame}`] = sprite)),
      ),
    ),
  ]).then(() => {
    if (destroyed) return
    ready = true
    draw()
  })

  function resetEntities() {
    player.x = PLAYER_START.x
    player.y = PLAYER_START.y
    player.facing = 'down'
    player.moving = false
    player.walkFrame = 0
    player.walkTimer = 0
    NINJA_SPAWNS.forEach((spawn, i) => {
      ninjas[i].x = spawn.x
      ninjas[i].y = spawn.y
    })
  }

  function update(dt: number) {
    if (!started || gameOver) return

    let dx = 0
    let dy = 0
    if (pressed.left) dx -= 1
    if (pressed.right) dx += 1
    if (pressed.up) dy -= 1
    if (pressed.down) dy += 1

    player.moving = dx !== 0 || dy !== 0
    if (dx !== 0) player.facing = dx > 0 ? 'right' : 'left'
    else if (dy !== 0) player.facing = dy > 0 ? 'down' : 'up'

    if (dx !== 0 && dy !== 0) {
      dx *= Math.SQRT1_2
      dy *= Math.SQRT1_2
    }

    const step = PLAYER_SPEED * dt
    const half = PLAYER_SIZE / 2
    const nextX = Math.min(ARENA_WIDTH - half, Math.max(half, player.x + dx * step))
    const nextY = Math.min(ARENA_HEIGHT - half, Math.max(half, player.y + dy * step))
    if (dx !== 0 && canStandAt(nextX, player.y)) player.x = nextX
    if (dy !== 0 && canStandAt(player.x, nextY)) player.y = nextY

    if (player.moving) {
      player.walkTimer += dt
      if (player.walkTimer >= WALK_FRAME_INTERVAL) {
        player.walkTimer = 0
        player.walkFrame = player.walkFrame === 0 ? 1 : 0
      }
    } else {
      player.walkFrame = 0
      player.walkTimer = 0
    }

    // Patrulla + wrap-around portados 1:1 de Juego.tick() (EnemigoNinjaV/H).
    const ninjaStep = NINJA_SPEED * dt
    for (const ninja of ninjas) {
      if (ninja.axis === 'vertical') {
        ninja.y += ninjaStep
        if (ninja.y > ARENA_HEIGHT) ninja.y = 0
      } else {
        ninja.x += ninjaStep
        if (ninja.x > ARENA_WIDTH) ninja.x = 0
      }
      if (aabbOverlap(player.x, player.y, PLAYER_SIZE, ninja.x, ninja.y, NINJA_SIZE)) {
        gameOver = true
        onGameOver?.()
      }
    }
  }

  function drawStreets() {
    if (!ctx) return
    ctx.fillStyle = 'rgba(148, 163, 184, 0.55)'
    for (const center of VERTICAL_STREETS) {
      ctx.fillRect(center - STREET_VISUAL_WIDTH / 2, 0, STREET_VISUAL_WIDTH, ARENA_HEIGHT)
    }
    for (const center of HORIZONTAL_STREETS) {
      ctx.fillRect(0, center - STREET_VISUAL_WIDTH / 2, ARENA_WIDTH, STREET_VISUAL_WIDTH)
    }
  }

  function drawPlayer() {
    if (!ctx) return
    const sprite = player.moving ? sprites[`walk-${player.facing}-${player.walkFrame}`] : sprites.playerIdle
    if (!sprite) return
    drawSprite(ctx, sprite, player.x, player.y, 50)
  }

  function draw() {
    if (!ctx) return
    ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
    if (sprites.background) {
      const bg = sprites.background
      ctx.drawImage(bg.img, bg.sx, bg.sy, bg.sw, bg.sh, 0, 0, ARENA_WIDTH, ARENA_HEIGHT)
    }
    drawStreets()
    if (sprites.house) {
      for (const spot of HOUSE_SPOTS) drawSprite(ctx, sprites.house, spot.x, spot.y, 50)
    }
    if (sprites.ninja) {
      for (const ninja of ninjas) drawSprite(ctx, sprites.ninja, ninja.x, ninja.y, 56)
    }
    drawPlayer()
  }

  function frame(now: number) {
    if (destroyed) return
    const dt = Math.min(0.033, (now - last) / 1000) || 0.016
    last = now
    if (ready) {
      update(dt)
      draw()
    }
    raf = requestAnimationFrame(frame)
  }

  last = performance.now()
  raf = requestAnimationFrame(frame)

  return {
    start() {
      started = true
    },
    restart() {
      gameOver = false
      resetEntities()
      started = true
    },
    setDirectionPressed(direction, isPressed) {
      pressed[direction] = isPressed
    },
    destroy() {
      destroyed = true
      cancelAnimationFrame(raf)
    },
  }
}
