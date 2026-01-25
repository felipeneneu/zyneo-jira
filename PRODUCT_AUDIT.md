# Auditoria de Produto (PT-BR)

Branch criada: `feature/workspace-dev-finalize`.

## Section 1 – Feature Inventory Audit
- Feature Name: Autenticação (email + OAuth)
- Current Purpose: permitir acesso e sessão
- Consequence if User Never Uses It: produto inutilizável
- Classification (CORE / SUPPORT / OPTIONAL / DEAD WEIGHT): CORE
- Recommendation (Keep / Simplify / Automate / Remove): Keep

- Feature Name: Workspace (criação/seleção)
- Current Purpose: separar contextos de trabalho
- Consequence if User Never Uses It: sem organização/escopo
- Classification: CORE
- Recommendation: Simplify

- Feature Name: Tarefas (CRUD + status + assignee + prazo)
- Current Purpose: executar o trabalho
- Consequence if User Never Uses It: sem valor principal
- Classification: CORE
- Recommendation: Keep

- Feature Name: Projetos (agrupamento de tarefas)
- Current Purpose: organização por projeto
- Consequence if User Never Uses It: perda de organização, mas o core funciona
- Classification: SUPPORT
- Recommendation: Simplify

- Feature Name: Membros/convites/roles
- Current Purpose: colaboração
- Consequence if User Never Uses It: ok para uso solo
- Classification: SUPPORT
- Recommendation: Simplify

- Feature Name: Comentários em tarefas
- Current Purpose: contexto assíncrono
- Consequence if User Never Uses It: perde histórico de decisão
- Classification: SUPPORT
- Recommendation: Keep

- Feature Name: Notificações (mentions/overdue/stale)
- Current Purpose: alertas e risco
- Consequence if User Never Uses It: menos visibilidade
- Classification: SUPPORT
- Recommendation: Simplify

- Feature Name: Analytics (contagem/deltas)
- Current Purpose: visão rápida de progresso
- Consequence if User Never Uses It: pouco impacto
- Classification: SUPPORT
- Recommendation: Simplify

- Feature Name: Onboarding wizard multi-step
- Current Purpose: coletar contexto do workspace
- Consequence if User Never Uses It: menor personalização
- Classification: OPTIONAL
- Recommendation: Remove

- Feature Name: Kanban/Calendário/Backlog
- Current Purpose: múltiplas visões
- Consequence if User Never Uses It: zero impacto no core
- Classification: OPTIONAL
- Recommendation: Simplify

- Feature Name: Chat interno
- Current Purpose: conversa rápida
- Consequence if User Never Uses It: nenhum impacto no core
- Classification: OPTIONAL
- Recommendation: Remove

- Feature Name: IA descrição de tarefa
- Current Purpose: ajuda a escrever descrição
- Consequence if User Never Uses It: nenhum impacto no core
- Classification: OPTIONAL
- Recommendation: Postpone

- Feature Name: IA overview diário (daily focus)
- Current Purpose: resumo inteligente
- Consequence if User Never Uses It: nenhum impacto no core
- Classification: OPTIONAL
- Recommendation: Postpone

- Feature Name: Dev Hub (tabs docs/sprints/reports/exports)
- Current Purpose: vitrine
- Consequence if User Never Uses It: nenhum
- Classification: DEAD WEIGHT
- Recommendation: Remove

- Feature Name: Diagrams board
- Current Purpose: diagramas (mock)
- Consequence if User Never Uses It: nenhum
- Classification: DEAD WEIGHT
- Recommendation: Remove

- Feature Name: Audit log (mock)
- Current Purpose: compliance/trace
- Consequence if User Never Uses It: nenhum
- Classification: DEAD WEIGHT
- Recommendation: Remove

- Feature Name: Rotas/testes (test-wizard, /next)
- Current Purpose: placeholder
- Consequence if User Never Uses It: nenhum
- Classification: DEAD WEIGHT
- Recommendation: Remove

- Feature Name: Sidebars duplicadas
- Current Purpose: variações visuais
- Consequence if User Never Uses It: nenhum
- Classification: DEAD WEIGHT
- Recommendation: Remove

## Section 2 – Flow Analysis
- Flow name: Onboarding wizard
- Steps involved: multi-step (tipo, identidade, etc.)
- Real outcome for the user: contexto inicial “bonito”, mas não entrega valor direto
- Is this flow mandatory for MVP? (Yes/No + justification): No — atrasa o time-to-value
- Simplification ideas: 1 passo só (nome do workspace) ou pular com defaults

- Flow name: Criação de workspace
- Steps involved: abrir modal → nome → salvar
- Real outcome for the user: ambiente de trabalho
- Is this flow mandatory for MVP?: Yes — define escopo
- Simplification ideas: auto-criar no primeiro login

- Flow name: Criação de projeto
- Steps involved: criar projeto → associar tarefas
- Real outcome for the user: organização por projeto
- Is this flow mandatory for MVP?: No — tarefas podem existir sem projeto
- Simplification ideas: projeto padrão automático

- Flow name: Ciclo de vida de tarefas
- Steps involved: criar → editar → mover status → concluir
- Real outcome for the user: controle do trabalho
- Is this flow mandatory for MVP?: Yes — é o core
- Simplification ideas: manter só visão tabela; reduzir campos obrigatórios

- Flow name: Notificações
- Steps involved: gerar eventos → listar → marcar como lido
- Real outcome for the user: alertas
- Is this flow mandatory for MVP?: No — útil, não essencial
- Simplification ideas: reduzir para 2 tipos (overdue + mention)

- Flow name: Analytics
- Steps involved: calcular → exibir cards
- Real outcome for the user: visão rápida
- Is this flow mandatory for MVP?: No — baixa consequência
- Simplification ideas: esconder em “Insights”

- Flow name: IA (descrição + overview diário)
- Steps involved: chamar Gemini → gerar → exibir
- Real outcome for the user: texto mais rápido
- Is this flow mandatory for MVP?: No — nice-to-have
- Simplification ideas: esconder atrás de “Beta”

## Section 3 – Automation Opportunities
- Automation idea: Auto-criar workspace + projeto padrão
- What manual step it replaces: wizard + criação manual
- Trigger condition: primeiro login
- Expected benefit: reduz fricção e acelera o valor

- Automation idea: Auto-atribuir criador da tarefa
- What manual step it replaces: seleção de assignee
- Trigger condition: criação de tarefa
- Expected benefit: menos cliques, menos tarefas órfãs

- Automation idea: Auto-marcar notificação como lida
- What manual step it replaces: botão “marcar como lido”
- Trigger condition: abrir notificação
- Expected benefit: reduz ruído

- Automation idea: Auto-status Done por comportamento
- What manual step it replaces: mover manualmente
- Trigger condition: checklist 100% ou tarefa fechada
- Expected benefit: menos esforço operacional

- Automation idea: Sugestão automática de prazo
- What manual step it replaces: preencher prazo
- Trigger condition: criação com prioridade/esforço
- Expected benefit: consistência e previsibilidade

## Section 4 – Final Recommendations
- Top 5 features to remove or postpone: Dev Hub completo; Diagrams board; Audit log mock; Chat interno; IA overview diário
- Top 5 features to automate next: workspace + projeto padrão; auto-assign creator; auto-mark read; auto-status Done; sugestão de prazo
- Top 5 simplifications with highest ROI: visão única de tarefas (tabela); remover wizard multi-step; unificar `features/notification` e `features/notifications`; remover sidebars duplicadas; esconder analytics/IA em “Insights/Beta”
