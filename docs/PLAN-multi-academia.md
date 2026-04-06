# PLAN: Multi-Academia (Revisado e Expandido)

> **Baseado em:** `doc/multi-academy.specs.md` + `doc/roadmap.md`
> **Criado em:** 02/04/2026
> **Atualizado em:** 02/04/2026 (decisões confirmadas pelo usuário)
> **Status:** 🟢 Aprovado — pronto para implementação

## ✅ Decisões Confirmadas

| # | Decisão | Impacto |
|---|---------|--------|
| 1 | **Aluno pode pertencer a múltiplas academias** | Nova tabela `student_academies` (many-to-many) |
| 2 | **Logo/upload → movido para roadmap** | Remove TASK de upload; campo `logo_url` aceita URL externa por enquanto |
| 3 | **Professor sem academia → tela de onboarding** | Nova tela/modal com opções: "Criar" ou "Associar-se a uma academia" |

---

## 📋 Visão Geral

Expandir o sistema atual para suportar múltiplas academias com isolamento de dados por contexto. Os novos requisitos incluem:

1. **Professor em múltiplas academias** — Um professor pode ser membro de N academias
2. **Aluno em múltiplas academias** — Um aluno pode pertencer a N academias simultaneamente
3. **Turmas e aulas pertencem à academia** — Já modelado (`Class.academyId`), mas sem isolamento de acesso
4. **Aluno vê apenas dados das suas academias** — Filtros de visibilidade pelo `academyId` em todas as queries
5. **Academia pode ter múltiplos professores** — Substituir campo único `professorId` por tabela de membros
6. **Onboarding de professor** — Professor sem academia recebe aviso para criar ou associar-se a uma

---

## 🎯 Critérios de Sucesso

| # | Critério | Verificação |
|---|----------|-------------|
| 1 | Professor pode pertencer a N academias | `GET /academies/me` retorna lista |
| 2 | Aluno pode pertencer a N academias | `GET /academies/me` (aluno) retorna lista |
| 3 | Turmas vinculadas à academia | `Class.academyId` obrigatório & validado |
| 4 | Aulas (ScheduledLesson) isoladas por academia | Query filtrada via Class → Academy |
| 5 | Aluno vê apenas turmas/aulas das suas academias | `GET /classes` retorna só das academias do aluno |
| 6 | Professor vê apenas dados das suas academias | Middleware de scope de academia |
| 7 | Migration não quebra dados existentes | Script idempotente com academia "default" |
| 8 | Professor sem academia vê tela de onboarding | Redirecionamento automático no frontend |

---

## 🏗️ Project Type

**BACKEND + WEB** — `backend-specialist` + `frontend-specialist`

Stack atual:
- **API:** Node.js + Express + TypeORM + PostgreSQL (TypeScript)
- **Frontend:** React + Vite + TypeScript + Tailwind v4

---

## 🔍 Análise do Estado Atual

### O que já existe (🟢)
| Artefato | Status | Observação |
|----------|--------|------------|
| `Academy` entity | ✅ Existe | Sem campo `professorId` — correto para multi-professor |
| `Class.academyId` | ✅ Existe | Relação com Academy já mapeada |
| `ScheduledLesson.professorId` | ✅ Existe | Professor por aula ok |
| `Class/Lesson endpoints` | ✅ Existe | Sem filtro de academia |

### O que está FALTANDO (🔴)
| Gap | Impacto |
|-----|---------|
| `User.academyId` ausente | Aluno não está vinculado a academia |
| Tabela `academy_professors` | Professor não está vinculado a academia |
| Sem middleware de isolamento | Qualquer professor/aluno vê todos os dados |
| `Academy` sem campos: `logoUrl`, `phone`, `address` fixo | Precisa de migration |
| Sem endpoint `POST /academies` | Professor não consegue criar academia |
| Frontend sem seleção de academia | Cadastro de aluno sem academia |

---

## 🗄️ Mudanças no Modelo de Dados

