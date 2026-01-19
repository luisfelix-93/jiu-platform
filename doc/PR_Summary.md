# PR: Melhorias de Vídeo - Upload e Armazenamento na Nuvem (Backend)

## Visão Geral
Esta pull request implementa as funcionalidades de upload e armazenamento de vídeos na plataforma Jiu Platform, estabelecendo a base para conteúdo multimídia escalável. A solução utiliza Cloudflare R2 como serviço de armazenamento S3-compatible, permitindo upload direto de vídeos pelo frontend com URLs assinadas para segurança, e acesso público via CDN global.

O commit `6e0f9f6` ("20260119 - configuração de envio de mídia") modifica **10 arquivos** na branch atual, introduzindo **2 novos serviços especializados em vídeo** e **1 novo endpoint de API** para geração de URLs de upload. As mudanças focam na integração completa com Cloudflare R2, incluindo configuração de CORS e estruturação de arquivos por lições.

## Contexto
As aulas de Jiu-Jitsu requerem demonstrações visuais de técnicas através de vídeos didáticos. A implementação anterior era limitada ao armazenamento local/mock, incapaz de suportar volumes maiores ou distribuição global. Esta atualização estabelece uma arquitetura de vídeo escalável com:

- **Armazenamento otimizado**: Cloudflare R2 com custos competitivos por GB armazenado
- **Distribuição global**: CDN integrada para streaming de vídeo de baixa latência
- **Segurança avançada**: URLs pré-assinadas com expiração automática (1 hora)
- **Organização estruturada**: Vídeos categorizados por aulas e biblioteca geral

## Mudanças Implementadas

### 1. Serviço de Armazenamento de Vídeo (StorageService)
Novo arquivo `jiu-api/src/services/StorageService.ts` implementa arquitetura completa para vídeo:

