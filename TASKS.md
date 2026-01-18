## Correcoes - Upload de imagem no projeto

Objetivo:
- Corrigir o upload de imagem na criacao/edicao de projetos (Appwrite Storage) para aceitar File vindo do form.

Aceite:
- Criar projeto com imagem gera arquivo no bucket e salva `imageUrl` com fileId.
- Atualizar projeto com nova imagem substitui `imageUrl`.
- Criar projeto sem imagem continua funcionando.

Fora de escopo:
- Alterar upload de imagem em workspaces ou tarefas.
- Validacao de tamanho/tipo de arquivo.
- Ajustes de UI.

Dependencias:
- `node-appwrite` com suporte a `InputFile.fromBuffer`.
