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
NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID=your_bucket_id
NEXT_APPWRITE_KEY=your_server_key
```

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
