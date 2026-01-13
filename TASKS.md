# TASKS.md

Este arquivo e o quadro simples de tarefas do projeto para acompanhar o que esta sendo feito.

## Sprint Atual (Sprint Hoje - MVP Jarvis + Relatorio + Chat)

- [ ] (TECH) Reverter traducoes automaticas no codigo
  - Objetivo: desfazer substituicoes automaticas que quebraram identifiers/strings.
  - Aceite: build sem erros; tipos/ids originais (Project/Task/etc); UI volta ao ingles base.
  - Fora de escopo: traducao manual ou i18n.
  - Dependencias: acesso ao repo/HEAD.

- [ ] (OPS) Alinhar env vars Appwrite + adicionar Resend
  - Objetivo: garantir que o MVP roda com Appwrite e envio de relatorios.
  - Aceite: `.env.local` e Vercel com `NEXT_PUBLIC_APPWRITE_*` e `NEXT_APPWRITE_KEY` + `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `MANAGER_REPORT_TO_EMAIL`.
  - Fora de escopo: valores por workspace/usuario.
  - Dependencias: acesso Appwrite Cloud e conta Resend.

- [ ] (DATA) Adicionar campos de refinamento Jarvis em tasks
  - Objetivo: suportar doc_raw/doc_final e flag de refinamento.
  - Aceite: atributos `descriptionRaw`, `descriptionRefined`, `isRefined` na collection `tasks`; indices em `projectId`, `status`, `isRefined`.
  - Fora de escopo: migracao de dados antigos.
  - Dependencias: Appwrite Console (collections/attributes/indexes).

- [ ] (PROJECT) Enriquecer projeto para contexto da IA
  - Objetivo: adicionar detalhes do projeto na criacao/edicao.
  - Aceite: campos `projectType` (enum: CLIENT|INTERNAL|PRODUCT|MARKETING|OPS), `projectContext` (text) e `projectGoal` (text) salvos no Appwrite e expostos no form.
  - Fora de escopo: migracao de dados antigos.
  - Dependencias: Appwrite Console (collections/attributes/indexes).

- [ ] (WORKSPACE) Tipo de workspace (BUSINESS|FREELANCER)
  - Objetivo: ajustar regras e UI conforme o perfil.
  - Aceite: atributo `workspaceType` na collection `workspaces` com selecao na criacao/edicao; default BUSINESS.
  - Fora de escopo: conversao automatica de workspaces existentes.
  - Dependencias: Appwrite Console (collections/attributes/indexes).

- [ ] (FREELANCE) Menu e navegacao por workspaceType
  - Objetivo: ajustar opcoes do menu para freelancer.
  - Aceite: quando `workspaceType=FREELANCER`, menu mostra `Orcamentos` e `Emails` e oculta itens de time (ex: Membros/Roles).
  - Fora de escopo: personalizacao por usuario.
  - Dependencias: `workspaceType` definido.

- [ ] (FREELANCE) Orcamentos (MVP)
  - Objetivo: criar e gerenciar orcamentos simples por cliente.
  - Aceite: collection `quotes` com `workspaceId`, `clientId`, `title`, `items` (json/text), `total`, `status` (DRAFT|SENT|ACCEPTED|DECLINED), `expiresAt?`; endpoints list/create/update; UI list + create.
  - Fora de escopo: pagamentos e assinatura digital.
  - Dependencias: `workspaceType=FREELANCER` e collection `clients`.

- [ ] (FREELANCE) Clientes (CRUD)
  - Objetivo: cadastrar clientes para orcamentos e comunicacao.
  - Aceite: collection `clients` com `workspaceId`, `name`, `email?`, `phone?`, `company?`, `notes?`; endpoints list/create/update/delete; UI list + form.
  - Fora de escopo: importacao em massa, tags.
  - Dependencias: `workspaceType=FREELANCER`.

- [ ] (FREELANCE) PDF do orcamento
  - Objetivo: gerar PDF padrao do orcamento.
  - Aceite: gerar PDF com logo/nome do freelancer, dados do cliente, itens e total; download e preview.
  - Fora de escopo: templates customizaveis.
  - Dependencias: biblioteca PDF (ex: pdf-lib) e dados de `quotes`.

- [ ] (FREELANCE) Envio de orcamento por email/WhatsApp
  - Objetivo: enviar o PDF para o cliente.
  - Aceite: envio via Resend (email) e via provedor WhatsApp (Meta Cloud API ou Twilio) com link/arquivo; log de envio (`channel`, `to`, `sentAt`).
  - Fora de escopo: sequencias automaticas.
  - Dependencias: `RESEND_API_KEY` e provider WhatsApp.

- [ ] (FREELANCE) Emails de vendas (MVP)
  - Objetivo: enviar emails profissionais para leads/clientes.
  - Aceite: templates base (pitch/follow-up/proposta), editor simples e envio via Resend; salvar log basico (`to`, `subject`, `sentAt`).
  - Fora de escopo: automacao/seq.
  - Dependencias: `RESEND_API_KEY`.

- [ ] (RULES) Permissoes e fluxo por role (admin vs membro)
  - Objetivo: restringir criacao e transicao de tasks.
  - Aceite: somente ADMIN cria task; MEMBRO move no kanban ate IN_REVIEW e apenas com `descriptionRaw.length >= 20`; API valida em `POST /api/tasks`, `PATCH /api/tasks/:taskId` e `POST /api/tasks/bulk-update`; UI bloqueia criar/arrastar quando regra falhar.
  - Fora de escopo: roles customizadas.
  - Dependencias: `workspaceType` definido e `descriptionRaw` na task.

- [ ] (AI) Incluir contexto do projeto/workspace no prompt
  - Objetivo: melhorar a qualidade do texto gerado.
  - Aceite: prompt do Gemini inclui `projectType`, `projectContext`, `projectGoal` e `workspaceType` quando existir.
  - Fora de escopo: templates por projeto.
  - Dependencias: campos novos de projeto/workspace.

- [ ] (API) Refinar descricao com Jarvis (persistir doc_final)
  - Objetivo: gerar texto via Gemini e salvar em `descriptionRefined` com `isRefined=true`.
  - Aceite: endpoint reaproveita `/api/tasks/:taskId/ai-description` ou cria `/api/tasks/:taskId/refine` e persiste no Appwrite; retorno inclui `descriptionRefined`.
  - Fora de escopo: limites de uso por usuario.
  - Dependencias: `GEMINI_API_KEY`.

- [ ] (RULES) Trava de status IN_REVIEW se doc_raw curto
  - Objetivo: impedir ir para revisao sem doc_raw minimo.
  - Aceite: ao setar `IN_REVIEW` com `descriptionRaw.length < 20`, API retorna 400 com "Doc muito curto para revisao" e UI exibe erro.
  - Fora de escopo: thresholds configuraveis.
  - Dependencias: `descriptionRaw` salvo na task.

- [ ] (UI) UX do Jarvis (botao + estado refinado)
  - Objetivo: permitir refinar e destacar doc_final.
  - Aceite: botao "Jarvis" aparece quando `isRefined=false`; apos sucesso, exibe check e renderiza `descriptionRefined` como conteudo principal.
  - Fora de escopo: edicao colaborativa.
  - Dependencias: API de refinamento pronta.

- [ ] (REPORT) API de relatorio semanal (Resend)
  - Objetivo: enviar resumo por projeto/status.
  - Aceite: `POST /api/report` aceita `workspaceId`/`projectId`/`status` e envia email HTML via Resend; acesso apenas membros do workspace.
  - Fora de escopo: agendamento/cron.
  - Dependencias: Resend configurado.

- [ ] (REPORT) Template HTML do relatorio
  - Objetivo: formatar email com resumo.
  - Aceite: header (projeto + periodo), lista/tabela por status, destaques e CTA para o app.
  - Fora de escopo: design premium/temas.
  - Dependencias: endpoint `/api/report`.

- [ ] (DOC) Instrucoes de setup do chat no Appwrite
  - Objetivo: orientar a criacao correta das collections e env vars.
  - Aceite: arquivo de instrucao com passos, atributos, indices e permissoes do Appwrite + envs.
  - Fora de escopo: automacoes de deploy.
  - Dependencias: acesso Appwrite Console.

- [ ] (I18N) Traducao pt-BR com tom enterprise (sem multi-idioma)
  - Objetivo: padronizar textos do app para apresentacao.
  - Aceite: navegacao, tabs, botoes, mensagens de erro e textos do chat/tarefas em pt-BR.
  - Fora de escopo: infraestrutura de i18n e selecao de idioma.
  - Dependencias: nenhuma.

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

- [ ] (CHAT) Realtime (MVP com Appwrite Realtime; fallback polling)
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


- [x] (TECH) Corrigir strings com encoding quebrado (chat/calendario)
  - Objetivo: remover caracteres corrompidos na UI.
  - Aceite: textos do chat e calendario exibem frases legiveis sem caracteres estranhos.
  - Fora de escopo: revisao de copywriting completo.
  - Dependencias: nenhuma.

- [x] (TECH) Corrigir typo "Unatorized"
  - Objetivo: padronizar mensagem de erro.
  - Aceite: erro em `createSessionClient` usa "Unauthorized".
  - Fora de escopo: handler global de erros.
  - Dependencias: nenhuma.


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

- [ ] (PROJECT) Adicionar `area` e `contexto` em projetos
  - Objetivo: guardar informacoes do projeto para relatorios/Jarvis.
  - Aceite: atributos Appwrite + types/schemas + create/edit forms + exibicao opcional na tela de projeto.
  - Fora de escopo: migracao de projetos existentes.
  - Dependencias: Appwrite Console (collections/attributes/indexes).

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
- [x] (OPS) Checklist deploy Vercel (env vars + Appwrite + Gemini)
  - Aceite: app sobe, login funciona, CRUD principal funciona

## Backlog (geral)
- [ ] (AUTH) Recuperacao de senha (forgot/reset) via Appwrite SMTP
- [ ] (AUTH) Verificacao de email (opcional, mas recomendado)
- [ ] (SEC) Rate limit em endpoints sensiveis (login/registro/ai)
- [ ] (INT) Webhooks/integ n8n (webhook direto vs outbox + retries)

## Convencoes de tarefa
- Cada tarefa deve ter: objetivo, aceite, escopo fora, dependencias.
- Antes de implementar, detalhar a tarefa e criar plano via `update_plan`.

