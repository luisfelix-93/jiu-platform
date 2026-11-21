# PR: feat(ci): Pipeline de Verificação de Vulnerabilidades com Fechamento Automático de PRs

## 📋 Resumo Executivo

Este Pull Request implementa um pipeline de segurança em GitHub Actions que executa verificações de vulnerabilidades a cada Pull Request com destino à branch `main`. Caso **qualquer vulnerabilidade seja detectada** — seja em dependências (`npm audit`) ou no código-fonte (análise estática com CodeQL) — o pipeline **comenta no PR com o detalhamento técnico completo das vulnerabilidades encontradas e fecha o PR automaticamente**, eliminando a possibilidade de merge de código vulnerável na `main`.

Hoje o repositório não possui nenhuma barreira automatizada de segurança: um PR pode ser mergeado contendo dependências com CVEs conhecidos ou código com falhas como SQL injection e XSS. Esta feature fecha essa lacuna.

---

## 🎯 Arquivos Adicionados

| Arquivo | Descrição |
|---|---|
| `.github/workflows/security-scan.yml` | Workflow do pipeline de segurança (4 jobs) |
| `docs/security-scan-pipeline.md` | Documentação funcional e operacional do pipeline |

---

## 🔍 Detalhamento Técnico

### Gatilhos e Permissões

- **Trigger:** eventos de `pull_request` na branch `main` nos tipos `opened`, `synchronize` e `reopened` — o pipeline roda na abertura do PR, a cada novo commit na branch e em reaberturas.
- **Permissões mínimas do `GITHUB_TOKEN`:**
  - `contents: read` — checkout do código
  - `pull-requests: write` — comentar e fechar o PR
  - `security-events: write` — publicar resultados do CodeQL na aba **Security > Code scanning**

### Arquitetura: 3 verificações em paralelo + 1 job de enforcement

#### 1. `audit-api` — Auditoria de dependências da API (`jiu-api/`)

1. `npm ci` — instalação limpa e reproduzível a partir do `package-lock.json`
2. `npm audit --json > audit-report.json` — gera relatório estruturado; step executa com `if: always()` e fallback para `{}`, garantindo a existência do relatório mesmo em caso de falha na instalação
3. Upload do relatório como **artifact** (`audit-api`, retenção de 7 dias) para consumo pelo job de enforcement
4. `npm audit --audit-level=high` — **falha o job** se houver vulnerabilidades de severidade `high` ou `critical`

#### 2. `audit-app` — Auditoria de dependências do frontend (`jiu-app/`)

Mesma estratégia do job anterior, executada no diretório `jiu-app/`, gerando o artifact `audit-app`.

#### 3. `codeql` — Análise estática de código

Utiliza o CodeQL (`github/codeql-action@v3`) sobre todo o código JavaScript/TypeScript do repositório:

- `build-mode: none` — análise sem etapa de compilação (adequado para TS executado via ts-node/Vite)
- Conjunto de queries `security-and-quality` — detecta SQL injection, XSS, path traversal, uso inseguro de credenciais, prototype pollution, entre outras classes de vulnerabilidade
- Resultados publicados na aba **Security > Code scanning** do repositório

#### 4. `close-pr-on-vulnerabilities` — Enforcement (comentário + fechamento)

Executa **somente se algum dos 3 jobs anteriores falhar**:

```yaml
if: always() && contains(join(needs.*.result, ','), 'failure')
```

Etapas:

1. **Download dos artifacts** `audit-*` contendo os relatórios JSON do `npm audit`
2. **Montagem do comentário detalhado** (`comment.md`) contendo:
   - Tabela com o resultado (`success`/`failure`) de cada verificação
   - **Vulnerabilidades de dependências:** parse do `npm audit --json` via Node (pré-instalado no runner `ubuntu-latest`), filtrando severidades `high`/`critical` e tratando os 3 formatos de `fixAvailable` (objeto com `nome@versão`, booleano `true`, `false`) — gera tabela **Pacote | Severidade | Correção disponível**
   - **Alertas do CodeQL:** consulta à API de code scanning (`GET /repos/{owner}/{repo}/code-scanning/alerts?ref=refs/heads/{head}&state=open`) filtrada pela branch head do PR — gera tabela **Regra | Severidade | Local (arquivo:linha) | Descrição**; se a API não retornar alertas, o comentário orienta a consulta aos logs do job
   - Instruções de correção passo a passo
3. `gh pr comment --body-file comment.md` — publica o comentário no PR
4. `gh pr close` — **fecha o PR**, bloqueando o merge

### Exemplo de comentário gerado no PR

> ## 🚫 Pull Request fechado automaticamente
>
> | Verificação | Resultado |
> |---|---|
> | Auditoria de dependências (jiu-api) | failure |
> | Auditoria de dependências (jiu-app) | success |
> | Análise estática (CodeQL) | success |
>
> ### 📦 jiu-api — vulnerabilidades em dependências
>
> | Pacote | Severidade | Correção disponível |
> |---|---|---|
> | axios | high | axios@1.13.2 |
>
> ### 🔍 CodeQL — alertas de análise estática
>
> | Regra | Severidade | Local | Descrição |
> |---|---|---|---|
> | js/sql-injection | high | `jiu-api/src/controllers/AuthController.ts:42` | Possible SQL injection... |

### Fluxo de correção para o autor do PR

1. Consulta o comentário automático com as vulnerabilidades apontadas (pacote/versão ou arquivo/linha)
2. **Dependências:** roda `npm audit` / `npm audit fix` no diretório afetado ou atualiza manualmente o `package.json`
3. **CodeQL:** corrige o código nos arquivos/linhas indicados
4. Envia os commits para a branch e abre um novo PR — o pipeline roda novamente

---

## 🧪 Validações Realizadas

1. **Estrutura YAML** verificada (indentação, ausência de tabs, blocos literais)
2. **Lógica de parse do `npm audit --json`** testada localmente com JSON de exemplo cobrindo os 3 formatos de `fixAvailable` e a filtragem por severidade `high`/`critical`
3. **Pré-requisito do `npm ci`** confirmado: `package-lock.json` existe em `jiu-api/` e `jiu-app/`

---

## ⚠️ Limitações Conhecidas

- `npm audit` cobre apenas advisories conhecidos do npm; vulnerabilidades no código próprio são cobertas pelo CodeQL
- Fechamento automático funciona apenas para PRs de branches do próprio repositório (PRs de forks recebem token somente-leitura)
- Code scanning em repositório privado requer GitHub Advanced Security; em repositório público funciona sem configuração adicional
- A listagem de alertas do CodeQL no comentário depende da propagação dos resultados para a API de code scanning; se indisponíveis no momento da consulta, o comentário orienta a verificação dos logs do job

---

## 📚 Documentação

Documentação funcional e operacional completa em [`docs/security-scan-pipeline.md`](../docs/security-scan-pipeline.md).
