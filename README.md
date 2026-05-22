# Task Manager — BGS Automation

Painel de gestão de tarefas integrado ao ClickUp, com IA para importação em bloco.

---

## 🚀 Deploy em 5 passos

### Pré-requisitos
- Node.js 18+ instalado → https://nodejs.org
- Git instalado → https://git-scm.com
- Conta no GitHub → https://github.com
- Conta no Vercel → https://vercel.com (pode fazer login com o GitHub)
- Chave da API Anthropic → https://console.anthropic.com

---

### Passo 1 — Instalar dependências

Abra o terminal dentro da pasta do projeto e rode:

```bash
npm install
```

---

### Passo 2 — Configurar a chave da API

Abra o arquivo `.env.local` e substitua o valor:

```
ANTHROPIC_API_KEY=sk-ant-COLOQUE_SUA_CHAVE_AQUI
```

⚠️ NUNCA suba o `.env.local` para o GitHub. Ele já está no `.gitignore`.

---

### Passo 3 — Testar localmente

```bash
npm run dev
```

Acesse http://localhost:3000 e teste tudo antes de subir.

---

### Passo 4 — Subir para o GitHub

```bash
git init
git add .
git commit -m "feat: task manager bgs"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/task-manager-bgs.git
git push -u origin main
```

Substitua SEU_USUARIO pelo seu usuário do GitHub.
Crie o repositório em https://github.com/new antes de rodar o push.

---

### Passo 5 — Deploy no Vercel

1. Acesse https://vercel.com/new
2. Clique em "Import Git Repository" e selecione o repositório que você acabou de criar
3. Na tela de configuração, clique em "Environment Variables" e adicione:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** sua chave `sk-ant-...`
4. Clique em "Deploy"
5. Em ~2 minutos sua URL estará no ar: `https://task-manager-bgs.vercel.app`

---

## 🔄 Atualizar depois

Sempre que quiser atualizar o app, basta:

```bash
git add .
git commit -m "sua mensagem"
git push
```

O Vercel detecta automaticamente e faz o redeploy.

---

## 🔒 Segurança

- A chave da Anthropic fica APENAS no servidor (API Route `/api/claude`)
- O navegador nunca vê a chave
- O ClickUp é acessado via MCP server-side
- O `.env.local` está no `.gitignore` — nunca vai pro GitHub

---

## 📁 Estrutura do projeto

```
task-manager/
├── src/
│   ├── app/
│   │   ├── api/claude/route.js   ← API Route segura (chave fica aqui)
│   │   ├── layout.jsx
│   │   └── page.jsx              ← Página principal
│   ├── components/
│   │   ├── Avatar.jsx
│   │   ├── BulkImport.jsx
│   │   ├── CuBadge.jsx
│   │   ├── KanbanColumn.jsx
│   │   ├── ManualForm.jsx
│   │   └── TaskCard.jsx
│   └── lib/
│       ├── api.js                ← Funções de chamada à API
│       ├── clickup.js            ← Dados do workspace ClickUp
│       └── constants.js          ← Design tokens e helpers
├── .env.local                    ← Chave da API (não vai pro GitHub)
├── .gitignore
├── next.config.mjs
└── package.json
```
