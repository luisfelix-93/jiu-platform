# Security Improvements (To Do)

Derived from `doc/security_specs.md`.

## Recommended Improvements

- [x] **Secure Token Storage (Frontend)**
    - Implement Secure, HttpOnly cookies for token storage instead of `localStorage` to mitigate XSS risks.
    - Requires backend changes to set cookies on login/refresh.

- [x] **Rate Limiting (Backend)**
    - Implement `express-rate-limit` to prevent brute-force and DDoS attacks.
    - Focus on `/api/auth/*` routes.

- [x] **Security Headers (Backend)**
    - Audit `helmet` configuration.
    - Configure `Content-Security-Policy` (CSP) appropriately.

- [x] **Input Validation Scope (Backend)**
    - Ensure **ALL** controllers (not just Auth) use `zod` (or similar) for input validation.

- [x] **Type Safety (Backend)**
    - Extend the Express `Request` type definition globally to include `user` (and other custom props) to avoid using `(req as any).user`.

# Performance Improvements (To Do)

Derived from `doc/performance_specs.md`.

## Checklist de Implementação Imediata

- [x] **Compression Middleware**
    - Instalar e configurar `compression` no Express app.

- [x] **Database Indexing**
    - Adicionar índices (@Index) nas tabelas `scheduled_lessons`, `attendances`, `class_enrollments` para FKs e colunas de filtro frequente.

- [x] **Pagination - LessonService**
    - Refatorar `LessonService.listLessons` para aceitar `page` e `limit`.

- [x] **Pagination - ContentService**
    - Refatorar `ContentService` para paginar conteúdos.

- [x] **Slow Query Logging**
    - Configurar `data-source.ts` para logar queries que demoram mais de 1000ms.

- [x] **Connection Pooling**
    - Configurar `extra.max` em `data-source.ts` (implementado).

# Video Player Avançado (To Do)

Derived from `jiu-app/docs/feature.specs.md`.

## Fase 1 - MVP (Player Básico com Funcionalidades Essenciais)

### Backend - Endpoints e Infraestrutura

- [ ] **Video Metadata Endpoint**
    - Criar `GET /api/video/{id}/manifest` para retornar URL do vídeo e metadados.
    - Incluir informações de duração, qualidades disponíveis, legendas e chapters.

- [ ] **Progress Tracking Endpoint**
    - Criar `POST /api/video/{id}/progress` para salvar progresso de visualização.
    - Implementar estrutura `VideoProgress` com `lastPosition`, `completed`, `watchedSegments`.

- [ ] **Video Entity**
    - Criar entidade `Video` com campos: `id`, `title`, `description`, `duration`, `url`.
    - Adicionar relacionamento com `Lesson` ou `Content`.

- [ ] **Streaming Adaptativo**
    - Configurar HLS (HTTP Live Streaming) no Cloudflare R2.
    - Gerar múltiplas qualidades de vídeo no upload (360p, 480p, 720p, 1080p).

- [ ] **Segurança de Vídeo**
    - Implementar URLs assinadas com tokens temporários para acesso a vídeos (RNFV-012).
    - Proteção contra hotlinking (RNFV-011).

### Frontend - Player e Controles Básicos

- [ ] **Enhanced Video Player Component**
    - Integrar Video.js ou Plyr.js como player principal.
    - Criar componente `<EnhancedVideoPlayer />` com props: `src`, `title`, `metadata`, `onProgress`, `onComplete`.

- [ ] **Controles Básicos (RFV-001 a RFV-005)**
    - Implementar controles play/pause, volume, tela cheia, barra de progresso.
    - Adicionar buffer indicator durante carregamento.
    - Suporte a gestos em mobile (toque para play/pause).

- [ ] **Controle de Velocidade (RFV-006)**
    - Implementar seletor de velocidade: 0.25x, 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x.

- [ ] **Fullscreen e Atalhos (RFV-011)**
    - Implementar teclas de atalho: espaço (play/pause), setas (avançar/retroceder), F (fullscreen).
    - Suporte a modo picture-in-picture (RFV-009).

- [ ] **Salvamento Automático de Progresso (RFV-022)**
    - Salvar progresso a cada 10 segundos automaticamente.
    - Retomar vídeo na última posição assistida ao reabrir.
    - Marcar como "assistido" ao concluir (RFV-023).

- [ ] **Performance - Carregamento Otimizado (RNFV-001, RNFV-004)**
    - Garantir tempo de carregamento inicial do player < 1s.
    - Lazy loading do player até interação do usuário.

