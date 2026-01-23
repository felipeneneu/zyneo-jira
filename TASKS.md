# TASKS.md

## Documentacao base do projeto (README, AGENTS, Context)

Objetivo:
- Produzir README profissional com overview, features, stack e instalacao.
- Definir AGENTS.md com personas de IA (frontend, backend, devops, QA, auditoria).
- Criar Context.md como SSOT com arquitetura, estrutura e convencoes.

Aceite:
- README.md cobre overview, features, stack, requisitos, instalacao, env vars, scripts e arquitetura.
- AGENTS.md descreve cada agente (incluindo auditoria) com system prompt, foco de stack e responsabilidades.
- Context.md documenta padroes arquiteturais, estrutura de pastas e convencoes de naming.

Fora de escopo:
- Mudancas de codigo ou UI.
- Implementacao de novas features.

Dependencias:
- Nenhuma.

## Analise 360 e documentacao estrategica (README, context, agents, requirements)

Objetivo:
- Extrair requisitos funcionais e nao funcionais do sistema descrito.
- Propor arquitetura e modelagem de dados em alto nivel.
- Gerar README.md, context.md, agents.md e requirements.md em Markdown.

Aceite:
- requirements.md lista FR/NFR com foco em escalabilidade, seguranca e performance.
- README.md descreve overview, features, stack e instalacao.
- context.md documenta arquitetura, estrutura de pastas e convencoes.
- agents.md define personas com system prompts e responsabilidades.

Fora de escopo:
- Implementacao de codigo.
- Execucao de testes ou deploy.

Dependencias:
- Nenhuma.

## Correcao de workspaceId indefinido em notificacoes

Objetivo:
- Evitar links e chamadas com `workspaceId=undefined` ao acessar `/notifications`.
- Garantir selecao automatica do ultimo workspace criado ou adicionado pelo usuario.

Aceite:
- Navigation e menus usam workspace valido quando nao ha param na rota.
- Nao ha requisicoes para `/api/chat/*` com `workspaceId=undefined`.
- Links nao geram `/workspaces/undefined`.

Fora de escopo:
- Alterar regras de permissao no backend.
- Persistir preferencia de workspace no servidor.

Dependencias:
- Hook de listagem de workspaces (`useGetWorkspaces`).
