import pino, { Logger, TransportTargetOptions } from "pino";
import { trace } from "@opentelemetry/api";

const isProduction = process.env.NODE_ENV === "production";
const logLevel = process.env.LOG_LEVEL || (isProduction ? "info" : "debug");
const lokiHost = process.env.LOKI_HOST?.trim();

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

const targets: TransportTargetOptions[] = [];

// Transports que utilizam worker_threads (pino-pretty / pino-loki) apenas fora de Serverless
if (!isServerless) {
    // Target 1: Terminal Output (pino-pretty em dev, json standard em prod)
    if (!isProduction) {
        targets.push({
            target: "pino-pretty",
            level: logLevel,
            options: {
                colorize: true,
                translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
                ignore: "pid,hostname",
            },
        });
    } else {
        targets.push({
            target: "pino/file",
            level: logLevel,
            options: { destination: 1 }, // stdout
        });
    }

    // Target 2: Grafana Loki (apenas se LOKI_HOST estiver configurado e não for serverless)
    if (lokiHost) {
        const lokiOptions: Record<string, any> = {
            host: lokiHost,
            silenceErrors: true, // Garante que falhas no Loki não afetem a API
            batching: {
                interval: 5,
            },
            labels: {
                app: process.env.OTEL_SERVICE_NAME || "jiu-api",
                env: process.env.NODE_ENV || "development",
            },
        };

        const lokiUser = process.env.LOKI_USER?.trim();
        const lokiPassword = process.env.LOKI_PASSWORD?.trim();
        if (lokiUser && lokiPassword) {
            lokiOptions.basicAuth = {
                username: lokiUser,
                password: lokiPassword,
            };
        }

        targets.push({
            target: "pino-loki",
            level: logLevel,
            options: lokiOptions,
        });
    }
}

// Inicialização resiliente de transporte: se falhar ou estiver em serverless, fallback para stdout nativo do Pino
let transport: any = undefined;

if (!isServerless && targets.length > 0) {
    try {
        transport = pino.transport({ targets });
    } catch (err: any) {
        console.warn(
            "[Logger] Falha ao inicializar transporte do Pino. Ativando fallback direto para stdout:",
            err?.message || err
        );
        transport = undefined;
    }
} else if (isServerless && lokiHost) {
    console.log(
        "[Logger] Ambiente Serverless (Vercel) detectado: logs sendo emitidos como JSON estruturado para stdout (compatível com Vercel Log Drains)."
    );
}

export const logger: Logger = pino(
    {
        level: logLevel,
        redact: {
            paths: [
                "req.headers.authorization",
                "req.headers.cookie",
                "headers.authorization",
                "headers.cookie",
                "password",
                "*.password",
                "token",
                "*.token",
                "refreshToken",
                "*.refreshToken",
                "newPassword",
                "*.newPassword",
            ],
            censor: "[REDACTED]",
        },
        mixin: () => {
            const activeSpan = trace.getActiveSpan();
            if (activeSpan) {
                const spanContext = activeSpan.spanContext();
                return {
                    trace_id: spanContext.traceId,
                    span_id: spanContext.spanId,
                };
            }
            return {};
        },
    },
    transport
);

export default logger;
