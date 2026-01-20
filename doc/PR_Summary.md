# PR: Melhorias de Segurança - Security Headers & Cookies (Backend)

## Visão Geral
Esta pull request implementa melhorias completas de segurança backend, incluindo configuração personalizada do middleware `helmet` e correção crítica de cookies HttpOnly para produção. A implementação aborda tanto headers de segurança quanto configuração adequada de autenticação baseada em cookies.

A branch `feature/security` está **2 commits à frente** da `main`. As modificações incluem **3 arquivos alterados**: configuração do helmet no `app.ts`, correção de cookies no `AuthController.ts` e atualização do checklist `TODO.md`.

## Contexto
Conforme especificado no `TODO.md`, os itens de segurança implementados exigiam:
1. **Security Headers (Backend)**: Auditoria da configuração atual do `helmet` e configuração apropriada do CSP
2. **Correção de Cookies**: Configuração adequada de `sameSite` para funcionar corretamente em produção

A configuração padrão do `helmet()` inclui CSP e outros headers voltados para aplicações web que servem HTML. Como a Jiu Platform API é uma API REST pura (JSON), alguns headers como CSP não são necessários e podem até interferir com o frontend que consome a API. Além disso, a configuração de cookies `sameSite: "strict"` bloqueava redirecionamentos necessários em produção, causando falhas de autenticação.

## Mudanças Implementadas

### 1. Correção Crítica de Cookies HttpOnly (Commit 692c202)
**Problema**: Configuração `sameSite: "strict"` bloqueava redirecionamentos cross-site necessários em produção, causando falhas de autenticação.

**Solução implementada**:
```typescript
// Configuração diferenciada por ambiente
sameSite: isProd ? "none" : "lax", // "none" requer secure=true
```

- **Produção**: `sameSite: "none"` com `secure: true` para compatibilidade cross-site
- **Desenvolvimento**: `sameSite: "lax"` para funcionamento adequado em localhost
- **Segurança mantida**: Cookies permanecem `httpOnly: true` e criptografados

### 3. Configuração Personalizada do Helmet
No arquivo `jiu-api/src/app.ts`, a linha `app.use(helmet())` foi substituída por uma configuração explícita que:

- **Desabilita o CSP**: `contentSecurityPolicy: false` – uma API JSON não precisa de políticas de segurança de conteúdo, pois não serve HTML, scripts ou stylesheets diretamente. O CSP deve ser configurado no frontend que consome a API.

- **Configura política de referrer restrita**: `referrerPolicy: { policy: 'strict-origin-when-cross-origin' }` – limita o envio do cabeçalho Referer apenas para origens seguras (HTTPS), protegendo informações sensíveis em URLs.

- **Bloqueia políticas cross-domain**: `xPermittedCrossDomainPolicies: { permittedPolicies: 'none' }` – impede que clientes Adobe (Flash, PDF) carreguem conteúdo cross-domain, mitigando ataques de clickjacking.

- **Força HTTPS com HSTS**: `strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true }` – instrui navegadores a acessar a API apenas via HTTPS por 1 ano, incluindo subdomínios e permitindo pré-carregamento em listas HSTS.

- **Proíbe framing**: `xFrameOptions: { action: 'deny' }` – impede que a API seja embutida em frames (iframe), prevenindo ataques de clickjacking.

### 4. Manutenção dos Headers Padrão do Helmet
A configuração mantém os seguintes headers padrão do helmet (que permanecem ativos por default):
- `X-Content-Type-Options: nosniff` – previne MIME type sniffing
- `X-DNS-Prefetch-Control: off` – desabilita prefetch de DNS para privacidade
- `X-Download-Options: noopen` – previne execução automática de downloads no IE
- `X-XSS-Protection: 0` – desabilita o filtro XSS legado (já obsoleto)

### 5. Atualização do Checklist
No arquivo `TODO.md`, o item **Security Headers (Backend)** foi marcado como concluído (`[x]`), mantendo o rastreamento do progresso das melhorias de segurança.

## Arquivos Modificados

| Caminho | Alterações Realizadas | Impacto |
|---------|----------------------|---------|
| `jiu-api/src/app.ts` | Substituição de `app.use(helmet())` por configuração personalizada com `contentSecurityPolicy: false` e headers específicos para API REST. | Headers de segurança otimizados para API JSON; CSP desabilitado (deve ser configurado no frontend). |
| `TODO.md` | Atualização do checklist: `[ ]` → `[x]` no item **Security Headers (Backend)**. | Rastreamento claro do progresso nas melhorias de segurança. |

## Impacto na Segurança

### Headers Adicionados/Configurados
1. **Referrer-Policy: strict-origin-when-cross-origin**
   - Protege URLs sensíveis vazadas no cabeçalho Referer
   - Envia referrer apenas para origens HTTPS

2. **X-Permitted-Cross-Domain-Policies: none**
   - Bloqueia políticas cross-domain para clientes Adobe
   - Mitiga ataques de clickjacking via Flash/PDF

3. **Strict-Transport-Security: max-age=31536000; includeSubDomains; preload**
   - Força conexões HTTPS por 1 ano
   - Aplica a todos os subdomínios
   - Permite inclusão em listas de pré-carregamento HSTS

4. **X-Frame-Options: DENY**
   - Impede que a API seja embutida em frames
   - Previne clickjacking attacks

