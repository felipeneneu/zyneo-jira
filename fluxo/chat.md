# Fluxo de Chat em Tempo Real

Este documento explica o funcionamento do chat em tempo real dentro de um workspace, incluindo o envio e recebimento de mensagens e o gerenciamento de canais de comunicação.

## 1. Conexão e Autenticação em Tempo Real (Realtime)

1.  **Obtenção de Token JWT:**
    *   Para se inscrever em canais de tempo real do Appwrite de forma segura, o cliente (browser) precisa de um token JWT de curta duração. Ele não pode usar o cookie de sessão `HttpOnly`.
    *   Quando o componente de chat (`src/features/chat/components/workspace-chat.tsx`) é montado, ele chama o hook `use-chat-realtime-token`.
    *   Este hook faz uma requisição `GET` para a API (`/api/chat/token`).

2.  **Endpoint da API (Backend):**
    *   A rota correspondente em `src/features/chat/server/route.ts` é acionada.
    *   O backend, que tem acesso à sessão do usuário, gera um token JWT usando a função `account.createJWT()` do SDK `node-appwrite`.
    *   Este token é retornado para o cliente.

3.  **Inicialização do Cliente Realtime:**
    *   Com o token JWT, o hook customizado `use-chat-realtime` (`src/features/chat/hooks/`) inicializa uma nova instância do cliente web do Appwrite, autenticada com o token.
    *   `client.setJWT(token);`

4.  **Inscrição no Canal (Subscription):**
    *   O hook `use-chat-realtime` usa o método `client.subscribe()` para se inscrever no canal relevante.
    *   O canal é específico do workspace, por exemplo: `databases.${dbId}.collections.${collectionId}.documents`. A inscrição é filtrada para o workspace atual.
    *   `'documents.workspace-123'` ou um canal similar.
    *   O hook define listeners para eventos como `create`, `update`, `delete` de documentos.

## 2. Envio de Mensagens

1.  **Interface do Usuário (UI):**
    *   O usuário digita uma mensagem no componente de input de chat (`src/features/chat/components/chat-input.tsx`).
    *   O componente pode usar um editor de texto rico como o `react-quill`, estilizado em `src/features/chat/components/quill-edit.css`.

2.  **Submissão:**
    *   Ao enviar a mensagem, o hook `use-send-chat-message` é chamado.
    *   O conteúdo da mensagem (que pode ser HTML do editor) é validado e limpo no cliente (e novamente no servidor). A validação usa o schema de `src/features/chat/schemas.ts`.

3.  **Chamada à API:**
    *   O hook envia uma requisição `POST` para o endpoint da API de chat (`/api/chat/messages`).
    *   O corpo da requisição contém o conteúdo da mensagem e o `workspaceId`.

4.  **Endpoint da API (Backend):**
    *   A rota em `src/features/chat/server/route.ts` recebe a mensagem.
    *   **Validação:** O backend valida novamente o conteúdo e verifica se o usuário é membro do workspace.
    *   **Interação com Appwrite:** Um novo documento é criado na coleção `chat_messages`. O documento contém o `workspaceId`, `senderId`, o conteúdo da mensagem e um `timestamp`.
    *   **Permissões:** A permissão de leitura para o novo documento de mensagem é concedida à equipe do workspace (`team:${teamId}`).

## 3. Recebimento de Mensagens (Tempo Real)

1.  **Evento do Appwrite:** A criação do novo documento na coleção `chat_messages` dispara um evento no canal de tempo real do Appwrite.

2.  **Listener no Cliente:**
    *   O listener de `create` que foi configurado no hook `use-chat-realtime` recebe o payload do evento.
    *   O payload contém os dados do novo documento da mensagem (`event.payload`).

3.  **Atualização da UI:**
    *   O hook `use-chat-realtime` recebe o novo dado.
    *   Ele atualiza o estado local do `react-query` para a lista de mensagens (`['chat-messages', workspaceId]`), adicionando a nova mensagem ao final da lista.
    *   A UI, que está reativamente observando os dados da query, renderiza a nova mensagem na tela de chat instantaneamente, sem a necessidade de uma nova requisição `GET`.

## 4. Carregamento de Histórico de Mensagens

1.  **Interface do Usuário (UI):** Quando o componente de chat é aberto pela primeira vez, ele precisa carregar as mensagens anteriores.

2.  **Busca de Dados:**
    *   O componente chama o hook `use-get-chat-messages`.
    *   Este hook implementa paginação (infinite query) para buscar as mensagens em lotes (ex: 50 de cada vez).
    *   Ele faz uma requisição `GET` para a API de chat, passando o `workspaceId` e, opcionalmente, um cursor para a paginação.

3.  **Endpoint da API (Backend):**
    *   A rota `GET` correspondente consulta a coleção `chat_messages` no Appwrite, filtrando pelo `workspaceId`, ordenando por data de criação (`DESC`) e aplicando limites e cursores para a paginação.
    *   O lote de mensagens é retornado.

4.  **Renderização:** A UI exibe o histórico de mensagens. O usuário pode rolar para cima para acionar o carregamento da próxima página (lote mais antigo) de mensagens.
