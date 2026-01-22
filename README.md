# Jiu Platform

Plataforma completa de gestão para academias de Jiu-Jitsu, composta por uma API robusta e uma interface web moderna.

## 🏗 Estrutura do Projeto

O projeto funciona como um monorepo contendo:

- **`jiu-api/`**: Backend desenvolvido em Node.js com Express e PostgreSQL.
- **`jiu-app/`**: Frontend desenvolvido em React com Vite e TailwindCSS.

## ✨ Funcionalidades

### 🎯 Gestão de Alunos e Professores
- Cadastro e autenticação de usuários (alunos, professores, administradores)
- Perfis personalizados com informações detalhadas
- Controle de acesso baseado em roles

### 📅 Agendamento e Aulas
- Sistema de agendamento de aulas por turmas
- Calendário interativo para visualização de aulas
- Controle de presença e frequência

### 🥋 Sistema de Graduação
- Registro e acompanhamento de faixas (branco a preto)
- Cálculo automático de progressão baseado em frequência
- Metas customizáveis de tempo e aulas necessárias
- Interface para professores promoverem alunos
- Dashboard de progresso para alunos

### 📊 Relatórios e Analytics
- Relatórios de frequência e participação
- Análises de progresso dos alunos
- Estatísticas de turmas e professores

### 🔒 Segurança e Conformidade
- Autenticação JWT com cookies HttpOnly
- Controle de rate limiting
- Validação rigorosa de dados
- Conformidade com especificações de segurança

## 🚀 Tecnologias

### Backend (jiu-api)
- **Runtime**: Node.js
- **Framework**: Express
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM
- **Autenticação**: JWT (via HttpOnly Cookies)
- **Segurança**: Express Rate Limit, Helmet, Zod

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

Configure as variáveis de ambiente. Crie um arquivo `.env` na pasta `jiu-api` com base no exemplo e certifique-se de definir `JWT_SECRET` e `FRONTEND_URL`.

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
- `npm run start`: Inicia a versão compilada em produção (roda migrações antes).
- `npm run typeorm`: Executa comandos do CLI do TypeORM.
- `npm run migration:generate`: Gera uma nova migração com base nas alterações das entidades.
- `npm run migration:run`: Executa as migrações pendentes.
- `npm run migration:revert`: Reverte a última migração executada.

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
