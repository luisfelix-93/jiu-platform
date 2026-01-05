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
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        })
        .catch((err) => {
            console.error("Error during Data Source initialization:", err);
        });
});
