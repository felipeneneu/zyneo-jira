# Audit Report V2 - Zyneolist (gestaozyneo)

Escopo: auditoria tecnica criteriosa do codigo atual (Next.js App Router + Hono + Appwrite + React Query + Tailwind + Gemini).
Objetivo: listar o que ja existe, o que falta para producao / Jira-level e os principais riscos/bugs.

## Resumo executivo

- O core do produto esta pronto: auth (incl. OAuth), workspaces, membros, projetos, tarefas (CRUD + filtros) e UI tipo Jira (tabela/kanban/calendario) com bulk update.
- Ja existe integracao de IA (Gemini) para gerar descricao de tarefa em Markdown.
- Existem lacunas claras de produto (workflow configuravel, comments, anexos, audit log, notificacoes, automacoes) e lacunas de producao (rate limit, recovery/verification, observabilidade, testes).
- Foram encontrados bugs objetivos e pontos de fragilidade (rotas incoerentes, logicas de posicionamento, logs residuais, encoding quebrado em strings).

## Stack e arquitetura (estado atual)

- Frontend: Next.js 16 (App Router), React 19, Tailwind v4, Radix.
- Data fetching: TanStack React Query; filtros via nuqs.
- Backend: Hono rodando dentro do Next.js em `/api/*` (via `hono/vercel`).
- Backend principal: Appwrite (Auth + Database + Storage).
- IA: Gemini via `@google/generative-ai`.

### Layout do repositorio

- UI: `src/app/*` + componentes por feature em `src/features/*/components`.
- API: `src/features/*/server/route.ts` e registro em `src/app/api/[[...route]]/route.ts`.
- Clientes Appwrite:
  - Sessao do usuario (cookie): `src/lib/appwrite.ts#createSessionClient`.
  - Admin (server key): `src/lib/appwrite.ts#createAdminClient`.
- Middleware de sessao (Hono): `src/lib/session-middleware.ts`.

## O que ja esta pronto (inventario)

### Auth e sessao

- Registro / login / logout e usuario atual:
  - `GET /api/auth/current`
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `POST /api/auth/logout`
    Arquivo: `src/features/auth/server/route.ts`
- OAuth Google/GitHub via Appwrite:
  - helpers: `src/lib/oauth.ts`
  - callback: `src/app/oauth/route.ts`
- Cookie de sessao: `jira-clone-session` (`AUTH_COOKIE`).

### Workspaces

- CRUD workspace + upload de imagem (Appwrite Storage).
- Convite por codigo + reset de codigo.
- Entrar no workspace por `inviteCode`.
- Analytics mensal (comparativo vs mes anterior).
  Arquivo: `src/features/workspaces/server/route.ts`

### Membros

- Listar membros do workspace (enriquece com `users.get` para nome/email).
- Atualizar role.
- Remover membro, com regras (nao remover ultimo; so admin altera role; membro pode se remover).
  Arquivo: `src/features/members/server/route.ts`

### Projetos

- CRUD projeto + upload de imagem.
- Analytics mensal por projeto.
  Arquivo: `src/features/projects/server/route.ts`

### Tarefas

- CRUD de tarefa e filtros: status/assignee/projeto/prazo/busca.
- Views: tabela, kanban (drag & drop), calendario, backlog (hoje replica tabela), chat (UI mock).
- Bulk update de kanban (status + position).
- Tela de task com overview + descricao (Markdown) editavel.
  Arquivos:
- API: `src/features/tasks/server/route.ts`
- UI: `src/features/tasks/components/*`

### IA (Gemini)

- Geracao de descricao via `POST /api/tasks/:taskId/ai-description`.
- Prompt em pt-BR e retorno em Markdown (UI renderiza via `react-markdown`).
  Arquivos:
- API: `src/features/tasks/server/route.ts`
- UI hook: `src/features/tasks/api/use-generate-task-description.ts`

## Modelo de dados (Appwrite)

Conforme README:

- `workspaces`: name, imageUrl, inviteCode, userId
- `members`: workspaceId, userId, role (ADMIN|MEMBER)
- `projects`: name, imageUrl, workspaceId
- `tasks`: name, status, assigneeId, projectId, workspaceId, position, dueDate, description

