# Guia de Deploy (Vercel + Neon)

Este guia descreve como realizar o deploy da plataforma Jiu-Jitsu (API e App) na Vercel, utilizando um banco de dados PostgreSQL no Neon.

## Pré-requisitos

1.  Conta no [GitHub](https://github.com/).
2.  Conta na [Vercel](https://vercel.com/).
3.  Conta na [Neon](https://neon.tech/) (para o banco de dados).
4.  Repositório do projeto enviado para o GitHub.

## Estrutura de Deploy

Recomendamos configurar **dois projetos separados na Vercel**, ambos conectados ao mesmo repositório GitHub, mas apontando para pastas diferentes (`jiu-api` e `jiu-app`).

---

## 1. Banco de Dados (Neon)

1.  Crie um novo projeto no Neon.
2.  Copie a **Connection String** (Postgres URL). Ela será necessária para as variáveis de ambiente da API.
    *   Formato: `postgres://user:password@host:port/database?sslmode=require`

---

## 2. Backend (jiu-api)

### Configuração na Vercel

1.  No painel da Vercel, clique em **"Add New..."** -> **"Project"**.
2.  Importe o repositório `jiu-platform`.
3.  Configure o projeto:
    *   **Framework Preset**: Selecione **Other** (ou deixe que a Vercel detecte, mas garantiremos via `vercel.json`).
    *   **Root Directory**: Clique em "Edit" e selecione a pasta **`jiu-api`**.
    *   **Build Command**: `npm run build` (ou deixe o padrão se for detectado).
    *   **Output Directory**: `dist` (ou deixe o padrão).
    *   **Install Command**: `npm install`.

4.  **Environment Variables** (Variáveis de Ambiente):
    Adicione as seguintes variáveis:
    *   `DATABASE_URL`: A string de conexão do Neon copiada anteriormente.
    *   `JWT_SECRET`: Uma string secreta e segura para assinar os tokens.
    *   `NODE_ENV`: `production`
    *   `PORT`: `3000` (Embora a Vercel gerencie portas, é bom manter para consistência).
    *   Outras variáveis que seu `.env` local possua (ex: configurações de e-mail, etc).

5.  Clique em **Deploy**.

> **Nota:** O arquivo `vercel.json` na pasta `jiu-api` já configura o redirecionamento de rotas para o arquivo `api/index.ts`, que atua como uma Serverless Function.

---

## 3. Frontend (jiu-app)

### Configuração na Vercel

1.  No painel da Vercel, clique em **"Add New..."** -> **"Project"**.
2.  Importe o **mesmo** repositório `jiu-platform`.
3.  Configure o projeto:
    *   **Framework Preset**: Selecione **Vite**.
    *   **Root Directory**: Clique em "Edit" e selecione a pasta **`jiu-app`**.
    *   **Build Command**: `npm run build`.
    *   **Output Directory**: `dist`.
    *   **Install Command**: `npm install`.

4.  **Environment Variables**:
    Adicione a URL da sua API (o projeto que você acabou de criar no passo anterior):
    *   `VITE_API_URL`: A URL do seu backend (ex: `https://jiu-api-seu-projeto.vercel.app`).
    > **Importante:** Não esqueça de adicionar `/api` no final se suas chamadas no frontend não o fizerem automaticamente, mas geralmente a URL base é suficiente se o axios estiver configurado corretamente. Verifique sua configuração do Axios.

5.  Clique em **Deploy**.

> **Nota:** O arquivo `vercel.json` na pasta `jiu-app` configura o rewrite para SPA, garantindo que rotas como `/login` ou `/aluno` funcionem corretamente ao recarregar a página.

---

## Verificação

1.  Acesse a URL do Frontend.
2.  Tente fazer login.
3.  Se houver erros, verifique os **Logs** no painel da Vercel (tanto do Backend quanto do Frontend).
