# TASKS.md

Este arquivo e o quadro simples de tarefas do projeto para acompanhar o que esta sendo feito.

## Sprint Atual (Sprint Hoje - MVP Jarvis + Relatorio + Chat)

- [ ] (TECH) Reverter traducoes automaticas no codigo
  - Objetivo: desfazer substituicoes automaticas que quebraram identifiers/strings.
  - Aceite: build sem erros; tipos/ids originais (Project/Task/etc); UI volta ao ingles base.
  - Fora de escopo: traducao manual ou i18n.
  - Dependencias: acesso ao repo/HEAD.

- [ ] (TECH) Log do error boundary no reload
  - Objetivo: capturar o erro real que dispara "Something went wrong".
  - Aceite: `src/app/error.tsx` imprime erro + digest no console quando o fallback aparece.
  - Fora de escopo: envio para observabilidade/alertas.
  - Dependencias: nenhuma.

- [ ] (NOTIF) Badge com contagem de mensagens nao lidas
  - Objetivo: exibir quantidade de mensagens nao lidas no avatar (estilo WhatsApp).
  - Aceite: API retorna `count`; badge mostra numero (ex: 3, 9, 99+).
  - Fora de escopo: notificacao push.
  - Dependencias: Appwrite com indices para query por workspaceId e createdAt.

- [ ] (SEC) Auditoria de seguranca e vulnerabilidades (full)
  - Objetivo: mapear falhas, riscos e vetores de ataque do sistema atual.
  - Aceite: relatorio com achados priorizados, impactos e recomendacoes.
  - Fora de escopo: correcoes no codigo.
  - Dependencias: acesso ao repo e contexto de deploy.

- [ ] (OPS) Teste de build para deploy
  - Objetivo: validar que o build compila sem erros antes do deploy.
  - Aceite: `npm run build` executa com sucesso ou loga falhas.
  - Fora de escopo: correcoes de falhas encontradas.
  - Dependencias: dependencias instaladas e env vars basicas.

- [ ] (OPS) Log diario + commit geral
  - Objetivo: registrar o resumo do dia e consolidar commit.
  - Aceite: log do dia criado e commit com todas as mudancas atuais.
  - Fora de escopo: split por feature.
  - Dependencias: status do git revisado.

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

- [ ] (BACKEND) Conectar onboarding de workspace ao backend
  - Objetivo: persistir dados do wizard (purpose/type/teamSize/workflowStyle/mainGoal/tools) na criacao do workspace.
  - Aceite: POST /api/workspaces aceita campos do onboarding e salva no Appwrite.
  - Fora de escopo: envio real de convites e regras de negocio por role.
  - Dependencias: atributos criados no Appwrite.

- [ ] (OPS) Atualizar env vars do Appwrite
  - Objetivo: garantir que o app possui ids/keys atualizados para novas collections e chat.
  - Aceite: `.env.local` (ou env de deploy) inclui vars necessarias e documentadas.
  - Fora de escopo: provisionamento automatico.
  - Dependencias: ids das collections no Appwrite.

- [ ] (BACKEND) Types do workspace evolutivo (UI)
  - Objetivo: definir enums e tipos base para onboarding e configuracao de workspace.
  - Aceite: `src/features/workspaces/types.ts` exporta purpose/workspaceType/teamSize/workflowStyle/roles/workspaceStatus e `Workspace` com campos opcionais.
  - Fora de escopo: UI de onboarding e migracao de dados.
  - Dependencias: alinhamento final dos enums do produto.

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

- [ ] (CHAT) Input Lexical + payload bodyLexical
  - Objetivo: usar Lexical no input e enviar body + bodyLexical no chat.
  - Aceite: input usa Lexical; API aceita `bodyLexical` opcional; envio continua funcionando.
  - Fora de escopo: renderer Lexical completo e anexos.
  - Dependencias: `chat_messages` com atributo `bodyLexical` e libs Lexical.

- [ ] (CHAT) Emoji picker no input do chat
  - Objetivo: permitir inserir emojis pelo botao do chat.
  - Aceite: botao de emoji abre seletor simples e insere emoji no texto.
  - Fora de escopo: catalogo completo e historico de favoritos.
  - Dependencias: editor Lexical no chat.