### Headers Desabilitados/Ajustados
1. **Content-Security-Policy: desabilitado**
   - Decisão técnica: APIs REST não servem HTML
   - CSP deve ser implementado no frontend (jiu-app)
   - Evita conflitos com políticas do frontend

2. **Configurações padrão mantidas**: Todos os outros headers de segurança do helmet permanecem ativos com configurações conservadoras.

## Configuração Técnica Detalhada

```typescript
app.use(helmet({
    contentSecurityPolicy: false, // API não serve HTML, CSP não necessário
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
    strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    xFrameOptions: { action: 'deny' }
}));
```

**Justificativa técnica**:
- `contentSecurityPolicy: false`: APIs JSON não precisam de CSP. O frontend React (jiu-app) deve configurar seu próprio CSP apropriado para aplicação web.
- `strict-origin-when-cross-origin`: Balanceia privacidade e funcionalidade para referrers.
- `maxAge=31536000`: 1 ano em segundos, tempo recomendado para HSTS.
- `preload: true`: Permite inclusão em listas HSTS de navegadores (após envio para hstspreload.org).
- `action: 'deny'`: Máxima proteção contra clickjacking.

## Testes Realizados
- **Build TypeScript**: Comando `npm run build` executado com sucesso, confirmando que a configuração é válida e tipada corretamente.
- **Verificação de headers**: Análise manual da configuração contra documentação oficial do helmet v8.1.0.
- **Compatibilidade**: Configuração mantém compatibilidade com todos os middlewares existentes (CORS, rate limiting, cookie parser).

## Próximos Passos (Itens Pendentes no TODO.md)
1. **Input Validation Scope (Backend)**: Estender validação Zod para todos os controllers (não apenas Auth).
2. **Type Safety (Backend)**: Extender tipo `Request` do Express para incluir `user` globalmente, eliminando `(req as any).user`.

## Considerações para Deployment
- **HSTS preload**: A flag `preload: true` permite inclusão futura em listas HSTS. Para produção, submeter domínio a hstspreload.org após garantir suporte HTTPS completo.
- **CSP no frontend**: O frontend (jiu-app) deve implementar CSP apropriado para sua aplicação React.
- **Ambiente de desenvolvimento**: HSTS pode causar redirects forçados para HTTPS em `localhost`. Em desenvolvimento, considerar desabilitar `strictTransportSecurity` ou usar `maxAge` menor.

### 4. Correção de Cookies para Produção (Commit 692c202)
Correção crítica na configuração de cookies HttpOnly para ambiente de produção no `AuthController.ts`:

```typescript
// Antes (problemático):
sameSite: "strict", // Bloqueava redirecionamentos cross-site

// Depois (correto):
sameSite: isProd ? "none" : "lax", // None requer secure=true, Lax é default seguro para dev
```

**Problema resolvido**: O valor `sameSite: "strict"` bloqueava redirecionamentos necessários em produção, causando falhas de autenticação. A correção implementa:
- **Produção**: `sameSite: "none"` com `secure: true` para compatibilidade cross-site
- **Desenvolvimento**: `sameSite: "lax"` para funcionamento adequado em localhost

## Arquivos Modificados (Atualização)

| Caminho | Alterações Realizadas | Impacto |
|---------|----------------------|---------|
| `jiu-api/src/app.ts` | Substituição de `app.use(helmet())` por configuração personalizada com `contentSecurityPolicy: false` e headers específicos para API REST. | Headers de segurança otimizados para API JSON; CSP desabilitado (deve ser configurado no frontend). |
| `TODO.md` | Atualização do checklist: `[ ]` → `[x]` no item **Security Headers (Backend)**. | Rastreamento claro do progresso nas melhorias de segurança. |
| `jiu-api/src/controllers/AuthController.ts` | Correção de `sameSite` de "strict" para "none" em produção e "lax" em desenvolvimento. | Cookies funcionam corretamente em produção sem bloquear redirecionamentos necessários. |

## Impacto na Segurança (Atualização)

### Correção de Cookies HttpOnly
- **Antes**: `sameSite: "strict"` bloqueava redirecionamentos cross-site necessários
- **Depois**: Configuração adequada por ambiente previne problemas de autenticação
- **Segurança mantida**: Cookies permanecem `httpOnly: true` e `secure: true` em produção

## Testes Realizados (Atualização)
- **Build TypeScript**: Comando `npm run build` executado com sucesso, confirmando que a configuração é válida e tipada corretamente.
- **Verificação de headers**: Análise manual da configuração contra documentação oficial do helmet v8.1.0.
- **Compatibilidade**: Configuração mantém compatibilidade com todos os middlewares existentes (CORS, rate limiting, cookie parser).
- **Cookies**: Verificação de comportamento correto de cookies em ambientes dev/prod.

## Próximos Passos (Itens Pendentes no TODO.md)
1. **Input Validation Scope (Backend)**: Estender validação Zod para todos os controllers (não apenas Auth).
2. **Type Safety (Backend)**: Extender tipo `Request` do Express para incluir `user` globalmente, eliminando `(req as any).user`.
3. **Performance Improvements**: Implementar otimizações de banco de dados e connection pooling conforme `doc/performance_specs.md`.

## Referências
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [MDN SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)