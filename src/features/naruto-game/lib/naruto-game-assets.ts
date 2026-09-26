import type { Direction } from './naruto-game-constants'
import background from '../assets/background.jpg'
import house from '../assets/house.png'
import ninja from '../assets/ninja.png'
import playerIdle from '../assets/player-idle.png'
import playerDown1 from '../assets/player-down-1.png'
import playerDown2 from '../assets/player-down-2.png'
import playerUp1 from '../assets/player-up-1.png'
import playerUp2 from '../assets/player-up-2.png'
import playerLeft1 from '../assets/player-left-1.png'
import playerLeft2 from '../assets/player-left-2.png'
import playerRight1 from '../assets/player-right-1.png'
import playerRight2 from '../assets/player-right-2.png'

export const NARUTO_GAME_ASSETS = {
  background,
  house,
  ninja,
  playerIdle,
  playerWalk: {
    down: [playerDown1, playerDown2],
    up: [playerUp1, playerUp2],
    left: [playerLeft1, playerLeft2],
    right: [playerRight1, playerRight2],
  } satisfies Record<Direction, [string, string]>,
}
