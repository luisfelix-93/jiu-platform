# Plataforma de Jiu-Jitsu - Especificação do Projeto (MVP)
## 1. Visão Geral
### 1.1. Objetivo
Desenvolver uma plataforma web responsiva para gestão de aulas, conteúdo e presença em academia de Jiu-Jitsu, com dashboards diferenciados para alunos e professores.

### 1.2. Público-Alvo
- Alunos: Acompanhar aulas, acessar conteúdo, verificar presença
- Professores: Gerenciar turmas, controlar presença, compartilhar conteúdo
- Administradores: Gerenciar usuários e configurações (futuro)

### 1.3. Escopo do MVP
- ✅ Sistema de autenticação (aluno/professor)
- ✅ Dashboard personalizado por perfil
- ✅ Gestão de horários e calendário
- ✅ Controle de presença
- ✅ Upload/view de conteúdo didático
- ❌ Sistema de pagamentos (fase 2)
- ❌ Streaming de vídeo avançado (apenas upload/view básico inicial)
- ❌ App mobile nativo (web responsiva apenas)


## 2. Requisitos Funcionais
### 2.1 Módulo de Autenticação

```text
RF-001: Login com email/senha
RF-002: Redirecionamento para dashboard baseado no perfil
RF-003: Recuperação de senha
RF-004: Logout seguro
RF-005: Perfil do usuário (foto, graduação, data ingresso)
```

### 2.2 Dashboard do aluno

```text
RF-006: Visão geral da semana (próximas aulas)
RF-007: Calendário interativo de aulas
RF-008: Histórico de presença (% mensal)
RF-009: Acesso ao conteúdo das aulas (vídeos + notas)
RF-010: Biblioteca de técnicas organizável
RF-011: Progresso visual (faixa, conquistas)
```

### 2.3. Dashboard do Professor

```text
RF-012: Lista de turmas ministradas
RF-013: Controle de presença em tempo real (mobile-friendly)
RF-014: Upload de conteúdo por aula (vídeo + anotações)
RF-015: Acompanhamento individual de alunos
RF-016: Anotações privadas sobre alunos
RF-017: Finalização de aula (salva presença + conteúdo)
```

### 2.4. Sistema de Aulas

```text
RF-018: Calendário semanal/mensal de todas as turmas
RF-019: Detalhes da aula (data, horário, professor, tema)
RF-020: Status da aula (agendada, em andamento, finalizada)
RF-021: Check-in de aluno (se permitido)
```

## 3. Requisitos Não Funcionais
### 3.1 Performance
```text
RNF-001: Carregamento inicial da dashboard em < 3s
RNF-002: Interface responsiva (mobile-first)
RNF-003: Suporte a conexões 3G (otimização de assets)
RNF-004: Lazy loading para vídeos e imagens
```

### 3.2 Segurança
```text
RNF-009: Autenticação via JWT tokens
RNF-010: Proteção contra XSS e CSRF
RNF-011: HTTPS obrigatório
RNF-012: Sanitização de inputs
```

### 3.3 Usabilidade
```text
RNF-005: Design intuitivo (nível de complexidade baixo)
RNF-006: Acessibilidade (nível AA WCAG 2.1)
RNF-007: Suporte a touch para tablets
RNF-008: Feedback visual para todas as ações
```

### 3.4 Compatibilidade
```text
RNF-013: Chrome 90+, Firefox 88+, Safari 14+
RNF-014: iOS 12+, Android 8+
RNF-015: Telas de 320px a 1920px
```

## 4. Arquitetura
### 4.1 Stack Tecnológica
```text
Framework: React 18+ (TypeScript)
Build Tool: Vite
Estilização: Tailwind CSS + Headless UI
Gerenciamento de Estado: Zustand (leve) ou Redux Toolkit
Roteamento: React Router v6
Requisições HTTP: Axios + React Query
Formulários: React Hook Form + Zod (validação)
Calendário: React Big Calendar
Player de Vídeo: Video.js (simples) ou Plyr
Upload: React Dropzone
Ícones: Lucide React
```

