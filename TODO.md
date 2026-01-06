# Security Improvements (To Do)

Derived from `doc/security_specs.md`.

## Recommended Improvements

- [ ] **Secure Token Storage (Frontend)**
    - Implement Secure, HttpOnly cookies for token storage instead of `localStorage` to mitigate XSS risks.
    - Requires backend changes to set cookies on login/refresh.

- [ ] **Rate Limiting (Backend)**
    - Implement `express-rate-limit` to prevent brute-force and DDoS attacks.
    - Focus on `/api/auth/*` routes.

- [ ] **Security Headers (Backend)**
    - Audit `helmet` configuration.
    - Configure `Content-Security-Policy` (CSP) appropriately.

- [ ] **Input Validation Scope (Backend)**
    - Ensure **ALL** controllers (not just Auth) use `zod` (or similar) for input validation.

- [ ] **Type Safety (Backend)**
    - Extend the Express `Request` type definition globally to include `user` (and other custom props) to avoid using `(req as any).user`.