## Fase 2 - Recursos de Aprendizado e Analytics

### Backend - Bookmarks e Anotações

- [ ] **Bookmark Endpoints**
    - Criar `POST /api/video/{id}/bookmarks` para salvar marcadores de tempo.
    - Criar `GET /api/video/{id}/bookmarks` para listar marcadores do usuário.
    - Implementar entidade `Bookmark` com campos: `videoId`, `userId`, `timestamp`, `note`.

- [ ] **Annotation Endpoints**
    - Criar `POST /api/video/{id}/annotations` para salvar anotações temporizadas.
    - Criar `GET /api/video/{id}/annotations` para obter anotações (pessoais e do professor).
    - Implementar entidade `Annotation` com campos: `timestamp`, `text`, `author` (professor/student).

- [ ] **Video Quality Endpoint**
    - Criar `GET /api/video/{id}/qualities` para listar qualidades disponíveis.
    - Implementar detecção automática de banda (RNFV-002).

- [ ] **Analytics de Visualização (RFV-024, RFV-025)**
    - Criar endpoint para coletar métricas de engajamento (tempo assistido, pausas, repetições).
    - Relatório de visualização para professores (quais alunos assistiram, quanto tempo).

### Frontend - Marcadores, Anotações e Qualidade

- [ ] **Bookmark Manager Component (RFV-012)**
    - Criar `<BookmarkManager />` para gerenciar marcadores de tempo.
    - UI para adicionar/remover/editar bookmarks na linha do tempo.

- [ ] **Annotation Sidebar Component (RFV-013)**
    - Criar `<AnnotationSidebar />` para exibir anotações temporizadas.
    - Permitir adicionar novas anotações durante reprodução.
    - Sincronizar anotações com IndexedDB/localStorage e API.

- [ ] **Video Quality Selector (RFV-007)**
    - Criar `<VideoQualitySelector />` com dropdown de qualidades (auto, 360p, 480p, 720p, 1080p).
    - Implementar seleção automática baseada em banda disponível.

- [ ] **Suporte a Legendas (RFV-008)**
    - Implementar seletor de legendas (formato VTT) com opções de idioma.
    - Personalização de legendas (tamanho, cor, fundo) - RFV-028.

- [ ] **Video Analytics Component (RFV-024)**
    - Criar `<VideoAnalytics />` para coletar e enviar métricas via Beacon API.
    - Rastrear tempo assistido, pausas, repetições, velocidade usada.

- [ ] **Marcadores do Professor (RFV-020)**
    - Exibir marcadores pré-definidos pelo professor na linha do tempo.
    - Indicar pontos importantes da técnica visualmente.

## Fase 3 - Recursos Avançados

### Backend - Recursos Complexos

- [ ] **Video Comparison Support**
    - Endpoint para carregar múltiplos vídeos para comparação lado a lado.
    - Sincronização de timestamps entre vídeos.

- [ ] **Shared Links com Timestamp (RFV-021)**
    - Criar links compartilháveis para trechos específicos de vídeos.
    - Formato: `/video/{id}?t=125` (inicia em 2:05).

- [ ] **Offline Playback (RNFV-009)**
    - Implementar endpoint para download autorizado de vídeos (RFV-010).
    - DRM básico via token para downloads.

- [ ] **Transcrição Automática (RFV-029)**
    - Integrar API de transcrição automática de vídeos.
    - Armazenar transcrições textuais para acessibilidade.

### Frontend - Modo Aprendizado Avançado

- [ ] **Loop de Trecho (RFV-014)**
    - Permitir selecionar início e fim para repetição contínua de trecho.
    - UI para definir pontos A e B do loop.

- [ ] **Modo Câmera Lenta (RFV-015)**
    - Implementar câmera lenta mantendo áudio sincronizado.
    - Controle fino de velocidade para análise técnica.

- [ ] **Comparação Lado a Lado (RFV-016)**
    - Criar `<VideoComparisonView />` para dois vídeos sincronizados.
    - Controles mestres para play/pause sincronizado.
    - Ajuste de delay entre vídeos.

- [ ] **Visualização de Ângulos Múltiplos (RFV-017)**
    - Suporte a múltiplos ângulos de câmera (se disponível no conteúdo).
    - Troca entre ângulos durante reprodução.

- [ ] **Thumbnail Preview (RFV-004)**
    - Exibir thumbnail ao passar mouse sobre barra de progresso.
    - Gerar sprites de thumbnails no backend.

