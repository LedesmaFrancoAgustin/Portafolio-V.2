/* Scene data ported from the "Hero Projection" Claude Design prototype
   (Hero Projection.dc.html) — folders, files and syntax-highlighted lines
   kept verbatim so the editor mockup matches the design exactly. */

export type SyntaxTone =
  | 'key'
  | 'fn'
  | 'str'
  | 'num'
  | 'cmt'
  | 'txt'
  | 'type'
  | 'punc'
  | 'prop'
  | 'tag'
  | 'head'

export type CodeSegment = [text: string, tone: SyntaxTone]

export const TONE_COLOR: Record<SyntaxTone, string> = {
  key: '#c792ea',
  fn: '#82aaff',
  str: '#ff9a4d',
  num: '#f78c6c',
  cmt: '#4a5a72',
  txt: '#cfd9ea',
  type: '#7fd4ff',
  punc: '#6f7f99',
  prop: '#a6d6ff',
  tag: '#7fd4ff',
  head: '#ffb27a',
}

const TINT = { ts: '#3b82f6', tsx: '#22d3ee', md: '#8ea3c0', prisma: '#5eead4' } as const

export function tintFor(name: string): string {
  if (name.endsWith('.tsx')) return TINT.tsx
  if (name.endsWith('.md')) return TINT.md
  if (name.endsWith('.prisma')) return TINT.prisma
  return TINT.ts
}

export function langFor(name: string): string {
  if (name.endsWith('.tsx')) return 'TypeScript React'
  if (name.endsWith('.md')) return 'Markdown'
  if (name.endsWith('.prisma')) return 'Prisma'
  return 'TypeScript'
}

export interface FolderDef {
  name: string
  tint: string
  files: string[]
}

export const FOLDERS: FolderDef[] = [
  { name: 'backend', tint: '#e8b339', files: ['users.routes.ts', 'users.controller.ts', 'users.service.ts', 'schema.prisma'] },
  { name: 'front', tint: '#6f8bb0', files: ['App.tsx', 'UserDetail.tsx', 'api.ts'] },
  { name: 'docs', tint: '#4d93d9', files: ['README.md', 'architecture.md', 'AGENTS.md'] },
]