- [ ] (CHAT) Rota dedicada do chat
  - Objetivo: tirar o chat do switcher de tasks e abrir em rota propria.
  - Aceite: `/workspaces/:workspaceId/chat` renderiza `WorkspaceChat`; tab removida.
  - Fora de escopo: filtro por projeto.
  - Dependencias: menu de navegacao atualizado.

- [ ] (CHAT) Padrao page/client e ajuste de funcionamento
  - Objetivo: seguir o padrao de page.tsx + client.tsx e estabilizar o chat.
  - Aceite: rota do chat usa `client.tsx` e renderiza corretamente sem erros.
  - Fora de escopo: melhorias de realtime.
  - Dependencias: rota `/workspaces/:workspaceId/chat` existente.

- [ ] (CHAT) Editor Lexical rich text (estilo Slack)
  - Objetivo: usar Lexical rich text com tamanho do input estilo Slack e cores do tema.
  - Aceite: editor com plugins rich text ativos, altura minima e maximo consistente.
  - Fora de escopo: upload de imagem e renderer rico das mensagens.
  - Dependencias: pacotes Lexical adicionais.

- [ ] (UI) Lexical com cores do sistema
  - Objetivo: alinhar o editor do chat ao tema do app (sem cores fixas).
  - Aceite: estilos do editor usam tokens do tema e nao hardcode de cor.
  - Fora de escopo: toolbar rica e upload de imagem.
  - Dependencias: tema global (vars CSS) definido.

- [ ] (DOC) Atualizar schema Appwrite (workspace evolutivo + chat Lexical)
  - Objetivo: documentar mudancas de collections, atributos, indices e permissoes.
  - Aceite: arquivo com passo a passo para criar/atualizar tabelas e bucket.
  - Fora de escopo: execucao manual no console.
  - Dependencias: enums oficiais do workspace e colecoes existentes.

- [ ] (CHAT) Realtime (MVP com Appwrite Realtime; fallback polling)
  - Objetivo: atualizar UI ao chegar nova mensagem.
  - Aceite: mensagens aparecem automaticamente sem refresh (polling ok no MVP).

- [ ] (CHAT) Restaurar editor Lexical completo + limpar envio
  - Objetivo: voltar ao editor Lexical completo com toolbar e limpar o input apos envio.
  - Aceite: toolbar com funcionalidades basicas do pacote; enviar limpa o texto.
  - Fora de escopo: upload de imagem e renderizador rico no feed.
  - Dependencias: pacote Lexical instalado e rota de chat funcionando.

- [ ] (CHAT) Corrigir reset do input apos envio
  - Objetivo: garantir que o texto do Lexical seja limpo apos enviar mensagem.
  - Aceite: ao enviar, o editor fica vazio visualmente e o contador zera.
  - Fora de escopo: renderer rico e anexos.
  - Dependencias: editor Lexical em uso no chat.

- [ ] (BACKEND) Ajustar payload de criacao de workspace
  - Objetivo: evitar envio de campos indefinidos e destravar a criacao do workspace.
  - Aceite: POST /api/workspaces cria com dados do onboarding sem erro.
  - Fora de escopo: migracao de workspaces antigos.
  - Dependencias: atributos do Appwrite criados/atualizados.

- [ ] (DOC/OPS) Revisao de build/deploy + documento tecnico
  - Objetivo: revisar pontos de build/deploy e documentar checklist/ajustes.
  - Aceite: doc tecnico criado com requisitos, env vars e pontos de atencao.
  - Fora de escopo: pipeline CI/CD completo.
  - Dependencias: contexto atual do repo e Appwrite.

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


- [ ] (DOC) Evolucao do workspace (WORKSPACE_EVOLUTION.md)
  - Objetivo: documentar a evolucao do workspace para elemento central com enums, novo schema e impactos arquiteturais.
  - Aceite: `WORKSPACE_EVOLUTION.md` criado com as 10 secoes obrigatorias em linguagem tecnica.
  - Fora de escopo: implementacao de schema, UI ou APIs.
  - Dependencias: contexto do produto e alinhamento dos enums.
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