### Nova tabela: `academy_professors` (many-to-many)
```
academy_professors
├── academy_id (FK → academies.id, PK composta)
├── professor_id (FK → users.id, PK composta)
├── role: 'owner' | 'member'
└── created_at
```

### Nova tabela: `student_academies` (many-to-many) 🆕
```
student_academies
├── academy_id (FK → academies.id, PK composta)
├── student_id (FK → users.id, PK composta)
├── enrolled_at
└── is_active (soft-disable sem remover histórico)
```

### Atualizações na entidade `Academy`
```
academies
├── id (já existe)
├── name (já existe)
├── address (já existe)
├── phone (já existe)
├── logo_url (nullable — aceita URL externa; upload movido para roadmap)
└── created_at (já existe)
```

### Entidade `User` — SEM alteração de FK direta
```
users
├── ... (campos existentes — mantidos intactos)
└── (academias acessadas via student_academies e academy_professors)
```

> **Nota sobre migração**: Alunos existentes serão inseridos em `student_academies` apontando para a academia "default".
> `Class.academyId` já existe — sem alteração na entidade Class.

---

## 📐 Arquivo de Mudanças (File Structure)

```
jiu-api/src/
├── entities/
│   ├── Academy.ts                    [MODIFY] — adicionar logoUrl + relations
│   ├── AcademyProfessor.ts           [NEW] — vínculo professor-academia (com role)
│   └── StudentAcademy.ts             [NEW] — vínculo aluno-academia (many-to-many) 🆕
├── controllers/
│   └── AcademyController.ts          [NEW] — CRUD academia + gestão de membros
├── services/
│   └── AcademyService.ts             [NEW] — lógica de academia
├── middlewares/
│   └── academy-scope.middleware.ts   [NEW] — injeta academyIds no req
├── schemas/
│   └── academy.schema.ts             [NEW] — validação Zod
├── routes/
│   └── academy.routes.ts             [NEW] — rotas da academia
├── migrations/
│   └── XXXX-multi-academia.ts        [NEW] — migration completa
└── scripts/
    └── seed-default-academy.ts       [NEW] — seed academia default

jiu-app/src/
├── types/
│   └── academy.ts                    [NEW] — interfaces Academy, AcademyMember
├── services/
│   └── academyService.ts             [NEW] — chamadas de API
├── stores/
│   └── academyStore.ts               [NEW] — Zustand: myAcademies, activeAcademy
├── components/
│   ├── AcademyForm.tsx               [NEW] — formulário criar/editar academia
│   ├── AcademySelect.tsx             [NEW] — dropdown buscável de academias
│   ├── AcademyCard.tsx               [NEW] — card de exibição
│   └── AcademyOnboarding.tsx         [NEW] — modal/tela de onboarding 🆕
└── pages/
    ├── professor/
    │   ├── ProfessorProfile.tsx      [MODIFY] — seção "Minhas Academias"
    │   └── ProfessorLayout.tsx       [MODIFY] — redirect para onboarding se sem academia
    ├── student/
    │   └── StudentProfile.tsx        [MODIFY] — gerenciar academias vinculadas
    └── Register.tsx                  [MODIFY] — step de academia no cadastro
```

---

## 📋 Task Breakdown

### 🔴 FASE 1: Backend — Modelo e Migração

#### TASK-1.1: Criar entidades `AcademyProfessor` e `StudentAcademy`
- **Agent:** `backend-specialist`
- **Skill:** `database-design`
- **Priority:** P0 (foundation)
- **Dependencies:** nenhuma
- **INPUT:** Arquivo `entities/Academy.ts` como referência de padrão
- **OUTPUT:**
  - `entities/AcademyProfessor.ts` — PK composta `(academy_id, professor_id)`, role `owner|member`
  - `entities/StudentAcademy.ts` — PK composta `(academy_id, student_id)`, campo `is_active`, `enrolled_at`
- **VERIFY:** `npx tsc --noEmit` sem erros de FK ou tipo

---

