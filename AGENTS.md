# AGENTS.md (Zyneolist / gestaozyneo)

Estas instrucoes sao o contexto permanente do projeto. Em todo novo chat, siga esta rotina.

## Leitura obrigatoria (inicio de todo chat)
- `REQUEST_CONTEXT.md` (contexto do pedido atual)
- `TASKS.md` (tarefas e sprint atual)
- `AUDIT_REPORT_V2.md` (auditoria tecnica atual)
- `README.md` e `README.AI.md` (stack, arquitetura e integracoes)

## Regras de processo (obrigatorio)
- Sempre responder em pt-BR (salvo pedido contrario).
- Antes de implementar qualquer mudanca, sempre criar um plano curto via `update_plan`.
- Sempre quebrar o trabalho em tarefas (em `TASKS.md`) com: objetivo, aceite, fora de escopo, dependencias.

## Stack
- Next.js 16 App Router + React 19
- Hono (API em `/api/*`) + Zod
- Appwrite (Auth/DB/Storage)
- React Query + nuqs (filtros)
- Tailwind v4 + Radix
- Gemini (geracao de descricao de tasks)

## Pastas e convencoes
- UI pages: `src/app/*`
- Features: `src/features/<dominio>/{api,components,hooks,server,schemas,types}`
- API routes (Hono): `src/features/*/server/route.ts`
- Registry das rotas: `src/app/api/[[...route]]/route.ts`
- Appwrite clients:
  - `src/lib/appwrite.ts#createSessionClient` (cookie)
  - `src/lib/appwrite.ts#createAdminClient` (server key)
- Sessao (Hono middleware): `src/lib/session-middleware.ts`

## Auth e sessao
- Cookie: `jira-clone-session`.
- `sessionMiddleware` valida cookie e injeta: `account`, `databases`, `storage`, `user`.
- OAuth callback: `src/app/oauth/route.ts` cria sessao via Appwrite e seta cookie.

## Appwrite (modelo mental)
- Database + Collections (ids via env vars):
  - `workspaces`, `members`, `projects`, `tasks`
- Storage bucket (imagens): `NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID`
- `imageUrl` guarda `fileId` e a UI monta a URL via `getAppwriteFileViewUrl`.

## API (Hono) - padrao
- Rotas retornam JSON no formato `{ data: ... }` em sucesso e `{ error: ... }` em falha.
- Autorizacao normalmente valida membership via `getMember({ workspaceId, userId })`.

## UI / Data
- React Query: hooks em `src/features/*/api`.
- Filtros: `nuqs` (querystring) + `useTaskFilters`.
- Kanban: drag & drop e persistencia via `/api/tasks/bulk-update`.

## Pontos conhecidos (nao esquecer)
- Existe bug de rota de projeto (link singular vs rota plural).
- Criacao de task tem risco de `position` errado (orderAsc).
- Chat atual e mock (sem persistencia/realtime).
- Backlog tab hoje replica a tabela.

## Checklist de deploy (Vercel)
- Definir env vars: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APPWRITE_*`, `NEXT_APPWRITE_KEY`, `GEMINI_API_KEY`.
- Appwrite: configurar OAuth redirect/failure com URL da Vercel e liberar dominio/origins.

## Definition of Done (DoD)
- Tarefa em `TASKS.md` com aceite atendido.
- Sem logs de debug e sem strings quebradas.
- Validacao e autorizacao adequadas na API.
- Mudancas pequenas e incrementais (MVP primeiro).

