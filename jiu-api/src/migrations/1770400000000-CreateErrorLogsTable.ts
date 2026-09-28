import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateErrorLogsTable1770400000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "error_logs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "level" character varying(20) NOT NULL DEFAULT 'error',
                "message" text NOT NULL,
                "stack" text,
                "status_code" integer,
                "endpoint" character varying(255),
                "method" character varying(10),
                "user_id" character varying,
                "user_email" character varying(255),
                "ip" character varying(100),
                "user_agent" text,
                "context" jsonb,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_error_logs_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_error_logs_status_code" ON "error_logs" ("status_code")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_error_logs_endpoint" ON "error_logs" ("endpoint")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_error_logs_user_id" ON "error_logs" ("user_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_error_logs_created_at" ON "error_logs" ("created_at")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_error_logs_created_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_error_logs_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_error_logs_endpoint"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_error_logs_status_code"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "error_logs"`);
    }
}
