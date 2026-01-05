# Plataforma de Jiu-Jitsu - Especificação do Backend

## 1. Visão Geral
### 1.1 Objetivo
 - Desenvolver uma API RESTful segura e escalável para suportar as funcionalidades da plataforma de Jiu-Jitsu, com foco em gestão de usuários, aulas, presenças e conteúdo didático.
### 1.2 Arquitetura
```
API RESTful
Banco de Dados: PostgreSQL (relacional para MVP)
Autenticação: JWT + Refresh Tokens
Armazenamento: Local (MVP) → Cloud (S3/Azure) na fase 2
```
## 2. Tecnologias Utilizadas
### 2.1 API
```yaml
Runtime: Node.js 18+
Framework: Express.js ou NestJS
ORM: TypeORM
Validação: Zod ou Joi
Testes: Jest + Supertest
Documentação: Swagger/OpenAPI
```
### 2.2 Infrastrutura
```yaml
Database: PostgreSQL 15+ (Railway/Neon/Vercel Postgres)
Cache: Redis 
Fila: Bull (Node) 
Container: Docker
Deploy: Vercel ou Railway
```
## 3. Modelagem de Dados 
### 3.1 Diagrama Entidade-Relacionamento
```sql
-- Tabela base de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('aluno', 'professor', 'admin')),
    belt_color VARCHAR(30) DEFAULT 'white',
    stripe_count INTEGER DEFAULT 0,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de perfis (detalhes específicos)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE,
    phone VARCHAR(20),
    emergency_contact VARCHAR(100),
    medical_notes TEXT,
    start_date DATE DEFAULT CURRENT_DATE,
    graduation_date DATE
);

-- Tabela de academias/turmas
CREATE TABLE academies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de turmas/grupos
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID REFERENCES academies(id),
    name VARCHAR(100) NOT NULL, -- "Infantil Iniciante", "Adulto Avançado"
    description TEXT,
    schedule JSONB NOT NULL, -- [{day: "mon", time: "18:00", duration: 60}]
    max_students INTEGER DEFAULT 20,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relação muitos-para-muitos: alunos em turmas
CREATE TABLE class_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
    UNIQUE(class_id, user_id)
);

-- Tabela de aulas agendadas
CREATE TABLE scheduled_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    professor_id UUID REFERENCES users(id),
    topic VARCHAR(200),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, date, start_time)
);

-- Tabela de presenças
CREATE TABLE attendances (
    id UUID PRIMARY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES scheduled_lessons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    check_in_time TIMESTAMP,
    checked_by UUID REFERENCES users(id), -- professor que registrou
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lesson_id, user_id)
);

-- Tabela de conteúdo das aulas
CREATE TABLE lesson_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES scheduled_lessons(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) CHECK (content_type IN ('video', 'pdf', 'image', 'note')),
    file_url TEXT, -- URL para S3 ou storage local
    file_name TEXT,
    file_size INTEGER,
    duration INTEGER, -- em segundos, para vídeos
    positions TEXT[], -- ['guard', 'mount', 'back_control']
    techniques TEXT[], -- ['armbar', 'triangle', 'omoplata']
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de progresso/aluno (para futuras features)
CREATE TABLE student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level INTEGER DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
    last_practiced DATE,
    notes TEXT,
    professor_feedback TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tokens de refresh (para autenticação)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```