### 4.2 Estrutura de Pastas
```text
src/
├── components/
│   ├── common/          # Componentes reutilizáveis
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── ...
│   ├── layout/          # Layouts principais
│   │   ├── DashboardLayout/
│   │   ├── AuthLayout/
│   │   └── ...
│   ├── aluno/           # Componentes específicos aluno
│   └── professor/       # Componentes específicos professor
├── pages/
│   ├── Login/
│   ├── AlunoDashboard/
│   ├── ProfessorDashboard/
│   ├── AulaDetail/
│   └── ...
├── hooks/               # Custom hooks
├── stores/              # Zustand stores
├── services/            # API services
├── types/               # TypeScript types
├── utils/               # Funções utilitárias
└── assets/              # Imagens, fonts, etc.
```

### 4.3 Componentes Principais
```text
1. <PresenceTable />
   - Tabela touch-friendly para marcar presença
   - Checkboxes grandes para mobile
   - Ordenação por nome/frequência

2. <VideoUploader />
   - Drag & drop para vídeos
   - Preview antes do upload
   - Progress indicator

3. <ClassCalendar />
   - Vista semanal/mensal
   - Diferenciação por turma (cores)
   - Click para detalhes da aula

4. <AttendanceChart />
   - Gráfico de frequência mensal
   - Comparativo com média da turma

5. <ContentLibrary />
   - Filtro por posição/técnica
   - Busca por nome
   - Favoritos do aluno
```

## 5. Design System
### 5.1. Cores
```css
--primary: #dc2626;    /* Vermelho faixa coral */
--secondary: #171717;  /* Preto faixa */
--accent: #f59e0b;    /* Amarelo ouro */
--neutral-50: #fafafa;
--neutral-800: #262626;
--success: #10b981;   /* Verde presente */
--error: #ef4444;     /* Vermelho falta */
```

### 5.2. Tipografia
```css
Font Family: 'Inter', sans-serif
Títulos: 600-700 weight
Corpo: 400 weight
Hierarquia: h1(2rem), h2(1.5rem), h3(1.25rem), corpo(1rem)
```

### 5.3. Espaçamento
```css
Base: 4px (0.25rem)
Escala: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
```

### 5.4. Breaking Points
```text
sm: 640px  (mobile)
md: 768px  (tablet)
lg: 1024px (desktop)
xl: 1280px (desktop large)
```

## 6. Fluxos de Usuário
### 6.1. Fluxo do Aluno
```text
1. Login → Dashboard Aluno
2. Ver calendário → Selecionar aula → Ver detalhes
3. Acessar conteúdo → Ver vídeo + anotações
4. Ver presença → Gráfico mensal
5. Logout
```

### 6.2. Fluxo do Professor
```text
1. Login → Dashboard Professor
2. Selecionar turma → Ver agenda
3. Selecionar aula → Marcar presença
4. Upload conteúdo → Vídeo + notas
5. Finalizar aula → Salvar tudo
6. Acompanhar aluno → Ver histórico
```

## 7. API Mock
### 7.1. Estrutura de Dados
```typescript
// Tipos principais
interface User {
  id: string;
  email: string;
  name: string;
  role: 'aluno' | 'professor';
  belt: BeltColor;
  avatar?: string;
}

interface Class {
  id: string;
  title: string;
  date: Date;
  time: string;
  professorId: string;
  students: string[]; // IDs
  status: 'scheduled' | 'ongoing' | 'completed';
}

interface Attendance {
  classId: string;
  studentId: string;
  present: boolean;
  date: Date;
}

interface ClassContent {
  classId: string;
  videos: Array<{
    id: string;
    title: string;
    url: string;
    duration: number;
  }>;
  notes: string;
  positions: string[]; // ['guard', 'mount', ...]
}
```

### 7.2 Endpoints Mock
```javascript
// Mock service para desenvolvimento
const mockAPI = {
  // Autenticação
  '/api/auth/login': { method: 'POST', returns: { user, token } },
  
  // Aluno
  '/api/aluno/dashboard': { method: 'GET', returns: { upcomingClasses, attendanceRate, progress } },
  '/api/aluno/aulas': { method: 'GET', returns: { classes: [] } },
  '/api/aluno/presenca': { method: 'GET', returns: { attendance: [] } },
  '/api/aluno/conteudo/:classId': { method: 'GET', returns: { videos: [], notes: '' } },
  
  // Professor
  '/api/professor/turmas': { method: 'GET', returns: { classes: [] } },
  '/api/professor/aula/:classId/students': { method: 'GET', returns: { students: [] } },
  '/api/professor/aula/:classId/attendance': { method: 'POST', returns: { success: true } },
  '/api/professor/aula/:classId/content': { method: 'POST', returns: { success: true } },
};
```