# Fluxo de Autenticação de Usuário

Este documento descreve o fluxo de autenticação, desde o registro e login até o gerenciamento da sessão do usuário.

## 1. Registro (Sign-Up)

1.  **Interface do Usuário (UI):** O usuário acessa a página de registro em `/sign-up`. O componente principal é `src/features/auth/components/sign-up-card.tsx`.
2.  **Submissão do Formulário:** O usuário preenche o formulário com nome, email e senha. A validação dos dados é feita pelo Zod, com o esquema definido em `src/features/auth/schemas.ts`.
3.  **Chamada à API:** Ao submeter, o hook `use-register.ts` de `src/features/auth/api/` é acionado. Ele envia uma requisição `POST` para a rota da API interna.
4.  **Endpoint da API (Backend):** A requisição é recebida pelo servidor Hono em `src/features/auth/server/route.ts`.
5.  **Interação com Appwrite:** O backend chama a função `account.create()` do SDK `node-appwrite` para criar um novo usuário no Appwrite.
6.  **Criação da Sessão:** Após a criação bem-sucedida do usuário, o backend cria uma sessão para ele usando `account.createEmailPasswordSession()`.
7.  **Armazenamento da Sessão:** O ID secreto da sessão é armazenado em um cookie `HttpOnly` e seguro, gerenciado pelo `src/lib/session-middleware.ts`.
8.  **Redirecionamento:** O usuário é redirecionado para a página de criação de workspace (`/workspaces/create`) ou para o dashboard principal.

## 2. Login (Sign-In)

1.  **Interface do Usuário (UI):** O usuário acessa a página de login em `/sign-in`. O componente principal é `src/features/auth/components/sign-in-card.tsx`.
2.  **Submissão do Formulário:** O usuário insere email e senha. A validação segue o esquema em `src/features/auth/schemas.ts`.
3.  **Chamada à API:** O hook `use-login.ts` é acionado, enviando uma requisição `POST` para a API.
4.  **Endpoint da API (Backend):** A rota em `src/features/auth/server/route.ts` recebe a requisição.
5.  **Criação da Sessão no Appwrite:** O backend utiliza `account.createEmailPasswordSession()` para validar as credenciais e criar uma sessão.
6.  **Armazenamento da Sessão:** O cookie com o segredo da sessão é criado da mesma forma que no registro.
7.  **Redirecionamento:** O usuário é redirecionado para o último workspace acessado ou para o dashboard.

## 3. Autenticação via OAuth (Ex: Google, GitHub)

1.  **Interface do Usuário (UI):** Na tela de login/registro, o usuário clica no botão de um provedor OAuth.
2.  **Redirecionamento para o Provedor:** A função `signInWithProvider` em `src/lib/oauth.ts` é chamada, que por sua vez aciona `account.createOAuth2Token()` do SDK do Appwrite. O usuário é redirecionado para a página de autorização do provedor (ex: Google).
3.  **Callback do Provedor:** Após a autorização, o provedor redireciona o usuário de volta para a aplicação, na rota `/oauth/route.ts`.
4.  **Finalização da Sessão:** O `account.createSession('current')` é chamado para finalizar a sessão do lado do Appwrite com o token recém-obtido.
5.  **Armazenamento da Sessão:** O cookie da sessão é criado, e o usuário é logado.

## 4. Gerenciamento da Sessão

-   **Middleware:** O arquivo `src/lib/session-middleware.ts` atua como um middleware para as rotas protegidas.
-   **Validação da Sessão:** Em cada requisição para uma rota protegida, o middleware verifica a presença e a validade do cookie da sessão.
-   **Obtenção do Usuário:** Se a sessão for válida, as informações do usuário são obtidas do Appwrite usando `account.get()` e ficam disponíveis no contexto da requisição.
-   **Sessões Inválidas:** Se a sessão for inválida ou não existir, o usuário é redirecionado para a página de login `/sign-in`.

## 5. Logout

1.  **Interface do Usuário (UI):** O usuário clica no botão de logout, geralmente localizado no `src/features/auth/components/user-button.tsx`.
2.  **Chamada à API:** O hook `use-logout.ts` é acionado, enviando uma requisição `POST` para a API de logout.
3.  **Endpoint da API (Backend):** A rota em `src/features/auth/server/route.ts` recebe a chamada.
4.  **Encerramento da Sessão:** O backend utiliza `account.deleteSession('current')` para invalidar a sessão no Appwrite.
5.  **Limpeza do Cookie:** O cookie da sessão é removido do navegador.
6.  **Redirecionamento:** O usuário é redirecionado para a página de login.
