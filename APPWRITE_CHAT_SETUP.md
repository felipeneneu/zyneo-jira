# Appwrite - Setup do Chat (Zyneolist)

Este guia descreve como configurar o Appwrite para habilitar o chat do workspace.

Indices recomendados:

- `workspaceId` (para listar mensagens por workspace)
- `projectId` (para filtro por projeto)
- opcional: `workspaceId + projectId` (composto, se o Appwrite permitir)

## 4) Realtime (Appwrite)

No client, assinar o canal da collection para receber novas mensagens:

- `databases.{DATABASE_ID}.collections.{CHAT_MESSAGES_ID}.documents`

A UI atual usa polling de 3s como fallback. Quando o realtime estiver ativo, podemos atualizar o cache diretamente e reduzir o polling.

## 5) Checklist de validacao

- [ ] Mensagens aparecem ao recarregar a pagina
- [ ] Envio cria documento em `chat_messages`
- [ ] Unread funciona (badge no avatar)
- [ ] Filtro por projeto retorna apenas mensagens do projeto
