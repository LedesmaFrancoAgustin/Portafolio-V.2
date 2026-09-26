/* Scene data ported from the "Tech Ecosystem" Claude Design prototype
   (Tech Ecosystem.dc.html / tech-ecosystem.js) — positions, colors and link
   list kept verbatim so the 3D layout matches the design exactly. */

export type TechId =
  | 'react'
  | 'typescript'
  | 'vite'
  | 'tailwind'
  | 'claude'
  | 'node'
  | 'express'
  | 'rest'
  | 'postgres'
  | 'prisma'
  | 'mongo'
  | 'rls'
  | 'tenant'
  | 'git'
  | 'vitest'
  | 'eslint'
  | 'claudecode'
  | 'codex'
  | 'deploy'

export interface TechDef {
  id: TechId
  label: string
  cluster: 'Frontend' | 'Backend' | 'Data' | 'Architecture' | 'Tooling'
  color: number
  pos: [number, number, number]
  size: number
}

/** Logos that are already light/white on their own — skip the extra
 *  backing glow layer used to lift dark logos off the glass tile. */
export const LIGHT_LOGOS = new Set<TechId>([
  'react',
  'tailwind',
  'claude',
  'prisma',
  'mongo',
  'express',
  'typescript',
  'vitest',
])

export const TECH: TechDef[] = [
  { id: 'react', label: 'React', cluster: 'Frontend', color: 0x61dafb, pos: [-3.35, 1.75, 1.2], size: 1.58 },
  { id: 'typescript', label: 'TypeScript', cluster: 'Frontend', color: 0x3178c6, pos: [-2.3, 3.3, -0.45], size: 1.2 },
  { id: 'vite', label: 'Vite', cluster: 'Frontend', color: 0x8a5cf6, pos: [-5.95, 3.35, -1.5], size: 1.02 },
  { id: 'tailwind', label: 'Tailwind CSS', cluster: 'Frontend', color: 0x38bdf8, pos: [-5.0, 0.5, 0.15], size: 1.1 },
  { id: 'claude', label: 'Claude', cluster: 'Frontend', color: 0xda7756, pos: [-1.1, 1.0, 2.6], size: 0.95 },
  { id: 'node', label: 'Node.js', cluster: 'Backend', color: 0x6fbe4e, pos: [3.5, 2.1, 0.8], size: 1.55 },
  { id: 'express', label: 'Express', cluster: 'Backend', color: 0xe6eaf2, pos: [5.25, 0.7, -0.9], size: 1.18 },
  { id: 'rest', label: 'REST API', cluster: 'Backend', color: 0x22d3ee, pos: [2.6, 0.15, 1.7], size: 1.1 },
  { id: 'postgres', label: 'PostgreSQL', cluster: 'Data', color: 0x4c7fb8, pos: [3.2, -2.2, 0.2], size: 1.4 },
  { id: 'prisma', label: 'Prisma', cluster: 'Data', color: 0x5a67d8, pos: [4.6, -0.9, 1.3], size: 1.05 },
  { id: 'mongo', label: 'MongoDB', cluster: 'Data', color: 0x4db33d, pos: [1.15, -3.35, 1.35], size: 1.15 },
  { id: 'rls', label: 'Row-Level Security', cluster: 'Architecture', color: 0xf472b6, pos: [5.15, -2.95, -1.1], size: 1.0 },
  {
    id: 'tenant',
    label: 'Multi-tenant Architecture',
    cluster: 'Architecture',
    color: 0xa78bfa,
    pos: [-0.3, -3.7, -0.5],
    size: 1.05,
  },
  { id: 'git', label: 'Git', cluster: 'Tooling', color: 0xf05032, pos: [-1.95, -2.7, 2.2], size: 1.0 },
  { id: 'vitest', label: 'Vitest', cluster: 'Tooling', color: 0xfcc72b, pos: [-4.35, -2.2, -1.3], size: 0.95 },
  { id: 'eslint', label: 'ESLint', cluster: 'Tooling', color: 0x8b7cf6, pos: [5.8, 2.9, -2.2], size: 0.92 },
  { id: 'claudecode', label: 'Claude Code', cluster: 'Tooling', color: 0xc96442, pos: [-6.6, 1.6, 0.9], size: 0.95 },
  { id: 'codex', label: 'Codex', cluster: 'Tooling', color: 0x94a3b8, pos: [6.2, -1.0, -1.4], size: 0.9 },
  { id: 'deploy', label: 'VPS · Backblaze B2', cluster: 'Tooling', color: 0xe0393e, pos: [1.0, 3.7, -1.8], size: 0.95 },
]

