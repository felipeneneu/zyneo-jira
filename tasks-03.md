# TASKS-03.md

Este arquivo define o Sprint 03 do MVP.
Objetivo: reduzir fricção inicial, criar identidade legível (anti-IDs feios) e preparar o sistema para o Copilot (sem ainda implementar regras automáticas).

---

## Sprint 03 — Wizard Enxuto + Slugs Jira-like

### 🎯 Objetivo do Sprint

- Remover coleta de dados sem consequência
- Criar URLs e identificadores legíveis (anti-Appwrite ID)
- Preparar base de dados para automações futuras
- Não introduzir regras automáticas ainda (isso entra no Sprint 04)

---

## 1. (WIZARD) Enxugar wizard de criação de workspace (Dev)

**Objetivo**
Reduzir o wizard para o mínimo necessário, focado em contexto e identidade do workspace.

**Campos permitidos**

- `name` (obrigatório)
- `type` (ex: dev, design, finance, people)
- `description` (curta, opcional)
- `icon` ou `image` (opcional)

**Regras**

- Wizard deve ter **2 etapa idealmente** (máx. 3)
- Steps de **Tools / Invite / Methodology / Purpose** devem ser:
  - removidos da UI
  - OU escondidos via feature flag (sem deletar código)

**Critérios de Aceite**

- Wizard cria workspace com apenas os campos acima
- Campos são persistidos e usados no sistema
- UI não expõe etapas sem consequência

**Fora de Escopo**

- Convites por email
- Integrações externas
- Configurações avançadas

---

## 2. (DATA) Adicionar descrição curta ao workspace

**Objetivo**
Fornecer contexto mínimo para IA e automações futuras.

**Implementação**

- Novo atributo em `workspaces`: `description`
- Atualizar schemas, types e APIs de criação/edição

**Critérios de Aceite**

- Campo existe no Appwrite
- Wizard envia o valor
- UI exibe quando relevante

---

## 3. (SLUG) Gerar slug legível para workspace

**Objetivo**
Substituir URLs baseadas em IDs longos por slugs amigáveis.

**Regras**

- Slug gerado automaticamente a partir do nome
- `slugify(name)`
- Garantir unicidade com sufixo incremental (`acme`, `acme-2`)
- Slug **não muda** após criação

**Critérios de Aceite**

- Campo `slug` salvo em `workspaces`
- Índice unique no Appwrite
- URLs aceitam `/workspaces/:slug`
- Fallback por ID antigo continua funcionando

**Fora de Escopo**

- Migração automática de workspaces antigos

---

## 4. (DATA) Criar `projectKey` (prefixo Jira-like)

**Objetivo**
Criar um identificador curto por projeto (ex: `ACME`) para compor taskKey.

**Regras**

- Gerado automaticamente no POST `/api/projects`
- Baseado no nome do projeto (3–5 letras, A-Z)
- Garantir unicidade com sufixo incremental (`ACME`, `ACME2`)
- Não editável pelo usuário

**Critérios de Aceite**

- Campo `projectKey` salvo em `projects`
- Exibido na UI quando necessário

---

## 5. (DATA) Gerar `taskKey` Jira-like por projeto

**Objetivo**
Criar identificador legível de task (`PROJECT-123`) com sequência por projeto.

**Regras**

- Novo campo em `projects`: `taskSeq` (number, default 0)
- Ao criar task:
  1. Ler project
  2. Incrementar `taskSeq`
  3. Gerar `taskKey = ${projectKey}-${taskSeq}`
  4. Salvar task
- Índice unique em `tasks.taskKey`
- Retry automático em caso de colisão

**Critérios de Aceite**

- Toda task nova possui `taskKey`
- `taskKey` é único
- UI exibe `taskKey` na task e nos cards

**Fora de Escopo**

- Migração histórica automática

---

## 6. (ROUTE) Resolver task por `taskKey`

**Objetivo**
Permitir acessar task por URL legível.

**Implementação**

- Rota aceita `/tasks/:taskKey`
- Backend resolve para `taskId`
- Task page funciona normalmente

**Critérios de Aceite**

- Task abre corretamente via taskKey
- URLs com ID antigo continuam funcionando

---

## 7. (MIGRATION) Backfill opcional

**Objetivo**
Permitir gerar slugs/keys para dados existentes manualmente.

**Critérios**

- Script ou rotina documentada
- Execução manual, sem rodar automaticamente em produção

---

## ⚠️ Fora de Escopo do Sprint 03

- Regras automáticas (stale, overdue)
- Inbox de notificações
- Comentários em task
- IA Copilot
- Email

Esses itens entram no **Sprint 04 — Copilot Core**.
