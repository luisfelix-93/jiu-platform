# Pull Request Summary: Feature Multi-Acadademia

## Descrição do Pull Request

Este PR implementa a funcionalidade de **Multi-Acadademia**, permitindo que professores cadastrem suas academias e alunos sejam matriculados em uma academia específica. Esta é a primeira funcionalidade do roadmap de melhorias da plataforma.

---

## Visão Geral das Alterações

O PR adiciona suporte completo para múltiplas academias na plataforma, incluindo:
- Cadastro e gestão de academias por professores
- Matrícula de alunos em academias
- Middleware de escopo para filtragem de dados por academia
- Fluxo de onboarding para acadêmias
- Migração de dados para alunos existentes

---

## Alterações no Backend (`jiu-api`)

### 1. Novas Entidades

**`src/entities/Academy.ts`** - Entidade principal da academia
- Campos: id, name, address, phone, logoUrl, createdAt, updatedAt

**`src/entities/AcademyProfessor.ts`** - Relacionamento professor-academia
- Permite múltiplos professores por academia (many-to-many)

**`src/entities/StudentAcademy.ts`** - Relacionamento aluno-academia
- Permite que um aluno esteja matriculado em uma academia

**`src/entities/User.ts`** (atualização)
- Adicionado campo `academyId` para vincular usuário a uma academia

### 2. Serviços e Controllers

**`src/services/AcademyService.ts`** (187 linhas)
- `createAcademy()` - Criar nova academia
- `getAcademyByProfessor()` - Obter academia do professor logado
- `updateAcademy()` - Atualizar dados da academia
- `getAcademyById()` - Buscar academia por ID
- `listAcademies()` - Listar todas as academias (admin)
- `addProfessorToAcademy()` - Adicionar professor à academia
- `enrollStudentInAcademy()` - Matricular aluno
- `getStudentsByAcademy()` - Listar alunos de uma academia

**`src/controllers/AcademyController.ts`** (118 linhas)
- Endpoints REST para todas as operações do service

### 3. Rotas e Validação

**`src/routes/academy.routes.ts`**
- `POST /academies` - Criar academia
- `GET /academies/me` - Minha academia
- `PUT /academies/me` - Editar academia
- `GET /academies/:id` - Buscar por ID
- `POST /academies/:id/professors` - Adicionar professor
- `POST /academies/:id/alunos` - Matricular aluno
- `GET /academies/:id/alunos` - Listar alunos

**`src/schemas/academy.schema.ts`**
- Schema de validação Zod para criação e atualização de academias

### 4. Middleware

**`src/middlewares/academy-scope.middleware.ts`** (17 linhas)
- Filtra dados baseado na academia do usuário logado
- Aplica automaticamente em queries de turmas e aulas

### 5. Migração de Banco

**`src/migrations/1770000000000-MultiAcademia.ts`** (117 linhas)
- Criação das tabelas `academies`, `academy_professors`, `student_academies`
- Adição da coluna `academy_id` na tabela `users`
- Migração de dados existentes (criação de academia default)

### 6. Integração com Serviços Existentes

**`src/services/ClassService.ts`**
- Adicionado filtro por `academyId` nas consultas de turmas

**`src/services/LessonService.ts`**
- Adicionado filtro por `academyId` nas consultas de aulas
- Atualizado `getUpcomingLessons()` para filtrar por academia

---

## Alterações no Frontend (`jiu-app`)

### 1. Componentes de Academia

**`src/components/academy/AcademyForm.tsx`** (89 linhas)
- Formulário de criação/edição de academia
- Campos: nome, endereço, telefone
- Validação com Zod

**`src/components/academy/AcademyOnboarding.tsx`** (103 linhas)
- Fluxo de onboarding para professores sem academia
- Wizard de 3 passos: dados básicos → informações → confirmação

**`src/components/academy/AcademyProfessorsModal.tsx`** (177 linhas)
- Modal para gerenciar professores de uma academia
- Lista de professores com opção de adicionar/remover

**`src/components/academy/AcademySelect.tsx`** (97 linhas)
- Dropdown de seleção de academia
- Utilizado no registro e perfil do aluno

### 2. Serviços e Estado

**`src/services/academy.service.ts`** (54 linhas)
- `createAcademy()` - Criar academia
- `getMyAcademy()` - Obter minha academia
- `updateAcademy()` - Atualizar academia
- `listAcademies()` - Listar academias
- `getAcademy()` - Buscar por ID

**`src/stores/useAcademyStore.ts`** (93 linhas)
- Estado global Zustand para dados da academia
- Gerencia academia atual do professor

**`src/types/academy.ts`** (37 linhas)
- Tipos TypeScript para Academy, AcademyProfessor, etc.

### 3. Páginas Atualizadas

**`src/pages/professor/ProfessorProfile.tsx`** (+112 linhas)
- Nova seção "Minha Academia" no perfil do professor
- Botão para criar/editar academia
- Exibição de dados da academia cadastrada

**`src/pages/student/StudentProfile.tsx`** (+103 linhas)
- Campo de seleção de academia no perfil do aluno
- Edição da academia matriculada

**`src/pages/Register.tsx`**
- Adicionado fluxo de seleção de academia no registro

**`src/pages/professor/ProfessorLayout.tsx`** (28 linhas)
- Integração com AcademyStore para carregar dados da academia

**`src/pages/layout/DashboardLayout.tsx`** (38 linhas)
- Exibição do nome da academia no header

---

## Decisões Técnicas

1. **Estratégia de Migração**: Criação de academia "default" para vincular alunos existentes
2. **Relacionamento**: Um professor pode ter múltiplas academias, um aluno uma academia
3. **Filtros**: Middleware aplica automaticamente escopo de academia em turmas/aulas
4. **UX**: Onboarding obrigatório para professores sem academia cadastrada

---

## Impacto e Funcionalidades

### Para Professores
- ✅ Cadastro de academia com nome, endereço e telefone
- ✅ Edição dos dados da academia a qualquer momento
- ✅ Dashboard filtrado pela academia do professor

### Para Alunos
- ✅ Seleção de academia no momento do cadastro
- ✅ Edição da academia no perfil
- ✅ Visualização apenas de dados da sua academia

### Para Admin
- ✅ Visualização de todas as academias
- ✅ Gestão centralizada

---

## Testes Realizados

- Criação de academia pelo professor
- Edição de dados da academia
- Registro de novo aluno com seleção de academia
- Edição de academia pelo aluno
- Verificação de filtragem por academia em turmas/aulas

---

## Status

✅ **Pronto para produção**

**Nota**: Este PR faz parte do roadmap documentado em `doc/multi-academy.specs.md` e `doc/roadmap.md`.

---

*PR criado em: 06/04/2026*  
*Commit: f7e33ba - 20260406 - multi-academy feature*