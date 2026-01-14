# Fluxo de Gerenciamento de Tarefas

Este documento descreve o ciclo de vida das tarefas (tasks/issues), desde sua criação até a atualização de status dentro de um projeto.

## 1. Criação de uma Nova Tarefa

1.  **Interface do Usuário (UI):**
    *   O usuário navega para a página de um projeto específico (`/workspaces/[workspaceId]/projects/[projectId]`).
    *   Nesta página, existe um botão "Criar Tarefa", que abre um formulário, geralmente em um modal ou uma nova página. O componente do formulário estaria em `src/features/tasks/components/create-task-form.tsx`.

2.  **Submissão do Formulário:**
    *   O usuário preenche campos como título, descrição, responsável (assignee), status inicial (ex: "To Do"), prioridade, etc.
    *   A validação dos dados é garantida pelo Zod, com o esquema definido em `src/features/tasks/schemas.ts`.
    *   Ao submeter, o hook `use-create-task` (`src/features/tasks/api/`) é acionado.

3.  **Chamada à API:**
    *   O hook envia uma requisição `POST` para o endpoint da API de tarefas.
    *   O corpo da requisição contém os dados da tarefa, junto com o `projectId` e o `workspaceId` para contextualização.

4.  **Endpoint da API (Backend):**
    *   A rota do servidor Hono, localizada em `src/features/tasks/server/route.ts`, processa a requisição.
    *   **Validação de Permissão:** O backend verifica se o usuário (`userId`) é membro do workspace e, portanto, tem permissão para criar tarefas no projeto.

5.  **Interação com Appwrite:**
    *   Um novo documento é inserido na coleção `tasks`.
    *   O documento armazena todos os atributos da tarefa e inclui referências (`$id`) ao projeto (`projectId`) e ao workspace (`workspaceId`).
    *   O contador de tarefas do projeto (ex: `PROJ-1`, `PROJ-2`) é incrementado atomicamente. Isso pode ser feito com uma Appwrite Function que é acionada na criação do documento ou através de uma leitura e escrita transacional no backend.
    *   **Permissões:** As permissões de leitura no documento da tarefa são atribuídas à equipe do workspace (`team:${teamId}`), garantindo que apenas membros possam visualizá-la.

6.  **Atualização da UI:**
    *   A query do `react-query` para a lista de tarefas do projeto (`['tasks', projectId]`) é invalidada.
    *   Isso força o hook `use-get-tasks` a buscar os dados novamente, e a nova tarefa aparece na interface (ex: em um quadro Kanban ou lista).

## 2. Visualização de Tarefas

1.  **Carregamento da Página:** Ao acessar a página de um projeto, componentes como um quadro Kanban (`task-board.tsx`) ou uma lista de tarefas (`task-list.tsx`) são renderizados.

2.  **Busca de Dados:**
    *   Esses componentes usam o hook `use-get-tasks` (`src/features/tasks/api/`), passando o `projectId` da URL.
    *   O hook faz uma chamada `GET` para a API de tarefas.

3.  **Endpoint da API (Backend):**
    *   A rota `GET` em `src/features/tasks/server/route.ts` é chamada.
    *   O backend consulta a coleção `tasks` no Appwrite, filtrando pelos documentos que pertencem ao `projectId` especificado.
    *   A lista de tarefas é retornada, podendo incluir dados relacionados, como informações do responsável (joined data).

4.  **Renderização:** As tarefas são exibidas na UI, agrupadas por status (no Kanban) ou em uma tabela.

## 3. Atualização de uma Tarefa (Ex: Mover no Kanban)

1.  **Interface do Usuário (UI):**
    *   O usuário arrasta um card de tarefa de uma coluna (ex: "To Do") para outra (ex: "In Progress").
    *   Bibliotecas como `@hello-pangea/dnd` (drag and drop) são usadas para gerenciar a interação.

2.  **Ação de Atualização:**
    *   Ao soltar o card (onDragEnd), uma função é chamada, identificando a tarefa (`taskId`) e o novo status.
    *   O hook `use-update-task` é acionado, passando o `taskId` e um payload com o campo a ser atualizado (ex: `{ status: 'IN_PROGRESS' }`).

3.  **Chamada à API:**
    *   O hook envia uma requisição `PATCH` ou `PUT` para o endpoint da API, com o `taskId` como parâmetro de rota.

4.  **Endpoint da API (Backend):**
    *   A rota correspondente em `src/features/tasks/server/route.ts` é acionada.
    *   **Validação de Permissão:** O backend verifica se o usuário tem permissão para modificar a tarefa.
    *   **Lógica de Atualização:** O backend usa o SDK do Appwrite para atualizar o documento na coleção `tasks` com o ID fornecido (`databases.updateDocument`).

5.  **Atualização da UI (Otimista ou Pessimista):**
    *   **Atualização Otimista:** A UI pode ser atualizada imediatamente para refletir a mudança, antes mesmo da confirmação da API. Se a API falhar, a UI é revertida ao estado anterior. Isso proporciona uma experiência de usuário mais fluida.
    *   **Atualização Pessimista:** A UI aguarda a confirmação da API antes de mostrar a mudança. Após o sucesso, a query é invalidada para buscar o estado mais recente.
