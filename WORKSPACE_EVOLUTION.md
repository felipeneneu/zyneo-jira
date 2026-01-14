# 1. Problema do Modelo Atual
O workspace hoje e uma entidade fraca: funciona como um agrupador tecnico de projetos e tarefas, sem papel estrategico na experiencia do produto.
- Workspaces iguais geram a mesma UX, as mesmas permissoes e as mesmas regras, independentemente do tipo de equipe.
- A IA opera sem contexto estrutural e trata todos os casos como equivalentes.
- Nao existe mecanismo nativo para ativar/desativar capacidades por perfil, o que bloqueia diferenciacao e monetizacao.

Esse modelo impede escalar produto e IA porque o sistema nao sabe “quem” e o workspace, apenas “onde” os dados vivem.

# 2. Nova Visao: Workspace como Coracao do Sistema
O workspace passa a ser o tenant e o DNA do produto. Ele deixa de ser apenas um container e vira o centro de decisao que molda o comportamento do sistema. Em outras palavras, sai o workspace simples e entra o workspace “turbinado”, com poderes e responsabilidades.
- Fonte de verdade para UX, regras de negocio e permissoes.
- Gatilho para templates, automacoes e capacidades disponiveis.
- Base para a IA operar com contexto real (agent profile).

Essa visao e inspirada no modelo mental do ClickUp, onde o workspace define como o trabalho e organizado e apresentado, mas adaptada ao nosso produto e a nossa complexidade atual.

# 3. Enums Oficiais que Definem o DNA do Workspace
Os enums abaixo nao sao apenas dados. Eles sao chaves de comportamento que ativam regras, UX, templates e IA.
- purpose: work | personal | school
  - Define tom de linguagem, prioridades de onboarding e nivel de formalidade.
- workspaceType: software_dev | design | operations | sales_crm
  - Define o dominio principal do workspace e quais capacidades devem aparecer por padrao.
- teamSize
  - Indica o porte da equipe e influencia permissoes, padroes de colaboracao e complexidade de relatorios.
- workflowStyle
  - Determina o estilo de trabalho (ex: kanban, scrum, pipeline simples) e o conjunto de status sugeridos.
- roles
  - Define o conjunto de perfis disponiveis e o limite do que cada papel pode fazer.
- workspaceStatus
  - Controla o ciclo de vida (ex: draft, active, suspended, archived) e o acesso a features.

# 4. Novo Modelo de Dados do Workspace
O novo modelo separa atributos estruturais (identidade e governanca) de atributos configuracionais (comportamento e produto).

Campos estruturais:
- name, slug, ownerUserId, imageUrl, inviteCode
- status, createdAt, updatedAt

Campos configuracionais:
- purpose, workspaceType, teamSize, workflowStyle
- capabilities (lista de features e modulos habilitados)
- agentProfileId (perfil de IA associado ao workspace)
- settings e templates padronizados por dominio

Campos como workspaceType, capabilities e agentProfileId sao criticos porque determinam o que o produto oferece, o que e bloqueado e como a IA se comporta.

O slug deixa de ser apenas “bonito” e vira regra anti “test aa yyy”: ele e unico, derivado do nome real e validado, impedindo nomes genericos que degradam a experiencia e a qualidade do dado.

Comparacao direta:
| Aspecto | Legado | Novo |
| --- | --- | --- |
| Papel | Container de dados | Coracao do produto |
| Campos | name, userId, imageUrl, inviteCode | + slug, purpose, workspaceType, teamSize, workflowStyle, status, capabilities, agentProfileId |
| Comportamento | Igual para todos | Personalizado por DNA |

# 5. Impacto no Fluxo de Criacao de Workspace
O fluxo atual cria o workspace apenas com nome e acesso direto. No novo modelo, o onboarding passa a ser obrigatorio e multi-step, coletando sinais do usuario para definir o DNA.
- O workspace nasce em estado draft.
- Apos o onboarding completo, ele e promovido para active.
- Esse onboarding nao e burocracia: ele captura a intencao real do usuario, permitindo personalizacao imediata de UX, permissoes e IA.

# 6. Relacionamentos no Appwrite (Importante)
O Appwrite nao possui foreign keys visuais. Os relacionamentos sao definidos por IDs e indices, e a validacao ocorre no backend (Next.js/Hono).
O workspace passa a ser o pai logico de:
- members
- projects
- tasks
- reports
- agents

Cada collection precisa de indices por workspaceId para garantir performance e consistencia de acesso.

# 7. Workspace Members e Permissoes
O papel do membro evolui: ele nao e apenas um “usuario do workspace”, e sim parte de um modelo de governanca.
- Roles principais: owner, admin, manager, member.
- O workspace vira o boundary real de autorizacao: tudo e permitido ou negado a partir dele.
- Isso permite regras diferentes por tipo de workspace e por objetivo de negocio.

# 8. Papel dos Projects no Novo Modelo
Projetos continuam existindo porque ainda sao a unidade pratica de entrega. O que muda e o significado de projeto conforme o workspaceType.
- Em software_dev, projeto pode representar produto, sprint ou modulo.
- Em design, projeto pode ser campanha, cliente ou entrega criativa.
- Em sales_crm, projeto pode representar uma conta ou pipeline.

O workspace define os templates e regras de projeto. A inspiracao aqui e o modelo do ClickUp (Spaces/Folders/Lists) como conceito, nao como copia literal.

# 9. Workspace + IA (Agent Profiles)
A IA precisa do contexto do workspace para gerar respostas relevantes.
- Cada workspace possui um agentProfile associado no momento da criacao.
- Esse perfil define tom, foco, templates e limites de sugestao.
- Outputs esperados: onboarding assistido, relatorios inteligentes, sugestoes de melhorias e alertas de risco.

# 10. Consequencias Arquiteturais
- UX: experiencia personalizada, sem telas genericas para todos.
- IA: respostas mais precisas e com contexto real.
- Monetizacao: habilita planos e modulos por perfil de workspace.
- Evolucao do produto: novas features podem ser ativadas por DNA, reduzindo regressao e aumentando controle.