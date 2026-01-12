# Gemini e n8n

Este documento descreve o que ja esta configurado com Gemini e o que e possivel fazer com integracao via n8n.

## Gemini (ja configurado)
- Endpoint: POST /api/tasks/:taskId/ai-description
- Provider: Gemini via @google/generative-ai
- Modelo atual: gemini-2.5-flash
- Retorno: Markdown com contexto, objetivo, checklist, criterios de aceite e riscos
- Variavel obrigatoria: GEMINI_API_KEY

### Como usar (API)
Requisicao:
```
POST /api/tasks/:taskId/ai-description
Cookie: jira-clone-session=<sessao>
```
Resposta (exemplo):
```
{
  "data": {
    "text": "...markdown gerado..."
  }
}
```

### Onde aparece na UI
- Botao de geracao na descricao da tarefa (Task Description).
- O texto gerado pode ser editado e salvo manualmente.

### Boas praticas
- Defina um template de prompt por projeto se quiser padronizar.
- Armazene somente o markdown final no campo description da tarefa.
- Considere adicionar limites de uso por usuario para controlar custo.

## O que da para fazer com Gemini
- Gerar descricao detalhada de tarefas existentes.
- Padronizar criterios de aceite e checklists.
- Sugestao de riscos/observacoes com base no status e prazo.
- Variantes por tipo de tarefa (feature, bug, melhoria).

## n8n (integracao recomendada)
Nao existe integracao direta pronta, mas ha dois caminhos:
1) Usar a API do Appwrite com chave de servidor.
2) Usar a API do app (Hono) criando um token de servico.

### Pontos de integracao (Appwrite)
- Colecoes: workspaces, members, projects, tasks
- Eventos: create/update/delete via Webhooks (se configurados)
- Autenticacao: API key do Appwrite

### Fluxos sugeridos no n8n
- Criar tarefa a partir de formulario (Typeform/Google Forms) -> Appwrite.
- Enviar notificacao no Slack/Discord quando uma tarefa muda de status.
- Resumo diario/semana de tarefas por workspace (cron -> list tasks -> email).
- Importar backlog de CSV para tasks.
- Atualizar descricao da tarefa via Gemini e salvar no Appwrite.
- Transcrever audio (Whisper) -> criar/atualizar tarefa.

### Exemplo de payload (criacao de tarefa)
```
{
  "name": "Implementar login social",
  "status": "TODO",
  "workspaceId": "...",
  "projectId": "...",
  "assigneeId": "...",
  "dueDate": "2026-01-30T00:00:00.000Z"
}
```

### Observacoes de seguranca
- Evite expor a API do app sem autenticacao.
- Para n8n, prefira Appwrite API com chave de servidor.
- Se precisar usar Hono, crie um middleware de token para automacoes.
