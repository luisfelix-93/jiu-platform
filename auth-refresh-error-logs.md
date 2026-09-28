# Plano de Implementação: Resiliência de Autenticação, Compatibilidade Multi-Dispositivo e Tabela de Logs de Erros

**Slug:** `auth-refresh-error-logs.md`  
**Data:** 28/09/2026  
**Status:** Pronto para Execução  

---

## 1. Visão Geral e Objetivos

### Problema Identificado
1. **Perda de Sessão Silenciosa (Sessão Expirada após 15 min):** O `accessToken` possui TTL de 15 minutos em cookie HttpOnly. No frontend (`jiu-app`), o Axios não possui interceptor de refresh token. Quando o aluno tenta abrir a aula ou confirmar presença após 15 minutos de inatividade/uso contínuo, a requisição é rejeitada com `401 Unauthorized`. O modal abre e fica congelado ("a tela fica aberta") com o alerta de erro.
2. **Incompatibilidade com Safari / Navegadores Restritos (iOS/Brave):** Cookies configurados com `SameSite="None"` são bloqueados ou descartados pelo ITP do Safari (iOS) ou escudos do Brave. Como o frontend consome a API através de reverse proxy do Vercel (`/api/*`), o cookie opera como mesma origem e deve utilizar `SameSite="Lax"`.
3. **Falta de Tabela de Auditoria de Erros no Banco de Dados:** Atualmente, os erros dependem exclusivamente dos logs em tempo de execução do Vercel/Pino/Loki. Erros enfrentados por alunos em produção não ficam catalogados no PostgreSQL para consulta rápida.
4. **Ruído e Warnings de Segurança no Runtime:** Warnings de SSL do PostgreSQL (`sslmode=require`) e ruído de scanners públicos de vulnerabilidades externas (como sondagens do Metabase).

### Objetivos do Projeto
- Implementar **renovação automática e silenciosa de tokens (Silent Refresh Interceptor)** no Axios com fila de requisições pendentes.
- Ajustar política de cookies para **`SameSite: "lax"`**, garantindo compatibilidade total no Safari (iOS), Chrome e Brave.
- Criar a entidade e migration da tabela **`error_logs`** no PostgreSQL para registrar exceções, falhas 500 e metadados contextuais (rota, usuário, IP, stack trace, status code).
- Adicionar serviço centralizado de registro de erros no backend e capturador no `error-handler.middleware.ts`.
- Criar endpoint protegido para administradores consultarem os logs de erro (`GET /api/admin/error-logs`).
- Ajustar configuração de conexão com PostgreSQL para sanar o warning de SSL do `pg-connection-string`.

---

## 2. Arquitetura e Componentes Impactados

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (jiu-app)                          │
│                                                                 │
│  [ Axios api.ts ] ───(401 Detectado)───► [ POST /auth/refresh ] │
│         │                                         │             │
│         │ (Fila de retry com novo token)          │             │
│         ▼                                         ▼             │
│  [ StudentHome / Calendar ]              [ Novo accessToken ]   │
│  (UX resiliente, sem travar modal)                              │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP Cookies (SameSite: Lax)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (jiu-api)                           │
│                                                                 │
│  [ AuthController.ts ] ──► Cookies: SameSite "lax", HttpOnly    │
│  [ ErrorHandler / Logger ] ──► Grava em [ Tabela: error_logs ]  │
│  [ Admin Routes ] ──► GET /api/admin/error-logs                 │
│  [ data-source.ts ] ──► Ajuste pg SSL config                    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BANCO DE DADOS (PostgreSQL)                 │
│                                                                 │
│  Tabela `error_logs`:                                           │
│  • id (uuid), level, message, stack, status_code, endpoint,      │
│    method, user_id, user_email, ip, user_agent, context,         │
│    created_at                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Divisão de Fases e Tarefas

### Fase 1: Resiliência de Autenticação no Frontend (`jiu-app`)
**Especialista:** `frontend-specialist`

- [ ] **TASK-F1: Implementar Interceptor de Refresh Token Automático no Axios**
  - Arquivo: `jiu-app/src/lib/api.ts`
  - Descrição:
    - Adicionar interceptor de resposta para capturar `401 Unauthorized`.
    - Implementar mecanismo de fila (`failedQueue`): se múltiplos requests dispararem 401 ao mesmo tempo, apenas **uma** chamada de refresh (`/auth/refresh`) é feita; as outras aguardam na fila e são reexecutadas automaticamente após o sucesso.
    - Se a renovação falhar com 401 (refresh token expirado após 7 dias), limpar estado de autenticação no `useAuthStore` e redirecionar para `/login`.
    - Garantir que a própria rota `/auth/refresh` e rotas de login/registro não entrem em loop infinito de interceptação.

- [ ] **TASK-F2: Tratamento de Erro e UX no Modal de Presença do Aluno**
  - Arquivos: `jiu-app/src/pages/student/StudentHome.tsx` e `jiu-app/src/pages/student/StudentCalendar.tsx`
  - Descrição:
    - Tratar falhas no `getAttendanceStatus` e `checkIn` para exibir toast/alerta amigável (via Sonner ou alerta visual na interface) em vez de manter a tela congelada sem resposta.
    - Desabilitar ou indicar estado de erro de conexão caso a requisição falhe.

---

### Fase 2: Compatibilidade de Cookies e Sanar Alertas no Backend (`jiu-api`)
**Especialista:** `backend-specialist`

