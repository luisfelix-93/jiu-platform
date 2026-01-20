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

- [ ] **Input Validation Scope (Backend)**
    - Ensure **ALL** controllers (not just Auth) use `zod` (or similar) for input validation.

- [ ] **Type Safety (Backend)**
    - Extend the Express `Request` type definition globally to include `user` (and other custom props) to avoid using `(req as any).user`.

# Performance Improvements (To Do)

Derived from `doc/performance_specs.md`.

## Checklist de Implementação Imediata

- [ ] **Compression Middleware**
    - Instalar e configurar `compression` no Express app.

- [x] **Database Indexing**
    - Adicionar índices (@Index) nas tabelas `scheduled_lessons`, `attendances`, `class_enrollments` para FKs e colunas de filtro frequente.

- [ ] **Pagination - LessonService**
    - Refatorar `LessonService.listLessons` para aceitar `page` e `limit`.

- [ ] **Pagination - ContentService**
    - Refatorar `ContentService` para paginar conteúdos.

- [x] **Slow Query Logging**
    - Configurar `data-source.ts` para logar queries que demoram mais de 1000ms.

- [x] **Connection Pooling**
    - Configurar `extra.max` em `data-source.ts` (implementado).