export const CODE: Record<string, CodeSegment[][]> = {
  'users.routes.ts': [
    [['import ', 'key'], ['{ ', 'punc'], ['Router', 'type'], [' } ', 'punc'], ['from ', 'key'], ["'express'", 'str'], [';', 'punc']],
    [['import ', 'key'], ['{ ', 'punc'], ['userController', 'type'], [' } ', 'punc'], ['from ', 'key'], ["'./users.controller'", 'str'], [';', 'punc']],
    [['import ', 'key'], ['{ ', 'punc'], ['authMiddleware', 'type'], [', ', 'punc'], ['requireRole', 'type'], [' } ', 'punc'], ['from ', 'key'], ["'../middlewares/auth.middleware'", 'str'], [';', 'punc']],
    [],
    [['const ', 'key'], ['router ', 'txt'], ['= ', 'punc'], ['Router', 'fn'], ['();', 'punc']],
    [],
    [['router', 'txt'], ['.', 'punc'], ['use', 'fn'], ['(authMiddleware);', 'punc']],
    [],
    [['// GET /api/users/:id — scope por curso en el service', 'cmt']],
    [['router', 'txt'], ['.', 'punc'], ['get', 'fn'], ['(', 'punc'], ["'/:id'", 'str'], [',', 'punc']],
    [['  requireRole', 'fn'], ['(', 'punc'], ["'director'", 'str'], [', ', 'punc'], ["'secretario'", 'str'], [', ', 'punc'], ["'preceptor'", 'str'], [', ', 'punc'], ["'docente'", 'str'], ['),', 'punc']],
    [['  (req, res, next) ', 'punc'], ['=> ', 'key'], ['userController', 'txt'], ['.', 'punc'], ['findById', 'prop'], ['(req, res, next)', 'punc']],
    [[');', 'punc']],
    [],
    [['export ', 'key'], ['default ', 'key'], ['router', 'txt'], [';', 'punc']],
  ],
  'users.controller.ts': [
    [['import ', 'key'], ['{ ', 'punc'], ['Request', 'type'], [', ', 'punc'], ['Response', 'type'], [', ', 'punc'], ['NextFunction', 'type'], [' } ', 'punc'], ['from ', 'key'], ["'express'", 'str'], [';', 'punc']],
    [['import ', 'key'], ['{ ', 'punc'], ['userService', 'txt'], [' } ', 'punc'], ['from ', 'key'], ["'../services/users/users.service'", 'str'], [';', 'punc']],
    [['import ', 'key'], ['{ ', 'punc'], ['errors', 'txt'], [' } ', 'punc'], ['from ', 'key'], ["'../middlewares/errorHandler.middleware'", 'str'], [';', 'punc']],
    [],
    [['// GET /api/users/:id', 'cmt']],
    [['export ', 'key'], ['async ', 'key'], ['function ', 'key'], ['findById', 'fn'], ['(req, res, next) ', 'punc'], ['{', 'punc']],
    [['  try ', 'key'], ['{', 'punc']],
    [['    const ', 'key'], ['id ', 'txt'], ['= ', 'punc'], ['parseInt', 'fn'], ['(req.params.id);', 'punc']],
    [['    if ', 'key'], ['(isNaN(id)) ', 'punc'], ['{ next(errors', 'txt'], ['.', 'punc'], ['badRequest', 'fn'], ['(', 'punc'], ["'ID inválido'", 'str'], [')); return; }', 'punc']],
    [],
    [['    const ', 'key'], ['user ', 'txt'], ['= ', 'punc'], ['await ', 'key'], ['userService', 'txt'], ['.', 'punc'], ['findById', 'fn'], ['(id, req.user.tenantId, req.user);', 'punc']],
    [['    res', 'txt'], ['.', 'punc'], ['status', 'fn'], ['(', 'punc'], ['200', 'num'], [').', 'punc'], ['json', 'fn'], ['({ success: true, data: user });', 'punc']],
    [['  } ', 'punc'], ['catch ', 'key'], ['(err) ', 'punc'], ['{ next(err); }', 'punc']],
    [['}', 'punc']],
  ],
  'users.service.ts': [
    [['import ', 'key'], ['{ ', 'punc'], ['prisma', 'txt'], [' } ', 'punc'], ['from ', 'key'], ["'../../db'", 'str'], [';', 'punc']],
    [['import ', 'key'], ['{ ', 'punc'], ['getScopedCourseIds', 'fn'], [' } ', 'punc'], ['from ', 'key'], ["'../courseScope.service'", 'str'], [';', 'punc']],
    [],
    [['export ', 'key'], ['const ', 'key'], ['userService ', 'txt'], ['= ', 'punc'], ['{', 'punc']],
    [['  async ', 'key'], ['findById', 'fn'], ['(id: number, tenantId: number, viewer?: ', 'punc'], ['JWTPayload', 'type'], [') {', 'punc']],
    [['    const ', 'key'], ['user ', 'txt'], ['= ', 'punc'], ['await ', 'key'], ['prisma', 'txt'], ['.', 'punc'], ['user', 'prop'], ['.', 'punc'], ['findFirst', 'fn'], ['({', 'punc']],
    [['      where', 'prop'], [': { id, tenantId },', 'punc']],
    [['      select', 'prop'], [': { id: true, name: true, role: true },', 'punc']],
    [['    });', 'punc']],
    [['    if ', 'key'], ['(!user) ', 'punc'], ['throw new ', 'key'], ['AppError', 'fn'], ['(', 'punc'], ["'Usuario no encontrado'", 'str'], [', ', 'punc'], ['404', 'num'], [');', 'punc']],
    [['    // acota lectura por curso — ver assertViewerCanSee', 'cmt']],
    [['    await ', 'key'], ['this', 'txt'], ['.', 'punc'], ['assertViewerCanSee', 'fn'], ['(user.id, user.role, viewer);', 'punc']],
    [['    return ', 'key'], ['user;', 'txt']],
    [['  },', 'punc']],
    [['};', 'punc']],
  ],
  'schema.prisma': [
    [['model ', 'key'], ['User', 'type'], [' {', 'punc']],
    [['  id       ', 'prop'], ['Int          ', 'type'], ['@id ', 'fn'], ['@default', 'fn'], ['(autoincrement())', 'punc']],
    [['  tenantId ', 'prop'], ['Int', 'type']],
    [['  name     ', 'prop'], ['String       ', 'type'], ['@db.VarChar', 'fn'], ['(', 'punc'], ['100', 'num'], [')', 'punc']],
    [['  dni      ', 'prop'], ['String       ', 'type'], ['@db.VarChar', 'fn'], ['(', 'punc'], ['20', 'num'], [')', 'punc']],
    [['  role     ', 'prop'], ['UserRole', 'type']],
    [['  state    ', 'prop'], ['RecordStatus ', 'type'], ['@default', 'fn'], ['(active)', 'punc']],
    [],
    [['  tenant  ', 'prop'], ['Tenant   ', 'type'], ['@relation', 'fn'], ['(fields: [tenantId], references: [id])', 'punc']],
    [['  student ', 'prop'], ['Student?', 'type']],
    [],
    [['  @@unique', 'fn'], ['([tenantId, dni], name: ', 'punc'], ['"uq_users_tenant_dni"', 'str'], [')', 'punc']],
    [['  @@map', 'fn'], ['(', 'punc'], ['"users"', 'str'], [')', 'punc']],
    [['}', 'punc']],
  ],
  'App.tsx': [
    [['import ', 'key'], ['{ ', 'punc'], ['UserDetail', 'type'], [' } ', 'punc'], ['from ', 'key'], ["'./UserDetail'", 'str'], [';', 'punc']],
    [],
    [['export ', 'key'], ['default ', 'key'], ['function ', 'key'], ['App', 'fn'], ['() ', 'punc'], ['{', 'punc']],
    [['  return ', 'key'], ['(', 'punc']],
    [['    <', 'punc'], ['main ', 'tag'], ['className', 'prop'], ['=', 'punc'], ['"app"', 'str'], ['>', 'punc']],
    [['      <', 'punc'], ['UserDetail ', 'type'], ['userId', 'prop'], ['={1} ', 'punc'], ['/>', 'punc']],
    [['    </', 'punc'], ['main', 'tag'], ['>', 'punc']],
    [['  );', 'punc']],
    [['}', 'punc']],
  ],
  'UserDetail.tsx': [
    [['import ', 'key'], ['{ ', 'punc'], ['useUser', 'fn'], [' } ', 'punc'], ['from ', 'key'], ["'./api'", 'str'], [';', 'punc']],
    [],
    [['export ', 'key'], ['function ', 'key'], ['UserDetail', 'fn'], ['({ userId }) ', 'punc'], ['{', 'punc']],
    [['  const ', 'key'], ['{ data, loading } ', 'punc'], ['= ', 'punc'], ['useUser', 'fn'], ['(userId);', 'punc']],
    [['  if ', 'key'], ['(loading) ', 'punc'], ['return ', 'key'], ['<', 'punc'], ['Spinner ', 'type'], ['/>;', 'punc']],
    [],
    [['  return ', 'key'], ['(', 'punc']],
    [['    <', 'punc'], ['section ', 'tag'], ['className', 'prop'], ['=', 'punc'], ['"user-card"', 'str'], ['>', 'punc']],
    [['      <', 'punc'], ['h2', 'tag'], ['>{data', 'punc'], ['.', 'punc'], ['name', 'prop'], ['} {data', 'punc'], ['.', 'punc'], ['lastname', 'prop'], ['}</', 'punc'], ['h2', 'tag'], ['>', 'punc']],
    [['      <', 'punc'], ['span', 'tag'], ['>{data', 'punc'], ['.', 'punc'], ['role', 'prop'], ['}</', 'punc'], ['span', 'tag'], ['>', 'punc']],
    [['    </', 'punc'], ['section', 'tag'], ['>', 'punc']],
    [['  );', 'punc']],
    [['}', 'punc']],
  ],
  'api.ts': [
    [['const ', 'key'], ['BASE ', 'txt'], ['= ', 'punc'], ["'/api/users'", 'str'], [';', 'punc']],
    [],
    [['export ', 'key'], ['async ', 'key'], ['function ', 'key'], ['getUser', 'fn'], ['(id', 'punc'], [': ', 'punc'], ['number', 'type'], [')', 'punc'], [': ', 'punc'], ['Promise', 'type'], ['<', 'punc'], ['User', 'type'], ['> ', 'punc'], ['{', 'punc']],
    [['  const ', 'key'], ['res ', 'txt'], ['= ', 'punc'], ['await ', 'key'], ['fetch', 'fn'], ['(`${BASE}/${id}`);', 'punc']],
    [['  if ', 'key'], ['(!res', 'punc'], ['.', 'punc'], ['ok', 'prop'], [') ', 'punc'], ['throw new ', 'key'], ['Error', 'fn'], ['(', 'punc'], ["'request failed'", 'str'], [');', 'punc']],
    [['  return ', 'key'], ['res', 'txt'], ['.', 'punc'], ['json', 'fn'], ['();', 'punc']],
    [['}', 'punc']],
    [],
    [['export ', 'key'], ['function ', 'key'], ['useUser', 'fn'], ['(id: number) ', 'punc'], ['{', 'punc']],
    [['  return ', 'key'], ['useQuery', 'fn'], ['(', 'punc'], ["['user', id]", 'punc'], [', () => getUser(id));', 'punc']],
    [['}', 'punc']],
  ],
  'README.md': [
    [['# Users API', 'head']],
    [],
    [['Scaffolded and reviewed with Claude Code.', 'txt']],
    [],
    [['## Stack', 'head']],
    [['- ', 'punc'], ['Express + Prisma', 'txt']],
    [['- ', 'punc'], ['React + Vite', 'txt']],
    [['- ', 'punc'], ['Postgres', 'txt']],
    [],
    [['## Ejemplo', 'head']],
    [['GET ', 'key'], ['/api/users/:id ', 'str'], ['→ ', 'punc'], ['findById', 'fn']],
    [],
    [['## Run', 'head']],
    [['npm install', 'str']],
    [['npm run dev', 'str']],
  ],
  'architecture.md': [
    [['# Architecture', 'head']],
    [],
    [['routes ', 'txt'], ['→ ', 'punc'], ['controller ', 'txt'], ['→ ', 'punc'], ['service ', 'txt'], ['→ ', 'punc'], ['db', 'txt']],
    [],
    [['## Layers', 'head']],
    [['- ', 'punc'], ['routes', 'type'], [': HTTP surface only', 'txt']],
    [['- ', 'punc'], ['controller', 'type'], [': parsing and validation', 'txt']],
    [['- ', 'punc'], ['service', 'type'], [': business logic, scope checks', 'txt']],
    [],
    [['## Ejemplo real', 'head']],
    [['GET ', 'key'], ['/api/users/:id ', 'str'], ['→ ', 'punc'], ['controller', 'txt'], ['.', 'punc'], ['findById', 'fn'], [' → ', 'punc'], ['service', 'txt'], ['.', 'punc'], ['findById', 'fn']],
    [],
    [['## Conventions', 'head']],
    [['- ', 'punc'], ['One folder per resource', 'txt']],
    [['- ', 'punc'], ['No cross-layer imports', 'txt']],
  ],
  'AGENTS.md': [
    [['# AGENTS.md', 'head']],
    [],
    [['Cómo trabajo con IA (Claude Code) acá.', 'txt']],
    [],
    [['## Antes de tocar código', 'head']],
    [['- ', 'punc'], ['Explorar el módulo existente, no asumir', 'txt']],
    [['- ', 'punc'], ['Seguir routes ', 'txt'], ['→ ', 'punc'], ['controller ', 'txt'], ['→ ', 'punc'], ['service', 'txt']],
    [['- ', 'punc'], ['Revisar permisos y scope por tenant', 'txt']],
    [],
    [['## Reglas', 'head']],
    [['- ', 'punc'], ['Comentarios solo si explican el ', 'txt'], ['"por qué"', 'str']],
    [['- ', 'punc'], ['No mezclar capas ni saltear el service', 'txt']],
    [['- ', 'punc'], ['Confirmar conmigo los cambios.', 'txt']],
  ],
}