#### TASK-1.2: Atualizar entidade `Academy`
- **Agent:** `backend-specialist`
- **Skill:** `database-design`
- **Priority:** P0
- **Dependencies:** TASK-1.1
- **INPUT:** `entities/Academy.ts` atual
- **OUTPUT:** `entities/Academy.ts` com `logoUrl + OneToMany professors (AcademyProfessor)`
- **VERIFY:** Compilação TypeScript sem erro

---

#### TASK-1.3: Atualizar entidade `User` (relações)
- **Agent:** `backend-specialist`
- **Priority:** P0
- **Dependencies:** TASK-1.1
- **INPUT:** `entities/User.ts` atual
- **OUTPUT:** `User.ts` com relações:
  - `OneToMany → AcademyProfessor` (para professores)
  - `OneToMany → StudentAcademy` (para alunos)
  - **Sem FK direta** — academias acessadas via tabelas de vínculo
- **VERIFY:** Compilação TypeScript sem erro

---

#### TASK-1.4: Criar migration `multi-academia`
- **Agent:** `backend-specialist`
- **Skill:** `database-design`
- **Priority:** P0
- **Dependencies:** TASK-1.2, TASK-1.3
- **INPUT:** Entidades atualizadas
- **OUTPUT:** Migration file com:
  1. `ALTER TABLE academies ADD COLUMN logo_url` (nullable)
  2. `CREATE TABLE academy_professors` (PK composta + role)
  3. `CREATE TABLE student_academies` (PK composta + is_active + enrolled_at)
  4. INSERT academia "default"
  5. INSERT INTO `academy_professors` (default_id, admin_user_id, 'owner') — professor padrão
  6. INSERT INTO `student_academies` para todos os alunos existentes → academia default
- **VERIFY:** `npm run migration:run` sem erro; `migration:revert` desfaz completamente; nenhum aluno fica sem academia

---

#### TASK-1.5: Criar `AcademyService`
- **Agent:** `backend-specialist`
- **Skill:** `api-patterns`
- **Priority:** P1
- **Dependencies:** TASK-1.4
- **INPUT:** Padrão de outros services (ex: `UserController.ts`)
- **OUTPUT:** `services/AcademyService.ts` com:
  - `createAcademy(professorId, dto)` — cria academia + vínculo owner automático
  - `getAcademiesByProfessor(professorId)` — lista academias do professor
  - `getAcademiesByStudent(studentId)` — lista academias do aluno 🆕
  - `addProfessorToAcademy(academyId, requesterId, targetProfessorId)` — apenas owner
  - `enrollStudent(academyId, studentId)` — matricula aluno 🆕
  - `unenrollStudent(academyId, studentId)` — soft-disable (`is_active = false`) 🆕
  - `getAcademyById(id)` — com professores, total de alunos e stats
  - `updateAcademy(academyId, professorId, dto)` — edita (apenas owner)
  - `searchAcademies(query)` — busca por nome/cidade para professor/aluno se associar 🆕
- **VERIFY:** Unit tests: `createAcademy` (professor vira owner), `updateAcademy` (non-owner → 403), `enrollStudent` (aluno em 2 academias → ok)

---

#### TASK-1.6: Criar `AcademyController` e rotas
- **Agent:** `backend-specialist`
- **Skill:** `api-patterns`
- **Priority:** P1
- **Dependencies:** TASK-1.5
- **INPUT:** Padrão de `ClassController.ts`
- **OUTPUT:** Endpoints:
  | Método | Rota | Roles | Notas |
  |--------|------|-------|-------|
  | POST | `/academies` | professor | Cria + vínculo owner |
  | GET | `/academies/me` | professor, aluno | Lista academias do usuário logado |
  | PUT | `/academies/:id` | professor (owner) | — |
  | GET | `/academies/:id` | professor, aluno | — |
  | GET | `/academies` | qualquer (autenticado) | Busca/listagem para associação 🆕 |
  | POST | `/academies/:id/professors` | professor (owner) | Adiciona professor |
  | DELETE | `/academies/:id/professors/:userId` | professor (owner) | Remove professor |
  | POST | `/academies/:id/students` | aluno (self) | Aluno se matricula 🆕 |
  | DELETE | `/academies/:id/students/me` | aluno (self) | Aluno sai da academia 🆕 |
