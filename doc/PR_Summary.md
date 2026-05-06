# Resumo da Implementação: Sistema de Graduação e Ajustes de Frequência

Este documento detalha o conjunto de implementações realizadas para robustecer o módulo de graduação e a contagem de presenças na plataforma. As alterações englobam tanto ajustes manuais no saldo de aulas quanto a correção do ciclo de graduação (reset do contador após promoção de faixa/grau).

## 🎯 Objetivos
1. **Zerar Aulas na Graduação:** Garantir que o contador de aulas do aluno seja automaticamente reiniciado ao ser promovido, contando apenas aulas realizadas no novo grau/faixa.
2. **Edição da Data de Graduação:** Permitir que o professor corrija manualmente a data de promoções passadas (para ajustar o contador retroativamente).
3. **Ajuste Manual de Aulas:** Dar flexibilidade para adicionar ou remover créditos de aulas diretamente sem depender do calendário, respeitando o histórico real e o ciclo de graduação atual.

---

## 🛠️ Alterações Técnicas

### 1. Banco de Dados (jiu-api)
- **Entidade `User`**:
    - Adicionado o campo `lastGraduationDate` (tipo `timestamp`, *nullable*) para delimitar o início do ciclo atual de contagem de aulas.
- **Entidade `Attendance`**:
    - O campo `lesson_id` agora aceita valores nulos (`nullable: true`) para suportar créditos manuais órfãos.
    - Adicionada a flag `is_manual_credit` (boolean) para diferenciar check-ins físicos de créditos compensatórios.
    - Removida a trava de exclusividade (unique constraint) `lesson_id` vs `user_id` para permitir múltiplos créditos manuais.
- **Migrations**: 
    - `AddManualAttendanceCredit`: Configuração do suporte a aulas manuais.
    - `AddLastGraduationDate`: Criação da coluna de referência temporal de promoção na tabela de usuários.

### 2. Backend (jiu-api)
- **`UserService.ts`**:
    - **Promoção (`promoteStudent`)**: Modificado para registrar a `lastGraduationDate` do usuário sempre para o final do dia da promoção (`23:59:59.999` local). Isso assegura que aulas assistidas *no dia da graduação* não transbordem para o novo contador.
    - **Listagem de Alunos (`listStudentsWithGraduationInfo`)**: A subquery de contagem de presença via `loadRelationCountAndMap` passou a usar um `innerJoin` em `user` para aplicar a condição de filtro `"attendance"."created_at" > COALESCE("userAlias"."last_graduation_date", '1970-01-01')`. Apenas aulas estritamente posteriores à última graduação entram no cálculo matemático do total.
    - **Edição de Data (`updateGraduationDate`)**: Novo método de serviço focado na edição limpa da data.
    - **Ajuste de Aulas (`adjustAttendanceCount`)**: Atualizado para buscar apenas créditos dentro do limite da `lastGraduationDate`, impossibilitando a deleção acidental de presenças de graus anteriores ao remover créditos manualmente.
- **Controllers & Rotas**:
    - `POST /students/:id/adjust-attendance`: Endpoint de crédito manual validado via Zod.
    - `PATCH /students/:id/graduation-date`: Endpoint de manipulação livre da data de graduação.

### 3. Frontend (jiu-app)
- **Página de Graduação (`Graduation.tsx`)**:
    - **Edição de Aulas:** A coluna "Aulas Concluídas" virou editável inline de forma transacional, acionada por um clique simples.
    - **Data da Última Graduação:** Criada a coluna "Última Graduação". O professor pode clicar sobre ela e utilizar um modal *inline* nativo (`<input type="date">`) para redatar a promoção.
    - **Gestão de Timezone:** Para evitar os bugs clássicos de D-1 (data retroceder 1 dia devido ao uso de datas zeradas no fuso UTC), o front agora intercepta a string `YYYY-MM-DD`, fabrica o objeto date usando propriedades extraídas localmente e injeta os milissegundos para forçar `23:59:59.999`.

---

## 📋 Regras de Negócio e Casos de Uso Contemplados

1. **A Aula da Graduação não conta:** Se o aluno fez check-in as 19:00 e foi promovido às 20:00 (ou vice e versa no mesmo dia), a aula de 19:00 **não** será contabilizada no novo grau. O contador dele começará limpo na aula do dia seguinte.
2. **Correção Retroativa Instantânea:** Ao atualizar manualmente a data da "Última Graduação" de um aluno legado, o backend imediatamente exclui do somatório as aulas anteriores à nova data, fazendo o medidor e a régua de progresso saltarem para os valores corretos em tempo real sem qualquer sincronização extra.
3. **Auditoria Cega para Aulas:** É proibido deletar presenças vindas de aplicativo (o sistema restringe a subtração na edição manual apenas para remover "créditos" fantasmas).
4. **Resiliência PostgresSQL:** Todos os TypeORM raw-queries foram sanitizados contra nomes de tabela reservados do banco (`"user"`).

---
**Status Final:** ✅ Funcionalidades implementadas, validadas e prontas.
