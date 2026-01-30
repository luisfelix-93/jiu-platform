# PR Summary - Fix R2 Upload CORS Error in Production

**Branch**: `fix/r2-cors-production`
**Data**: 2026-01-30

## Overview

Este PR corrige o erro de upload de conteúdo para o Cloudflare R2 Bucket em ambiente de produção. O erro manifestava-se como "Upload failed: network error" e era causado por uma combinação de configuração CORS insuficiente e credenciais truncadas.

## Technical Details

### 1. CORS Configuration (`configure-cors.ts`)
**Problema**:
Requisições XMLHttpRequest de `https://jiu-platform.vercel.app` para o R2 bucket eram bloqueadas com:
```
Access to XMLHttpRequest at 'https://[...].r2.cloudflarestorage.com/...' 
from origin 'https://jiu-platform.vercel.app' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Solução**: 
Adicionado o domínio de produção aos `AllowedOrigins` na configuração CORS do bucket.

```diff
  AllowedOrigins: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:3002",
-     "http://127.0.0.1:5173"
+     "http://127.0.0.1:5173",
+     "https://jiu-platform.vercel.app"
  ]
```

### 2. Credential Issue Identified (Critical)
**Problema Observado**:
Durante a análise do log de erro, foi identificado que o `R2_ACCESS_KEY_ID` presente na URL de upload assinada está **truncado**:
- **Log**: `...bf` (31 caracteres)
- **Esperado**: `...bf9` (32 caracteres, conforme `.env` local)

**Impacto**:
Este truncamento causa erro `403 Access Denied` da Cloudflare, que o navegador reporta como erro de CORS/Network.

**Ação Requerida**: 
A variável de ambiente `R2_ACCESS_KEY_ID` deve ser corrigida nas configurações do projeto Vercel para incluir a chave completa de 32 caracteres.

## Implementation Steps

### Para aplicar a correção CORS:
1. **Obter credenciais de Admin** do R2 (se as atuais não tiverem permissão):
   - Acesse Cloudflare Dashboard → R2 → API Tokens
   - Crie token com permissão "Admin Read & Write"
   - Atualize temporariamente `.env` local

2. **Executar script de configuração**:
   ```bash
   npx ts-node scripts/configure-cors.ts
   ```
   
3. **Verificar sucesso**:
   O script deve exibir "Successfully configured CORS!" (sem erros de `AccessDenied`)

### Para corrigir as credenciais (OBRIGATÓRIO):
1. Acessar **Vercel Dashboard** → Projeto → Settings → Environment Variables
2. Editar `R2_ACCESS_KEY_ID`
3. Colar a chave completa (32 caracteres): 
4. Redesploar a aplicação para aplicar a mudança

## Verification

### CORS Configuration
- ✅ Script `configure-cors.ts` atualizado
- ⏳ Execução do script (requer credenciais Admin)

### Production Upload
- ⏳ Após correção da variável na Vercel, testar upload de vídeo/arquivo em produção
- ✅ Upload deve completar sem erro de CORS
- ✅ Console do navegador não deve exibir erros de "Access-Control-Allow-Origin"

## Conclusion

A solução envolve duas ações:
1. **CORS**: Configuração do bucket R2 para aceitar requisições do domínio de produção.
2. **Credenciais**: Correção urgente da variável `R2_ACCESS_KEY_ID` na Vercel (provavelmente o problema principal).

Após aplicadas ambas as correções, uploads de conteúdo em produção devem funcionar normalmente.