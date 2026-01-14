# Fluxo de Gerenciamento de Workspaces

Este documento detalha como os usuários criam, acessam e gerenciam workspaces na aplicação. Workspaces são os contêineres principais para projetos, tarefas e colaboração de equipes.

## 1. Criação de um Novo Workspace

1.  **Gatilho:** A criação de um workspace ocorre em dois cenários principais:
    *   Após o primeiro registro bem-sucedido, o usuário é redirecionado para `/workspaces/create`.
    *   Um usuário existente clica na opção "Criar Workspace" dentro do componente `src/app/components/workspace-switcher.tsx`.

2.  **Interface do Usuário (UI):** A página de criação é renderizada (localizada em `src/app/(standalone)/workspaces/create/page.tsx`). Ela contém um formulário para o nome do workspace.

3.  **Submissão e API:**
    *   Ao submeter o formulário, o hook `use-create-workspace` (de `src/features/workspaces/api/`) é chamado.
    *   Este hook envia uma requisição `POST` para o endpoint de workspaces da API.

4.  **Endpoint da API (Backend):**
    *   A rota do servidor Hono, definida em `src/features/workspaces/server/route.ts`, recebe a requisição.
    *   O backend executa a lógica de criação.

5.  **Interação com Appwrite:**
    *   Um novo documento é criado na coleção `workspaces` do Appwrite. O esquema de dados é validado por `src/features/workspaces/schemas.ts`.
    *   **Permissões:** O documento do workspace é criado com permissões específicas. O criador (usuário logado) recebe acesso de leitura, escrita e exclusão (`Permission.role(`user:${userId}`)`).
    *   Após criar o workspace, o backend cria um documento de associação na coleção `members`, vinculando o usuário ao novo workspace com a role de `admin`.

6.  **Redirecionamento:** Após a criação bem-sucedida, o usuário é redirecionado para o dashboard do novo workspace, usando o ID gerado: `/workspaces/[workspaceId]`.

## 2. Troca (Switch) entre Workspaces

1.  **Interface do Usuário (UI):**
    *   O componente `src/app/components/workspace-switcher.tsx` exibe o workspace atual e uma lista dos outros workspaces aos quais o usuário pertence.
    *   A lista de workspaces é obtida através do hook `use-get-workspaces-list` (`src/features/workspaces/api/`).

2.  **Ação do Usuário:** O usuário clica em um workspace diferente na lista.

3.  **Navegação:** A aplicação utiliza o Next.js App Router para navegar para a rota do workspace selecionado (`/workspaces/[workspaceId]`).

4.  **Atualização de Contexto:**
    *   A página do workspace (`src/app/(dashboard)/workspaces/[workspaceId]/page.tsx`) é carregada.
    *   Os componentes dentro da página (como `projects`, `tasks`, etc.) usarão o `workspaceId` da URL para buscar os dados relevantes para aquele contexto.

## 3. Acesso e Carregamento de um Workspace

1.  **Navegação:** O usuário acessa uma URL como `/workspaces/[workspaceId]`.

2.  **Layout do Dashboard:** O `src/app/(dashboard)/layout.tsx` é o layout principal que envolve as páginas do dashboard. Ele contém a `Sidebar`, `Navbar` e outros elementos estruturais.

3.  **Busca de Dados:**
    *   A página do workspace (`.../[workspaceId]/page.tsx`) e seus componentes filhos disparam hooks para buscar dados específicos.
    *   Por exemplo, a lista de projetos (`src/app/components/projects.tsx`) usará o `use-get-projects` passando o `workspaceId` atual.
    *   O hook `use-get-current-workspace` (`src/features/workspaces/api/`) busca os detalhes do workspace ativo.

4.  **Validação de Acesso:**
    *   Todas as chamadas de API no backend que acessam recursos de um workspace (projetos, tarefas, membros) devem validar se o usuário (`userId` da sessão) tem permissão para acessar aquele workspace.
    *   Isso é feito verificando a associação do usuário na coleção `members` antes de retornar os dados. Se o usuário não for membro do workspace, a API retorna um erro de "Não autorizado" (403).
