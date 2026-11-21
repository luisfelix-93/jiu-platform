# Pipeline de Verificação de Vulnerabilidades

## Objetivo

Garantir que nenhum código com vulnerabilidades de segurança seja mergeado na branch `main`. A cada Pull Request aberto (ou atualizado) com destino à `main`, um pipeline de segurança é executado automaticamente. Se qualquer vulnerabilidade for detectada, o PR é **comentado e fechado automaticamente**, impedindo que a vulnerabilidade chegue à produção.

## Onde está implementado

Workflow: [`.github/workflows/security-scan.yml`](../.github/workflows/security-scan.yml)

## Quando é executado

O pipeline é disparado nos seguintes eventos de Pull Request com destino à branch `main`:

- `opened` — quando um PR é aberto
- `synchronize` — quando novos commits são enviados para a branch do PR
- `reopened` — quando um PR fechado é reaberto

## O que é verificado

O pipeline executa três verificações em paralelo:

### 1. Auditoria de dependências — `jiu-api`

- Executa `npm ci` seguido de `npm audit --audit-level=high` no diretório `jiu-api`.
- Falha se houver vulnerabilidades de severidade **alta** ou **crítica** nas dependências da API.

### 2. Auditoria de dependências — `jiu-app`

- Executa `npm ci` seguido de `npm audit --audit-level=high` no diretório `jiu-app`.
- Falha se houver vulnerabilidades de severidade **alta** ou **crítica** nas dependências do frontend.

### 3. Análise estática de código — CodeQL

- Executa o [CodeQL](https://codeql.github.com/) do GitHub sobre o código JavaScript/TypeScript do repositório (`jiu-api` e `jiu-app`).
- Utiliza o conjunto de queries `security-and-quality`, que detecta vulnerabilidades como SQL injection, XSS, uso inseguro de credenciais, path traversal, entre outras.
- Os alertas ficam disponíveis na aba **Security > Code scanning** do repositório.

## Comportamento em caso de vulnerabilidade

Se **qualquer uma** das três verificações falhar:

1. Um job final (`close-pr-on-vulnerabilities`) é executado.
2. Um comentário **detalhado** é adicionado ao PR contendo:
   - tabela com o resultado de cada verificação;
   - **vulnerabilidades de dependências** (do relatório `npm audit --json`): pacote, severidade e versão com correção disponível;
   - **alertas do CodeQL** (via API de code scanning da branch do PR): regra, severidade, arquivo/linha e descrição;
   - instruções de correção.
3. O PR é **fechado automaticamente**, bloqueando o merge.

Exemplo de comentário gerado:

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

Os relatórios JSON completos do `npm audit` também ficam disponíveis como **artifacts** do workflow run (`audit-api` e `audit-app`, retidos por 7 dias).

Se todas as verificações passarem, o PR segue o fluxo normal de revisão e merge.

## Como corrigir um PR fechado

As vulnerabilidades encontradas já estão listadas no comentário automático do PR. Para corrigi-las:

1. **Vulnerabilidades em dependências:**
   ```bash
   cd jiu-api   # ou jiu-app
   npm audit
   npm audit fix        # corrige automaticamente quando possível
   ```
   Caso o `npm audit fix` não resolva, atualize manualmente a versão do pacote no `package.json`.

2. **Alertas do CodeQL:**
   - Acesse a aba **Security > Code scanning** no GitHub para ver o arquivo, a linha e a descrição de cada alerta.
   - Corrija o código conforme a recomendação do alerta.

3. Envie os commits de correção para a mesma branch e abra um novo Pull Request (ou reabra o anterior, que disparará o pipeline novamente).

## Permissões necessárias

O workflow utiliza apenas o `GITHUB_TOKEN` padrão com as permissões:

| Permissão | Motivo |
|---|---|
| `contents: read` | Checkout do código |
| `pull-requests: write` | Comentar e fechar o PR |
| `security-events: write` | Publicar os resultados do CodeQL na aba Security |

## Limitações conhecidas

- O `npm audit` verifica apenas dependências diretas/transitivas conhecidas na base de advisories do npm; não detecta vulnerabilidades no código escrito pelo time (para isso serve o CodeQL).
- Alertas do CodeQL de severidade informativa podem não falhar o job dependendo da configuração padrão; ajuste o conjunto de queries se for necessário maior rigor.
- Fechamento automático exige que o PR venha de uma branch do próprio repositório (PRs de forks têm token somente-leitura).
