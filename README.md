# GestaoZyneo (Jira Clone)

Sistema de gestao de workspaces, projetos, membros e tarefas com interface tipo Jira.
Backend interno via Hono dentro do Next.js e Appwrite como backend principal (auth, database e storage).

## Visao geral
- Frontend em Next.js App Router com React Query e componentes Radix.
- API em `/api/*` usando Hono, com middlewares de sessao e validacao Zod.
- Appwrite Cloud como fonte de dados atual (colecoes + bucket de imagens).
- Assistente de IA (Gemini) para gerar descricao de tarefas.

## Funcionalidades principais
- Auth: registro, login, logout e sessao via cookie.
- Workspaces: criar, editar, apagar, convite por codigo.
- Membros: listar, alterar role, remover.
- Projetos: CRUD por workspace, com imagem opcional.
- Tarefas: CRUD, filtros, kanban, calendario, bulk update.
- IA: gerar descricao detalhada da tarefa (pt-BR).

## Stack
- Next.js 16 (App Router), React 19
- Hono (API), Zod (validacao)
- Appwrite (auth, database, storage) via `node-appwrite`
- TanStack React Query
- Tailwind CSS v4, Radix UI, Recharts, React Big Calendar
- Gemini (`@google/generative-ai`)

## Arquitetura (alto nivel)
- **UI**: paginas e layouts em `src/app/*` com componentes em `src/features/*/components`.
- **API**: rotas em `src/features/*/server/route.ts`, registradas em `src/app/api/[[...route]]/route.ts`.
- **Auth/Sessao**:
  - Cookie `jira-clone-session` com `httpOnly`, `secure`, `sameSite=Strict`.
  - `sessionMiddleware` cria `account/databases/storage/user` a partir da sessao.
- **Appwrite clients**:
  - `createSessionClient` usa sessao do cookie.
  - `createAdminClient` usa `NEXT_APPWRITE_KEY` (admin).
- **IA**:
  - Endpoint `POST /api/tasks/:taskId/ai-description` gera markdown usando Gemini.

## Modelo de dados (Appwrite)
Colecoes no banco `NEXT_PUBLIC_APPWRITE_DATABASE_ID`:
- `workspaces`: `name`, `imageUrl`, `inviteCode`, `userId`
- `members`: `workspaceId`, `userId`, `role` (`ADMIN` | `MEMBER`)
- `projects`: `name`, `imageUrl`, `workspaceId`
- `tasks`: `name`, `status`, `assigneeId`, `projectId`, `workspaceId`, `position`, `dueDate`, `description`

Storage:
- Bucket `NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID` para imagens de workspace/projeto.
- O `imageUrl` guarda o `fileId` do Appwrite, e a UI monta a URL via `getAppwriteFileViewUrl`.

## Endpoints principais (Hono)
Prefixo base: `/api`
- `auth`: `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/current`
- `workspaces`: listar/criar/editar/remover, `/:workspaceId/join`, `/:workspaceId/reset-invite-code`
- `members`: listar, atualizar role, remover
- `projects`: listar/criar/editar/remover
- `tasks`: listar/criar/editar/remover, `/:taskId/ai-description`, `/bulk-update`

## Estrutura de pastas
- `src/app`: paginas, layouts e componentes globais
- `src/features/*`: cada dominio (auth, workspaces, members, projects, tasks)
  - `server/route.ts`: API do dominio
  - `api/`: hooks React Query
  - `components/`: UI especifica
  - `schemas.ts`: Zod schemas
  - `types.ts`: tipos do Appwrite
- `src/lib`: appwrite client, rpc client, middleware de sessao
- `src/ui`: componentes base (shadcn/radix)

## Variaveis de ambiente
Crie um `.env.local` com:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_WORKSPACES_ID=workspaces
NEXT_PUBLIC_APPWRITE_MEMBERS_ID=members
NEXT_PUBLIC_APPWRITE_PROJECTS_ID=projects
NEXT_PUBLIC_APPWRITE_TASKS_ID=tasks
NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID=your_bucket_id

NEXT_APPWRITE_KEY=your_server_key
GEMINI_API_KEY=your_gemini_key
```
Obs: o projeto atual usa Appwrite Cloud e ja tem valores locais em `.env.local`.

## Rodando local
```
npm install
npm run dev
```
App em `http://localhost:3000`.

## Pontos importantes para a migracao (Appwrite Docker)
- Atualizar `NEXT_PUBLIC_APPWRITE_ENDPOINT` para o endpoint do container.
- Recriar projeto, database, colecoes e bucket com os mesmos IDs (ou ajustar as envs).
- Gerar nova `NEXT_APPWRITE_KEY` no Appwrite local.
- Conferir CORS para `NEXT_PUBLIC_APP_URL`.
- Revisar acesso a imagens (file view) se o endpoint mudar.

## Automacao futura (n8n + Whisper)
Nao ha integracao direta ainda, mas os pontos naturais sao:
- Criacao/atualizacao de tarefas via endpoints `/api/tasks`.
- Atualizacao de descricao de tarefa com transcricao (Whisper) via `/api/tasks/:taskId`.
- Disparos por webhooks do Appwrite (se configurados) ou polling do n8n.

## Observacoes
- Existe import de `features/ai/server/route` em `src/app/api/[[...route]]/route.ts`, mas nao ha pasta `src/features/ai` no repositorio.
  Se for usar um modulo de IA separado, precisa criar essa feature ou remover o import.
