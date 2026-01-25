# Persistencia atual (columns/status, notifications, wizard, collections)

## Columns / status
- Status das tasks e um enum em `src/features/tasks/types.ts` (`TaskStatus`).
- O valor e persistido no documento da collection `TASKS_ID` no campo `status`.
- As colunas do Kanban sao derivadas do enum (array `boards`) em `src/features/tasks/components/data-kanban.tsx`.
- Nao existe collection separada de colunas/board; a coluna e implicita pelo `status`.

## Notifications
- Persistidas na collection `NOTIFICATIONS_ID` (Appwrite).
- Modelo em `src/features/notifications/types.ts`:
  - workspaceId, userId, type, severity, title, snippet, entityType, entityId, threadKey,
    readAt?, archivedAt?, starredAt?
- Rotas principais em `src/features/notifications/server/route.ts` (list, daily-focus, read, star, archive).

## Wizard (rota / componente)
- Rota de teste: `src/app/test-wizard/page.tsx` (abre `WorkspaceWizard`).
- Uso real: `src/features/workspaces/components/create-workspace-modal.tsx` (modal de criacao).
- Estrutura do wizard:
  - `src/features/workspaces/components/onboarding/workspace-wizard.tsx`
  - `src/features/workspaces/components/onboarding/store.tsx`
  - Steps: `step-type.tsx`, `step-identity.tsx`
  - Schemas: `schemas.ts`
  - Tipos: `types.ts`

## Collections atuais (Appwrite)
IDs em `src/config.ts`.

- WORKSPACES (WORKSPACE_ID)
  - Tipo: `Workspace` em `src/features/workspaces/types.ts`
  - Campos: name, imageUrl, inviteCode, userId, slug?, description?, purpose?,
    workspaceType?, teamSize?, workflowStyle?, mainGoal?, roles?, workspaceStatus?,
    capabilities?, tools?, agentProfileId?

- MEMBERS (MEMBERS_ID)
  - Tipo: `Member` em `src/features/members/types.ts`
  - Campos: workspaceId, userId, role, name, email, avatarUrl?

- PROJECTS (PROJECTS_ID)
  - Tipo: `Project` em `src/features/projects/types.ts`
  - Campos: name, imageUrl, workspaceId, projectKey?, taskSeq?

- TASKS (TASKS_ID)
  - Tipo: `Task` em `src/features/tasks/types.ts`
  - Campos: name, status, assigneeId, projectId, workspaceId, position, dueDate,
    taskKey?, description?, documentation?, commentsCount?, diagramUrl?, githubPrs?,
    completedAt?, lastActivityAt?, flags?

- TASK_COMMENTS (TASK_COMMENTS_ID)
  - Tipo: `TaskComment` em `src/features/comments/types.ts`
  - Campos: taskId, workspaceId, projectId?, authorId, type, content, mentionedUserIds?,
    authorName?, authorEmail?

- NOTIFICATIONS (NOTIFICATIONS_ID)
  - Tipo: `Notification` em `src/features/notifications/types.ts`
  - Campos: workspaceId, userId, type, severity, title, snippet, entityType, entityId,
    threadKey, readAt?, archivedAt?, starredAt?

- CHAT_MESSAGES (CHAT_MESSAGES_ID)
  - Tipo: `ChatMessage` em `src/features/chat/types.ts`
  - Campos: workspaceId, projectId?, userId, body, bodyLexical?, senderName, senderAvatarUrl?

- AGENT_PROFILES (AGENT_PROFILES_ID)
  - Nao ha type dedicado no repo; o uso atual busca por `slug` em
    `src/features/workspaces/server/use-cases/resolve-agent-profile-id.ts`.

## Storage
- Bucket de imagens: `IMAGES_BUCKET_ID` (usado para upload de workspace/project imagens).
