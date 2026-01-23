# Auditoria de features e fluxo (MVP)

## Escopo da auditoria
Foco: execucao diaria (prioridade principal), com suporte a visibilidade gerencial, previsibilidade e colaboracao.
MVP com modo orientado opcional e prazo de 4 semanas.

## Auditoria de features (valor vs superficial)
- Kanban: manter; nucleo de execucao diaria e foco.
- Tabela/Lista: simplificar; util para triagem e filtros, sem duplicar logica do Kanban.
- Chat interno: cortar no MVP; alto ruido e baixo impacto direto na execucao.
- Diagramas: cortar no MVP; utilidade baixa para entrega diaria.
- Notificacoes: manter, porem consequence-driven (apenas eventos relevantes, sem spam).

## Manter / Cortar / Simplificar (MVP)
- Manter: Kanban, IA (overview), comentarios, notificacoes minimas.
- Simplificar: Tabela (somente filtro/triagem), comentarios sem anexos avancados, IA com prompts curtos e objetivos.
- Cortar: Chat interno, diagramas, automacoes complexas, integracoes externas pesadas.

## Regras automaticas de consequencia (essenciais)
- WIP: limite por coluna; exceder exige justificar ou mover tarefa para Pause/Backlog.
- Aging/SLA: tarefas antigas sobem de prioridade ou disparam alerta diario.
- Blocked: ao marcar, exige motivo + owner do bloqueio; aparece no topo do overview.
- In Review: so entra com checklist basico (criterio de aceite + responsavel).
- Done: exige validacao simples (checkbox de aceite).
- Alertas: 1 por dia por tarefa (evita spam); foco em aging, bloqueios, prazo.
- Relatorio mensal: throughput, carryover, blockers recorrentes, top causas de atraso.

## IA – overview diario util (formato recomendado)
- Resumo executivo (1 paragrafo): status do sprint, risco principal, foco do dia.
- Riscos: tarefas com aging critico, bloqueios ativos, WIP estourado.
- Foco: 3 tarefas com maior impacto ou urgencia.
- Pendencias: tarefas sem dono, sem prazo, sem proximo passo.
- Tendencia: throughput 7 dias, carryover da sprint, previsibilidade.

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

## Melhorias de UX e prioridades
- Prioridade maxima: Kanban com regras de consequencia + overview diario.
- Segundo: tabela leve para triagem + filtros.
- Terceiro: sprint/schedule basico para previsibilidade.
