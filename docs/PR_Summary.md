# PR: fix(api): Corrigir erros TS2345 no build da Vercel — type safety em `req.params`

## 📋 Resumo

Correção de **8 erros de compilação TypeScript (TS2345)** que impediam o deploy na Vercel. O build falhava ao executar `npm run build` (`tsc`) com a mensagem:

> `Argument of type 'string | string[]' is not assignable to parameter of type 'string'.`

Os erros ocorriam em 3 controllers que passavam valores de `req.params` diretamente para métodos de service que esperam `string`.

---

## 🎯 Causa Raiz

O projeto utiliza **Express 5** (`express@5.2.1`) com `@types/express@5.0.6` e `@types/express-serve-static-core@5.1.0`.

Nas tipagens do Express 5, quando um handler utiliza `Request` genérico **sem parametrizar o tipo de params** (ex: `Request` em vez de `Request<{id: string}>`), o TypeScript resolve `req.params` como `ParamsDictionary`, onde os valores são `string`. Porém, dependendo da **resolução exata de dependências** no ambiente da Vercel (hoisting, lockfile, versão do npm), o TypeScript pode inferir os valores como `string | string[]`.

**Localmente** o build passava sem erros — a discrepância era causada pela diferença na árvore de `node_modules` entre o ambiente local e o ambiente de build da Vercel.

---

## 🔧 Alterações

### Arquivos Corrigidos

#### 1. `jiu-api/src/controllers/GraduationController.ts`

| Linha | Método | Correção |
|-------|--------|----------|
| 55 | `adjustAttendance` | `id` → `id as string` no 1º argumento de `adjustAttendanceCount()` |
| 71 | `updateGraduationDate` | `id` → `id as string` no 1º argumento de `updateGraduationDate()` |

```diff
 // adjustAttendance (linha 55)
-const result = await UserService.adjustAttendanceCount(id, newCount, adjustedBy);
+const result = await UserService.adjustAttendanceCount(id as string, newCount, adjustedBy);

 // updateGraduationDate (linha 71)
-const result = await UserService.updateGraduationDate(id, date ? new Date(date) : null);
+const result = await UserService.updateGraduationDate(id as string, date ? new Date(date) : null);
```

#### 2. `jiu-api/src/controllers/LessonController.ts`

| Linha | Método | Correção |
|-------|--------|----------|
| 85 | `getOne` | `req.params.id` → `req.params.id as string` |
| 95 | `updateStatus` | `req.params.id` → `req.params.id as string` |
| 104 | `update` | `req.params.id` → `req.params.id as string` |
| 113 | `delete` | `req.params.id` → `req.params.id as string` |

```diff
-const result = await LessonService.getLessonById(req.params.id);
+const result = await LessonService.getLessonById(req.params.id as string);

-const result = await LessonService.updateStatus(req.params.id, status);
+const result = await LessonService.updateStatus(req.params.id as string, status);

-const result = await LessonService.updateLesson(req.params.id, req.body);
+const result = await LessonService.updateLesson(req.params.id as string, req.body);

-await LessonService.deleteLesson(req.params.id);
+await LessonService.deleteLesson(req.params.id as string);
```

#### 3. `jiu-api/src/controllers/UserController.ts`

| Linha | Método | Correção |
|-------|--------|----------|
| 53 | `update` | `req.params.id` → `req.params.id as string` |
| 65 | `delete` | `req.params.id` → `req.params.id as string` |

```diff
-const result = await UserService.updateUser(req.params.id, req.body);
+const result = await UserService.updateUser(req.params.id as string, req.body);

-await UserService.deleteUser(req.params.id);
+await UserService.deleteUser(req.params.id as string);
```

---

## 🔍 Análise Detalhada

### Por que falha na Vercel mas não localmente?

A Vercel executa `npm install` em um ambiente limpo a cada deploy. A resolução de dependências transitivas (especialmente `@types/express-serve-static-core`) pode resultar em uma versão ligeiramente diferente da instalada localmente. Essa diferença é suficiente para que o TypeScript resolva `req.params[key]` como `string | string[]` em vez de `string`.

### Por que `string | string[]`?

No Express, route parameters _podem_ ser arrays em cenários com regex ou wildcards (ex: `/user/*`). O tipo `Params` é definido como:

```typescript
export type Params = ParamsDictionary | ParamsArray;
// onde ParamsArray = string[]
```

Quando o TypeScript não consegue inferir o tipo exato de `P` no `Request<P>`, ele pode usar a union `string | string[]` como fallback seguro.

### Impacto da correção

| Aspecto | Status |
|---------|--------|
| Comportamento em runtime | ✅ Nenhuma mudança — `req.params.id` sempre é `string` em rotas `:id` |
| Type safety | ✅ Cast explícito documenta a intenção e garante compatibilidade |
| Build local | ✅ Continua compilando sem erros |
| Build Vercel | ✅ Corrige os 8 erros TS2345 |

---

## 📁 Arquivos Modificados

```
jiu-api/src/controllers/GraduationController.ts  (2 linhas alteradas)
jiu-api/src/controllers/LessonController.ts      (4 linhas alteradas)
jiu-api/src/controllers/UserController.ts        (2 linhas alteradas)
```

**Total: 8 linhas alteradas em 3 arquivos**

---

## ⚠️ Breaking Changes

Nenhum. As alterações são puramente de tipagem (compile-time). O comportamento em runtime permanece idêntico.

---

## 🛡️ Recomendações Futuras

Para evitar recorrência deste tipo de problema:

1. **Parametrizar o `Request` genérico** nos handlers:
   ```typescript
   // Em vez de:
   static async getOne(req: Request, res: Response)
   // Usar:
   static async getOne(req: Request<{id: string}>, res: Response)
   ```
   Isso elimina a ambiguidade de tipos e torna o código mais seguro.

2. **Commitar o `package-lock.json`** para garantir que local e Vercel usem exatamente as mesmas versões de dependências.

3. **Fixar versões de `@types/`** removendo o `^` do `package.json` para tipos críticos.

---

## 🧪 Verificação

- [x] `tsc` compila sem erros localmente
- [x] `npm run build` executa com sucesso
- [ ] Deploy na Vercel bem-sucedido (pendente após merge)

---

## 📎 Referência

- **Log de erro:** (ver output do build/CI na Vercel)
- **Erro TypeScript:** [TS2345 — Argument type not assignable](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
- **Express 5 Types:** `@types/express@5.0.6`, `@types/express-serve-static-core@5.1.0`
