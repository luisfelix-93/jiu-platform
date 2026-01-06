# Resumo dos Últimos 3 Commits

Este documento apresenta um resumo detalhado das alterações realizadas nos últimos 3 commits do projeto `jiu-platform`.

## 1. Commit: `2362c2373` - Rate Limiting e Correção de Datas
**Data:** 06/01/2026 14:05
**Autor:** luisfelix-93

### Resumo
Este commit implementa mecanismos de proteção contra abuso (Rate Limiting) na API e corrige um problema de exibição de datas no frontend.

### Alterações Detalhadas
*   **Backend (`jiu-api`)**:
    *   **Dependências**: Adição do pacote `express-rate-limit` e seus tipos.
    *   **Rate Limiting Global (`app.ts`)**: Configurado um limitador global que permite até **100 requisições por 15 minutos** por IP.
    *   **Rate Limiting de Autenticação (`auth.routes.ts`)**: Configurado um limitador mais estrito para rotas de autenticação (`/login`, `/register`), permitindo apenas **5 tentativas por 15 minutos** para prevenir força bruta.
*   **Frontend (`jiu-app`)**:
    *   **Correção de Fuso Horário (`ProfessorHome.tsx`)**: Ajuste na exibição da data das aulas. Foi introduzida a função `addMinutes` com o offset do timezone local para corrigir problemas onde a data aparecia como dia anterior (D-1) devido a conversões de UTC.
*   **Documentação (`TODO.md`)**:
    *   Marcada como concluída a tarefa de "Rate Limiting (Backend)".
    *   Marcada como concluída a tarefa de "Secure Token Storage (Frontend)" (provavelmente concluída no commit anterior, mas marcada neste).

---

## 2. Commit: `6b49804d7` - Atualização de Cookies (Migração para HttpOnly)
**Data:** 06/01/2026 13:55
**Autor:** luisfelix-93

### Resumo
Este commit realiza uma mudança estrutural importante na autenticação, migrando do armazenamento de tokens em `localStorage` para Cookies `HttpOnly` seguros.

### Alterações Detalhadas
*   **Backend (`jiu-api`)**:
    *   **Dependências**: Adição do `cookie-parser`.
    *   **Configuração (`app.ts`)**: Middleware `cookie-parser` ativado para ler cookies das requisições.
    *   **AuthController**:
        *   Os métodos `register`, `login` e `refresh` foram alterados para enviar os tokens `accessToken` (15 min) e `refreshToken` (7 dias) através de **Cookies** em vez do corpo da resposta JSON.
        *   Configuração dos Cookies: `httpOnly: true`, `sameSite: 'strict'`, e `secure: true` (em produção).
    *   **AuthService**: Adicionadas verificações estritas para garantir que `JWT_SECRET` esteja definido.
    *   **Middleware de Auth**: Alterado para buscar o token de acesso primeiramente nos cookies (`req.cookies.accessToken`). Mantém fallback para header Authorization mas o fluxo principal agora é via cookie.
*   **Frontend (`jiu-app`)**:
    *   **Cliente API (`api.ts`)**:
        *   Adicionado `withCredentials: true` para garantir o envio de cookies em requisições CORS.
        *   Removido o interceptor que injetava manualmente o token do `localStorage`.
        *   Simplificado o tratamento de erro 401 (a lógica de refresh complexa no frontend foi reduzida, pois o browser gerencia os cookies automaticamente).
    *   **Store de Auth (`useAuthStore.ts`)**:
        *   Removida a lógica de salvar/ler tokens do `localStorage`.
        *   Login e Logout agora dependem apenas da resposta da API (que define/limpa cookies) e do estado em memória.
        *   `checkAuth` agora tenta refazer o fetch do perfil (`getMe`), confiando que o cookie de sessão será enviado automaticamente.
*   **Documentação (`TODO.md`)**:
    *   Criação/Atualização do arquivo com lista de melhorias de segurança baseadas em specs.

---

## 3. Commit: `06439d31c` - Atualizações de Segurança e Configuração
**Data:** 06/01/2026 13:31
**Autor:** luisfelix-93

### Resumo
Focado em melhorias gerais de segurança, configuração de CORS, scripts de banco de dados e limpeza de logs.

### Alterações Detalhadas
*   **Segurança e CORS (`app.ts`)**:
    *   Configuração dinâmica do **CORS** para aceitar origens do ambiente de desenvolvimento (`localhost:5173`) e produção (`process.env.FRONTEND_URL`).
    *   Bloqueio da rota de debug `/api/debug` em ambiente de produção.
*   **Banco de Dados (`data-source.ts`, `package.json`)**:
    *   Adicionados scripts npm para gerenciamento de migrações TypeORM (`migration:generate`, `migration:run`, `migration:revert`).
    *   Ajuste na configuração do TypeORM para carregar migrações e desativar `synchronize` em produção (embora ainda true em dev).
    *   Criada a migração inicial `InitialSchema`.
*   **Limpeza e Logs**:
    *   Removido log que expunha o corpo da requisição (incluindo senhas) no `AuthController.ts`.
    *   Atualizado `.gitignore` para ignorar pastas de logs e documentação específica.
*   **AuthService**:
    *   Refatoração para garantir que `JWT_SECRET` esteja presente antes de verificar/assinar tokens.
