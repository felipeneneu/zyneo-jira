# Auditoria de features e fluxo (MVP)

## Escopo da auditoria
Foco: execucao diaria (prioridade principal), com suporte a visibilidade gerencial, previsibilidade e colaboracao.
MVP com modo orientado opcional e prazo de 4 semanas.

## Status atual no sistema (verificado no codigo)
- Implementado: Kanban com drag/drop e ordenacao; Tabela/Lista com filtros; Comentarios com tipos e mencoes; Notificacoes (lista, menu, read/star/archive); IA overview diario (Gemini daily-focus); Alertas de aging (flags stale/overdue + notificacoes).
- Parcial: WIP apenas contado no overview (sem limite/gate); Blocked via comentario (sem exigir motivo/owner); Backlog/Calendar/Reports/Audit/Exports/Diagrams como UI/placeholder sem regras de fluxo.
- Fora do MVP mas presente: Chat interno completo (UI + API + realtime); Diagramas com board basico.

## Auditoria de features (valor vs superficial)
- Kanban: manter; nucleo de execucao diaria e foco.
- Tabela/Lista: simplificar; util para triagem e filtros, sem duplicar logica do Kanban.
- Chat interno: cortar no MVP; alto ruido e baixo impacto direto na execucao.
- Diagramas: cortar no MVP; utilidade baixa para entrega diaria.
- Notificacoes: manter, porem consequence-driven (apenas eventos relevantes, sem spam).

## Manter / Cortar / Simplificar (MVP)
- Manter: Kanban (implementado), IA (overview implementado), comentarios (implementado), notificacoes minimas (implementado).
- Simplificar: Tabela (implementado), comentarios sem anexos avancados (ok), IA com prompts curtos e objetivos (ok).
- Cortar: Chat interno (implementado, mas fora do MVP), diagramas (implementado como board basico), automacoes complexas (nao), integracoes externas pesadas (nao).

## Regras automaticas de consequencia (essenciais)
- WIP: limite por coluna; exceder exige justificar ou mover tarefa para Pause/Backlog. (nao implementado; apenas wipCount no overview diario)
- Aging/SLA: tarefas antigas sobem de prioridade ou disparam alerta diario. (parcial: flags stale/overdue + notificacao)
- Blocked: ao marcar, exige motivo + owner do bloqueio; aparece no topo do overview. (parcial: flag via comentario, sem motivo/owner)
- In Review: so entra com checklist basico (criterio de aceite + responsavel). (nao implementado)
- Done: exige validacao simples (checkbox de aceite). (nao implementado)
- Alertas: 1 por dia por tarefa (evita spam); foco em aging, bloqueios, prazo. (parcial: upsert por threadKey, sem limite diario)
- Relatorio mensal: throughput, carryover, blockers recorrentes, top causas de atraso. (nao implementado)

## IA – overview diario util (formato recomendado)
- Resumo executivo (1 paragrafo): status do sprint, risco principal, foco do dia.
- Riscos: tarefas com aging critico, bloqueios ativos, WIP estourado.
- Foco: 3 tarefas com maior impacto ou urgencia.
- Pendencias: tarefas sem dono, sem prazo, sem proximo passo.
- Tendencia: throughput 7 dias, carryover da sprint, previsibilidade.
Status: implementado no daily-focus com JSON estruturado + card na UI.

## Lacunas de fluxo
- Falta Definition of Ready/Done minima.
- Falta politica de entrada/saida de colunas.
- Falta gestao de aging e tarefas esquecidas.
- Falta priorizacao objetiva (1–3 criterios simples).
- Falta rituais claros para modo orientado.

## Sprints, Epics, Tasks, Subtasks integrados ao Kanban
- Epic: container macro (nao vai ao board, apenas agrupa e mede progresso).
- Task/Story: item principal no board; sempre com prioridade e dono.
- Subtask: checklist dentro da Task (nao precisa virar card).
- Sprint: filtro/escopo do board + meta; backlog separado.
- Regra: so tasks Ready entram no sprint; carryover e explicitado.

## Modo orientado vs modo livre
- Orientado (opcional): politicas de WIP, Ready/Done, aging e bloqueios obrigatorios.
- Livre: Trello-like, sem gates, mas com alertas suaves.
- Transicao: botao Modo + pequena explicacao do impacto.

## Automatizacao de progresso sem Git
- Baseada em eventos internos: comentarios, mudancas de status, reatribuicao, prazos.
- Regras simples: sem atividade 3 dias → alerta; bloqueado 2 dias → escalar.
- Templates de tarefas para reduzir trabalho manual.
Status: parcial (stale/overdue via check-rules; sem regra de bloqueado 2 dias, sem templates).

## Melhorias de UX e prioridades
- Prioridade maxima: Kanban com regras de consequencia + overview diario.
- Segundo: tabela leve para triagem + filtros.
- Terceiro: sprint/schedule basico para previsibilidade.
