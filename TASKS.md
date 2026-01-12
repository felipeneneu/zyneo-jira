# TASKS.md

Este arquivo e o quadro simples de tarefas do projeto para acompanhar o que esta sendo feito.

## Sprint Atual (Sprint 1 - Chat de Workspace + Notificacoes)

- [ ] (CHAT) Definir modelo de dados no Appwrite (Workspace Chat)
  - Objetivo: chat unico por workspace, com mensagens opcionais vinculadas a um projeto do workspace.
  - Aceite: collection `chat_messages` (ou equivalente) com `workspaceId`, `projectId?`, `userId`, `body`, `senderName`, `senderAvatarUrl?`; indices para queries; permissao: so membros do workspace.
  - Fora de escopo: threads, reactions, anexos.
  - Dependencias: Appwrite Console (criar collections/attributes/indexes).

- [ ] (CHAT) Implementar API de chat (Hono)
  - Objetivo: endpoints para listar mensagens (com paginacao), enviar mensagem e marcar como lido.
  - Aceite:
    - `GET /api/chat/messages?workspaceId&projectId?&cursor?&limit?`
    - `POST /api/chat/messages` cria mensagem
    - `POST /api/chat/mark-read` marca como lido
    - Acesso somente para membros do workspace.
  - Fora de escopo: edicao/remocao de mensagens.

- [ ] (CHAT) Implementar UI de chat real (substituir mock)
  - Objetivo: chat funcional com filtro por projeto (All/Projeto X).
  - Aceite: mensagens persistem e carregam ao abrir; enviar funciona; UI sem `console.log`.
  - Fora de escopo: anexos, reactions.

- [ ] (CHAT) Realtime (MVP via polling; depois Appwrite Realtime)
  - Objetivo: atualizar UI ao chegar nova mensagem.
  - Aceite: mensagens aparecem automaticamente sem refresh (polling ok no MVP).

- [ ] (NOTIF) Unread por workspace
  - Objetivo: saber se ha mensagens novas no workspace desde a ultima leitura do usuario.
  - Aceite: estado `chatLastReadAt` (por membro) + endpoint `GET /api/chat/unread?workspaceId`.

- [ ] (NOTIF) Badge no avatar quando chegar mensagem nova
  - Objetivo: indicador (dot) no `UserButton` quando houver unread no workspace atual.
  - Aceite: badge aparece quando chega mensagem e some ao abrir/ler.

- [ ] (TECH) Corrigir bug de rota de projeto (singular vs plural)
  - Objetivo: evitar links quebrados no dashboard.
  - Aceite: clicar em projeto no dashboard abre a pagina correta.
  - Ref: `src/app/(dashboard)/workspaces/[workspaceId]/client.tsx`.

- [ ] (TECH) Corrigir logica de `position` na criacao de task
  - Objetivo: evitar duplicacao/ordem errada no kanban.
  - Aceite: nova task recebe `position` consistente (sempre maior que a ultima da coluna).
  - Ref: `src/features/tasks/server/route.ts`.

- [ ] (AVATAR) Mostrar avatar real do usuario (Google/GitHub)
  - Objetivo: se usuario tiver avatarUrl, renderizar imagem no `UserButton`.
  - Aceite: `UserButton` usa `user.prefs.avatarUrl` (fallback para iniciais); endpoint para sync do profile OAuth.

## Sprint 2 (Audit Log do Sistema)

- [ ] (AUDIT) Definir modelo de dados no Appwrite (audit log)
  - Objetivo: registrar acoes do usuario (ex: moveu task, editou descricao, mudou assignee).
  - Aceite: collection `audit_logs` com `workspaceId`, `actorUserId`, `entityType`, `entityId`, `action`, `changes`, `createdAt`.

- [ ] (AUDIT) Instrumentar alteracoes em tasks
  - Objetivo: toda mudanca relevante em task gera um audit log.
  - Aceite: `PATCH /api/tasks/:taskId` e `POST /api/tasks/bulk-update` escrevem logs com diff.

- [ ] (AUDIT) Tela `/workspaces/:workspaceId/audit`
  - Objetivo: visualizar audit logs por workspace.
  - Aceite: lista paginada + filtro por entityType/usuario; acesso admin.

## Sprint 3 (Regras de negocio + Campos novos de Task)

- [ ] (TASK) Adicionar `priority` (HIGH|MEDIUM|LOW) em tasks
  - Objetivo: permitir prioridade na task.
  - Aceite: atributo Appwrite + types/schemas + create/edit forms + exibir no card/overview.

- [ ] (TASK) Adicionar `tag` (ex: BUGFIX|UI_UX|FEATURE|TECH) em tasks
  - Objetivo: categorizar task.
  - Aceite: atributo Appwrite + types/schemas + create/edit forms + exibir no card/overview.

- [ ] (RULES) Levantar e documentar regras de negocio do dominio
  - Objetivo: mapear invariantes (permissoes, transicoes de status, limites, ownership).
  - Aceite: documento curto com regras e exemplos; tarefas derivadas.

- [ ] (ARCH) Criar camada de services/use-cases e refatorar rotas
  - Objetivo: tirar regra de negocio de dentro das rotas Hono para facilitar evolucao/testes.
  - Aceite: pelo menos `tasks` refatorado; rotas finas; comportamento igual.

## Sprints anteriores

### Sprint 0 - Deploy de teste
- [x] (SEC) Remover log de senha no registro (src/features/auth/server/route.ts)
  - Aceite: nenhum log contendo senha/email/sensitive no servidor
- [x] (SEC) Ajustar cookie do OAuth para `secure` em producao (src/app/oauth/route.ts)
  - Aceite: em `NODE_ENV=production`, cookie sai com `secure: true`
- [ ] (OPS) Checklist deploy Vercel (env vars + Appwrite + Gemini)
  - Aceite: app sobe, login funciona, CRUD principal funciona

## Backlog (geral)
- [ ] (AUTH) Recuperacao de senha (forgot/reset) via Appwrite SMTP
- [ ] (AUTH) Verificacao de email (opcional, mas recomendado)
- [ ] (SEC) Rate limit em endpoints sensiveis (login/registro/ai)
- [ ] (INT) Webhooks/integ n8n (webhook direto vs outbox + retries)

## Convencoes de tarefa
- Cada tarefa deve ter: objetivo, aceite, escopo fora, dependencias.
- Antes de implementar, detalhar a tarefa e criar plano via `update_plan`.
