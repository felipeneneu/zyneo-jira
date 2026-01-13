# Sprint Viavel Hoje (Correcoes Rapidas)

Objetivo: limpar textos quebrados e padronizar mensagens de erro antes da proxima entrega.

Escopo
- Ajustar textos corrompidos no chat e no calendario.
- Corrigir typo de mensagem de erro de sessao.

Tarefas
- (TECH) Corrigir strings com encoding quebrado (chat/calendario)
  - Objetivo: remover caracteres corrompidos na UI.
  - Aceite: textos do chat e calendario exibem frases legiveis sem caracteres estranhos.
  - Fora de escopo: revisao de copywriting completo.
  - Dependencias: nenhuma.

- (TECH) Corrigir typo "Unatorized"
  - Objetivo: padronizar mensagem de erro.
  - Aceite: erro em `createSessionClient` usa "Unauthorized".
  - Fora de escopo: handler global de erros.
  - Dependencias: nenhuma.