- **VERIFY:** `curl` nos endpoints retorna 200/201/403 corretos; aluno pode se matricular em 2 academias

---

#### TASK-1.7: Middleware de isolamento de academia
- **Agent:** `backend-specialist`
- **Skill:** `api-patterns`
- **Priority:** P1
- **Dependencies:** TASK-1.6
- **INPUT:** `auth.middleware.ts` como base
- **OUTPUT:** `middlewares/academy-scope.middleware.ts`
  - Injeta `req.academyIds` (lista de IDs de academias do usuário — funciona para professor e aluno)
  - Controllers usam `WHERE academy_id IN (:...academyIds)` para filtrar
- **VERIFY:** GET `/classes` retorna somente turmas das academias do usuário logado (teste com aluno em 2 academias)

---

#### TASK-1.8: Filtrar controllers existentes por academia
- **Agent:** `backend-specialist`
- **Priority:** P1
- **Dependencies:** TASK-1.7
- **INPUT:** `ClassController.ts`, `LessonController.ts`, `AttendanceController.ts`
- **OUTPUT:** Todas as queries filtradas por `req.academyIds` injetado pelo middleware
- **Regra de visibilidade (unificada):**
  - **Aluno:** `WHERE class.academy_id IN (academias do aluno)`
  - **Professor:** `WHERE class.academy_id IN (academias do professor)`
- **VERIFY:** Aluno matriculado em academias A e B vê turmas de ambas; não vê turmas da academia C

---

### 🟡 FASE 2: Migração de Dados

#### TASK-2.1: Script de seed da academia default
- **Agent:** `backend-specialist`
- **Priority:** P0 (blocker para produção)
- **Dependencies:** TASK-1.4
- **INPUT:** Script de migration da TASK-1.4
- **OUTPUT:** `scripts/seed-default-academy.ts` — idempotente, pode rodar múltiplas vezes
- **VERIFY:** Rodar 2x não duplica academia; todos os alunos têm `academy_id != null`

---

### 🟢 FASE 3: Frontend

#### TASK-3.1: Tipos e serviço de academia
- **Agent:** `frontend-specialist`
- **Priority:** P0 (foundation)
- **Dependencies:** TASK-1.6
- **INPUT:** Types de outros serviços (ex: `types/`)
- **OUTPUT:**
  - `types/academy.ts` — interfaces TypeScript
  - `services/academyService.ts` — axios calls para endpoints de academia
- **VERIFY:** TypeScript compila sem any

---

#### TASK-3.2: Zustand store de academia
- **Agent:** `frontend-specialist`
- **Priority:** P0
- **Dependencies:** TASK-3.1
- **INPUT:** Padrão de outros stores em `stores/`
- **OUTPUT:** `stores/academyStore.ts` com:
  - `myAcademies: Academy[]` — lista de academias do usuário
  - `activeAcademy: Academy | null` — academia selecionada no contexto atual (para app com múltiplas)
  - Ações: `fetchMyAcademies`, `setActiveAcademy`, `enrollInAcademy`, `leaveAcademy`
- **VERIFY:** Store persiste `activeAcademy` no sessionStorage; troca de academia recarrega dados corretamente

---

#### TASK-3.3: Componente `AcademyForm`
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **Priority:** P1
- **Dependencies:** TASK-3.2
- **INPUT:** Campos: nome, endereço, telefone, logo_url (campo de texto/URL — sem upload por ora)
- **OUTPUT:** `components/AcademyForm.tsx` — reutilizável para criar e editar
- **Nota:** Upload de imagem movido para roadmap. Campo `logo_url` aceita URL externa
- **VERIFY:** Validação frontend + submit chama corretamente o service

---

#### TASK-3.4: Componente `AcademySelect`
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **Priority:** P1
- **Dependencies:** TASK-3.1
- **INPUT:** Lista de academias via `GET /academies`
- **OUTPUT:** `components/AcademySelect.tsx` — dropdown searchable
- **VERIFY:** Busca funciona com 10+ academias

