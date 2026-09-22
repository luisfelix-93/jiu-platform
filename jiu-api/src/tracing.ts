import * as dotenv from "dotenv";
dotenv.config();

import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

const isOtelEnabled = process.env.OTEL_ENABLED === "true";
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim();

let sdk: NodeSDK | null = null;

if (isOtelEnabled && otlpEndpoint) {
    if (process.env.OTEL_LOG_LEVEL === "debug") {
        diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
    }

    const headers: Record<string, string> = {};

    // Support Basic Authentication
    const user = process.env.OTEL_USER?.trim();
    const password = process.env.OTEL_PASSWORD?.trim();
    if (user && password) {
        const credentials = Buffer.from(`${user}:${password}`).toString("base64");
        headers["Authorization"] = `Basic ${credentials}`;
    }

    // Support standard OpenTelemetry headers format (key=val,key2=val2)
    if (process.env.OTEL_EXPORTER_OTLP_HEADERS) {
        const rawHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS.split(",");
        for (const item of rawHeaders) {
            const separatorIndex = item.indexOf("=");
            if (separatorIndex > 0) {
                const key = item.substring(0, separatorIndex).trim();
                const value = item.substring(separatorIndex + 1).trim();
                if (key && value) {
                    headers[key] = value;
                }
            }
        }
    }

    // Ensure traces endpoint matches standard OTLP HTTP path
    let traceUrl = otlpEndpoint;
    if (!traceUrl.endsWith("/v1/traces")) {
        traceUrl = traceUrl.replace(/\/+$/, "") + "/v1/traces";
    }

    const traceExporter = new OTLPTraceExporter({
        url: traceUrl,
        headers,
    });

    sdk = new NodeSDK({
        serviceName: process.env.OTEL_SERVICE_NAME || "jiu-api",
        traceExporter,
        instrumentations: [
            getNodeAutoInstrumentations({
                // Disable noisy filesystem instrumentation
                "@opentelemetry/instrumentation-fs": {
                    enabled: false,
                },
            }),
        ],
    });

    try {
        sdk.start();
        console.log(`[OpenTelemetry] Tracing active. Exporting to ${traceUrl} (Basic Auth: ${Boolean(headers["Authorization"])})`);
    } catch (error) {
        console.error("[OpenTelemetry] Error during initialization:", error);
    }

    // Graceful termination
    const handleShutdown = () => {
        if (sdk) {
            sdk.shutdown()
                .then(() => console.log("[OpenTelemetry] SDK terminated gracefully"))
                .catch((err) => console.error("[OpenTelemetry] Error terminating SDK:", err));
        }
    };

    process.on("SIGTERM", handleShutdown);
    process.on("SIGINT", handleShutdown);
} else {
    // Fallback/No-op mode: application continues without remote telemetry
}

export default sdk;
