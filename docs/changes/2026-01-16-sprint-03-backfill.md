# Backfill manual — Sprint 03 (slug, projectKey, taskKey)

Este procedimento e manual. Use somente em ambientes controlados.

## Objetivo

- Gerar `slug` para workspaces existentes
- Gerar `projectKey` e `taskSeq` para projetos existentes
- Gerar `taskKey` para tasks existentes

## Regras

- `slug`: slugify do nome + sufixo incremental (`acme`, `acme-2`)
- `projectKey`: 3-5 letras A-Z (base no nome) + sufixo incremental (`ACME`, `ACME2`)
- `taskKey`: `${projectKey}-${taskSeq}`

## Passo a passo

1) Workspaces
   - Liste workspaces sem `slug`.
   - Gere slug por nome e verifique unicidade.
   - Atualize cada documento com o `slug`.

2) Projects
   - Liste projetos sem `projectKey`.
   - Gere `projectKey` por nome e verifique unicidade.
   - Defina `taskSeq` inicial com base no total de tasks existentes no projeto.

3) Tasks
   - Para cada projeto, ordene tasks por `$createdAt`.
   - Gere `taskKey` incremental seguindo a ordem e atualize cada task.

## Observacoes

- Se houver colisao de `taskKey`, incremente a sequencia e tente novamente.
- Nao execute este procedimento automaticamente em producao.
