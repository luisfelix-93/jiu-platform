# Jiu-Jitsu Platform App

Interface web moderna para a plataforma de gestão de academias de Jiu-Jitsu. Desenvolvida com React, TypeScript e TailwindCSS, focada em performance e usabilidade.

## 🚀 Tecnologias

- **Framework**: React 18
- **Build Tool**: Vite
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS (Design System customizado)
- **State Management**: Zustand
- **Formulários**: React Hook Form + Zod
- **Calendário**: React Big Calendar
- **HTTP Client**: Axios
- **Ícones**: Lucide React

## ✨ Funcionalidades

### Autenticação
- Login e Registro seguros.
- Sessão gerenciada via **HttpOnly Cookies** (segurança contra XSS).
- Renovação automática de token (Refresh Token).

### Portal do Professor
- **Dashboard**: Visão geral de alunos, aulas e métricas.
- **Gestão de Aulas**: Criação e agendamento de aulas.
- **Gestão de Turmas**: Criação de turmas e matrícula de alunos.
- **Chamada**: Registro de presença rápido e intuitivo.
- **Upload de Vídeos**: Upload de aulas gravadas com armazenamento em nuvem (Cloudflare R2).

### Portal do Aluno
- **Dashboard**: Acompanhamento de progresso (graduação, presenças).
- **Calendário**: Visualização de aulas agendadas.
- **Histórico**: Registro completo de treinos.

## 🛠️ Instalação e Execução

1. **Entre na pasta do projeto**:
   ```bash
   cd jiu-app
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em `http://localhost:5173`.

## 🔒 Fluxo de Autenticação

A aplicação não armazena tokens sensíveis (Access Token) no `localStorage` ou `sessionStorage`.
Em vez disso, utiliza **Cookies HttpOnly** definidos pelo backend.

- O cliente HTTP (`axios` em `src/lib/api.ts`) está configurado com `withCredentials: true`.
- O navegador envia/recebe os cookies automaticamente em cada requisição para a API.
- Em caso de erro 401 (Não autorizado), a aplicação redireciona para o login.
- O **Logout** realiza a limpeza de segurança (tokens legados) e invalida a sessão no servidor.

## 🗂️ Estrutura de Pastas

```
src/
├── components/     # Componentes Reutilizáveis (UI Kit)
├── layouts/        # Layouts de página (Auth, Dashboard)
├── lib/            # Configurações de libs (Axios, Utils)
├── pages/          # Páginas da aplicação
├── services/       # Camada de serviço (Chamadas API)
├── stores/         # Gerenciamento de Estado Global (Zustand)
├── types/          # Definições de Tipos TypeScript
└── App.tsx         # Rotas e Configuração Principal
```

## 🎨 Design System

O projeto utiliza um sistema de design baseado em TailwindCSS. As cores e tokens estão configurados em `tailwind.config.js`.
Componentes base como Button, Input, Card e Modal estão localizados em `src/components/ui`.