- **Cliente S3 otimizado para R2**: Configurado com endpoint Cloudflare (`https://${accountId}.r2.cloudflarestorage.com`) para compatibilidade S3
- **Gerenciamento de credenciais**: Variáveis de ambiente seguras (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`)
- **URLs pré-assinadas para vídeo**: Método `getUploadUrl()` gera URLs válidas por 1 hora para uploads diretos de arquivos grandes (vídeos)
- **URLs públicas para streaming**: Método `getPublicUrl()` retorna links CDN para reprodução de vídeo
- **Estrutura hierárquica**: Vídeos organizados como `lessons/{lessonId}/{timestamp}-{filename}` para navegação eficiente

### 2. Lógica de Vídeo no ContentService
Atualização de `jiu-api/src/services/ContentService.ts` com funcionalidades específicas para vídeo:

- **Método `generateUploadUrl` otimizado**: Processa `fileName` (incluindo extensões .mp4, .mov), `contentType` (video/mp4, etc.), e `lessonId` opcional
- **Sanitização robusta**: Remove caracteres especiais e normaliza nomes de arquivo para URLs seguras
- **Integração StorageService**: Gera simultaneamente upload URL assinada e public URL para vídeo
- **Categorização por aula**: Vídeos associados a lições específicas ou armazenados na biblioteca geral de técnicas

### 3. API Endpoint para Upload de Vídeo
Nova funcionalidade em `jiu-api/src/controllers/ContentController.ts`:

- **Endpoint `getUploadUrl`**: POST `/api/content/upload-url` dedicado a uploads de vídeo
- **Validação de tipos**: Verifica `fileName` e `contentType` obrigatórios, com suporte a tipos MIME de vídeo
- **Resposta otimizada**: Retorna `{ uploadUrl, publicUrl, key }` para upload direto do cliente
- **Autenticação integrada**: Valida token JWT do professor via `(req as any).user.userId`

### 4. Configuração CORS para Vídeo
Script dedicado `jiu-api/scripts/configure-cors.ts` para buckets de vídeo:

- **Configuração automatizada**: Script TypeScript para setup de CORS em buckets R2
- **Regras de desenvolvimento**: Permite origens localhost para testes de upload de vídeo
- **Métodos de vídeo**: PUT, POST, GET, HEAD, DELETE otimizados para streaming
- **Headers de vídeo**: ETag exposto para validação de integridade de arquivos grandes
- **Cache de 3000s**: Configurações persistentes para sessões de upload

### 5. Infraestrutura e Dependências para Vídeo
- **SDK AWS otimizado**: `@aws-sdk/client-s3@^3.971.0` e `@aws-sdk/s3-request-presigner@^3.971.0` para operações S3/R2 de vídeo
- **Documentação técnica**: Atualização de `jiu-api/docs/API_REFERENCE.md` com especificações de upload de vídeo
- **Especificações de arquitetura**: `jiu-api/docs/project_specs.md` atualizado com fluxo de vídeo
- **README com setup**: Instruções detalhadas para configuração de ambiente R2 para vídeo

## Arquivos Modificados

| Caminho | Alterações Realizadas | Impacto |
|---------|----------------------|---------|
| `jiu-api/src/services/StorageService.ts` (novo) | Serviço de armazenamento otimizado para vídeo com R2, URLs assinadas e estrutura hierárquica. | Base para upload e streaming de vídeos escalável. |
| `jiu-api/src/services/ContentService.ts` | Novo método `generateUploadUrl` com validação de tipos MIME de vídeo e sanitização. | Lógica de negócio para gerenciamento de vídeos por aula. |
| `jiu-api/src/controllers/ContentController.ts` | Método `getUploadUrl` com validação de contentType para vídeo. | Controller REST para geração de URLs de upload de vídeo. |
| `jiu-api/src/routes/content.routes.ts` | Rota `POST /upload-url` para integração de vídeo. | Exposição da API de vídeo no sistema de rotas. |
| `jiu-api/scripts/configure-cors.ts` (novo) | Script de configuração CORS otimizado para uploads de vídeo grandes. | Setup automatizado para buckets de vídeo em R2. |
| `jiu-api/scripts/configure-cors.js` (novo) | Executável Node.js para configuração CORS de vídeo. | Ferramenta de linha de comando para setup rápido. |
| `jiu-api/package.json` | Dependências AWS SDK v3 para operações S3/R2 de vídeo. | Suporte técnico para integração de armazenamento de vídeo. |
| `jiu-api/README.md` | Configuração R2 detalhada com variáveis para vídeo. | Guia de setup para desenvolvedores de vídeo. |
| `jiu-api/docs/API_REFERENCE.md` | Especificações completas do endpoint de upload de vídeo. | Documentação técnica da API de vídeo. |
| `jiu-api/docs/project_specs.md` | Arquitetura atualizada com fluxo de vídeo end-to-end. | Especificações técnicas da infraestrutura de vídeo. |

## Configuração Necessária

### Variáveis de Ambiente R2
```env
R2_ACCOUNT_ID=seu_account_id_cloudflare
R2_ACCESS_KEY_ID=seu_access_key
R2_SECRET_ACCESS_KEY=seu_secret_key
R2_BUCKET_NAME=jiu-platform-videos
R2_PUBLIC_URL=https://seu-dominio.com  # Opcional, para CDN customizada
```

### Configuração CORS
Execute o script após configurar credenciais:
```bash
cd jiu-api && npx ts-node scripts/configure-cors.ts
```

## Impacto no Sistema de Vídeo

### Para Desenvolvedores de Vídeo
- **Upload direto de vídeo**: Frontend pode fazer upload de arquivos grandes (.mp4, .mov) diretamente para R2, reduzindo latência e carga no servidor
- **URLs assinadas para vídeo**: Segurança avançada com expiração automática de 1 hora para proteção de conteúdo
- **Organização hierárquica**: Vídeos automaticamente categorizados por aula ou biblioteca de técnicas
- **Escalabilidade de vídeo**: Infraestrutura preparada para volumes altos de conteúdo multimídia

### Para Professores (Usuários Finais)
- **Upload de vídeos didáticos**: Capacidade de enviar demonstrações de técnicas Jiu-Jitsu diretamente para aulas
- **Biblioteca de vídeo organizada**: Acesso estruturado a vídeos por lição, facilitando reutilização de conteúdo
- **Integração futura**: Base para implementação de drag-and-drop e preview de vídeo no frontend
- **Distribuição global**: Vídeos acessíveis com baixa latência via CDN Cloudflare

### Para Infraestrutura de Vídeo
- **Custos otimizados**: R2 com preços competitivos por GB de vídeo armazenado e transferido
- **Performance de streaming**: CDN global para reprodução de vídeo de alta qualidade
- **Segurança de conteúdo**: URLs pré-assinadas previnem acesso não autorizado a vídeos
- **Persistência**: Vídeos armazenados permanentemente na nuvem (vs armazenamento temporário local)

## Fluxo de Upload de Vídeo Implementado

1. **Professor solicita URL de upload**: Frontend faz POST `/api/content/upload-url` com `fileName: "guard.mp4"`, `contentType: "video/mp4"`, `lessonId: "123"`
2. **API gera URLs assinadas**: StorageService cria upload URL (válida 1h) e public URL para vídeo
3. **Frontend faz upload direto**: PUT do arquivo de vídeo para URL assinada em R2 (streaming direto)
4. **Professor registra vídeo**: POST `/api/content/upload` com `fileUrl` (URL pública) para persistir metadados
5. **Vídeo disponível para alunos**: Acesso público via CDN para streaming e download

## Testes Realizados para Vídeo
- **Build TypeScript**: `npm run build` validado com todas as dependências de vídeo
- **Compatibilidade AWS SDK v3**: Verificação de integração R2 para operações de vídeo
- **Configuração CORS**: Script testado manualmente para buckets de vídeo
- **Estrutura de URLs de vídeo**: Validação de organização `lessons/{lessonId}/{timestamp}-{filename}` para vídeos
- **Geração de URLs assinadas**: Teste de expiração automática (1 hora) para uploads de vídeo

## Próximos Passos para Vídeo
1. **Integração frontend de vídeo**: Implementar componente de upload com drag-and-drop e preview
2. **Validação avançada de vídeo**: Verificar tipos MIME (mp4, mov, avi), tamanhos máximos e codecs
3. **Compressão e otimização**: Adicionar processamento FFmpeg para transcoding e redução de bitrate
4. **Streaming adaptativo**: Implementar HLS/DASH para qualidade variável baseada em conexão
5. **CDN customizado**: Configurar domínio próprio no R2 para branding da plataforma
6. **Analytics de vídeo**: Monitorar visualizações, tempo de reprodução e engajamento
7. **Limpeza automática**: Sistema para remover vídeos não utilizados ou expirados
8. **Backup e replicação**: Estratégia de redundância para vídeos críticos

## Referências Técnicas para Vídeo
- [Cloudflare R2 para Vídeo](https://developers.cloudflare.com/r2/get-started/)
- [AWS SDK S3 Client v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)
- [Pre-signed URLs para Upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)
- [MIME Types para Vídeo](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#video_types)
- [HLS Streaming Protocol](https://developer.apple.com/streaming/)