## 4. Endpoints para a API
### 4.1 Autenticação
```text
POST   /api/auth/register      # Registrar novo usuário
POST   /api/auth/login         # Login (retorna JWT)
POST   /api/auth/refresh       # Refresh token
POST   /api/auth/logout        # Logout (invalida refresh token)
POST   /api/auth/forgot-password # Solicitar reset de senha
POST   /api/auth/reset-password  # Resetar senha com token
```
### 4.2 Usuários
```text
GET    /api/users/me           # Obter perfil do usuário logado
PUT    /api/users/me           # Atualizar perfil
GET    /api/users/:id          # Obter usuário específico (apropriado)
GET    /api/users              # Listar usuários (admin/professor)
PUT    /api/users/:id/status   # Ativar/desativar usuário (admin)
```
### 4.3 Turmas
```text
GET    /api/classes            # Listar todas as turmas (com filtros)
POST   /api/classes            # Criar nova turma (admin/professor)
GET    /api/classes/:id        # Obter detalhes da turma
PUT    /api/classes/:id        # Atualizar turma
DELETE /api/classes/:id        # Remover turma (soft delete)
GET    /api/classes/:id/students # Listar alunos da turma
POST   /api/classes/:id/enroll # Matricular aluno
DELETE /api/classes/:id/enroll/:userId # Remover matrícula
```
### 4.4 Aulas Agendadas
```text
GET    /api/lessons            # Listar aulas (com filtros: date, class, status)
POST   /api/lessons            # Criar aula (professor)
GET    /api/lessons/:id        # Obter detalhes da aula
PUT    /api/lessons/:id        # Atualizar aula
PUT    /api/lessons/:id/status # Atualizar status (scheduled → in_progress → completed)
DELETE /api/lessons/:id        # Cancelar aula
GET    /api/lessons/upcoming   # Próximas aulas (para dashboard)
GET    /api/lessons/calendar   # Aulas para calendário (date range)
```
### 4.5 Presenças
```text
GET    /api/lessons/:id/attendance # Listar presenças de uma aula
POST   /api/lessons/:id/attendance/batch # Registrar múltiplas presenças (batch)
PUT    /api/attendance/:id     # Atualizar presença específica
GET    /api/users/:id/attendance # Histórico de presenças do aluno
GET    /api/attendance/stats/:userId # Estatísticas de presença (últimos 30 dias)
```
### 4.6 Conteúdo das Aulas
```text
GET    /api/lessons/:id/content # Listar conteúdo da aula
POST   /api/lessons/:id/content # Adicionar conteúdo (vídeo, notas)
GET    /api/content/:id        # Obter conteúdo específico
PUT    /api/content/:id        # Atualizar conteúdo
DELETE /api/content/:id        # Remover conteúdo
GET    /api/content/library    # Biblioteca de conteúdo (todos os vídeos com filtros)
POST   /api/content/upload-signed-url # Gerar URL assinada para upload (S3)
```
### 4.7 Dashboard
```text
GET    /api/dashboard/aluno    # Dados para dashboard do aluno
GET    /api/dashboard/professor # Dados para dashboard do professor
GET    /api/dashboard/admin    # Dados para dashboard admin
```
## 5. Autenticação
### 5.1 Fluxo JWT
```typescript
// Estrutura do JWT Payload
interface JWTPayload {
  userId: string;
  email: string;
  role: 'aluno' | 'professor' | 'admin';
  academyId?: string;
  iat: number;
  exp: number;
}

// Headers para todas as requisições autenticadas
Authorization: Bearer {access_token}
```
### 5.2 Middleware de autenticação
```typescript
// Exemplo em Node.js/Express
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
};

// Uso nas rotas
router.get('/admin', authorize('admin'), adminController);
router.post('/lessons', authorize('professor', 'admin'), lessonController);
```
### 5.3 Permissões por Role
```text
ALUNO:
- Ver próprio perfil
- Ver turmas matriculadas
- Ver aulas agendadas
- Ver próprio histórico de presença
- Ver conteúdo das aulas

PROFESSOR:
- Todas permissões de aluno
- Gerenciar turmas (CRUD)
- Criar/atualizar aulas
- Registrar presenças
- Upload de conteúdo
- Ver perfil de alunos da turma

ADMIN:
- Todas permissões de professor
- Gerenciar todos os usuários
- Gerenciar academias
- Acesso a todos os dados
```
## 6. Validação de Dados
### 6.1. Schemas de Validação (exemplo com Zod)
```typescript
// Validação de registro de usuário
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.enum(['aluno', 'professor']),
  beltColor: z.string().optional(),
});

// Validação de criação de aula
const createLessonSchema = z.object({
  classId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  topic: z.string().max(200).optional(),
  professorId: z.string().uuid(),
});
```
### 6.2. Validação de Uploads de arquivos
```typescript
const videoUploadSchema = {
  maxSize: 100 * 1024 * 1024, // 100MB
  allowedMimeTypes: [
    'video/mp4',
    'video/mov',
    'video/avi',
    'video/webm',
  ],
  maxDuration: 600, // 10 minutos em segundos
};
```
## 7. Regras de negócio
### 7.1. Sistema de Presença
```typescript
class AttendanceService {
  async registerAttendance(lessonId, userId, status, checkedBy) {
    // 1. Verificar se aula existe e está em andimento/completada
    // 2. Verificar se aluno está matriculado na turma
    // 3. Verificar se professor pertence à turma
    // 4. Registrar presença com timestamp
    // 5. Atualizar estatísticas do aluno
  }
  
  async calculateAttendanceRate(userId, days = 30) {
    // Calcular percentual de presença dos últimos X dias
    // Considerar apenas aulas onde o aluno estava matriculado
    // Ignorar aulas canceladas
  }
}
```
### 7.2. Gestão de Aulas
```typescript
class ClassService {
  async enrollStudent(classId, studentId) {
    // 1. Verificar se turma existe e está ativa
    // 2. Verificar se tem vagas disponíveis
    // 3. Verificar se aluno já está matriculado
    // 4. Criar matrícula com status 'active'
  }
  
  async generateClassSchedule(classId, startDate, endDate) {
    // Gerar aulas automaticamente baseado no schedule JSON
    // Ex: schedule: [{day: 'mon', time: '18:00', duration: 60}]
    // Gerar todas as segundas-feiras entre startDate e endDate
  }
}
```
### 7.3. Gestão de Conteúdo
```typescript
class ContentService {
  async uploadLessonContent(lessonId, file, metadata, userId) {
    // 1. Validar arquivo (tamanho, tipo)
    // 2. Gerar nome único para arquivo
    // 3. Upload para storage (local ou S3)
    // 4. Salvar metadados no banco
    // 5. Retornar URL de acesso
  }
  
  async generateSignedUrl(fileName, contentType) {
    // Para S3: gerar URL assinada para upload direto do frontend
    // Retornar URL e campos necessários para POST
  }
}
```
## 8. Segurança
### 8.1 Medidas de Segurança
```yaml
Autenticação:
  - JWT com tempo de expiração curto (15min)
  - Refresh tokens com revogação
  - Rate limiting por IP/usuário
  - Log de tentativas de login

Dados:
  - Senhas hasheadas com bcrypt (cost: 12)
  - Dados sensíveis criptografados no banco
  - SQL injection prevention (ORM/parametrized queries)
  - XSS protection (sanitização de inputs)

API:
  - CORS configurado corretamente
  - Helmet.js (Node) ou equivalente
  - Rate limiting: 100 req/min por usuário
  - Logging de requisições suspeitas
```
### 8.2 Environment Variables
```yaml
# Banco de Dados
DATABASE_URL=postgresql://user:pass@localhost:5432/jiujitsu
DB_SSL=false

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Aplicação
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Storage (MVP: local, depois S3)
STORAGE_TYPE=local  # ou 's3'
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=100mb

# S3 (futuro)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_BUCKET_NAME=jiujitsu-videos
```
## 9. API Responses
### 9.1. Respostas de sucesso
```json
{
  "success": true,
  "data": { /* dados da resposta */ },
  "meta": { /* paginação, etc */ },
  "message": "Operação realizada com sucesso"
}

// Erro:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Erro de validação",
    "details": [
      { "field": "email", "message": "Email inválido" }
    ]
  }
}
```
### 9.2. Respostas de erro
```typescript
enum ErrorCodes {
  // 400 - Client Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_EXISTS = 'USER_EXISTS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // 403 - Authorization
  ACCESS_DENIED = 'ACCESS_DENIED',
  ROLE_REQUIRED = 'ROLE_REQUIRED',
  
  // 404 - Not Found
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  CLASS_NOT_FOUND = 'CLASS_NOT_FOUND',
  LESSON_NOT_FOUND = 'LESSON_NOT_FOUND',
  
  // 409 - Conflict
  ALREADY_ENROLLED = 'ALREADY_ENROLLED',
  LESSON_CONFLICT = 'LESSON_CONFLICT',
  
  // 500 - Server Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}
```


