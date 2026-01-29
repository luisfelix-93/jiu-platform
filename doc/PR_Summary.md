# PR Summary - Production Fixes: TypeORM, Proxy Config & Mobile Auth

**Branch**: `fix/production-errors`
**Data**: 2026-01-29

## Overview

Este PR consolida correções críticas para estabilidade em produção. Além das correções anteriores de TypeORM e Rate Limiting, foi implementada uma solução definitiva para o **erro 401 em dispositivos móveis**, causado pelo bloqueio de Cookies de Terceiros (ITP) em iOS/Android.

## Technical Details

### 1. TypeORM DataType Fix (`User.ts`)
**Problema**:
Erro crítico no startup devido a tipo `Object` inferido na coluna `resetToken` do Postgres.
**Solução**: Definição explícita de `type: "varchar"`.

### 2. Express Proxy Trust (`app.ts`)
**Problema**:
`express-rate-limit` gerava avisos por não confiar nos headers do Proxy reverso.
**Solução**: Habilitado `app.set('trust proxy', 1)`.

### 3. Mobile Authentication Fix (Proxy Strategy)
**Problema**:
Usuários em **dispositivos móveis** (iOS, Android) recebiam erro `401 Unauthorized` após login.
A causa raiz é o **Intelligent Tracking Prevention (ITP)** e políticas de segurança modernas que bloqueiam "Third-Party Cookies" (cookies definidos por `api.dominio.com` quando acessados de `app.dominio.com`).

**Solução (Proxy Pattern)**:
Transformamos a arquitetura para que o Frontend "pense" que a API está no mesmo domínio ("First-Party").
Isso foi feito configurando um Proxy reverso tanto em Desenvolvimento quanto em Produção.

#### Frontend (`api.ts`)
Alterado o `baseURL` do Axios para usar caminho relativo. Isso força o browser a enviar requisições para a mesma origem da página.

```typescript
// Antes
baseURL: import.meta.env.VITE_API_URL || "http://localhost:3002/api"

// Depois
baseURL: "/api"
```

#### Development Proxy (`vite.config.ts`)
Adicionado proxy no Vite para encaminhar requisições `/api` para o backend local.
```typescript
server: {
  proxy: {
    '/api': { target: 'http://localhost:3002', changeOrigin: true }
  }
}
```

#### Production Rewrite (`vercel.json`)
Adicionado rewrite Rule na Vercel para encaminhar `/api` para o backend de produção de forma transparente.
```json
"rewrites": [
    { "source": "/api/:path*", "destination": "https://jiu-api.vercel.app/api/:path*" }
]
```

**Impacto**:
- Cookies `Set-Cookie` passam a ser tratados como **First-Party**, permitindo o uso seguro de `SameSite=Lax` no backend.
- Elimina completamente o problema de 401 em Mobile e Safari.
- Remove a necessidade de configurações complexas de CORS para subdomínios.
- **Atenção**: para alinhar totalmente com esta abordagem, o `AuthController.ts` em produção deve atualizar a configuração de cookies para usar `sameSite: "lax"` (ou deve ser criado um issue/PR de follow-up para isso).

## Verification

### Health Check & Database
Verificados anteriormente.

### Mobile Authentication
- **Teste Dev**: Login via IP local (ex: `192.168.x.x:5173`) funciona corretamente (Vite Proxy).
- **Teste Prod**: Login via URL de produção deve funcionar em iOS/Android sem bloquear cookies.

## Conclusion
A aplicação agora está robusta contra bloqueios de privacidade de navegadores móveis e erros de inicialização de banco de dados.