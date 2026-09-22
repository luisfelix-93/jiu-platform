# PR: feat(observability): Módulo de Observabilidade com Logs (Loki) e Traces (Grafana Tempo)

## 📋 Resumo

Implementação completa do módulo de **Monitoração e Observabilidade** da plataforma Jiu Platform (`jiu-api`), introduzindo **tracing distribuído com OpenTelemetry** exportado para o **Grafana Tempo** e **logging estruturado de alta performance com Pino** exportado para o **Grafana Loki**.

A solução conta com **correlação nativa entre logs e traces** (injeção de `trace_id` e `span_id`), middleware de request tracing com **`X-Request-Id`**, captura centralizada de erros com anotação em spans, e **degradação graciosa** (resiliência total contra ausência de `.env` ou indisponibilidade dos servidores remotos).

---

## 🎯 Principais Funcionalidades

1. **Rastreabilidade Fim-a-Fim (OpenTelemetry + Grafana Tempo)**:
   - Bootstrapping antecipado do OpenTelemetry Node SDK antes do carregamento dos módulos do Node.js.
   - Auto-instrumentação transparente para requisições HTTP, rotas do Express e queries ao banco de dados PostgreSQL (`pg`/TypeORM).
   - Exportação via protocolo OTLP HTTP padrão (`/v1/traces`).
   - **Suporte a Basic Auth**: Injeção automática do cabeçalho `Authorization: Basic <base64>` para servidores protegidos com usuário e senha (`OTEL_USER` / `OTEL_PASSWORD` ou `OTEL_EXPORTER_OTLP_HEADERS`).

2. **Logging Estruturado e Exportação (Pino + Grafana Loki)**:
   - Logger Pino em formato JSON estruturado com labels do serviço (`app="jiu-api"`, `env="production|development"`).
   - **Correlação Automática Logs ↔ Traces**: O logger extrai em tempo real o contexto do span ativo (`trace.getActiveSpan()`) e anexa `trace_id` e `span_id` em cada linha de log emitida.
   - **Sanitização de Dados (Redaction)**: Ocultação automática de campos sensíveis (`authorization`, `cookie`, `password`, `token`, `refreshToken`).
   - Transporte assíncrono em lotes para o Loki (`batching: 5s`) com suporte a Basic Auth (`LOKI_USER` / `LOKI_PASSWORD`).

3. **🛡️ Resiliência & Degradação Graciosa (Zero Impact / Zero Crash)**:
   - **Se as variáveis de ambiente não estiverem configuradas** (ou `OTEL_ENABLED=false` e `LOKI_HOST` vazio):
     - O SDK OpenTelemetry opera em modo no-op silencioso (sem iniciar timers ou requisições de rede).
     - O Pino envia os logs exclusivamente para o `stdout` padrão (formatado com `pino-pretty` em desenvolvimento ou JSON em produção).
     - A aplicação inicializa e roda 100% normalmente sem lançar exceções.
   - **Se o servidor de observabilidade ficar offline**: A flag `silenceErrors: true` e a gestão assíncrona garantem que nenhuma falha de rede da telemetria derrube ou atrase as requisições dos usuários.

4. **Middlewares de Request Tracing e Tratamento Global de Erros**:
   - `requestLogger`: Gera ou propaga `X-Request-Id`, calcula a latência da rota (`duration_ms`), status code e associa usuário autenticado (`userId`, `role`, `academyId`). Níveis customizados reduzem ruídos em `/health` (`trace`) e destacam 4xx (`warn`) e 5xx (`error`).
   - `errorHandler`: Captura exceções não tratadas, marca o span ativo do OpenTelemetry com `ERROR`, anexa a exceção (`recordException`), loga o stack trace e retorna resposta sanitizada ao cliente com o respectivo `requestId`.

5. **Ambiente Local de Homologação (Docker Compose)**:
   - Arquivo `docker-compose.observability.yml` configurado com Grafana, Loki e Tempo.
   - Provisionamento automático de datasources no Grafana com navegação direta **Logs-to-Trace** (clicar no `trace_id` no Loki abre a árvore de spans correspondente no Tempo).

---

## 🔧 Arquivos Criados e Modificados

### Backend (`jiu-api`)

