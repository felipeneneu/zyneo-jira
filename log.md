# Log de Mudancas (v2.0 - em desenvolvimento)
Gerado em: 2026-01-12 00:26
## Contexto
- Base: MVP em producao (ultimo deploy).
- Objetivo atual: iniciar v2.0 com Chat por workspace (filtrando por projeto), badge de unread no avatar e avatar real para OAuth.
## O que foi implementado
### Chat (Workspace)
- Criado modulo src/features/chat/* com:
  - Tipos e schemas.
  - API Hono em /api/chat/*.
  - UI WorkspaceChat e hooks React Query.
- Aba **Chat** no switcher de tarefas agora renderiza WorkspaceChat (substitui o chat mock).
### Notificacao (unread badge)
- UserButton agora consulta unread do chat e exibe um dot vermelho quando ha mensagem nova no workspace atual.
### Avatar (Google/GitHub)
- Adicionado endpoint POST /api/auth/sync-profile que tenta buscar avatar do provider (Google/GitHub) usando account.listIdentities() + providerAccessToken e salva em user.prefs.avatarUrl.
- UserButton renderiza AvatarImage quando user.prefs.avatarUrl existir (fallback para iniciais mantido).
### Fixes e limpeza
- Corrigido calculo de position na criacao de tasks (agora usa Query.orderDesc("position")).
- Removidos logs de debug em requests/auth.
## Arquivos adicionados
- src/features/chat/types.ts
- src/features/chat/schemas.ts
- src/features/chat/server/route.ts
- src/features/chat/components/workspace-chat.tsx
- src/features/chat/api/use-get-chat-messages.ts
- src/features/chat/api/use-send-chat-message.ts
- src/features/chat/api/use-mark-chat-read.ts
- src/features/chat/api/use-chat-unread.ts
- src/features/auth/api/use-sync-profile.ts
## Arquivos alterados
- src/config.ts (adicionado CHAT_MESSAGES_ID + env var NEXT_PUBLIC_APPWRITE_CHAT_MESSAGES_ID)
- src/app/api/[[...route]]/route.ts (registrado .route("/chat", chat))
- src/features/tasks/components/task-view-switcher.tsx (Chat tab -> WorkspaceChat)
- src/features/tasks/server/route.ts (fix position + remo├º├úo de logs)
- src/features/auth/server/route.ts (novo endpoint POST /sync-profile)
- src/features/auth/api/use-current.ts (remo├º├úo de log)
- src/features/auth/components/user-button.tsx (avatarUrl + unread dot + sync profile)
- src/features/projects/components/chat-project.tsx (remo├º├úo de console.log)
## Dependencias / Config necessaria
- Appwrite: criar collection de chat e adicionar chatLastReadAt em members.
- Env var nova: NEXT_PUBLIC_APPWRITE_CHAT_MESSAGES_ID.

