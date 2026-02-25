# Pull Request Summary: Fix Neon DB SSL Connection

## 🐛 O Que Foi Corrigido
Ocorria o seguinte erro de certificado SSL ao tentar conectar a API em produção (Vercel) com o banco de dados Postgres gerenciado no Neon:

```
Error during Data Source initialization: Error: self-signed certificate in certificate chain
  code: 'SELF_SIGNED_CERT_IN_CHAIN'
```

### 🔍 Causa Raiz
A conexão falhava pois o Node.js não estava validando o certificado com sucesso (considerando-o *self-signed*) porque alguns drivers ou strings de conexão via URI (como `?sslmode=require` no final da URL do banco) acabam sobrescrevendo configurações nativas do objeto de conexão dentro do TypeORM se a opção explícita de SSL não for injetada da maneira correta na camada subjacente.

A nossa configuração de SSL atual do TypeORM (`ssl: isProd ? { rejectUnauthorized: false } : false`) estava sendo definida apenas no objeto principal (raiz) das configurações. Porém, na inicialização instanciada por uma URL formatada, essa configuração básica muitas vezes era interpretada de forma estrita ou sobrescrita, lançando a exceção.

## 🛠️ Modificações Realizadas
- Arquivo `jiu-api/src/data-source.ts`
  - Foi adicionada a configuração de SSL explícita: `ssl: isProd ? { rejectUnauthorized: false } : false` diretamente dentro do objeto de conexão bruta `extra: {}` (que é repassada pelo driver do TypeORM ao driver básico `pg` do Node).
  - Dessa forma garantimos que a propriedade `rejectUnauthorized: false` assumirá a mais alta prioridade, neutralizando restrições conflitantes provenientes da *connection string* e contornando assim a rejeição da chain de certificados auto-assinada do Neon (ou semelhantes).

## ✅ Como Validar
Após o deploy destas modificações para a Vercel, monitorar os logs de inicialização da API (Serverless Function). O output deverá mostrar sucesso na conexão sem a exception de `SELF_SIGNED_CERT_IN_CHAIN`, permitindo as operações normais do banco de dados na branch de produção.
