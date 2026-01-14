# Checklist de Build/Deploy (gestaozyneo)

Documento tecnico para preparar o build e o deploy do app (Next.js 16 + Hono + Appwrite).

## 1) Pre-requisitos
- Node.js e npm instalados.
- Appwrite Cloud configurado com Database/Collections e Storage.
- Variaveis de ambiente completas (ver secao 2).

## 2) Variaveis de ambiente (obrigatorias)
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_APPWRITE_ENDPOINT
- NEXT_PUBLIC_APPWRITE_PROJECT
- NEXT_PUBLIC_APPWRITE_DATABASE_ID
- NEXT_PUBLIC_APPWRITE_WORKSPACES_ID
- NEXT_PUBLIC_APPWRITE_MEMBERS_ID
- NEXT_PUBLIC_APPWRITE_PROJECTS_ID
- NEXT_PUBLIC_APPWRITE_TASKS_ID
- NEXT_PUBLIC_APPWRITE_CHAT_MESSAGES_ID
- NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID
- NEXT_PUBLIC_APPWRITE_AGENT_PROFILES_ID (quando collection existir)
- NEXT_PUBLIC_APPWRITE_WORKSPACE_REPORT_RUNS_ID (quando collection existir)
- NEXT_APPWRITE_KEY
- GEMINI_API_KEY

## 3) Appwrite (schema minimo atualizado)
Workspaces (collection em NEXT_PUBLIC_APPWRITE_WORKSPACES_ID):
- purpose (enum: work | personal | school)
- workspaceType (enum: software_dev | design | operations | sales_crm)
- teamSize (enum: solo | small | medium | large | enterprise)
- workflowStyle (enum: kanban | simple | scrum | custom)
- mainGoal (enum: organize | deliver | sell | standardize)
- tools (string array)
- workspaceStatus (enum: draft | active | suspended | archived) - opcional

Chat (collection em NEXT_PUBLIC_APPWRITE_CHAT_MESSAGES_ID):
- workspaceId (string, required)
- projectId (string, opcional)
- userId (string, required)
- body (string, required)
- bodyLexical (string, opcional)
- senderName (string, required)
- senderAvatarUrl (string, opcional)

Indices recomendados (chat):
- workspaceId
- projectId
- workspaceId + $createdAt

Storage:
- bucket de imagens existente (NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID) precisa permitir PDFs se for salvar relatorios.

## 4) Build local (antes do deploy)
- npm install
- npm run build
- npm run start (opcional, validacao local)

## 5) Observacoes de runtime
- Mensagens de "Invalid source map" no dev costumam ser ruido do Next/Appwrite.
- Se ocorrer erro de "Unknown attribute", o schema do Appwrite nao esta alinhado.
- O chat usa Lexical rich text; verifique que as deps estao instaladas.

## 6) Validacao pos-deploy (smoke test)
- Login (email e OAuth).
- Criar workspace com onboarding completo.
- Criar projeto e task.
- Abrir chat, enviar mensagem e confirmar que o input limpa.

