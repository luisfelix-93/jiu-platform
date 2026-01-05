# Referência da API (API Reference)

Este documento detalha os endpoints da API, incluindo exemplos de requisições e respostas de sucesso e erro.

## Endpoints

### 1. Autenticação (`/api/auth`)

#### Registrar Usuário
**POST** `/register`

Cria uma nova conta de usuário (Aluno ou Professor).

**Corpo da Requisição:**
```json
{
  "email": "student@example.com",
  "password": "Password123",
  "name": "João da Silva",
  "role": "aluno", // "aluno" ou "professor"
  "beltColor": "white" // Opcional
}
```

**Resposta de Sucesso (201 Created):**
```json
{
  "user": {
    "id": "uuid-do-usuario",
    "email": "student@example.com",
    "name": "João da Silva",
    "role": "aluno"
  },
  "accessToken": "ey...",
  "refreshToken": "ey..."
}
```

**Resposta de Erro (400 Bad Request):**
```json
{
  "error": "User already exists"
}
```

#### Login
**POST** `/login`

Autentica um usuário e retorna os tokens.

**Corpo da Requisição:**
```json
{
  "email": "student@example.com",
  "password": "Password123"
}
```

**Resposta de Sucesso (200 OK):**
```json
{
  "user": {
    "id": "uuid-do-usuario",
    "email": "student@example.com",
    "name": "João da Silva",
    "role": "aluno"
  },
  "accessToken": "ey...",
  "refreshToken": "ey..."
}
```

**Resposta de Erro (400 Bad Request):**
```json
{
  "error": "Invalid credentials"
}
```

---

### 2. Usuários (`/api/users`)

#### Obter Meu Perfil
**GET** `/me`
*Auth: Bearer Token*

Retorna os detalhes do usuário logado e seu perfil.

**Resposta de Sucesso (200 OK):**
```json
{
  "id": "uuid-do-usuario",
  "name": "João da Silva",
  "email": "student@example.com",
  "role": "aluno",
  "beltColor": "white",
  "stripeCount": 0,
  "isActive": true,
  "profile": {
    "id": "uuid-do-perfil",
    "birthDate": "1990-01-01",
    "phone": "999999999",
    "startDate": "2025-01-01"
  }
}
```

#### Atualizar Meu Perfil
**PUT** `/me`
*Auth: Bearer Token*

Atualiza dados do perfil (profile).

**Corpo da Requisição:**
```json
{
  "phone": "11999998888",
  "emergencyContact": "Maria Silva"
}
```

**Resposta de Sucesso (200 OK):**
```json
{
  "id": "uuid-do-perfil",
  "userId": "uuid-do-usuario",
  "phone": "11999998888",
  "emergencyContact": "Maria Silva",
  ...
}
```

---

### 3. Turmas (`/api/classes`)

#### Listar Turmas
**GET** `/`
*Auth: Bearer Token*

Lista todas as turmas cadastradas.

**Resposta de Sucesso (200 OK):**
```json
[
  {
    "id": "uuid-da-turma",
    "name": "Jiu-Jitsu Iniciante",
    "description": "Turma para faixa branca",
    "schedule": { "days": ["mon", "wed"], "time": "19:00" },
    "academy": { "id": "...", "name": "Matriz" }
  }
]
```

#### Criar Turma
**POST** `/`
*Auth: Bearer Token (Professor/Admin)*

**Corpo da Requisição:**
```json
{
  "name": "Jiu-Jitsu Avançado",
  "description": "Treino de competição",
  "schedule": { "days": ["tue", "thu"], "time": "20:00" },
  "academyId": "uuid-da-academia" // Opcional, se houver relação direta
}
```

#### Matricular Aluno
**POST** `/:id/enroll`
*Auth: Bearer Token (Professor/Admin)*

**Corpo da Requisição:**
```json
{
  "studentId": "uuid-do-aluno"
}
```

**Resposta de Sucesso (200 OK):**
```json
{
  "id": "uuid-da-matricula",
  "classId": "uuid-da-turma",
  "userId": "uuid-do-aluno",
  "status": "active",
  "enrolledAt": "2025-01-01T10:00:00.000Z"
}
```

---

### 4. Aulas Agendadas (`/api/lessons`)

#### Listar Aulas
**GET** `/`
*Auth: Bearer Token*
*Query Params: `startDate`, `endDate`, `classId`*

**Resposta de Sucesso (200 OK):**
```json
[
  {
    "id": "uuid-da-aula",
    "date": "2026-01-05",
    "startTime": "19:00",
    "endTime": "20:00",
    "topic": "Passagem de Guarda",
    "status": "scheduled",
    "class": { "name": "Iniciante" },
    "professor": { "name": "Mestre Carlos" }
  }
]
```

#### Criar Aula (Agendar)
**POST** `/`
*Auth: Bearer Token (Professor/Admin)*

**Corpo da Requisição:**
```json
{
  "classId": "uuid-da-turma",
  "professorId": "uuid-do-professor",
  "date": "2026-01-10",
  "startTime": "18:00",
  "endTime": "19:00",
  "topic": "Finalizações"
}
```

---

### 5. Presenças (`/api/attendance`)

#### Registrar Presença
**PUT** `/:lessonId` (Nota: Implementado como `PUT /api/attendance/:id` onde ID é o da presença, ou `POST` se nova. A rota atual aceita criar/atualizar via Controller)

*Para fins de simplificação, a rota documentada é:*
**PUT** `/api/attendance/:lessonId` (Se parametro for ID da aula) ou POST no controller.
*Verificar implementação exata no `AttendanceController`.*
*No código atual (AttendanceController.register), a rota é chamada com `lessonId` no path? Não, no código da rota: `router.put("/:id", ...)` onde `:id` está sendo usado, mas o controller espera `lessonId` no params OU body? O `AttendanceController.register` pega `req.params.lessonId`? Não, ele estava como `req.params.lessonId` na implementação sugerida.*

**Atenção:** Na implementação atual da rota `src/routes/attendance.routes.ts`: `router.put("/:id", ... Controller.register)`.
E no Controller: `const { lessonId } = req.params`.
Isso significa que você deve chamar `PUT /api/attendance/{lessonId}` passando o corpo abaixo.

**Corpo da Requisição:**
```json
{
  "userId": "uuid-do-aluno",
  "status": "present", // present, absent, late
  "notes": "Chegou cedo"
}
```

**Resposta de Sucesso (200 OK):**
```json
{
  "id": "uuid-da-presenca",
  "lessonId": "...",
  "userId": "...",
  "status": "present",
  "checkInTime": "..."
}
```

---

### 6. Dashboard (`/api/dashboard`)

#### Obter Dados do Dashboard
**GET** `/`
*Auth: Bearer Token*

Retorna dados contextualizados para o usuário logado (Aluno, Professor ou Admin).

**Exemplo de Resposta (Aluno):**
```json
{
  "upcomingLessons": [ ... ],
  "recentAttendance": [ ... ],
  "stats": {
    "totalAttended": 15
  }
}
```

---

## Códigos de Erro Comuns

| Código | Significado | Descrição |
|--------|-------------|-----------|
| 400 | Bad Request | Erro de validação ou dados incorretos |
| 401 | Unauthorized | Token ausente, inválido ou expirado |
| 403 | Forbidden | Usuário não tem permissão (ex: Aluno tentando criar turma) |
| 404 | Not Found | Recurso não encontrado (ID inválido) |
| 500 | Internal Server Error | Erro inesperado no servidor |
