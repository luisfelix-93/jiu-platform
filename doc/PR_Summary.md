# PR Summary

## Recent Commits

### 20260107: Lógica de envio de email
- **`src/services/EmailService.ts`**:
    - Implementação da classe `EmailService` utilizando a biblioteca `nodemailer`.
    - Adicionado método `sendEmail` para envio genérico de emails.
    - Adicionado método `sendAttendanceConfirmation` para envio de confirmações de presença com template HTML simples.
- **`src/config/email.config.ts`**:
    - Definição das configurações de transporte SMTP (host, port, user, pass) capturadas via variáveis de ambiente.
- **Dependências**:
    - Adição de `nodemailer` e `@types/nodemailer` ao projeto.

### 20260107: Notificações em presença
- **`src/services/AttendanceService.ts`**:
    - Integração com `EmailService` no método `confirmAttendance`.
    - Disparo automático de email de confirmação após o registro de presença com sucesso.
- **`src/controllers/AttendanceController.ts`**:
    - Ajustes para suportar o fluxo de notificação assíncrona (se aplicável), garantindo que a resposta ao cliente não seja bloqueada pelo envio do email.
