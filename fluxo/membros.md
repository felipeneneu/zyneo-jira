# Fluxo de Gerenciamento de Membros

Este documento descreve como os membros são convidados, gerenciados e removidos de um workspace.

## 1. Visualização de Membros

1.  **Interface do Usuário (UI):**
    *   Dentro de um workspace, há uma seção ou página de "Membros" ou "Configurações da Equipe".
    *   Esta página renderiza uma lista dos membros atuais do workspace. O componente principal para isso poderia ser `src/features/members/components/members-list.tsx`.

2.  **Busca de Dados:**
    *   O componente utiliza o hook `use-get-members` (`src/features/members/api/`), que recebe o `workspaceId` atual como parâmetro.
    *   Este hook faz uma requisição `GET` para o endpoint da API de membros.

3.  **Endpoint da API (Backend):**
    *   A rota do servidor Hono em `src/features/members/server/route.ts` é acionada.
    *   O backend consulta a coleção `members` do Appwrite, buscando todos os documentos associados ao `workspaceId` fornecido.
    *   Para enriquecer os dados, o backend pode fazer um "join" com a coleção `users` (ou `profiles`) para obter o nome e o avatar de cada membro, em vez de apenas o `userId`.
    *   A lista de membros com seus detalhes é retornada.

4.  **Renderização:** A UI exibe a lista, mostrando o avatar, nome e a role (função) de cada membro no workspace (ex: Admin, Membro). O componente `src/features/members/components/members-avatar.tsx` pode ser usado para exibir os avatares.

## 2. Convidar Novos Membros (Fluxo Sugerido, pode não estar implementado)

*Nota: A implementação exata de convites pode variar. Um sistema comum seria baseado em links de convite ou convite direto por email.*

### Fluxo A: Convite por Link

1.  **Geração do Link (UI/Backend):**
    *   Um admin do workspace clica em "Convidar Membro".
    *   A UI solicita ao backend a criação de um token de convite único, associado ao `workspaceId`.
    *   O backend armazena este token (ex: na coleção `invites`) com um tempo de expiração e o retorna para a UI.
    *   A UI monta uma URL de convite, como `.../workspaces/join?token=[token]`.

2.  **Aceite do Convite:**
    *   O novo usuário recebe e acessa a URL.
    *   Se não estiver logado, ele é solicitado a fazer login ou se registrar.
    *   Após o login, a página de aceite de convite (`/workspaces/join`) é processada.
    *   O frontend envia o token para o backend.

3.  **Validação do Convite (Backend):**
    *   O backend verifica se o token é válido e não expirou.
    *   Se válido, ele adiciona o `userId` atual à coleção `members` do `workspaceId` associado ao token.
    *   O token de convite é então invalidado ou excluído.
    *   O usuário é redirecionado para o workspace.

## 3. Atualização de Role (Função) de um Membro

1.  **Interface do Usuário (UI):**
    *   Na lista de membros, um admin clica em um dropdown ao lado do nome de um membro para alterar sua função (ex: de "Membro" para "Admin").
    *   A seleção da nova role dispara o hook `use-update-member`.

2.  **Chamada à API:**
    *   O hook envia uma requisição `PATCH` para a API de membros (`/api/members/[membershipId]`).
    *   O corpo da requisição contém a nova `role`. O `membershipId` é o ID do documento na coleção `members`.

3.  **Endpoint da API (Backend):**
    *   A rota `PATCH` em `src/features/members/server/route.ts` é acionada.
    *   **Validação de Permissão:** O backend verifica se o usuário que está fazendo a requisição é um admin do workspace.
    *   **Lógica de Atualização:** O backend atualiza o documento na coleção `members` com a nova role.

4.  **Atualização da UI:** A query `['members', workspaceId]` é invalidada, e a lista de membros é recarregada para exibir a nova função.

## 4. Remoção de um Membro

1.  **Interface do Usuário (UI):**
    *   Um admin clica no botão "Remover" ao lado de um membro na lista.
    *   Um modal de confirmação é exibido (`use-confirm`).

2.  **Chamada à API:**
    *   Após a confirmação, o hook `use-delete-member` é chamado.
    *   Ele envia uma requisição `DELETE` para `/api/members/[membershipId]`.

3.  **Endpoint da API (Backend):**
    *   A rota `DELETE` em `src/features/members/server/route.ts` é acionada.
    *   **Validação de Permissão:** O backend verifica se o requisitante é um admin. Um usuário não pode remover a si mesmo se for o único admin.
    *   **Lógica de Remoção:** O backend deleta o documento correspondente da coleção `members`.

4.  **Atualização da UI:** A lista de membros é invalidada e recarregada, e o membro removido desaparece da interface.
