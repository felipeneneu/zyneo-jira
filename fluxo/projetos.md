# Fluxo de Gerenciamento de Projetos

Este documento descreve como os projetos são criados, visualizados e gerenciados dentro de um workspace. Projetos servem para agrupar tarefas relacionadas.

## 1. Criação de um Novo Projeto

1.  **Interface do Usuário (UI):**
    *   Dentro da página de um workspace (`/workspaces/[workspaceId]`), há um botão "Novo Projeto".
    *   Este botão abre um modal (usando o componente `src/app/components/responsive-modal.tsx`) que contém o formulário de criação de projeto. O conteúdo do formulário está em `src/features/projects/components/create-project-form.tsx`.

2.  **Submissão do Formulário:**
    *   O usuário preenche o nome, identificador (key), e opcionalmente um ícone e cor para o projeto.
    *   A validação dos dados é feita pelo Zod, seguindo o esquema em `src/features/projects/schemas.ts`.
    *   Ao submeter, o hook `use-create-project` (de `src/features/projects/api/`) é chamado.

3.  **Chamada à API:**
    *   O hook envia uma requisição `POST` para o endpoint da API de projetos, incluindo o `workspaceId` no corpo da requisição para contextualizar onde o projeto deve ser criado.

4.  **Endpoint da API (Backend):**
    *   A rota do servidor Hono em `src/features/projects/server/route.ts` recebe a requisição.
    *   **Validação de Permissão:** O backend primeiro verifica se o usuário logado (`userId`) é membro do `workspaceId` informado. Isso é feito consultando a coleção `members`. Se não for membro, a API retorna um erro 403 (Não Autorizado).

5.  **Interação com Appwrite:**
    *   Se a permissão for validada, um novo documento é criado na coleção `projects`.
    *   O documento contém os dados do projeto e uma referência (`$id`) ao `workspace` a que pertence.
    *   **Permissões do Documento:** O acesso ao documento do projeto é herdado das permissões do workspace ou definido para garantir que apenas membros do workspace possam vê-lo. A permissão de leitura é dada a todos os membros do time (`team:${teamId}`), onde `teamId` é o ID da equipe do workspace no Appwrite.

6.  **Atualização da UI:**
    *   Após a criação bem-sucedida, a biblioteca `react-query` (usada pelos hooks) invalida a query `['projects', workspaceId]`.
    *   Isso faz com que a lista de projetos seja automaticamente recarregada (o hook `use-get-projects` é chamado novamente), e o novo projeto aparece na interface.

## 2. Visualização de Projetos

1.  **Carregamento da Página:** Quando o usuário acessa a página de um workspace, o componente `src/app/components/projects.tsx` é renderizado.

2.  **Busca de Dados:**
    *   Este componente utiliza o hook `use-get-projects` (`src/features/projects/api/`), passando o `workspaceId` atual obtido da URL.
    *   O hook faz uma chamada `GET` para a API.

3.  **Endpoint da API (Backend):**
    *   A rota `GET` em `src/features/projects/server/route.ts` é acionada.
    *   O backend consulta a coleção `projects` no Appwrite, filtrando os documentos onde o atributo `workspaceId` corresponde ao ID informado e o usuário tem permissão de leitura.
    *   A lista de projetos é retornada como resposta.

4.  **Renderização:** A lista de projetos é exibida no `projects.tsx`, geralmente em formato de tabela ou lista de cards.

## 3. Exclusão de um Projeto

1.  **Interface do Usuário (UI):**
    *   Cada projeto na lista tem uma opção (ex: um menu de contexto) para "Excluir".
    *   Ao clicar, um modal de confirmação é exibido para previnir exclusões acidentais. O hook `use-confirm` (`src/hooks/use-confirm.tsx`) pode ser usado para essa finalidade.

2.  **Chamada à API:**
    *   Confirmada a exclusão, o hook `use-delete-project` é chamado, passando o `projectId`.
    *   Este hook envia uma requisição `DELETE` para o endpoint da API, com o ID do projeto a ser excluído.

3.  **Endpoint da API (Backend):**
    *   A rota `DELETE` em `src/features/projects/server/route.ts` é acionada.
    *   **Validação de Permissão:** O backend verifica se o usuário tem permissão para excluir o projeto (ex: se ele é `admin` do workspace).
    *   **Lógica de Exclusão:** O backend envia um comando ao Appwrite para deletar o documento correspondente da coleção `projects`. Opcionalmente, pode também deletar em cascata todas as tarefas (`tasks`) associadas a esse projeto.

4.  **Atualização da UI:** Assim como na criação, a query de projetos é invalidada, fazendo com que a lista seja recarregada e o projeto excluído desapareça da tela.
