# PR: fix(multi-academy): telas de aulas e turmas retornando vazio

## Summary

Corrige um bug crítico onde as telas de **Aulas** (Lessons) e **Turmas** (Classes) — tanto no painel do Professor quanto do Admin — apareciam sempre vazias, mesmo com dados existentes no banco.

Também corrige um **timeout de conexão** ao rodar migrations contra o banco Neon em produção.

---

## Problem

Após a implementação do sistema multi-academia (migration `MultiAcademia`), todas as listagens de turmas e aulas passaram a retornar `[]`. Os dados existiam no banco, mas nunca eram exibidos no frontend.

**Telas afetadas:**
- `ProfessorClasses.tsx` — lista de turmas do professor
- `ProfessorLessons.tsx` — lista de aulas do professor
- `AdminClasses.tsx` — lista de turmas (admin)
- `AdminLessons.tsx` — lista de aulas (admin)

---

## Root Cause

Dois bugs interligados causavam o problema:

### Bug 1: Classes criadas sem `academy_id`

O `ClassController.create` repassava `req.body` diretamente para `ClassService.createClass()` sem injetar `academyId`. Como o campo `academy_id` na entidade `Class` é `nullable: true`, as turmas eram salvas com `academy_id = NULL`.

```
ClassController.create(req.body)
  └── ClassService.createClass(data)  → academy_id = NULL ❌
```

### Bug 2: Filtro por academy retornava array vazio

O `academyScopeMiddleware` (aplicado em todas as rotas de classes e lessons) sempre preenche `req.user.academyIds`. O `ClassService.listClasses()` verifica esse array:

```typescript
// ClassService.ts — linhas 17-21
if (academyIds !== undefined) {
    if (academyIds.length === 0) {
        return [];  // ← Array vazio → retorna vazio imediatamente
    }
    return classRepository.find({
        where: { academyId: In(academyIds) }  // ← Nunca bate com NULL
    });
}
```

**Cenário 1**: Usuário sem academia → `academyIds = []` → retorna `[]`
**Cenário 2**: Usuário com academia → filtra `academy_id IN (uuid)` → classes têm `NULL` → 0 matches

O mesmo efeito cascata atingia as aulas (lessons), que fazem `JOIN` com a tabela `classes` e filtram por `class.academy_id`.

```
Frontend: GET /api/classes
  → authMiddleware ✅
  → academyScopeMiddleware → academyIds = ['uuid-da-academia']
  → ClassService.listClasses(['uuid-da-academia'])
  → WHERE academy_id IN ('uuid-da-academia')
  → Classes com academy_id = NULL → Match = 0 → retorna [] ❌
```

---

## Fix

### 1. Migration: associar dados existentes à academia padrão

**Arquivo:** `jiu-api/src/migrations/1770100000000-AssociateClassesToDefaultAcademy.ts`

```sql
UPDATE classes SET academy_id = '<default-academy-id>' WHERE academy_id IS NULL;
```

Busca a "Academia Padrão" (criada na migration `MultiAcademia`) e associa todas as turmas órfãs a ela.

---

### 2. Backend: injetar `academyId` ao criar turma

**Arquivo:** `jiu-api/src/controllers/ClassController.ts`

```diff
 static async create(req: Request, res: Response) {
     try {
-        const result = await ClassService.createClass(req.body);
+        const academyIds = req.user?.academyIds || [];
+
+        let academyId = req.body.academyId;
+        if (academyId) {
+            if (!academyIds.includes(academyId)) {
+                return res.status(403).json({ error: "Você não pertence a esta academia" });
+            }
+        } else if (academyIds.length > 0) {
+            academyId = academyIds[0];
+        }
+
+        if (!academyId) {
+            return res.status(400).json({ error: "Nenhuma academia encontrada." });
+        }
+
+        const result = await ClassService.createClass({ ...req.body, academyId });
         res.status(201).json(result);
```

**Lógica:**
- Se o frontend enviar `academyId` → valida que pertence ao usuário
- Se não enviar → usa a primeira academia do usuário (fallback)
- Se não tem academia nenhuma → retorna erro 400

---

### 3. Frontend: seletor de academia nos formulários

**Arquivos:** `ProfessorClasses.tsx` e `AdminClasses.tsx`

- Busca academias do professor/admin via `AcademyService.getMyAcademies()` no `useEffect`
- Se o usuário tem **1 academia** → preenche automaticamente (sem mostrar seletor)
- Se tem **+1 academia** → exibe `<select>` para escolher
- Envia `academyId` junto com os dados da turma ao criar/editar

```diff
+import { AcademyService } from '../../services/academy.service';
+import type { Academy } from '../../types/academy';

 const createClassSchema = z.object({
     name: z.string().min(3),
+    academyId: z.string().min(1, "Selecione uma academia"),
     // ...
 });
```

---

### 4. Fix: timeout de conexão com Neon

**Arquivo:** `jiu-api/src/data-source.ts`

```diff
-connectionTimeoutMillis: 2000,
+connectionTimeoutMillis: 10000,
```

O timeout de 2 segundos era insuficiente para o cold start do Neon serverless (3-5s).

---

## Files Changed

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `jiu-api/src/migrations/1770100000000-AssociateClassesToDefaultAcademy.ts` | NEW | Associa classes órfãs à academia padrão |
| `jiu-api/src/controllers/ClassController.ts` | MODIFY | Injeta `academyId` ao criar turma |
| `jiu-api/src/data-source.ts` | MODIFY | Aumenta connection timeout para 10s |
| `jiu-app/src/pages/professor/ProfessorClasses.tsx` | MODIFY | Adiciona seletor de academia |
| `jiu-app/src/pages/admin/AdminClasses.tsx` | MODIFY | Adiciona seletor de academia |

---

## Type of Change

- [x] Bug fix (non-breaking)
- [x] Database migration (data fix)
- [x] Infrastructure (timeout config)

## Testing

### Local
1. ✅ Migration `AssociateClassesToDefaultAcademy` executada com sucesso
2. ✅ Servidor API reiniciado sem erros

### Produção
1. ✅ Migration executada com sucesso no Neon (após fix de timeout)

### Verificação funcional
1. Login como professor → **Turmas** deve listar turmas existentes
2. Login como admin → **Turmas** e **Aulas** devem listar dados
3. Criar nova turma → deve ser criada com `academy_id` preenchido
4. Se professor tem multi-academias → seletor de academia aparece no formulário
