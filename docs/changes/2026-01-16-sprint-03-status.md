Sprint 03 - Status (2026-01-16)

Resumo
- Commit principal: 46bd2a5 "feat: wizard enxuto e slugs jira-like".
- Escopo entregue: wizard reduzido, slug de workspace, projectKey, taskKey Jira-like, rotas aceitando slug/taskKey, UI mostrando taskKey.
- Documentacao de schema e backfill: APPWRITE_SCHEMA_UPDATES.md, APPWRITE_COLLECTIONS.md, docs/changes/2026-01-16-sprint-03-backfill.md.

Arquivos centrais alterados (nao exaustivo)
- Workspace: src/features/workspaces/server/route.ts, src/features/workspaces/utils.ts, src/features/workspaces/schemas.ts, src/features/workspaces/types.ts.
- Wizard: src/features/workspaces/components/onboarding/workspace-wizard.tsx, src/features/workspaces/components/onboarding/step-identity.tsx, src/features/workspaces/components/onboarding/schemas.ts, src/features/workspaces/components/onboarding/store.tsx.
- Projetos/Tasks: src/features/projects/server/route.ts, src/features/projects/types.ts, src/features/tasks/server/route.ts, src/features/tasks/types.ts.
- UI taskKey: src/features/tasks/components/kanban-card.tsx, src/features/tasks/components/task-breadcrumbs.tsx, src/features/tasks/components/task-overview.tsx, src/features/tasks/components/columns.tsx, src/features/tasks/components/event-card.tsx.

Pendencias imediatas
- Aplicar mudancas no Appwrite: indices e novos campos (ver APPWRITE_SCHEMA_UPDATES.md).
- Rodar backfill opcional para slug/projectKey/taskKey (ver docs/changes/2026-01-16-sprint-03-backfill.md).

Mudancas locais nao relacionadas (fora do commit)
- AGENTS.md, AUDIT_REPORT_V2.md, TASKS-02.md, package.json, package-lock.json,
  src/features/tasks/schemas.ts, src/features/workspaces/components/onboarding/option-card.tsx,
  src/features/workspaces/components/onboarding/step-type.tsx, log.md.
- Itens nao versionados: PRODUCT_AUDIT.md, Tasks-old/, src/app/(dashboard)/workspaces/[workspaceId]/notifications/,
  src/app/api/oauth/, src/features/notification/.

