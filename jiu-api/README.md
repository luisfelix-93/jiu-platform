# Jiu-Jitsu Platform API

Backend da plataforma de gestão para academias de Jiu-Jitsu. Esta API RESTful gerencia usuários, turmas, aulas, presenças, conteúdo didático e dashboards.

## 🚀 Tecnologias

- **Node.js** (v18+) & **TypeScript**
- **Express.js** - Framework web
- **TypeORM** - ORM para interação com banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização (via Cookies HttpOnly)
- **Docker** - Containerização
- **Segurança**: Express Rate Limit, Helmet, Cookie Parser

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
   O arquivo `.env` já deve existir na raiz. Caso não, crie um com o seguinte conteúdo e ajuste suas credenciais:
   ```env
   PORT=3000
   NODE_ENV=development  # ou production
   FRONTEND_URL=http://localhost:5173,https://meu-app.vercel.app # URL(s) do Frontend (separadas por vírgula)
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=sua_senha
   DB_NAME=jiujitsu
   
   JWT_SECRET=supersecretkey # OBRIGATÓRIO: Chave forte para assinar tokens
   JWT_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=7d
   
   # Configurações de Email
   MAIL_HOST=smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USER=seu_usuario
   MAIL_PASS=sua_senha
   MAIL_FROM=nao-responda@jiujitsu.com

   # Storage (Cloudflare R2 / AWS S3) - Para upload de vídeos
   R2_ACCOUNT_ID=seu_account_id
   R2_ACCESS_KEY_ID=sua_access_key
   R2_SECRET_ACCESS_KEY=sua_secret_key
   R2_BUCKET_NAME=jiujitsu-videos
   R2_PUBLIC_URL=https://pub-xxxx.r2.dev # Opcional
   ```

4. **Banco de Dados e Migrações**:
   O projeto utiliza TypeORM Migrations para gerenciar o schema.
   
   - **Gerar Migração**: Quando fizer alterações nas entidades, rode `npm run migration:generate --name=NomeDaMudanca`.
   - **Rodar Migrações**: `npm run migration:run`.
   - **Reverter Migração**: `npm run migration:revert`.

   *Nota: Em desenvolvimento, se `synchronize` estiver true no DataSource, as tabelas podem ser criadas automaticamente, mas o uso de migrations é recomendado.*

## ▶️ Executando a Aplicação

### Modo de Desenvolvimento
Roda com `nodemon`, reiniciando automaticamente a cada alteração.
```bash
npm run dev
```
O servidor iniciará em `http://localhost:3000`.

### Modo de Produção
Builda o TypeScript, roda as migrações e inicia a versão compilada.
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

## 📚 Documentação da API

### Autenticação (Cookies)
A autenticação agora utiliza **HttpOnly Cookies**. Os tokens **NÃO** são retornados no corpo da resposta (exceto User object).

- `POST /api/auth/register` - Cria usuário e define cookies (`accessToken`, `refreshToken`).
- `POST /api/auth/login` - Login e define cookies.
- `POST /api/auth/refresh` - Usa o cookie `refreshToken` para renovar o `accessToken`.

### Rate Limiting
Para proteção contra abuso:
- **Login**: Limite de **5 tentativas a cada 15 minutos** por IP.
- **Registro**: Limite de **10 contas a cada hora** por IP.
- **Global**: Limite de **100 requisições a cada 15 minutos** por IP.

### Demais Rotas Principais
(Acesso requer cookie `accessToken` válido)

- `GET /api/users/me` - Perfil do usuário logado
- `GET /api/classes` - Listar turmas
- `GET /api/lessons` - Listar aulas
- `POST /api/attendance/:id` - Registrar presença
- `GET /api/dashboard` - Dados resumidos

### Notificações
O sistema envia notificações por email automaticamente em eventos importantes:
- **Confirmação de Presença**: Enviado ao aluno quando sua presença é confirmada em uma aula.

## 🔒 Segurança

- **HttpOnly Cookies**: Mitigação de XSS (tokens não acessíveis via JS).
- **CSRF**: Proteção via SameSite=Strict cookies.
- **Rate Limiting**: Proteção contra Brute-Force e DDoS no nível da aplicação.
- **Helmet**: Headers de segurança HTTP.
- **Validação**: Zod para validação rigorosa de inputs.