---

#### TASK-3.5: Onboarding de Professor sem Academia 🆕
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **Priority:** P1 (blocker de UX — professor sem academia fica preso)
- **Dependencies:** TASK-3.3, TASK-3.4
- **INPUT:** `pages/professor/ProfessorLayout.tsx` (interceptor de rota)
- **OUTPUT:** Componente `AcademyOnboarding.tsx` exibido quando professor não tem nenhuma academia:
  - Card: **"Criar nova academia"** → abre `AcademyForm`
  - Card: **"Associar-se a uma academia existente"** → abre `AcademySelect` (busca por nome) → solicita ao owner
  - Professor não bloqueado de ver o perfil, mas dashboard mostra aviso proeminente
- **VERIFY:** Professor recém-cadastrado vê onboarding; após criar academia, aviso desaparece

---

#### TASK-3.6: Perfil do Professor — Seção Academias
- **Agent:** `frontend-specialist`
- **Priority:** P2
- **Dependencies:** TASK-3.3, TASK-3.5
- **INPUT:** `pages/professor/ProfessorProfile.tsx`
- **OUTPUT:** Seção "Minhas Academias" com:
  - Lista das suas academias (com badge `owner`/`membro`)
  - Botão de criar nova academia
  - Formulário de edição por academia (apenas owner vê botão de editar)
  - Lista de professores por academia (apenas owner pode gerenciar)
- **VERIFY:** UI mostra lista corretamente; owner pode editar; membro vê dados em read-only

---

#### TASK-3.7: Perfil do Aluno — Gestão de Academias
- **Agent:** `frontend-specialist`
- **Priority:** P2
- **Dependencies:** TASK-3.4
- **INPUT:** `pages/student/StudentProfile.tsx`
- **OUTPUT:** Seção "Minhas Academias" com:
  - Lista das academias vinculadas (com opção de sair)
  - Botão "+ Associar-me a uma academia" → abre `AcademySelect`
  - Seletor de academia ativa (contexto de exibição de turmas/aulas)
- **VERIFY:** Aluno pode estar em 2 academias e alternar entre elas para ver turmas diferentes

---

#### TASK-3.8: Registro — Step de Academia
- **Agent:** `frontend-specialist`
- **Priority:** P2
- **Dependencies:** TASK-3.4
- **INPUT:** `pages/Register.tsx`
- **OUTPUT:** Novo step no fluxo de cadastro de aluno para selecionar academia (opcional — pode pular e adicionar depois no perfil)
- **VERIFY:** Registro com academia → `POST /academies/:id/students/me` chamado; registro sem academia → conta criada normalmente

---

#### TASK-3.9: Seletor de Academia Ativa (contexto global) 🆕
- **Agent:** `frontend-specialist`
- **Priority:** P2
- **Dependencies:** TASK-3.2
- **INPUT:** `academyStore.ts` + layouts existentes
- **OUTPUT:** Componente de seleção de academia ativa visível no header/nav para usuários com múltiplas academias. Trocar academia atualiza turmas/aulas exibidas
- **Regra:** Usuário com 1 academia não vê o seletor (hidden). Usuário com 2+ vê dropdown no nav
- **VERIFY:** Aluno com 2 academias troca academia ativa → lista de turmas atualiza sem reload de página

---

## ⚠️ Regras de Negócio Expandidas