- [ ] **TASK-B1: Ajuste da Política de Cookies (SameSite: Lax)**
  - Arquivo: `jiu-api/src/controllers/AuthController.ts`
  - Descrição:
    - Modificar `setAuthCookies`:
      - Alterar `sameSite: isProd ? "none" : "lax"` para `sameSite: "lax"`.
      - Manter `secure: isProd` e `httpOnly: true`.
      - Justificativa: Como a aplicação no navegador acessa a API através do mesmo domínio (via Vercel rewrite `arcieribjjteam.com.br/api/*`), o cookie é tratado como primário (first-party). `SameSite="Lax"` garante envio confiável e elimina bloqueios de terceiros no Safari (iOS), Chrome e Brave.

- [ ] **TASK-B2: Resolução do Alerta de SSL do PostgreSQL**
  - Arquivo: `jiu-api/src/data-source.ts`
  - Descrição:
    - Configurar explicitamente as opções de SSL no driver `pg` para evitar que `pg-connection-string` emita o aviso `SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'`.
    - Se a URL contiver `sslmode=require`, ajustar para o formato compatível ou passar a configuração de SSL programática `ssl: { rejectUnauthorized: false }` no pool `extra`.

---

### Fase 3: Criação da Tabela de Logs de Erros (`error_logs`)
**Especialista:** `database-architect` & `backend-specialist`

- [ ] **TASK-DB1: Entidade e Migration TypeORM para `ErrorLog`**
  - Arquivo: `jiu-api/src/entities/ErrorLog.ts`
  - Campos:
    - `id` (UUID, Primary Key)
    - `level` (varchar: 'error' | 'warn' | 'fatal')
    - `message` (text)
    - `stack` (text, nullable)
    - `statusCode` (integer, nullable, index)
    - `endpoint` (varchar, nullable, index)
    - `method` (varchar 10, nullable)
    - `userId` (varchar, nullable, index)
    - `userEmail` (varchar, nullable)
    - `ip` (varchar, nullable)
    - `userAgent` (text, nullable)
    - `context` (jsonb / text, nullable - para salvar corpo seguro ou parâmetros)
    - `createdAt` (timestamp with timezone, index)
  - Registrar entidade no `AppDataSource` (`jiu-api/src/data-source.ts`).
  - Gerar e aplicar migration correspondente.

- [ ] **TASK-DB2: Serviço de Persistência Assíncrona de Logs (`ErrorLogService`)**
  - Arquivo: `jiu-api/src/services/ErrorLogService.ts`
  - Descrição:
    - Criar método estático `logError(data)` que salva na tabela de forma segura e não bloqueante.
    - Se a gravação no banco falhar, capturar e registrar no logger do Pino sem derrubar a requisição principal (isolamento de falhas).

- [ ] **TASK-DB3: Integração no `error-handler.middleware.ts`**
  - Arquivo: `jiu-api/src/middlewares/error-handler.middleware.ts`
  - Descrição:
    - Sempre que uma exceção 500 ou erro não tratado ocorrer na API, disparar o `ErrorLogService.logError` preenchendo automaticamente rota, método, usuário autenticado (`req.user`), IP e stack trace.

- [ ] **TASK-DB4: Endpoint de Consulta para Administradores (`GET /api/admin/error-logs`)**
  - Arquivos: `jiu-api/src/routes/admin.routes.ts` ou `user.routes.ts` / `AdminController.ts`
  - Descrição:
    - Rota restrita a administradores (`checkRole([UserRole.ADMIN])`).
    - Paginação (`page`, `limit`), filtros opcionais por `statusCode`, `endpoint` e intervalo de datas.

---

### Fase 4: Validação, Testes e Verificação de Regressão
**Especialista:** `qa-automation-engineer` & `debugger`

- [ ] **TASK-V1: Validação de Compilação e Tipagem**
  - Executar verificação de tipos e compilação em ambos os projetos:
    - `cd jiu-api && npm run build`
    - `cd jiu-app && npm run build`
- [ ] **TASK-V2: Teste do Fluxo de Expiração e Renovação Automática**
  - Simular token expirado no frontend e verificar se:
    1. A chamada interceptada renova o token via `/api/auth/refresh` silenciosamente.
    2. A ação de confirmação de presença é concluída com sucesso sem exigir logout ou deslogar o aluno.
- [ ] **TASK-V3: Teste de Disparo e Gravação de Log de Erro**
  - Forçar uma falha de teste (ex: requisição com erro simulado) e verificar se o registro é persistido na tabela `error_logs` com todos os campos preenchidos.
- [ ] **TASK-V4: Verificação de Compatibilidade Cross-Browser**
  - Validar funcionamento em Chrome, Safari e Firefox (confirmando que cookies `SameSite=Lax` trafegam corretamente).

---

## 4. Matriz de Agentes Responsáveis

| Agente | Responsabilidade |
|--------|------------------|
| `frontend-specialist` | Interceptor Axios (Silent Refresh), UX do modal de presença em `jiu-app`. |
| `backend-specialist` | Ajuste de cookies (`SameSite: Lax`), rota administrativa de logs e resolução de warnings no `jiu-api`. |
| `database-architect` | Modelagem da entidade `ErrorLog`, migration TypeORM e índices de performance. |
| `debugger` & `qa-automation-engineer` | Validação de ponta a ponta, testes de expiração de token e checagem de logs. |

---

## 5. Critérios de Aceite

1. **Presença Concluída sem Congelar a Tela:** O aluno consegue confirmar presença mesmo após longos períodos de inatividade, pois o Axios renova o token automaticamente em segundo plano.
2. **Compatibilidade Safari/Brave:** Nenhum erro de autenticação decorrente de bloqueio de cookies `SameSite=None`.
3. **Logs Armazenados no Banco:** Qualquer erro não tratado na API é registrado na tabela `error_logs`, permitindo consulta rápida de diagnóstico.
4. **Builds Limpos:** Ambos os pacotes (`jiu-api` e `jiu-app`) compilam com zero erros de TypeScript.
