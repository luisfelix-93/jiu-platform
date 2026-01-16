import nodemailer from "nodemailer";
import { emailConfig } from "../config/email.config";

export class EmailService {
    private static transporter: nodemailer.Transporter | null = null;

    private static getTransporter() {
        if (!this.transporter) {
            this.transporter = nodemailer.createTransport({
                host: emailConfig.host,
                port: emailConfig.port,
                secure: emailConfig.secure,
                auth: {
                    user: emailConfig.auth.user,
                    pass: emailConfig.auth.pass,
                },
            });
        }
        return this.transporter;
    }

    private static isValidEmail(email: string): boolean {
        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static async sendMail(to: string, subject: string, html: string) {
        try {
            if (!this.isValidEmail(to)) {
                throw new Error("Invalid recipient email address");
            }

            const transporter = this.getTransporter();

            // Simple fallback: strip tags. ideally use a library like 'html-to-text' but this suffices for now
            const text = html.replace(/<[^>]*>/g, "");

            const info = await transporter.sendMail({
                from: emailConfig.from,
                to,
                subject,
                html,
                text, // Helper for clients that don't support HTML
            });

            console.log("Email sent: %s", info.messageId);
            return info;
        } catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    }
}