| # | Regra | Origem |
|---|-------|--------|
| RN-1 | Professor pode pertencer a múltiplas academias | NOVO |
| RN-2 | Ao criar academia, professor torna-se `owner` automaticamente | NOVO |
| RN-3 | Apenas `owner` pode editar dados da academia e remover professores | NOVO |
| RN-4 | Owner pode adicionar outros professores membros | NOVO |
| RN-5 | Turma (`Class`) DEVE pertencer a uma academia | mantido |
| RN-6 | Aula (`ScheduledLesson`) herda academia via turma | mantido |
| RN-7 | Aluno vê turmas e aulas das suas academias (todas as que está matriculado) | ✏️ REVISADO |
| RN-8 | Professor vê turmas e aulas de todas as suas academias | NOVO |
| RN-9 | **Aluno pode pertencer a múltiplas academias simultaneamente** | ✏️ REVISADO |
| RN-10 | Aluno pode sair de academia (`is_active = false` em `student_academies`) | ✏️ REVISADO |
| RN-11 | Professor sem academia vê onboarding — não é bloqueado | NOVO |
| RN-12 | Logo da academia aceita URL externa; upload de arquivo é roadmap | NOVO |

---

## 🚨 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Migration falha em produção | Média | Alto | Testar migration em staging; script idempotente |
| Dados órfãos (alunos sem academia) | Alta | Médio | Script de seed mandatory antes do deploy |
| Performance das queries com JOIN extra | Baixa | Médio | Index em `academy_id` em todas as tabelas |
| Professor fica sem academia se não criar | Média | Médio | UI clara + fluxo de onboarding |

---

## 🌐 Atualização do Specs (`multi-academy.specs.md`)

O plano **complementa** o documento existente. As seguintes seções precisam ser atualizadas no specs:

1. **Estrutura de dados** — Adicionar `AcademyProfessor` entity
2. **API Endpoints** — Adicionar endpoints de professores por academia
3. **Regras de negócio** — Atualizar RN-1 (era "um professor, uma academia")
4. **Modelo Academy** — Remover campo `professorId` (substituído pela tabela de vínculo)

---

## ✅ Phase X: Verification Checklist

```
[ ] 1. npm run lint (sem erros)
[ ] 2. npx tsc --noEmit (sem erros TypeScript)
[ ] 3. migration:run sem erro + migration:revert funciona
[ ] 4. seed-default-academy roda sem duplicatas; todos os alunos em student_academies
[ ] 5. GET /classes com aluno em 2 academias retorna turmas de ambas
[ ] 6. GET /classes com aluno em 2 academias e academia ativa = A retorna só turmas de A
[ ] 7. GET /classes com professor retorna apenas turmas das suas academias
[ ] 8. POST /academies cria academia + vínculo owner automático
[ ] 9. Aluno consegue se matricular em 2ª academia pelo perfil
[ ] 10. Aluno consegue sair de uma academia (soft-delete)
[ ] 11. Professor sem academia vê tela de onboarding
[ ] 12. Professor consegue criar e editar academia
[ ] 13. Professor pode adicionar outro professor (como membro) à sua academia
[ ] 14. Membro não consegue editar academia (403)
```

---

## 📅 Ordem de Execução Sugerida

```
FASE 1 (Backend — foundation)
  TASK-1.1 (AcademyProfessor + StudentAcademy entities)
      ↓
  TASK-1.2 (Academy entity update) + TASK-1.3 (User relations) [paralelo]
      ↓
  TASK-1.4 (Migration completa)
      ↓
  TASK-1.5 (AcademyService)
      ↓
  TASK-1.6 (AcademyController + routes)
      ↓
  TASK-1.7 (academy-scope middleware)
      ↓
  TASK-1.8 (filtros nos controllers existentes)

FASE 2 (Dados — paralelo com TASK-1.5+)
  TASK-2.1 (seed academia default)

FASE 3 (Frontend)
  TASK-3.1 (types + service)
      ↓
  TASK-3.2 (Zustand store)
      ↓
  TASK-3.3 (AcademyForm) + TASK-3.4 (AcademySelect) [paralelo]
      ↓
  TASK-3.5 (Onboarding professor) ← P1, antes dos outros
  TASK-3.6 (Perfil professor) + TASK-3.7 (Perfil aluno) + TASK-3.8 (Registro) [paralelo]
      ↓
  TASK-3.9 (Seletor academia ativa no nav) [último]
```

---

*Plano criado por: project-planner agent*
*Arquivo: `docs/PLAN-multi-academia.md`*
