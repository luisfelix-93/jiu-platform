import "./tracing";
import { AppDataSource } from "./data-source";
import app from "./app";
import * as dotenv from "dotenv";

dotenv.config();


import { ensureDatabaseExists } from "./utils/ensure-db";

const PORT = process.env.PORT || 3000;

ensureDatabaseExists().then(() => {
    AppDataSource.initialize()
        .then(() => {
            console.log("Data Source has been initialized!");

            // Sanitiza logs com mais de 15 dias na inicialização e a cada 24 horas
            import("./services/ErrorLogService").then(({ ErrorLogService }) => {
                ErrorLogService.sanitize(15).catch(() => {});
                setInterval(() => {
                    ErrorLogService.sanitize(15).catch(() => {});
                }, 24 * 60 * 60 * 1000);
            });

            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        })
        .catch((err) => {
            console.error("Error during Data Source initialization:", err);
        });
});
