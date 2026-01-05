# Jiu-Jitsu Platform API

Backend da plataforma de gestão para academias de Jiu-Jitsu. Esta API RESTful gerencia usuários, turmas, aulas, presenças, conteúdo didático e dashboards.

## 🚀 Tecnologias

- **Node.js** (v18+) & **TypeScript**
- **Express.js** - Framework web
- **TypeORM** - ORM para interação com banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização
- **Docker** - Containerização

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) instalado
- [PostgreSQL](https://www.postgresql.org/) rodando localmente (ou via Docker)
- Gerenciador de pacotes `npm`

## 🛠️ Instalação e Configuração

1. **Clone o repositório** e entre na pasta `jiu-api`:
   ```bash
   cd jiu-api
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente**:
   O arquivo `.env` já deve existir na raiz. Caso não, crie um com o seguinte conteúdo e ajuste suas credenciais do banco:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres      # Seu usuário do Postgres
   DB_PASSWORD=sua_senha # Sua senha do Postgres
   DB_NAME=jiujitsu
   JWT_SECRET=supersecretkey
   ```

4. **Banco de Dados**:
   A aplicação possui um script automático (`ensure-db.ts`) que verificará se o banco de dados `jiujitsu` existe e tentará criá-lo ao iniciar o servidor. O TypeORM sincronizará as tabelas automaticamente (`synchronize: true`).

## ▶️ Executando a Aplicação

### Modo de Desenvolvimento
Roda com `nodemon`, reiniciando automaticamente a cada alteração.
```bash
npm run dev
```
O servidor iniciará em `http://localhost:3000`.

### Modo de Produção
Builda o TypeScript para JavaScript e roda a versão compilada.
```bash
npm run build
npm start
```

### Via Docker 🐳
Para rodar a aplicação em um container:

1. **Build da imagem**:
   ```bash
   docker build -t jiu-api .
   ```

2. **Rodar o container**:
   ```bash
   docker run -p 3000:3000 --env-file .env jiu-api
   ```
   *Nota: Se o banco estiver no host (fora do docker), ajuste o `DB_HOST` no .env para `host.docker.internal` (Windows/Mac) ou use `--network host` (Linux).*

## 📚 Documentação da API

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário (Aluno/Professor)
- `POST /api/auth/login` - Login (Retorna Access Token e Refresh Token)
- `POST /api/auth/refresh` - Renovar token de acesso

### Usuários
- `GET /api/users/me` - Perfil do usuário logado
- `PUT /api/users/me` - Atualizar perfil
- `GET /api/users` - Listar usuários (Admin/Professor)

### Turmas (Classes)
- `GET /api/classes` - Listar turmas
- `POST /api/classes` - Criar turma (Admin/Professor)
- `POST /api/classes/:id/enroll` - Matricular aluno

### Aulas (Lessons)
- `GET /api/lessons` - Listar aulas agendadas
- `POST /api/lessons` - Agendar aula
- `GET /api/lessons/upcoming` - Próximas aulas

### Presenças (Attendance)
- `POST /api/attendance/:id` - Registrar presença (Batch/Individual via lógica do controller)
- `GET /api/attendance/stats/:userId` - Estatísticas de presença do aluno

### Conteúdo (Content)
- `GET /api/content/library` - Biblioteca de conteúdo
- `POST /api/content/upload/:lessonId` - Upload de conteúdo para aula

### Dashboard
- `GET /api/dashboard` - Dados resumidos específicos para o perfil do usuário (Aluno/Professor/Admin)

## 🗂️ Estrutura do Projeto

```
src/
├── config/         # Configurações gerais
├── controllers/    # Lógica de controle das rotas
├── entities/       # Modelos do Banco de Dados (TypeORM)
├── middlewares/    # Middlewares (Auth, Validação)
├── routes/         # Definição das rotas da API
├── services/       # Regras de Negócio
├── utils/          # Utilitários (ex: DB check)
├── app.ts          # Configuração do Express
├── data-source.ts  # Configuração do TypeORM
└── server.ts       # Entry point
```

## 🔒 Segurança

- Senhas criptografadas com `bcrypt`.
- Autenticação via `JWT`.
- Proteção de rotas via Middleware (`auth.middleware.ts`) e Role-based Access Control (`checkRole`).
- Headers de segurança com `helmet`.
