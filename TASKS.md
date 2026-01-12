# TASKS.md

Este arquivo e o quadro simples de tarefas do projeto para acompanhar o que esta sendo feito.

## Sprint Atual (Sprint 1 - Chat de Workspace + Notificacoes)

- [ ] (CHAT) Definir modelo de dados no Appwrite (Workspace Chat)
  - Objetivo: permitir mensagens persistidas por workspace (canais/rooms + messages).
  - Aceite: colecoes/atributos/indexes definidos; permissao por workspace; documentado no README/notes.
  - Fora de escopo: threads, reactions, anexos.
  - Dependencias: Appwrite Console (criar collections e indexes).

- [ ] (CHAT) Implementar API de chat (Hono)
  - Objetivo: endpoints para listar canais, listar mensagens (com paginacao) e enviar mensagem.
  - Aceite: `POST /api/chat/messages` cria mensagem; `GET /api/chat/messages` pagina; acesso so para membros do workspace.
  - Fora de escopo: edicao/remocao de mensagens.

- [ ] (CHAT) Implementar UI de chat real (substituir mock)
  - Objetivo: tela funcional de chat do workspace (listar mensagens, enviar, scroll).
  - Aceite: mensagens persistem, carregam ao abrir e aparecem apos refresh; sem `console.log` no componente.
  - Fora de escopo: anexos, reactions.

- [ ] (CHAT) Realtime (Appwrite Realtime) para novas mensagens
  - Objetivo: atualizar UI instantaneamente ao chegar nova mensagem.
  - Aceite: ao enviar/receber mensagem em outra aba, ela aparece sem refresh.
  - Dependencias: decidir stack realtime (Appwrite Realtime primeiro).

- [ ] (NOTIF) Unread: contabilizar mensagens nao lidas por usuario
  - Objetivo: calcular se ha mensagens novas desde a ultima leitura (por workspace/canal).
  - Aceite: estado `lastReadAt` por membro/canal; API/UI calcula unread; ao abrir chat marca como lido.
  - Fora de escopo: notificacoes push/email.

- [ ] (NOTIF) Badge no avatar quando chegar mensagem nova
  - Objetivo: exibir indicador (dot/contador) no avatar/user-button quando houver unread.
  - Aceite: badge aparece quando chega mensagem e some ao ler.

- [ ] (TECH) Corrigir bug de rota de projeto (singular vs plural)
  - Objetivo: evitar links quebrados no dashboard.
  - Aceite: clicar em projeto no dashboard abre a pagina correta.
  - Ref: `src/app/(dashboard)/workspaces/[workspaceId]/client.tsx`.

- [ ] (TECH) Corrigir logica de `position` na criacao de task
  - Objetivo: evitar duplicacao/ordem errada no kanban.
  - Aceite: nova task recebe `position` consistente (sempre maior que a ultima da coluna).
  - Ref: `src/features/tasks/server/route.ts`.

## Sprint 2 (Observabilidade + Logs de Telas)

- [ ] (LOGS) Definir o que e "logs das telas" e padrao de eventos
  - Objetivo: especificar quais eventos vamos registrar (erros, navegacao, actions, falhas de API).
  - Aceite: lista de eventos + payload + politica de retencao.

- [ ] (LOGS) Criar coleta de logs no client
  - Objetivo: capturar errors (window.onerror/unhandledrejection) e eventos-chave.
  - Aceite: logs sao enviados para um endpoint protegido (ou persistidos em collection dedicada).

- [ ] (LOGS) Criar tela `/logs` (admin-only)
  - Objetivo: visualizar logs por periodo/usuario/tela.
  - Aceite: lista paginada, filtros basicos, acesso restrito a admin.

## Sprint 3 (Regras de negocio + Fortalecer "Jira-like")

- [ ] (RULES) Levantar e documentar regras de negocio do dominio
  - Objetivo: mapear invariantes (permissoes, transicoes de status, limites, ownership).
  - Aceite: documento curto com regras e exemplos; tarefas derivadas.

- [ ] (ARCH) Criar camada de services/use-cases e refatorar rotas
  - Objetivo: tirar regra de negocio de dentro das rotas Hono para facilitar evolucao/testes.
  - Aceite: pelo menos `tasks` refatorado; rotas finas; comportamento igual.

- [ ] (AUDIT) Auditoria/historico de mudancas em tasks
  - Objetivo: registrar quem alterou o que/quando (status, assignee, dueDate, descricao).
  - Aceite: collection de audit; UI basica na task (timeline).

## Sprint 4 (Perfil / Avatar)

- [ ] (AVATAR) Descobrir e padronizar origem do avatar (Google/GitHub)
  - Objetivo: definir como obter avatarUrl para usuarios OAuth no Appwrite (identities/prefs) e fallback.
  - Aceite: estrategia definida + implementavel sem expor tokens.

- [ ] (AVATAR) Renderizar avatar real no user button
  - Objetivo: quando `avatarUrl` existir, renderizar imagem em vez de letra.
  - Aceite: usuario Google/GitHub ve foto; fallback para iniciais continua funcionando.

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
