import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSanitizeErrorLogsJob1770500000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Criar função de sanitização no PostgreSQL (retenção padrão de 15 dias)
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION sanitize_error_logs(retention_days INT DEFAULT 15)
            RETURNS INT AS $$
            DECLARE
                deleted_rows INT;
            BEGIN
                DELETE FROM "error_logs"
                WHERE "created_at" < NOW() - (retention_days || ' days')::INTERVAL;

                GET DIAGNOSTICS deleted_rows = ROW_COUNT;
                RETURN deleted_rows;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // 2. Se a extensão pg_cron estiver disponível no ambiente PostgreSQL, agenda o job diário
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron'
                ) THEN
                    BEGIN
                        CREATE EXTENSION IF NOT EXISTS pg_cron;

                        -- Desagenda job anterior se já existir
                        IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sanitize_error_logs_job') THEN
                            PERFORM cron.unschedule('sanitize_error_logs_job');
                        END IF;

                        -- Agenda para rodar todo dia às 03:00 UTC limpando logs com mais de 15 dias
                        PERFORM cron.schedule('sanitize_error_logs_job', '0 3 * * *', 'SELECT sanitize_error_logs(15)');
                    EXCEPTION WHEN OTHERS THEN
                        -- Ignora se o usuário de banco não tiver permissão de superuser/pg_cron
                        RAISE NOTICE 'pg_cron schedule bypassed: %', SQLERRM;
                    END;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
                    BEGIN
                        PERFORM cron.unschedule('sanitize_error_logs_job');
                    EXCEPTION WHEN OTHERS THEN
                        NULL;
                    END;
                END IF;
            END $$;
        `);

        await queryRunner.query(`DROP FUNCTION IF EXISTS sanitize_error_logs(INT);`);
    }
}
