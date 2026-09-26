/* Brand SVGs downloaded from https://github.com/LelouchFR/skill-icons (MIT)
   for the technologies that have an official mark — kept as files under
   ../assets/icons so they're versioned like any other asset, not fetched at
   runtime. The remaining TechIds (REST API, RLS, multi-tenant, Claude Code,
   Codex, deploy) are illustrated concepts with no logo of their own, so they
   keep the hand-drawn versions in tech-logos.ts. */
import type { TechId } from './tech-data'

import claudeSvg from '../assets/icons/claude.svg?raw'
import eslintSvg from '../assets/icons/eslint.svg?raw'
import expressSvg from '../assets/icons/express.svg?raw'
import gitSvg from '../assets/icons/git.svg?raw'
import mongoSvg from '../assets/icons/mongo.svg?raw'
import nodeSvg from '../assets/icons/node.svg?raw'
import postgresSvg from '../assets/icons/postgres.svg?raw'
import prismaSvg from '../assets/icons/prisma.svg?raw'
import reactSvg from '../assets/icons/react.svg?raw'
import tailwindSvg from '../assets/icons/tailwind.svg?raw'
import typescriptSvg from '../assets/icons/typescript.svg?raw'
import viteSvg from '../assets/icons/vite.svg?raw'
import vitestSvg from '../assets/icons/vitest.svg?raw'

export const TECH_ICON_SVGS: Partial<Record<TechId, string>> = {
  react: reactSvg,
  typescript: typescriptSvg,
  vite: viteSvg,
  tailwind: tailwindSvg,
  claude: claudeSvg,
  node: nodeSvg,
  express: expressSvg,
  postgres: postgresSvg,
  prisma: prismaSvg,
  mongo: mongoSvg,
  git: gitSvg,
  vitest: vitestSvg,
  eslint: eslintSvg,
}
