# PR: Melhorias de Segurança - Security Headers (Backend)

## Visão Geral
Esta pull request implementa o tópico **Security Headers (Backend)** da lista de melhorias de segurança derivada de `doc/security_specs.md`. A mudança principal é a configuração personalizada do middleware `helmet` na aplicação Express, substituindo a configuração padrão por uma mais adequada para uma API REST que não serve conteúdo HTML diretamente.

A branch `feature/security` está **1 commit à frente** da `main`. As modificações incluem **2 arquivos alterados**: a configuração do helmet no `app.ts` e a atualização do checklist `TODO.md`.

## Contexto
Conforme especificado no `TODO.md`, o item **Security Headers (Backend)** exigia:
1. Auditoria da configuração atual do `helmet`
2. Configuração apropriada do `Content-Security-Policy` (CSP)

A configuração padrão do `helmet()` inclui CSP e outros headers voltados para aplicações web que servem HTML. Como a Jiu Platform API é uma API REST pura (JSON), alguns headers como CSP não são necessários e podem até interferir com o frontend que consome a API.

## Mudanças Implementadas

### 1. Configuração Personalizada do Helmet
No arquivo `jiu-api/src/app.ts`, a linha `app.use(helmet())` foi substituída por uma configuração explícita que:

- **Desabilita o CSP**: `contentSecurityPolicy: false` – uma API JSON não precisa de políticas de segurança de conteúdo, pois não serve HTML, scripts ou stylesheets diretamente. O CSP deve ser configurado no frontend que serve a interface web.

- **Configura política de referrer restrita**: `referrerPolicy: { policy: 'strict-origin-when-cross-origin' }` – limita o envio do cabeçalho Referer apenas para origens seguras (HTTPS), protegendo informações sensíveis em URLs.

- **Bloqueia políticas cross-domain**: `xPermittedCrossDomainPolicies: { permittedPolicies: 'none' }` – impede que clientes Adobe (Flash, PDF) carreguem conteúdo cross-domain, mitigando ataques de clickjacking.

- **Força HTTPS com HSTS**: `strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true }` – instrui navegadores a acessar a API apenas via HTTPS por 1 ano, incluindo subdomínios e permitindo pré-carregamento em listas HSTS.

- **Proíbe framing**: `xFrameOptions: { action: 'deny' }` – impede que a API seja embutida em frames (iframe), prevenindo ataques de clickjacking.

### 2. Manutenção dos Headers Padrão do Helmet
A configuração mantém os seguintes headers padrão do helmet (que permanecem ativos por default):
- `X-Content-Type-Options: nosniff` – previne MIME type sniffing
- `X-DNS-Prefetch-Control: off` – desabilita prefetch de DNS para privacidade
- `X-Download-Options: noopen` – previne execução automática de downloads no IE
- `X-XSS-Protection: 0` – desabilita o filtro XSS legado (já obsoleto)

### 3. Atualização do Checklist
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

## Referências
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)