- [ ] **Acessibilidade Completa (RFV-026 a RFV-030)**
    - Suporte a leitores de tela com ARIA labels.
    - Documentação de atalhos de teclado.
    - Navegação completa via teclado.

## Critérios de Aceitação e Testes

- [ ] **Performance Testing**
    - Verificar carregamento em < 1s em conexão 3G simulada.
    - Controles devem responder em < 100ms.
    - Progresso salvo após 10s de reprodução.

- [ ] **Compatibilidade Cross-Browser (RNFV-006, RNFV-007)**
    - Testar em Chrome 90+, Firefox 88+, Safari 14+, Edge 90+.
    - Testar em iOS 12+ e Android 8+.
    - Responsividade de 320px a 3840px.

- [ ] **Testes de Anotações e Bookmarks**
    - Verificar persistência após recarregar página.
    - Sincronização entre dispositivos.

- [ ] **Métricas de Sucesso**
    - Aumento de 25% no tempo médio de visualização.
    - Redução de 15% na taxa de rejeição (saída antes de 30s).
    - 80% dos usuários usando pelo menos um recurso avançado após 30 dias.

# Acesso de Professores a Funcionalidades de Aluno (To Do)

Derived from `issues/enhancement.spec.md`.

## Frontend (`jiu-app`)

- [x] **ProfessorLayout (`src/components/layout/ProfessorLayout.tsx`)**
    - Adicionar item de menu "Calendário (Aluno)".
    - Adicionar item de menu "Meu Progresso".
    - Condicionar a exibição desses itens verificar se a cor da faixa do professor não é preta (`user?.beltColor !== 'black'`).

- [x] **Roteamento (`src/App.tsx`)**
    - Configurar `/professor/calendario-aluno` para renderizar `<StudentCalendar />`.
    - Configurar `/professor/progresso` para renderizar `<StudentProgress />`.

## Backend (`jiu-api`)

- [x] **Permissões de Aulas e Presença**
    - Validar no `lesson.service.ts` e `attendance.service.ts` se um professor pode recuperar turmas gerais e realizar check-in em aulas ministradas por outros professores, da mesma forma que um aluno listaria e faria check-in em suas aulas.

# Notificação de Validação de Senha e Login (To Do)

Derived from `docs/notify-pass.specs.md`.

## Fase 1: Padronização da Validação

- [x] **Atualizar schemas frontend**
    - Alterar validação de senha para `min(8)` em `Register.tsx`.
    - Alterar validação de senha para `min(1)` (apenas obrigatória) em `Login.tsx`.
    - Alterar validação de senha para `min(8)` em `ResetPassword.tsx`.

- [x] **Alinhar backend auth.schema.ts**
    - Garantir que `loginSchema` e `registerSchema` exijam mínimo de 8 caracteres.

## Fase 2: Implementação de Notificações (Toast)

- [x] **Instalar biblioteca de Toast**
    - Instalar `sonner` no `jiu-app`.
    - Configurar o provedor `<Toaster />` no `main.tsx`.

- [x] **Notificações em Tempo Real e Feedback**
    - Adicionar `toast.error` para login incorreto em `Login.tsx`.
    - Adicionar feedback visual/toast imediato quando a senha não atender aos 8 caracteres no registro.
    - Personalizar mensagens em português para cada contexto.

## Fase 3: Testes e Validação


# Multi-Academia (To Do)

Derived from `docs/PLAN-multi-academia.md`.

## Fase 1: Backend — Modelo e Migração

### Entidades

- [x] **TASK-1.1: Criar entidades `AcademyProfessor` e `StudentAcademy`**
    - Criar `entities/AcademyProfessor.ts` com PK composta `(academy_id, professor_id)` e role `owner | member`.
    - Criar `entities/StudentAcademy.ts` com PK composta `(academy_id, student_id)`, campos `enrolled_at` e `is_active`.
    - Verificar: `npx tsc --noEmit` sem erros.

- [x] **TASK-1.2: Atualizar entidade `Academy`**
    - Adicionar campo `logo_url` (nullable, aceita URL externa).
    - Adicionar relações `OneToMany` para `AcademyProfessor` e `StudentAcademy`.
    - Verificar: compilação TypeScript sem erro.

- [x] **TASK-1.3: Atualizar entidade `User` (relações)**
    - Adicionar relação `OneToMany → AcademyProfessor` (para professores).
    - Adicionar relação `OneToMany → StudentAcademy` (para alunos).
    - **Sem FK direta** — academias acessadas via tabelas de vínculo.
    - Verificar: compilação TypeScript sem erro.

