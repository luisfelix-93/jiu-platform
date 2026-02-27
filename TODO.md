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

