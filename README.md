# Zyneolist (Jira Clone)

Sistema de gestao de workspaces, projetos, membros e tarefas com interface tipo Jira.
Backend interno via Hono no Next.js e Appwrite como backend principal (auth, database e storage).

## Visao geral
- Next.js App Router + React Query e componentes Radix.
- API em /api/* via Hono com validacao Zod e middleware de sessao.
- Appwrite Cloud como fonte de dados (colecoes e bucket de imagens).
- OAuth Google/GitHub via Appwrite.
- IA Gemini para gerar descricao de tarefas.

## Funcionalidades principais
- Auth: registro, login, logout, sessao por cookie, OAuth Google/GitHub.
- Workspaces: CRUD, convite por codigo e reset do invite code.
- Membros: listar, alterar role, remover.
- Projetos: CRUD por workspace, com imagem opcional.
- Tarefas: CRUD, filtros (status, assignee, projeto, prazo, busca),
  visoes em tabela/kanban/calendario e bulk update.
- Chat de projeto (UI basica).
- IA: gerar descricao detalhada da tarefa (pt-BR).

## Stack
- Next.js 16, React 19
- Hono (API), Zod (validacao)
- Appwrite (auth, database, storage)
- TanStack React Query, React Table
- Tailwind CSS v4, Radix UI, Recharts, React Big Calendar
- Gemini (@google/generative-ai)

## Arquitetura (alto nivel)
- UI: src/app/* + componentes em src/features/*/components
- API: src/features/*/server/route.ts e registro em src/app/api/[[...route]]/route.ts
- Auth/Sessao:
  - Cookie jira-clone-session (httpOnly, sameSite=Strict, secure em login/registro).
  - sessionMiddleware cria account/databases/user a partir da sessao.
- Appwrite clients:
  - createSessionClient usa sessao do cookie.
  - createAdminClient usa NEXT_APPWRITE_KEY (admin).
- OAuth:
  - Actions em src/lib/oauth.ts
  - Callback em src/app/oauth/route.ts

## Modelo de dados (Appwrite)
Banco NEXT_PUBLIC_APPWRITE_DATABASE_ID:
- workspaces: name, imageUrl, inviteCode, userId
- members: workspaceId, userId, role (ADMIN | MEMBER), email
- projects: name, imageUrl, workspaceId
- tasks: name, status, assigneeId, projectId, workspaceId, position, dueDate, description

Storage:
- Bucket NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID para imagens.
- imageUrl guarda fileId e a UI monta a URL via getAppwriteFileViewUrl.

## Endpoints principais (Hono)
Base: /api
- auth: /auth/login, /auth/register, /auth/logout, /auth/current
- workspaces: listar/criar/editar/remover, /:workspaceId/join, /:workspaceId/reset-invite-code
- members: listar, atualizar role, remover
- projects: listar/criar/editar/remover
- tasks: listar/criar/editar/remover, /:taskId/ai-description, /bulk-update

## OAuth (Google/GitHub)
- Ative os providers no Appwrite Console (Auth > Providers).
- Configure o redirect/callback para: {NEXT_PUBLIC_APP_URL}/oauth
- Configure URL de falha para: {NEXT_PUBLIC_APP_URL}/sign-up
- Garanta que o dominio do app esta permitido no Appwrite.

## Variaveis de ambiente
Crie um .env.local com:
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
Obs: o projeto atual usa Appwrite Cloud e ja tem valores locais em .env.local.

## Rodando local
```
npm install
npm run dev
```
App em http://localhost:3000.

## Recuperacao de senha (esqueci minha senha) - passo a passo
1. Appwrite Console:
   - Configure SMTP (Settings > Email) para envio de recovery.
   - Em Auth > Providers, garanta Email/Password habilitado.
2. Variaveis/URLs:
   - Defina NEXT_PUBLIC_APP_URL com a URL publica do app.
   - Use uma rota publica para reset, ex: /reset-password.
3. API (Hono):
   - Crie POST /api/auth/recovery que recebe { email } e chama:
     account.createRecovery(email, `${APP_URL}/reset-password`).
   - Crie POST /api/auth/recovery/confirm que recebe
     { userId, secret, password, passwordConfirm } e chama:
     account.updateRecovery(userId, secret, password, passwordConfirm).
4. UI:
   - Pagina /forgot-password com form de email -> chama /api/auth/recovery.
   - Pagina /reset-password le userId e secret da query e envia nova senha.
5. Seguranca:
   - Rate limit no endpoint de recovery.
   - Mensagem generica no email (nao revelar se a conta existe).
   - Valide senha com Zod (min 6).
6. Teste:
   - Solicite recovery, verifique o email, complete o reset e tente login.

## Docs adicionais
- README.AI.md: uso do Gemini e ideias de integracao com n8n.

## Notas
- A IA esta integrada em tasks (/api/tasks/:taskId/ai-description), nao ha feature separada.
