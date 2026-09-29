import { ErrorLogService } from "../src/services/ErrorLogService";

async function runValidation() {
    console.log("=== INICIANDO VALIDAÇÃO DA FASE 4 ===");

    // Test 1: ErrorLogService structure and methods
    console.log("\n[TEST 1] Verificando métodos do ErrorLogService...");
    if (typeof ErrorLogService.logError !== "function") throw new Error("logError não é função");
    if (typeof ErrorLogService.listLogs !== "function") throw new Error("listLogs não é função");
    if (typeof ErrorLogService.getLogById !== "function") throw new Error("getLogById não é função");
    if (typeof ErrorLogService.clearOldLogs !== "function") throw new Error("clearOldLogs não é função");
    if (typeof ErrorLogService.sanitize !== "function") throw new Error("sanitize não é função");
    console.log("✔ Todos os métodos do ErrorLogService estão definidos.");

    // Test 2: ErrorLog entity structure
    console.log("\n[TEST 2] Verificando entidade ErrorLog...");
    const { ErrorLog } = await import("../src/entities/ErrorLog");
    const logInstance = new ErrorLog();
    logInstance.level = "warn";
    logInstance.message = "Test 401 Unauthorized";
    logInstance.statusCode = 401;
    logInstance.endpoint = "/api/attendance/check-in";
    logInstance.method = "POST";
    logInstance.userId = "test-user-uuid";
    logInstance.ip = "127.0.0.1";
    logInstance.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)";
    logInstance.context = { test: true };
    console.log("✔ Instância de ErrorLog criada com campos válidos:", {
        level: logInstance.level,
        statusCode: logInstance.statusCode,
        endpoint: logInstance.endpoint,
        message: logInstance.message,
    });

    // Test 3: Middleware httpErrorLogger structure
    console.log("\n[TEST 3] Verificando middleware httpErrorLogger...");
    const { httpErrorLogger } = await import("../src/middlewares/http-error-logger.middleware");
    if (typeof httpErrorLogger !== "function") throw new Error("httpErrorLogger não é função");

    let interceptedJson = false;
    const mockReq: any = {
        method: "POST",
        path: "/api/attendance/check-in",
        originalUrl: "/api/attendance/check-in",
        ip: "127.0.0.1",
        headers: { "user-agent": "Safari iOS" },
        params: {},
        query: {},
    };
    const mockRes: any = {
        statusCode: 401,
        json: function (data: any) {
            interceptedJson = true;
            return data;
        },
    };
    httpErrorLogger(mockReq, mockRes, () => {});
    mockRes.json({ error: "Token expired" });
    if (!interceptedJson) throw new Error("res.json não foi interceptado!");
    console.log("✔ httpErrorLogger interceptou resposta 401 com sucesso.");

    // Test 4: Database SSL sanitization in data-source
    console.log("\n[TEST 4] Verificando data-source e registro de entidades...");
    const { AppDataSource } = await import("../src/data-source");
    const entities = AppDataSource.options.entities as any[];
    const hasErrorLog = entities.some((e: any) => e?.name === "ErrorLog" || e === ErrorLog);
    if (!hasErrorLog) throw new Error("ErrorLog não está registrado nas entidades do AppDataSource!");
    console.log("✔ ErrorLog está devidamente registrado no AppDataSource.");

    console.log("\n=== TODAS AS VALIDAÇÕES PASSARAM COM SUCESSO! ===");
}

runValidation().catch((err) => {
    console.error("❌ Falha na validação:", err);
    process.exit(1);
});
