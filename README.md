# Jiu Platform

Plataforma completa de gestão para academias de Jiu-Jitsu, composta por uma API robusta e uma interface web moderna.

## 🏗 Estrutura do Projeto

O projeto funciona como um monorepo contendo:

- **`jiu-api/`**: Backend desenvolvido em Node.js com Express e PostgreSQL.
- **`jiu-app/`**: Frontend desenvolvido em React com Vite e TailwindCSS.

## 🚀 Tecnologias

### Backend (jiu-api)
- **Runtime**: Node.js
- **Framework**: Express
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: Zod

### Frontend (jiu-app)
- **Framework**: React
- **Build Tool**: Vite
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS
- **Gerenciamento de Estado**: Zustand
- **Formulários**: React Hook Form
- **Calendário**: React Big Calendar

## 📋 Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (v18 ou superior)
- [PostgreSQL](https://www.postgresql.org/)
- Gerenciador de pacotes (npm, yarn ou pnpm)

## 🛠 Instalação e Configuração

### 1. Backend (jiu-api)

Entre na pasta da API e instale as dependências:

```bash
cd jiu-api
npm install
```

Configure as variáveis de ambiente. Crie um arquivo `.env` na pasta `jiu-api` com base no exemplo (se houver) ou configure as credenciais do seu banco de dados PostgreSQL.

Para iniciar a API em modo de desenvolvimento:

```bash
npm run dev
```

### 2. Frontend (jiu-app)

Em um novo terminal, entre na pasta do aplicativo e instale as dependências:

```bash
cd jiu-app
npm install
```

Para iniciar o frontend em modo de desenvolvimento:

```bash
npm run dev
```

## 📜 Scripts Disponíveis

### jiu-api
- `npm run dev`: Inicia o servidor de desenvolvimento com hot-reload.
- `npm run build`: Compila o TypeScript para JavaScript (pasta `dist`).
- `npm run start`: Inicia a versão compilada em produção.
- `npm run typeorm`: Executa comandos do CLI do TypeORM.

### jiu-app
- `npm run dev`: Inicia o servidor de desenvolvimento Vite.
- `npm run build`: Compila o projeto para produção.
- `npm run lint`: Executa a verificação de código com ESLint.
- `npm run preview`: Visualiza o build de produção localmente.

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/MinhaFeature`)
3. Faça o Commit de suas mudanças (`git commit -m 'Adiciona funcionalidade X'`)
4. Faça o Push para a Branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request
