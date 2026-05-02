# Resumo da Implementação: Ajuste Manual de Presenças

Este documento detalha as alterações realizadas para permitir que os professores ajustem manualmente a contagem de presenças dos alunos no módulo de graduação.

## 🎯 Objetivo
Permitir correções rápidas no histórico de aulas de um aluno (ex: migrações de sistema ou aulas externas) sem a necessidade de criar aulas fictícias no cronograma.

## 🛠️ Alterações Técnicas

### 1. Banco de Dados (jiu-api)
- **Entidade `Attendance`**:
    - O campo `lesson_id` agora aceita valores nulos (`nullable: true`), permitindo presenças não atreladas a uma aula específica.
    - Adicionada a flag `is_manual_credit` (boolean) para diferenciar presenças reais de ajustes manuais.
    - Removida a restrição de unicidade entre `lesson_id` e `user_id`, possibilitando múltiplos créditos manuais para o mesmo usuário.
- **Migration**: Criada a migration `1770200000000-AddManualAttendanceCredit.ts` para aplicar estas mudanças no banco de dados.

### 2. Backend (jiu-api)
- **`UserService.ts`**:
    - Implementado o método `adjustAttendanceCount`.
    - **Lógica de Adição**: Se o novo valor for maior que o atual, o sistema insere N novos registros de `Attendance` com `isManualCredit: true`.
    - **Lógica de Remoção**: Se o novo valor for menor, o sistema remove apenas os registros marcados como crédito manual (os mais antigos primeiro). Presenças reais registradas via check-in não são afetadas.
- **`GraduationController.ts`**: Adicionado o endpoint `adjustAttendance` com validação de entrada via Zod.
- **`graduation.routes.ts`**: Exposta a nova rota `POST /students/:id/adjust-attendance`.

### 3. Frontend (jiu-app)
- **`Graduation.tsx`**:
    - A coluna "Aulas Concluídas" agora é interativa.
    - Ao clicar no número de aulas, um campo de entrada aparece permitindo a edição.
    - Implementado feedback visual de carregamento (`savingAttendance`) e tratamento de erros.
    - Adicionado suporte a teclas de atalho (Enter para salvar, Esc para cancelar).

## 📋 Regras de Negócio Implementadas
1. **Proteção de Histórico**: O sistema nunca deleta uma presença real (check-in em aula) através deste ajuste. Se o professor tentar reduzir o saldo abaixo do número de presenças reais, um erro é exibido.
2. **Auditoria**: Todos os créditos manuais são criados com uma nota padrão indicando que foram adicionados por um professor.
3. **Cálculo Automático**: O total de aulas exibido na plataforma (`attendanceCount`) continua sendo uma contagem dinâmica, garantindo que o ajuste manual reflita em todos os dashboards e relatórios instantaneamente.

---
**Status:** ✅ Implementado e pronto para testes.