### Migration e Seed

- [x] **TASK-1.4: Criar migration `multi-academia`**
    - `ALTER TABLE academies ADD COLUMN logo_url` (nullable).
    - `CREATE TABLE academy_professors` (PK composta + role `owner | member`).
    - `CREATE TABLE student_academies` (PK composta + `is_active` + `enrolled_at`).
    - INSERT academia "default" (nome, endereço e telefone provisórios).
    - INSERT em `academy_professors` para vincular admin/professor padrão como owner.
    - INSERT em `student_academies` para todos os alunos existentes → academia default.
    - Verificar: `npm run migration:run` sem erro; `migration:revert` desfaz tudo sem conflito.

- [x] **TASK-2.1: Script seed academia default**
    - Criar `scripts/seed-default-academy.ts` idempotente (pode rodar N vezes sem duplicatas).
    - Garantir que nenhum aluno existente fique sem entrada em `student_academies`.
    - Verificar: rodar 2× consecutivas sem inserir duplicatas; todos os alunos vinculados.

### Serviço e Controller

- [x] **TASK-1.5: Criar `AcademyService`**
    - `createAcademy(professorId, dto)` — cria academia + vínculo owner automático.
    - `getAcademiesByProfessor(professorId)` — lista academias do professor.
    - `getAcademiesByStudent(studentId)` — lista academias do aluno.
    - `searchAcademies(query)` — busca por nome para associação.
    - `addProfessorToAcademy(academyId, requesterId, targetProfessorId)` — apenas owner.
    - `enrollStudent(academyId, studentId)` — matricula aluno.
    - `unenrollStudent(academyId, studentId)` — soft-disable (`is_active = false`).
    - `updateAcademy(academyId, professorId, dto)` — edita (apenas owner, retorna 403 para membro).
    - Verificar: unit tests cobrindo owner vs membro e aluno em múltiplas academias.

- [x] **TASK-1.6: Criar `AcademyController` e rotas**
    - `POST /academies` — cria academia (professor).
    - `GET /academies/me` — lista academias do usuário logado (professor ou aluno).
    - `PUT /academies/:id` — edita academia (owner).
    - `GET /academies/:id` — detalhe da academia (professor, aluno).
    - `GET /academies` — listagem/busca para associação (autenticado).
    - `POST /academies/:id/professors` — adiciona professor membro (owner).
    - `DELETE /academies/:id/professors/:userId` — remove professor (owner).
    - `POST /academies/:id/students` — aluno se matricula.
    - `DELETE /academies/:id/students/me` — aluno sai da academia (soft-delete).
    - Registrar rotas em `routes/academy.routes.ts` e conectar em `app.ts`.
    - Verificar: todos os endpoints retornam 200/201/403 corretos.

### Middleware e Filtros

- [x] **TASK-1.7: Middleware de scope de academia**
    - Criar `middlewares/academy-scope.middleware.ts`.
    - Injeta `req.academyIds: string[]` com os IDs de academias do usuário logado (funciona para professor e aluno via tabelas de vínculo).
    - Verificar: `GET /classes` com middleware ativo retorna apenas turmas das academias do usuário.

- [x] **TASK-1.8: Aplicar filtros de isolamento nos controllers existentes**
    - `ClassController` — filtrar por `WHERE class.academy_id IN (:...academyIds)`.
    - `LessonController` — filtrar via join `Class → academy_id`.
    - `AttendanceController` — filtrar via join `ScheduledLesson → Class → academy_id`.
    - Verificar: aluno matriculado nas academias A e B vê turmas de ambas; não vê turmas da academia C.

---

## Fase 2: Frontend

### Foundation

- [x] **TASK-3.1: Tipos e serviço de academia**
    - Criar `types/academy.ts` com interfaces `Academy`, `AcademyMember`, `StudentAcademy`.
    - Criar `services/academyService.ts` com chamadas axios para todos os endpoints de academia.
    - Verificar: TypeScript compila sem `any`.

- [x] **TASK-3.2: Zustand store de academia**
    - Criar `stores/academyStore.ts` seguindo padrão dos outros stores.
    - Campos: `myAcademies: Academy[]`, `activeAcademy: Academy | null`.
    - Ações: `fetchMyAcademies`, `setActiveAcademy`, `enrollInAcademy`, `leaveAcademy`.
    - Persistir `activeAcademy` no `sessionStorage`.
    - Verificar: troca de academia ativa dispara re-render das listas de turmas/aulas.

