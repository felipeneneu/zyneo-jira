## Correcoes - Upload de imagem no projeto

Objetivo:
- Corrigir o upload de imagem na criacao/edicao de projetos (Appwrite Storage) para aceitar File vindo do form.

Aceite:
- Criar projeto com imagem gera arquivo no bucket e salva `imageUrl` com fileId.
- Atualizar projeto com nova imagem substitui `imageUrl`.
- Criar projeto sem imagem continua funcionando.

Fora de escopo:
- Alterar upload de imagem em workspaces ou tarefas.
- Validacao de tamanho/tipo de arquivo.
- Ajustes de UI.

Dependencias:
- `node-appwrite` com suporte a `InputFile.fromBuffer`.

## Notificacao de chat responsiva + realtime com som

Objetivo:
- Exibir badge de notificacao do chat apenas no mobile (UserButton) e no desktop no icon Bell do Header.
- Atualizar realtime para tocar som quando chegar mensagem nova no workspace.

Aceite:
- No mobile, o badge aparece no UserButton; no desktop, o badge aparece no Bell do Header.
- Ao chegar nova mensagem (de outro usuario), o badge atualiza em tempo real.
- Som de notificacao toca em chegada de mensagem (quando permitido pelo browser).

Fora de escopo:
- Persistencia de notificacoes de chat em Appwrite.
- Preferencias por usuario (mutar som, volume, DND).
- Notificacoes push do navegador.

Dependencias:
- Realtime do Appwrite (JWT) ja configurado em `useChatRealtime`.

## Dropdown de notificacoes (chat + sistema)

Objetivo:
- Transformar o Bell (desktop) e o UserButton (mobile) em entradas de menu para acessar chat e notificacoes do sistema.
- Unificar badge com contagem de chat nao lido + notificacoes nao lidas.

Aceite:
- Bell abre menu com itens "Chat" (workspace) e "Notificacoes do sistema" (/notifications).
- UserButton no mobile mostra os mesmos itens.
- Badge mostra soma de nao lidas (chat + sistema).

Fora de escopo:
- Realtime para notificacoes do sistema.
- Preferencias de usuario (silenciar, filtros).

Dependencias:
- Hook `useGetNotifications` para filtro `unread`.

## Realtime do chat - permissoes de leitura

Objetivo:
- Garantir que mensagens do chat tenham permissoes de leitura para habilitar realtime no cliente.

Aceite:
- Evento realtime chega no client e atualiza badge/son.
- Mensagens continuam sendo criadas via API.

Fora de escopo:
- Refatoracao completa de permissoes por workspace.
- Paginação de membros para permissoes por usuario.

Dependencias:
- `node-appwrite` com `Permission` e `Role`.

## Som de notificacao via polling (sem realtime)

Objetivo:
- Tocar som quando houver novas mensagens detectadas pelo polling do unread.

Aceite:
- Som toca ao detectar novo `lastMessageAt` e aumento de `count`.
- Nao toca no carregamento inicial.

Fora de escopo:
- Deduplicacao perfeita por mensagem.
- Preferencias de usuario (mutar/volume).

Dependencias:
- `useChatUnread` com suporte a `refetchInterval`.
