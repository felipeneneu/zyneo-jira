# context.md

Fonte unica da verdade para LLMs e colaboradores.

## Arquitetura
- Monolito modular com Next.js (App Router) e API interna.
- Separacao por dominio/feature em `src/features`.
- Integracoes externas encapsuladas em `src/lib`.
- Gemini via camada de servico com protecao de chaves.

## Padroes de projeto
- SOLID e DRY com composicao por feature.
- Validacao de entrada com Zod.
- Respostas de API no formato `{ data }` e `{ error }`.
- Autorizacao por membership e papel.

## Estrutura de pastas
- `src/app/*`: paginas e rotas do App Router
- `src/features/<dominio>/{api,components,hooks,server,schemas,types}`
- `src/lib/*`: clientes externos e utilitarios
- `src/app/api/[[...route]]/route.ts`: registro de rotas

## Convencoes de naming
- Componentes: PascalCase
- Hooks: `use-` em kebab-case
- Rotas: `route.ts`
- Variaveis de ambiente: SCREAMING_SNAKE_CASE

## Regras de qualidade
- Sem logs de debug em producao.
- Testes para fluxos criticos (auth, workspace, tasks).
- Permissoes consistentes em todas as rotas.
