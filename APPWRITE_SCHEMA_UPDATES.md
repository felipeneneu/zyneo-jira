# Appwrite - Atualizacoes de Schema (Workspace Evolutivo + Chat Lexical)

Este guia descreve as mudancas necessarias no Appwrite para suportar:

- Workspace evolutivo (DNA do produto)
- Chat com Lexical (bodyLexical)
- Agentes por workspace
- Relatorios com PDF

## Premissas

- Document Security desabilitado nas collections (modelo atual do app).
- Validacoes de acesso feitas no backend (Next.js/Hono).

## Variaveis de ambiente

Adicionar/confirmar:

- `NEXT_PUBLIC_APPWRITE_CHAT_MESSAGES_ID`
- `NEXT_PUBLIC_APPWRITE_WORKSPACES_ID`
- `NEXT_PUBLIC_APPWRITE_MEMBERS_ID`
- `NEXT_PUBLIC_APPWRITE_PROJECTS_ID`
- `NEXT_PUBLIC_APPWRITE_TASKS_ID`
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
- `NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID`

Relatorios: usar o bucket existente (`NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID`).

## 1) Atualizar collections existentes

### Collection: workspaces

Adicionar atributos (opcionais para nao quebrar legado):

- `slug` (string, size 80)
- `purpose` (enum: work | personal | school)
- `workspaceType` (enum: software_dev | design | operations | sales_crm)
- `teamSize` (enum: solo | small | medium | large | enterprise)
- `workflowStyle` (enum: kanban | scrum | simple | custom)
- `mainGoal` (enum: organize | deliver | sell | standardize)
- `roles` (string array, item size 16)
- `workspaceStatus` (enum: draft | active | suspended | archived)
- `capabilities` (string array, item size 64)
- `tools` (string array, item size 32)
- `agentProfileId` (string, size 64)

Indices recomendados:

- `slug` (unique)
- `workspaceType` (key)
- `workspaceStatus` (key)
- `purpose` (key, opcional)

### Collection: members

Adicionar atributo:

- `chatLastReadAt` (datetime, optional)

### Collection: chat_messages

Adicionar atributo:

- `bodyLexical` (string, size 20000, optional)

Se a collection ainda nao existir, criar com:

- `workspaceId` (string, size 64, required)
- `projectId` (string, size 64, optional)
- `userId` (string, size 64, required)
- `body` (string, size 2000, required)
- `bodyLexical` (string, size 20000, optional)
- `senderName` (string, size 128, required)
- `senderAvatarUrl` (string, size 512, optional)

Indices recomendados:

- `workspaceId`
- `workspaceId + $createdAt`
- `workspaceId + projectId`
- `workspaceId + projectId + $createdAt`

Permissoes (MVP):

- Read: role:users
- Create: role:users
- Update/Delete: desabilitar (ou restringir a admin)

## 2) Criar collections novas

### Collection: agent_profiles

Objetivo: perfis de IA por tipo de workspace.

Atributos:

- `name` (string, size 80, required)
- `slug` (string, size 80, required)
- `purpose` (enum: work | personal | school)
- `workspaceType` (enum: software_dev | design | operations | sales_crm)
- `systemPrompt` (string, size 6000, required)
- `tone` (string, size 64, optional)
- `outputs` (string array, item size 32)
- `capabilities` (string array, item size 64)
- `status` (enum: active | inactive)
- `isDefault` (boolean)

Indices recomendados:

- `slug` (unique)
- `purpose` (key)
- `workspaceType` (key)
- `status` (key)

Permissoes (MVP):

- Read: role:users
- Create/Update/Delete: role:users (ou somente admin)

### Collection: workspace_report_runs

Objetivo: registrar execucoes de relatorios e links de PDF.

Atributos:

- `workspaceId` (string, size 64, required)
- `projectId` (string, size 64, optional)
- `requestedByUserId` (string, size 64, required)
- `status` (enum: queued | running | done | failed)
- `summary` (string, size 6000, optional)
- `pdfFileId` (string, size 64, optional)

Indices recomendados:

- `workspaceId + $createdAt`
- `workspaceId + projectId + $createdAt`
- `workspaceId + requestedByUserId + $createdAt`
- `status`

Permissoes (MVP):

- Read: role:users
- Create: role:users
- Update/Delete: restringir a admin (ou backend-only)

## 3) Storage bucket para PDFs (usar o bucket existente)

Usar o bucket definido em `NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID`.

- Read: role:users (ou somente membros do workspace via backend)
- Create: role:users (ou backend-only)
- Permitir mime type `application/pdf` (se o bucket estiver limitado a imagens).
- Ajustar limite de tamanho se necessario.

Salvar o `fileId` em `workspace_report_runs.pdfFileId`.

## 4) Checklist rapido

- [x] `chat_messages.bodyLexical` criado
- [x] `members.chatLastReadAt` criado
- [x] `workspaces` com enums e `slug` (unique) criado
- [x] `agent_profiles` criado
- [x] `workspace_report_runs` criado
- [ ] bucket existente configurado para PDFs
- [ ] env vars atualizadas
