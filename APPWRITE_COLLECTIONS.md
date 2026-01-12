# Appwrite - Collections (v2.0)

Este arquivo documenta como criar/ajustar as collections no Appwrite para suportar o Chat (Sprint 1) e preparar o Audit Log (Sprint 2).

## Variaveis de ambiente

Adicionar:
- `NEXT_PUBLIC_APPWRITE_CHAT_MESSAGES_ID=<collection_id_chat_messages>`

Observacao importante:
- O backend usa o Appwrite via sessao do usuario (cookie) e atualmente nao envia `permissions` ao criar documents.
- Para funcionar no mesmo modelo do resto do app, mantenha **Document Security desabilitado** nessas collections (ou adapte o codigo para enviar permissions por documento).

---

## Collection: `chat_messages`

### Objetivo
Armazenar mensagens do chat do workspace, com filtro opcional por projeto.

### Atributos (sugestao)
- `workspaceId` (string, required)
- `projectId` (string, optional)
- `userId` (string, required)
- `body` (string, required, max 2000)
- `senderName` (string, required, max 128)
- `senderAvatarUrl` (string, optional, max 512)

### Indexes (sugestao)
- `workspaceId`
- `workspaceId + projectId`
- `workspaceId + $createdAt`
- `workspaceId + projectId + $createdAt`

### Permissoes (modo simples para MVP)
- Collection permissions:
  - Read: `role:users`
  - Create: `role:users`
  - Update/Delete: desabilitar (ou restringir a admin se voce for evoluir)

---

## Collection: `members` (ajuste)

Adicionar atributo:
- `chatLastReadAt` (datetime ou string ISO, optional)

Uso no app:
- Atualizado ao abrir o chat (`POST /api/chat/mark-read`) e ao enviar mensagem.

---

## (Preparacao) Collection: `audit_logs`

### Objetivo
Registrar acoes do sistema (ex: usuario moveu task, alterou assignee, mudou prioridade/tag, etc.).

### Atributos (sugestao)
- `workspaceId` (string, required)
- `actorUserId` (string, required)
- `actorName` (string, optional)
- `entityType` (string enum, required: TASK | PROJECT | WORKSPACE | MEMBER)
- `entityId` (string, required)
- `action` (string enum, required: CREATED | UPDATED | DELETED | MOVED | BULK_UPDATED)
- `changes` (string ou json serializado, required)

### Indexes (sugestao)
- `workspaceId + $createdAt`
- `workspaceId + entityType + $createdAt`
- `workspaceId + actorUserId + $createdAt`
