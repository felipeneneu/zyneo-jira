# 🛠️ Plantão Tech: MVP Jira Clone + IA

Checklist operacional para montar e apresentar o MVP (Jira clone + “Jarvis” + relatório por e-mail + chat realtime).

---

## 1. ☁️ Configuração Cloud (Check-in)

- [ ] Criar projeto no **Appwrite Cloud**
- [ ] Configurar API Key no **Resend**
- [ ] Adicionar variáveis de ambiente no `.env.local` do Next.js

**Sugestão de `.env.local`:**

- [ ] `NEXT_PUBLIC_APPWRITE_ENDPOINT=...`
- [ ] `NEXT_PUBLIC_APPWRITE_PROJECT_ID=...`
- [ ] `APPWRITE_API_KEY=...` (server-only)
- [ ] `APPWRITE_DATABASE_ID=...`
- [ ] `APPWRITE_COLLECTION_PROJECTS_ID=...`
- [ ] `APPWRITE_COLLECTION_TASKS_ID=...`
- [ ] `APPWRITE_COLLECTION_MEMBERS_ID=...`
- [ ] `RESEND_API_KEY=...`
- [ ] `RESEND_FROM_EMAIL=...`
- [ ] `MANAGER_REPORT_TO_EMAIL=...` (ou por workspace)

---

## 2. 🗃️ Banco de Dados (Appwrite Collections)

### 2.1 **Projetos**

- [ ] Criar collection `projects`
- [ ] Criar atributos:
  - [ ] `nome` (string)
  - [ ] `area` (string)
  - [ ] `contexto` (string / text)

### 2.2 **Tasks**

- [ ] Criar collection `tasks`
- [ ] Criar atributos:
  - [ ] `titulo` (string)
  - [ ] `status` (enum: `todo | doing | in_review | done`)
  - [ ] `doc_raw` (string / text)
  - [ ] `doc_final` (string / text)
  - [ ] `is_refined` (boolean)
  - [ ] `projeto_id` (relation ou string)
- [ ] Índices recomendados:
  - [ ] `projeto_id`
  - [ ] `status`
  - [ ] `is_refined`

### 2.3 **Membros**

Escolher 1 abordagem:

**Opção A — Teams (Appwrite Teams)**

- [ ] Criar `team` por workspace/projeto
- [ ] Roles: `gestor`, `membro`

**Opção B — Collection `members`**

- [ ] Criar collection `members`
- [ ] Atributos:
  - [ ] `user_id` (string)
  - [ ] `role` (enum: `gestor | membro`)
  - [ ] `workspace_id` (string) _(ou projeto_id)_
- [ ] Índices:
  - [ ] `user_id`
  - [ ] `workspace_id`

---

## 3. ⚙️ Desenvolvimento Next.js (Lógica de Negócio)

### 3.1 API Route `/api/refine` (Jarvis)

- [ ] Receber `taskId` + `doc_raw`
- [ ] Chamar IA para refinar (ex: transformar doc em texto final)
- [ ] Salvar na task:
  - [ ] `doc_final`
  - [ ] `is_refined = true`
- [ ] Retornar `doc_final`

### 3.2 API Route `/api/report` (Resumo + Resend)

- [ ] Buscar tasks por `projeto_id` e/ou `status`
- [ ] Montar payload do relatório (semanal)
- [ ] Enviar via **Resend**
- [ ] Registrar log (opcional): `sent_at`, `to`, `project_id`

### 3.3 Trava de Status (Regra do MVP)

- [ ] Impedir `in_review` se `doc_raw.length < 20`
- [ ] Mensagem de erro: “Doc muito curto para revisão”

### 3.4 UI Refined (UX do Jarvis)

- [ ] Botão “Jarvis” aparece quando `is_refined = false`
- [ ] Após refinamento:
  - [ ] Botão some
  - [ ] Mostrar Check ✅
  - [ ] Exibir `doc_final` como conteúdo principal

---

## 4. 📣 Comunicação & Relatórios

### 4.1 Template de E-mail (Gestor)

- [ ] Criar HTML do relatório semanal:
  - [ ] Header (Projeto + Semana)
  - [ ] Tabela/Lista de tasks por status
  - [ ] Destaques (ex: em review, atrasadas, concluídas)
  - [ ] CTA (link para o app)

### 4.2 Chat (Realtime Appwrite)

- [ ] Collection `messages` (se usar banco) **ou** Realtime direto
- [ ] Estrutura mínima:
  - [ ] `workspace_id`
  - [ ] `sender_id`
  - [ ] `text`
  - [ ] `created_at`
- [ ] Subscrição Realtime no client
- [ ] Input + lista de mensagens por workspace

---

## 5. ✅ Testes de Fluxo (The Presentation Run)

- [ ] **Fluxo 1**: Criar projeto como Gestor
- [ ] **Fluxo 2**: Membro escreve `doc_raw`, usa Jarvis e envia para revisão
- [ ] **Fluxo 3**: Gestor aprova e dispara relatório por e-mail

---

## 🎯 Critérios de sucesso do MVP

- [ ] Jarvis refina e salva `doc_final`
- [ ] Regra de status bloqueia `in_review` quando doc é curto
- [ ] UI mostra ✅ após refinamento
- [ ] Gestor recebe relatório por e-mail via Resend
- [ ] Chat realtime funcional (mínimo “manda/recebe”)

---
