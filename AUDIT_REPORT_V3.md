# Audit Report V3 - Zyneolist (gestaozyneo)

Data: 2026-01-13
Escopo: auditoria de seguranca/risco do sistema atual (Next.js App Router + Hono + Appwrite + React Query + Tailwind + Gemini).

## Resumo executivo

- O core funciona, mas ha lacunas de hardening para ambiente publico (rate limit, recovery, validacao de upload, observabilidade).
- O chat realtime introduz risco de vazamento se as permissoes da collection forem abertas a "users".
- Existem pontos de UX/estabilidade que podem virar falha funcional em prod (cookie secure em dev, erro "Unatorized").

## Achados (prioridade)

### P0 (alto risco)

1) Permissoes do Appwrite podem expor dados via realtime/SDK
   - Se a collection `chat_messages` estiver com `read` aberto para `users`, qualquer usuario logado pode assinar o canal realtime e receber mensagens de outros workspaces.
   - Impacto: vazamento de dados entre workspaces.
   - Recomendacao: usar Appwrite Teams por workspace e aplicar permissao de read no documento/collection por team; ou aplicar permissao por documento na criacao.

2) Ausencia de rate limit em endpoints sensiveis
   - Endpoints: login, register, ai-description, chat messages.
   - Impacto: brute force, abuso de recursos, custo com IA.
   - Recomendacao: rate limit por IP e por usuario, com bloqueio temporario.

### P1 (medio)

3) Upload sem validacao de tipo/tamanho
   - Workspaces/Projetos aceitam upload de imagem sem validar tipo/tamanho.
   - Impacto: custo de storage, possivel upload malicioso.
   - Recomendacao: validar MIME/size no backend e restringir no Appwrite.

4) Sem recovery/verificacao de email
   - Impacto: contas comprometidas sem fluxo de recuperacao; usuarios falsos sem verificacao.
   - Recomendacao: habilitar recovery e email verification no Appwrite.

5) Observabilidade e logs estruturados ausentes
   - Impacto: investigacao de incidentes lenta.
   - Recomendacao: logging estruturado com requestId, erro padronizado e alertas basicos.

### P2 (baixo)

6) Cookie secure sempre true em dev
   - Pode quebrar login local (http).
   - Impacto: instabilidade em dev.
   - Recomendacao: usar secure somente em production.

7) Mensagem "Unatorized" no createSessionClient
   - Impacto: DX/UX.
   - Recomendacao: corrigir typo.

8) Falta de indices/performance no Appwrite
   - Impacto: queries lentas e erros "Index not found".
   - Recomendacao: revisar indices por collection e workloads principais.

## Pontos de atencao especificos (chat realtime)

- O realtime roda no client e precisa de JWT por usuario.
- Se o JWT for comprometido, o escopo de acesso depende das permissoes da collection.
- Recomendado: limitar read por workspace e manter fallback polling se realtime falhar.

## Checklist minimo antes de deploy

- [ ] Rate limit em login/registro/IA
- [ ] Recovery e verificacao de email configurados
- [ ] Validacao de upload (tipo/tamanho)
- [ ] Indices Appwrite revisados
- [ ] Permissoes de collections restritas por workspace/team

