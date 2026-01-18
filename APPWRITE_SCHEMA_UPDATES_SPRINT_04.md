# Appwrite Schema Updates - Sprint 04 (Copilot Core)

Este documento descreve as alterações necessárias no Appwrite Console para Sprint 04.

---

## 1. Atualizar Collection `tasks`

### Novos Atributos

| Atributo | Tipo | Obrigatório | Default |
|----------|------|-------------|---------|
| `lastActivityAt` | datetime | Não | - |
| `flags` | string[] | Não | `[]` |

**Passos no Console:**
1. Acesse Databases → seu database → `tasks`
2. Clique em "Attributes"
3. Add Attribute → DateTime → `lastActivityAt` → Required: No
4. Add Attribute → String (Array) → `flags` → Required: No

---

## 2. Criar Collection `task_comments`

### Atributos

| Atributo | Tipo | Tamanho | Obrigatório |
|----------|------|---------|-------------|
| `taskId` | string | 36 | Sim |
| `workspaceId` | string | 36 | Sim |
| `projectId` | string | 36 | Não |
| `authorId` | string | 36 | Sim |
| `type` | string | 20 | Sim |
| `content` | string | 5000 | Sim |
| `mentionedUserIds` | string[] | - | Não |

**Valores de `type`:** `comment`, `progress`, `blocked`, `decision`

### Indexes

| Key | Tipo | Atributos |
|-----|------|-----------|
| `idx_taskId` | key | `taskId` |
| `idx_workspaceId` | key | `workspaceId` |
| `idx_authorId` | key | `authorId` |
| `idx_createdAt` | key | `$createdAt` (DESC) |

**Passos no Console:**
1. Databases → Create Collection → Name: `task_comments`
2. Adicione os atributos listados
3. Adicione os indexes
4. Settings → Permissions:
   - `any` → No permissions
   - `users` → Read, Create
   - Ou use Teams por workspace

---

## 3. Criar Collection `notifications`

### Atributos

| Atributo | Tipo | Tamanho | Obrigatório |
|----------|------|---------|-------------|
| `workspaceId` | string | 36 | Sim |
| `userId` | string | 36 | Sim |
| `type` | string | 30 | Sim |
| `severity` | string | 10 | Sim |
| `title` | string | 200 | Sim |
| `snippet` | string | 500 | Sim |
| `entityType` | string | 20 | Sim |
| `entityId` | string | 36 | Sim |
| `threadKey` | string | 100 | Sim |
| `readAt` | datetime | - | Não |
| `archivedAt` | datetime | - | Não |
| `starredAt` | datetime | - | Não |

**Valores de `type`:** `system.stale`, `system.overdue`, `system.daily_focus`, `human.mention`

**Valores de `severity`:** `info`, `warn`, `critical`

**Valores de `entityType`:** `task`, `workspace`

### Indexes

| Key | Tipo | Atributos |
|-----|------|-----------|
| `idx_userId` | key | `userId` |
| `idx_workspaceId` | key | `workspaceId` |
| `idx_type` | key | `type` |
| `idx_threadKey` | key | `threadKey` |
| `idx_user_unread` | key | `userId`, `readAt`, `archivedAt` |
| `idx_createdAt` | key | `$createdAt` (DESC) |

**Passos no Console:**
1. Databases → Create Collection → Name: `notifications`
2. Adicione os atributos listados
3. Adicione os indexes
4. Settings → Permissions:
   - `any` → No permissions
   - `users` → Read (próprias notificações via query)

---

## 4. Variáveis de Ambiente

Adicione ao `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_TASK_COMMENTS_ID=<id_da_collection>
NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_ID=<id_da_collection>
```

---

## Checklist

- [x] Atualizar collection `tasks` com `lastActivityAt` e `flags`
- [x] Criar collection `task_comments`
- [x] Criar collection `notifications`
- [x] Adicionar todos os indexes necessários
- [x] Configurar permissões
- [x] Atualizar `.env.local` com os novos IDs