### Componentes

- [x] **TASK-3.3: Componente `AcademyForm`**
    - Criar `components/AcademyForm.tsx` reutilizável para criar e editar academia.
    - Campos: nome (obrigatório), endereço (obrigatório), telefone (obrigatório), logo_url (URL externa, opcional).
    - Validação com zod + react-hook-form.
    - Verificar: submit chama `academyService` e exibe toast de sucesso/erro.

- [x] **TASK-3.4: Componente `AcademySelect`**
    - Criar `components/AcademySelect.tsx` — dropdown com busca de academias.
    - Busca com debounce chamando `GET /academies?q=...`.
    - Verificar: busca funciona com 10+ academias.

- [x] **TASK-3.5: Componente `AcademyOnboarding`**
    - Criar `components/AcademyOnboarding.tsx` — banner/modal para professor sem academia.
    - Card **"Criar nova academia"** → abre `AcademyForm`.
    - Card **"Associar-se a uma academia existente"** → abre `AcademySelect`.
    - Exibir no `ProfessorLayout` quando `myAcademies.length === 0` (não bloqueia acesso ao perfil).
    - Verificar: professor recém-cadastrado vê onboarding; após criar/associar, aviso desaparece.

### Páginas e Layouts

- [x] **TASK-3.6: Perfil do Professor — Seção "Minhas Academias"**
    - Atualizar `pages/professor/ProfessorProfile.tsx`.
    - Listar academias com badge `owner` / `membro`.
    - Owner vê botão de editar → `AcademyForm`.
    - Owner vê lista de professores e pode adicionar/remover membros.
    - Verificar: owner edita; membro vê em read-only.

- [x] **TASK-3.7: Perfil do Aluno — Gestão de Academias**
    - Atualizar `pages/student/StudentProfile.tsx`.
    - Seção "Minhas Academias" com lista de academias vinculadas e opção de sair.
    - Botão "+ Associar-me a uma academia" → `AcademySelect` → `POST /academies/:id/students`.
    - Seletor de academia ativa quando vinculado a 2+ academias.
    - Verificar: aluno pode estar em 2 academias e alternar entre elas.

- [x] **TASK-3.8: Registro — Step de Academia**
    - Atualizar `pages/Register.tsx` com step opcional de seleção de academia.
    - Aluno pode pular; academia pode ser configurada no perfil depois.
    - Se selecionada: chamar `POST /academies/:id/students` após registro.
    - Verificar: registro com academia inclui matrícula; sem academia cria conta normalmente.

- [x] **TASK-3.9: Seletor de Academia Ativa no Nav**
    - Componente no header/nav visível **apenas** para usuários com 2+ academias.
    - Trocar academia ativa via `academyStore.setActiveAcademy` → turmas/aulas atualizam sem reload.
    - Verificar: aluno com 2 academias troca academia ativa → conteúdo atualiza sem reload de página.

---

## Critérios de Aceitação

- [x] Migration roda sem erro; `migration:revert` desfaz completamente.
- [x] Seed idempotente — nenhum aluno existente fica sem academia.
- [x] Aluno em 2 academias vê turmas de ambas ao alternar academia ativa.
- [x] Aluno não vê turmas de academia em que não está matriculado.
- [x] Professor sem academia vê tela de onboarding no dashboard.
- [x] Professor membro não consegue editar academia (403).
- [x] `npx tsc --noEmit` e `npm run lint` passam sem erros.

# Correção: Aulas não zeram ao graduar (Opção A)

Implementação da solução onde a contagem de aulas é resetada baseada em uma data de graduação.

## Backend
- [x] **Entidade User:** Adicionar o campo `lastGraduationDate` (nullable).
- [x] **Migration:** Criar migration `AddLastGraduationDate` para o banco de dados.
- [x] **UserService:** 
    - Atualizar `promoteStudent` para registrar a data ao promover.
    - Atualizar `listStudentsWithGraduationInfo` para filtrar aulas criadas após a última graduação.
    - Atualizar `adjustAttendanceCount` para também respeitar o filtro da data.
- [x] **GraduationController:** Criar endpoint `updateGraduationDate` para que professores possam corrigir alunos que já graduaram.
- [x] **Rotas:** Adicionar a rota `PATCH /students/:id/graduation-date` em `graduation.routes.ts`.

## Frontend
- [x] **Página de Graduação (`Graduation.tsx`):**
    - Mostrar a data da última graduação (se houver).
    - Criar interface (modal ou inline) para o professor editar a data de graduação do aluno.
