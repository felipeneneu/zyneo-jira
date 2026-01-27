# README

## Visao geral
Sistema de gestao de projetos com Next.js e Gemini. O produto organiza o trabalho por workspaces e areas (dev, design, RH, vendas), com foco em colaboracao, produtividade e inteligencia assistida.

## Funcionalidades
- Workspaces por area ou unidade de negocio.
- Gestao de projetos, tarefas, status e prioridades.
- Membros, papeis e permissoes.
- Comentarios e anexos em tarefas.
- Automacao leve (notificacoes e regras simples).
- Assistente inteligente com Gemini (resumo, descricao e recomendacoes).

## Tech stack
- Frontend: Next.js (App Router), React
- API: Next.js API Routes ou Hono dentro do app
- Banco: Appwrite (Auth/DB/Storage) ou Postgres (alternativa)
- Cache/filas: Redis (opcional)
- IA: Gemini API
- Observabilidade: logs estruturados + Sentry (opcional)

## Arquitetura (alto nivel)
Monolito modular com separacao por features. O frontend e a API vivem no mesmo deploy para reduzir latencia e custo operacional. A integracao com Gemini ocorre em endpoints internos protegidos.

## Instalacao
```
npm install
npm run dev
```

## Variaveis de ambiente (exemplo)
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_key

# Appwrite (se utilizado)
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_WORKSPACES_ID=workspaces
NEXT_PUBLIC_APPWRITE_PROJECTS_ID=projects
NEXT_PUBLIC_APPWRITE_TASKS_ID=tasks
NEXT_PUBLIC_APPWRITE_MEMBERS_ID=members
NEXT_PUBLIC_APPWRITE_TASK_COMMENTS_ID=task_comments
NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_ID=notifications
NEXT_PUBLIC_APPWRITE_CHAT_MESSAGES_ID=chat_messages
NEXT_PUBLIC_APPWRITE_AGENT_PROFILES_ID=agent_profiles
NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID=your_bucket_id
NEXT_APPWRITE_KEY=your_server_key
```

## Requisitos de funcionamento (branch atual)
- Appwrite configurado com Database, Collections e Bucket de imagens.
- Gemini configurado (para overview diario): `GEMINI_API_KEY`.
- Workspaces `SOFTWARE_DEV` sao Guided Dev por padrao (sem workflowStyle).

## Setup rapido (opcional, Appwrite)
> Este setup e opcional para nao quebrar ambientes atuais. Use apenas se quiser habilitar Guided Dev completo.

1) Confirme as collections existentes:
- WORKSPACES, MEMBERS, PROJECTS, TASKS, TASK_COMMENTS, NOTIFICATIONS, CHAT_MESSAGES, AGENT_PROFILES

2) Atualize atributos:
- WORKSPACES: adicionar `workflowPreset` (string).
- TASKS: permitir `READY` no enum `status` (se estiver como enum).
- TASKS: garantir `flags` (string[]) e `lastActivityAt` (string ISO).
- NOTIFICATIONS: permitir `task.overdue`, `task.stale`, `task.blocked` no enum `type` (se estiver como enum).

3) Recrie indices se necessario:
- TASKS.workspaceId, TASKS.status, TASKS.assigneeId, TASKS.dueDate, TASKS.lastActivityAt
- NOTIFICATIONS.userId, NOTIFICATIONS.type, NOTIFICATIONS.threadKey, NOTIFICATIONS.archivedAt

4) (Opcional) Seed manual:
- Criar um workspace `SOFTWARE_DEV` e verificar se o seed cria projeto "Development" e tarefas tutorial.

### Appwrite: collections e atributos essenciais
- WORKSPACES
  - `workflowPreset` (string) para registrar o preset `DEV_GUIDED_V1`.
- TASKS
  - `status` deve aceitar `READY` (alem dos existentes).
  - `flags` (string[]) usado para `priority:P1|P2|P3` e `blockedAt:<iso>`.
  - `lastActivityAt` (string ISO) para aging/stale.
- NOTIFICATIONS
  - `type` deve aceitar `task.overdue`, `task.stale`, `task.blocked` (alem dos existentes).

### Guided Dev (SOFTWARE_DEV)
- Ao criar workspace `SOFTWARE_DEV`, o servidor cria:
  - Projeto "Development"
  - 5 tarefas tutorial com status/flags/datas
  - Notificacoes iniciais (overdue/stale/blocked)
  - `workflowPreset = DEV_GUIDED_V1`
- Gates de status:
  - READY exige `assigneeId` e prioridade.
  - DONE exige `assigneeId`.
  - Transicoes seguem `DEV_GUIDED_V1`.
- Tutorial leve no board via `localStorage`:
  `tutorial:dev-guided:v1:${workspaceId}`.

## Scripts
- `npm run dev`: ambiente local
- `npm run build`: build de producao
- `npm run start`: executar build
- `npm run lint`: lint

## Boas praticas
- Aplicar validacao de entrada (Zod) em todas as rotas.
- Padronizar respostas `{ data }` e `{ error }`.
- Registrar logs sem dados sensiveis.

## Licenca
Projeto privado. Defina a licenca conforme necessidade.
