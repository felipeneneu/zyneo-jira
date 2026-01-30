# Extensões da Tabela de Tarefas

Este documento descreve as funcionalidades adicionadas na aba **Tabelas** do módulo de tarefas, cobrindo importação via CSV e geração de relatório PDF.

## Escopo

- **Importação via CSV** para criação em massa de tarefas.
- **Relatório PDF profissional** com cabeçalho, tabela e rodapé.
- Integração com o estado atual da tabela (filtros e paginação via backend).

## Dependências

Instalar no projeto:

```bash
npm install papaparse jspdf jspdf-autotable
```

## Importação via CSV

### Arquivo esperado

Cabeçalhos obrigatórios (exatamente):

- `Título`
- `Descrição`
- `Prazo`
- `Prioridade`
- `Responsável`

### Mapeamento

| CSV             | Campo interno |
|-----------------|---------------|
| Título          | name          |
| Descrição       | description   |
| Prazo           | dueDate       |
| Prioridade      | priority      |
| Responsável     | assigneeId    |

### Regras atuais

- `Prioridade`: aceita `P1`, `P2`, `P3`, ou texto `Alta`, `Média`, `Media`, `Baixa`.
- `Prazo`: se inválido ou ausente, a data atual é usada.
- `Responsável`: tenta casar por **nome** ou **email** do membro no workspace. Se não encontrar, o `assigneeId` é omitido.
- O projeto é obrigatório; se não houver projeto selecionado e existir apenas um projeto, ele é usado automaticamente.

### UX

O botão **Importar CSV** aparece na aba **Tabelas** e usa o Design System (Shadcn UI).

## Relatório PDF Profissional

### Comportamento

- O botão **Gerar Relatório** fica ao lado do **TabsTrigger** “Tabelas”.
- O relatório agora inclui um **Overview de desempenho** gerado por IA (Gemini).
- **Disponível apenas às sextas-feiras** (UI e API validam).
- **Em ambiente de desenvolvimento**, o botão fica liberado.
- O relatório considera **as tarefas visíveis na tabela atual** (filtros aplicados no backend).
- O PDF inclui:
  - Logo do sistema no topo (carregada de `/public/logo.svg`)
  - Título e resumo executivo (contagem total, em andamento, concluídas, atrasadas)
  - Overview de desempenho (IA): forças, pontos de melhoria, atenção e ações recomendadas
  - Gráficos estilo PowerBI (distribuição por status e saúde de prazos)
  - Tabela com: `Título`, `Status`, `Prazo`, `Conclusão`
  - Rodapé com data de geração e número de página

### Estilos

As cores são derivadas de variáveis CSS do Design System (`--primary`, `--muted-foreground`, `--border`) e convertidas para RGB.

### Performance

O PDF é gerado de forma assíncrona para evitar travamento da UI em tabelas grandes.

## Arquivos principais

- `src/features/tasks/components/task-view-switcher.tsx`
  - Botões de importação e relatório na aba **Tabelas**
- `src/features/tasks/components/csv-importer.tsx`
  - Componente de importação com PapaParse
- `src/features/tasks/utils/generate-tasks-report.ts`
  - Função utilitária de geração de PDF com jsPDF + AutoTable

## Próximos passos (opcionais)

- Suportar mapeamento flexível de colunas (ex: "Data de Entrega" → `dueDate`).
- Melhorar resolução do logo com fallback Base64.
- Adicionar seção com gráficos no PDF (ex: barras por status).
- Mapear responsável por ID direto (quando CSV fornecer ID interno).
