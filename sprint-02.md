# Sprint 02 - Chat demo + PT-BR baseline

Objetivo: deixar o chat funcional para a apresentacao de amanha e padronizar textos principais em pt-BR.

Escopo
- Chat de workspace com persistencia (Appwrite) e envio/consulta via API.
- Realtime no chat (Appwrite Realtime) com fallback para polling.
- Traducao pt-BR das telas usadas na demo.

Tarefas
- (CHAT) Appwrite: collection `chat_messages` + env var
  - Objetivo: habilitar persistencia das mensagens.
  - Aceite: collection com campos `workspaceId`, `projectId?`, `userId`, `body`, `senderName`, `senderAvatarUrl?` e indices em `workspaceId` e `projectId`; env `NEXT_PUBLIC_APPWRITE_CHAT_MESSAGES_ID` configurado; atributo `chatLastReadAt` (datetime) em `members`.
  - Fora de escopo: threads/reacoes/anexos.
  - Dependencias: Appwrite Console.

- (CHAT) Pagina /chat usando `WorkspaceChat`
  - Objetivo: exibir o chat real na rota de chat.
  - Aceite: `src/app/(dashboard)/workspaces/[workspaceId]/chat` renderiza `WorkspaceChat` e permite filtrar por projeto/enviar mensagem.
  - Fora de escopo: redesign completo do layout.
  - Dependencias: API de chat + Appwrite.

- (CHAT) Realtime via Appwrite
  - Objetivo: mensagens chegando sem refresh.
  - Aceite: assinatura `client.subscribe` em `databases.{dbId}.collections.{chatId}.documents` atualiza a lista; polling de 3s fica como fallback.
  - Fora de escopo: typing indicators.
  - Dependencias: SDK web do Appwrite (pacote `appwrite`).

- (I18N) PT-BR baseline (sem multi-idioma)
  - Objetivo: traduzir textos usados na demo.
  - Aceite: navegacao, tabs de tasks, placeholders e botoes do chat em pt-BR; sem infra de i18n por enquanto.
  - Fora de escopo: suporte multi-idioma e traducao completa do sistema.
  - Dependencias: nenhuma.