| Arquivo | Status | Descrição |
|---|---|---|
| `src/tracing.ts` | **[NOVO]** | Bootstrapping do OpenTelemetry NodeSDK com OTLP HTTP Exporter, Basic Auth e shutdown gracioso. |
| `src/utils/logger.ts` | **[NOVO]** | Logger Pino centralizado com mixin OTel para injeção de `trace_id`, transporte Loki e sanitização. |
| `src/middlewares/request-logger.middleware.ts` | **[NOVO]** | Middleware Express para medição de latência, captura de contexto e propagação de `X-Request-Id`. |
| `src/middlewares/error-handler.middleware.ts` | **[NOVO]** | Middleware global de tratamento de erros com enriquecimento no span ativo do OpenTelemetry. |
| `src/server.ts` | **[MODIFICADO]** | Importação do `./tracing` no topo absoluto do arquivo para auto-instrumentação prematura. |
| `api/index.ts` | **[MODIFICADO]** | Importação do `../src/tracing` para garantir compatibilidade e observabilidade em serverless. |
| `src/app.ts` | **[MODIFICADO]** | Registro dos middlewares `requestLogger` e `errorHandler`. |
| `.env.example` | **[NOVO]** | Documentação de todas as variáveis de ambiente com seção dedicada à observabilidade. |
| `package.json` | **[MODIFICADO]** | Adição das dependências `@opentelemetry/*`, `pino`, `pino-http`, `pino-loki` e `pino-pretty`. |

### Infraestrutura & Validação

| Arquivo | Status | Descrição |
|---|---|---|
| `docker-compose.observability.yml` | **[NOVO]** | Stack local de observabilidade (Grafana :3001, Loki :3100, Tempo :3200/:4318). |
| `docker/observability/loki.yaml` | **[NOVO]** | Configuração do Loki em modo TSDB local. |
| `docker/observability/tempo.yaml` | **[NOVO]** | Configuração do Tempo recebendo OTLP HTTP/gRPC. |
| `docker/observability/grafana/...` | **[NOVO]** | Provisionamento de datasources no Grafana com correlação derivedField `trace_id`. |

---

## ⚙️ Configuração de Variáveis de Ambiente

No arquivo `.env` da API (`jiu-api/.env`):

```env
# ==============================================================================
# Observabilidade (Grafana Loki & Grafana Tempo)
# ==============================================================================
# Tracing (OpenTelemetry -> Tempo)
OTEL_ENABLED=true
OTEL_SERVICE_NAME=jiu-api
OTEL_EXPORTER_OTLP_ENDPOINT=http://seu-servidor:4318
# Credenciais de autenticação básica para o OTel (se houver)
OTEL_USER=seu-usuario
OTEL_PASSWORD=sua-senha

# Logging Estruturado (Pino -> Loki)
LOKI_HOST=http://seu-servidor:3100
# Credenciais de autenticação básica para o Loki (se houver)
LOKI_USER=seu-usuario
LOKI_PASSWORD=sua-senha

LOG_LEVEL=info
```

> 💡 **Modo Fallback:** Se `OTEL_ENABLED=false` ou `LOKI_HOST` estiverem vazios, a aplicação funcionará normalmente sem tentar conectar a nenhum servidor remoto.

---

## 🧪 Como Testar

### 1. Teste de Degradação Graciosa (sem servidores remotos)
1. Certifique-se de que `OTEL_ENABLED=false` ou não definido no `.env`.
2. Inicie a API:
   ```bash
   cd jiu-api
   npm run dev
   ```
3. Realize chamadas a endpoints da API (`GET /health`, `GET /api/classes`).
4. **Resultado esperado:** A aplicação sobe imediatamente; logs coloridos formatados com `pino-pretty` são impressos no terminal com status e latência; nenhum erro de conexão remota é lançado.

### 2. Teste com Ambiente de Observabilidade Local
1. Suba a stack de observabilidade na raiz do projeto:
   ```bash
   docker compose -f docker-compose.observability.yml up -d
   ```
2. No `jiu-api/.env`, configure:
   ```env
   OTEL_ENABLED=true
   OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
   LOKI_HOST=http://localhost:3100
   ```
3. Inicie a API e faça requisições.
4. Acesse o Grafana em `http://localhost:3001`:
   - No menu **Explore**, selecione o datasource **Loki**: execute `{app="jiu-api"}` para visualizar os logs.
   - Note o campo **TraceID** clicável ao lado da mensagem de log.
   - Clique em **Ver Trace no Tempo** para inspecionar os spans de latência de cada middleware e query do banco de dados.

---

## ✅ Checklist de Verificação

- [x] `npx tsc --noEmit` executado com 0 erros.
- [x] `npm run build` executado com sucesso gerando a pasta `dist/`.
- [x] Princípio de resiliência e fallback testado e documentado.
- [x] Auto-instrumentação do PostgreSQL, Express e HTTP funcionando.
- [x] Redaction de campos sensíveis ativo no logger.
- [x] Suporte a Basic Auth configurado tanto para Tempo quanto para Loki.
- [x] Tarefas sincronizadas no `TODO.md` e no plano de observabilidade.
