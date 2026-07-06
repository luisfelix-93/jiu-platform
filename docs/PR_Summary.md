# PR: feat(academy): Professor Self-Join — Associação direta a academias existentes

## 📋 Resumo

Implementação do fluxo de **self-join** para professores, permitindo que um professor se associe diretamente a uma academia existente na plataforma sem necessidade de intervenção do owner.

**Antes:** ao clicar em "Associar-se à existente" e selecionar uma academia, o sistema exibia apenas um toast informativo (_placeholder_):
> _"Você selecionou a [Academia]. Entre em contato com o responsável para ser adicionado como professor."_

Nenhuma ação real era executada — o fluxo nunca havia sido implementado.

**Depois:** o professor seleciona a academia e é **vinculado automaticamente** como `MEMBER`. O store é atualizado, o onboarding desaparece e a academia fica ativa imediatamente.

---

## 🎯 Motivação

O componente `AcademyOnboarding` oferecia a opção de associação, mas a função `handleSelectAcademy` era um stub que só mostrava um toast. A API backend existente (`addProfessorToAcademy`) exigia que o **OWNER** da academia adicionasse o professor — não existia nenhum endpoint para o professor se auto-associar.

---

## 🔧 Alterações

### Backend (`jiu-api`)

#### 1. `src/services/AcademyService.ts`
- **Novo método:** `joinAcademy(academyId, professorId)`
  - Valida que a academia existe
  - Valida que o usuário é professor/admin
  - Impede duplicata (professor já vinculado)
  - Cria registro `AcademyProfessor` com role `MEMBER`

#### 2. `src/controllers/AcademyController.ts`
- **Novo método:** `join(req, res)`
  - Chama `AcademyService.joinAcademy` com o `userId` do token JWT
  - Retorna `201 Created` em sucesso
  - Retorna `409 Conflict` se professor já pertence à academia
  - Retorna `400 Bad Request` para demais erros de validação

#### 3. `src/routes/academy.routes.ts`
- **Nova rota:** `POST /academies/:id/professors/join`
  - Protegida por `authMiddleware` + `checkRole([PROFESSOR, ADMIN])`
  - Posicionada antes da rota de gerenciamento do owner (`POST /:id/professors`) para evitar conflito de roteamento

### Frontend (`jiu-app`)

#### 4. `src/services/academy.service.ts`
- **Novo método:** `joinAsProfessor(academyId)`
  - Faz `POST /academies/:id/professors/join`

#### 5. `src/components/academy/AcademyOnboarding.tsx`
- **Substituição do placeholder** por fluxo funcional:
  - Adicionado import de `AcademyService`
  - Adicionado estado `isJoining` para prevenir duplo-clique
  - `handleSelectAcademy` agora chama a API, exibe toast de sucesso/erro e recarrega as academias do store
  - Após sucesso, o `fetchMyAcademies()` atualiza o store Zustand → onboarding desaparece automaticamente

---

## 🔀 Nova Rota da API

| Método | Endpoint | Auth | Role | Descrição |
|--------|----------|------|------|-----------|
| `POST` | `/academies/:id/professors/join` | JWT | `professor`, `admin` | Professor se associa à academia como MEMBER |

### Response

**201 Created**
```json
{
  "academyId": "uuid",
  "professorId": "uuid",
  "role": "member",
  "createdAt": "2026-07-06T..."
}
```

**409 Conflict**
```json
{
  "error": "Você já pertence a esta academia"
}
```

**400 Bad Request**
```json
{
  "error": "Academia não encontrada | Apenas professores podem se associar a academias"
}
```

---

## 🛡️ Validações e Segurança

| Validação | Camada | Comportamento |
|-----------|--------|---------------|
| Autenticação JWT | Middleware | Rejeita requests sem token válido |
| Role check (professor/admin) | Middleware | Retorna 403 se não for professor |
| Academia existe | Service | Retorna 400 se ID inválido |
| Usuário é professor | Service | Dupla verificação no service |
| Vínculo duplicado | Service | Retorna 409 se já está associado |
| Duplo-clique | Frontend | Estado `isJoining` bloqueia ação |

---

## 🧪 Cenários de Teste

| Cenário | Esperado |
|---------|----------|
| Professor seleciona academia válida | 201 + vínculo criado + toast sucesso |
| Professor tenta se associar novamente | 409 + toast erro "já pertence" |
| Aluno tenta acessar a rota | 403 Forbidden (middleware) |
| Academia com ID inexistente | 400 + "Academia não encontrada" |
| Duplo-clique rápido | Segundo clique ignorado (isJoining) |

---

## 📁 Arquivos Modificados

```
jiu-api/src/services/AcademyService.ts       (+21 linhas)
jiu-api/src/controllers/AcademyController.ts  (+10 linhas)
jiu-api/src/routes/academy.routes.ts           (+3 linhas)
jiu-app/src/services/academy.service.ts        (+6 linhas)
jiu-app/src/components/academy/AcademyOnboarding.tsx  (~20 linhas alteradas)
```

---

## ⚠️ Breaking Changes

Nenhum. A rota existente `POST /:id/professors` (owner adiciona professor) permanece inalterada.

## 📝 Notas

- O professor entra como `MEMBER` (não `OWNER`). Apenas quem cria a academia é `OWNER`.
- Não há sistema de aprovação — o join é imediato. Caso futuramente se deseje um fluxo de aprovação, basta adicionar um status `pending` na entidade `AcademyProfessor`.