export const LINKS: [TechId, TechId, number][] = [
  ['react', 'typescript', 1],
  ['typescript', 'vite', 1],
  ['vite', 'tailwind', 1],
  ['react', 'tailwind', 0.7],
  ['react', 'claude', 0.6],
  ['claude', 'typescript', 0.4],
  ['node', 'express', 1],
  ['express', 'rest', 1],
  ['react', 'rest', 1],
  ['rest', 'node', 1],
  ['node', 'postgres', 1],
  ['rest', 'postgres', 0.7],
  ['node', 'mongo', 1],
  ['postgres', 'rls', 1],
  ['postgres', 'prisma', 1],
  ['prisma', 'rest', 0.5],
  ['rls', 'tenant', 1],
  ['git', 'react', 0.5],
  ['git', 'node', 0.5],
  ['git', 'postgres', 0.5],
  ['vitest', 'react', 0.5],
  ['vitest', 'node', 0.5],
  ['eslint', 'react', 0.5],
  ['eslint', 'typescript', 0.5],
  ['eslint', 'node', 0.5],
  ['git', 'claudecode', 0.5],
  ['claudecode', 'node', 0.4],
  ['git', 'codex', 0.4],
  ['codex', 'react', 0.3],
  ['deploy', 'node', 0.6],
  ['deploy', 'postgres', 0.4],
]

export type CategoryId = 'frontend' | 'backend' | 'data' | 'tooling'

/** A description segment: plain text, or a tool/technology name to render
 *  in bold. Lets the card highlight the tools it mentions without needing
 *  HTML in the data file. */
export type DescriptionSegment = string | { bold: string }

/** One card per category, shown to the left of the 3D scene — same colors
 *  as the tiles/links in that cluster, so the card and the floating tiles
 *  read as the same group. */
export const CATEGORY_DETAILS: {
  id: CategoryId
  label: string
  color: string
  description: DescriptionSegment[]
}[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    color: '#61DAFB',
    description: [
      { bold: 'React' },
      ' y ',
      { bold: 'TypeScript' },
      ' para construir interfaces claras, con ',
      { bold: 'Tailwind CSS' },
      ' cuidando cada detalle visual .',
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    color: '#6FBE4E',
    description: [
      'APIs con ',
      { bold: 'Node.js' },
      ', ',
      { bold: 'JavaScript/TypeScript' },
      ' y ',
      { bold: 'Express' },
      ', exponiendo servicios REST que escalan junto con el producto.',
    ],
  },
  {
    id: 'data',
    label: 'Datos y Arquitectura',
    color: '#F472B6',
    description: [
      { bold: 'PostgreSQL' },
      ' con ',
      { bold: 'Prisma' },
      ', seguridad a nivel de fila (RLS) y una arquitectura multi-tenant pensada desde la base — con experiencia previa también en ',
      { bold: 'MongoDB' },
      '.',
    ],
  },
  {
    id: 'tooling',
    label: 'Herramientas',
    color: '#FCC72B',
    description: [
      { bold: 'Git' },
      ', ',
      { bold: 'Vitest' },
      ' y ',
      { bold: 'ESLint' },
      ' en el día a día, ',
      { bold: 'Claude Code' },
      ' y ',
      { bold: 'Codex' },
      ' como asistentes de IA en mi flujo de trabajo, y despliegue en VPS con almacenamiento en ',
      { bold: 'Backblaze B2' },
      '.',
    ],
  },
]

/** Maps each tile's 3D cluster to the (coarser) category card it belongs
 *  to — Data and Architecture tiles both highlight the same "Datos y
 *  Arquitectura" card. Used to sync the hovered tile with its card. */
export const CATEGORY_ID_BY_CLUSTER: Record<TechDef['cluster'], CategoryId> = {
  Frontend: 'frontend',
  Backend: 'backend',
  Data: 'data',
  Architecture: 'data',
  Tooling: 'tooling',
}

const TECH_BY_ID = new Map(TECH.map((tech) => [tech.id, tech]))

export function categoryIdForTech(id: TechId): CategoryId | null {
  const tech = TECH_BY_ID.get(id)
  return tech ? CATEGORY_ID_BY_CLUSTER[tech.cluster] : null
}