## Bugs e problemas tecnicos encontrados

### BUG: calculo de position na criacao de task

- Ao criar task, a busca do item de referencia usa `Query.orderAsc("position")` com `Query.limit(1)`.
- Isso tende a pegar o menor `position` e pode gerar duplicacao de `position` (ou ordem errada).
  Arquivo: `src/features/tasks/server/route.ts` (create).

### BUG: Erro critico no callback OAuth (`TypeError: e._formData.get`)

- **Sintoma**: Apos login social (Google/GitHub), ocorre erro 500 com `TypeError: e._formData.get is not a function`.
- **Causa Raiz**: O arquivo `src/app/oauth/route.ts` chama `account.createSession({ userId, secret })` passando um objeto.
- **Analise**: O SDK `node-appwrite` espera argumentos posicionais: `createSession(userId, secret)`.
- **Consequencia**: O metodo recebe um objeto no lugar do `userId` e `undefined` no `secret`, falhando a chamada. O erro resultante engatilha uma falha interna no Next.js (ao tentar inspecionar o request/erro) gerando o `TypeError` em `_formData`.
- **Correcao**: Alterar para `account.createSession(userId, secret)`.

### Logs residuais / ruido em prod

- Existem `console.log` em filtros de tasks, chat mock e hooks.
  Arquivos: `src/features/tasks/server/route.ts`, `src/features/projects/components/chat-project.tsx`, `src/features/auth/api/use-current.ts`, `src/features/workspaces/api/use-get-workspaces.ts`.

### Strings com encoding quebrado

- Existem strings com acentos corrompidos (ex: chat e calendario).
  Arquivos: `src/features/projects/components/chat-project.tsx`, `src/features/tasks/components/data-calendar.tsx`.

### UX/qualidade

- Backlog tab hoje replica tabela (nao ha backlog/sprint real).
- Chat e apenas UI local (nao persiste e nao e realtime).

### Consistencia / DX

- `createSessionClient` lanca erro com texto "Unatorized" (typo).
  Arquivo: `src/lib/appwrite.ts`.
- Uso misto de `zod` e `zod/v3` (tarefas usam `zod/v3`).
  Arquivos: `src/features/tasks/schemas.ts` e forms de tasks.

## Riscos de producao (prioridade)

P0 (alto risco):

- Sem recovery de senha / verificacao de email (dependendo do publico).
- Sem rate limiting (login/registro/ai endpoints).
- Upload sem validacao de tipo/tamanho (workspace/projeto).

P1 (medio):

- Sem observabilidade (logs estruturados/metrics/tracing).
- Sem paginacao/limites nas listagens (pode degradar rapido em workspaces grandes).
- N+1 em listagens (ex: members e tasks enriquecem via `users.get` por item).

P2 (melhorias):

- Padrao de erros/respostas nao unificado (faltam handlers globais).
- Falta estrategia clara de indices/performance no Appwrite.

## Lacunas para "Jira-level" (produto / regras de negocio)

- Workflow configuravel (status/transicoes/regras por transicao).
- Comentarios, anexos, watchers/mentions.
- Historico/audit log (quem mudou o que/quando).
- Notificacoes (in-app/email), automacoes e webhooks.
- Tipos de issue (bug/feature/epic), labels, prioridade, componentes/versions.
- Busca/consultas avancadas (estilo JQL).
- Scrum de verdade: backlog, sprint, relatorios (burndown/velocity).

## Recomendacoes (ordem sugerida)

1. Fixes rapidos (antes de crescer usuarios)

- Corrigir rota de projeto (singular/plural).
- Corrigir logica de `position` na criacao de tasks.
- Remover logs residuais e corrigir mensagens/strings quebradas.

2. Hardening minimo para prod

- Recovery de senha (Appwrite SMTP) + rate limit.
- Validacao de upload.
- Paginacao/limites para listagens.

3. Features para virar "poderoso"

- Comentarios + anexos + audit log.
- Chat persistido + realtime.
- Webhooks/outbox para integracoes (n8n).
- Workflow configuravel.
