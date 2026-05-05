import { MigrationInterface, QueryRunner } from "typeorm";

export class AddManualAttendanceCredit1770200000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add is_manual_credit column
        await queryRunner.query(`
            ALTER TABLE "attendances"
            ADD COLUMN "is_manual_credit" boolean NOT NULL DEFAULT false
        `);

        // Make lesson_id nullable to allow manual credits without a lesson
        await queryRunner.query(`
            ALTER TABLE "attendances"
            ALTER COLUMN "lesson_id" DROP NOT NULL
        `);

        // Drop the existing unique constraint on (lesson_id, userId)
        // so manual credits (with null lesson_id) don't conflict
        await queryRunner.query(`
            ALTER TABLE "attendances"
            DROP CONSTRAINT IF EXISTS "UQ_attendances_lesson_id_user_id"
        `);

        // Also try the TypeORM auto-generated constraint name pattern
        await queryRunner.query(`
            ALTER TABLE "attendances"
            DROP CONSTRAINT IF EXISTS "UQ_attendances_lessonId_userId"
        `);

        // Try all common patterns for TypeORM unique constraints
        await queryRunner.query(`
            DO $$
            DECLARE
                constraint_name text;
            BEGIN
                SELECT tc.constraint_name INTO constraint_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.constraint_column_usage ccu
                    ON tc.constraint_name = ccu.constraint_name
                WHERE tc.table_name = 'attendances'
                    AND tc.constraint_type = 'UNIQUE'
                    AND ccu.column_name IN ('lesson_id', 'user_id')
                GROUP BY tc.constraint_name
                HAVING COUNT(*) = 2
                LIMIT 1;

                IF constraint_name IS NOT NULL THEN
                    EXECUTE format('ALTER TABLE attendances DROP CONSTRAINT %I', constraint_name);
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Re-add the unique constraint
        await queryRunner.query(`
            ALTER TABLE "attendances"
            ADD CONSTRAINT "UQ_attendances_lesson_id_user_id"
            UNIQUE ("lesson_id", "user_id")
        `);

        // Make lesson_id NOT NULL again
        await queryRunner.query(`
            ALTER TABLE "attendances"
            ALTER COLUMN "lesson_id" SET NOT NULL
        `);

        // Remove is_manual_credit column
        await queryRunner.query(`
            ALTER TABLE "attendances"
            DROP COLUMN "is_manual_credit"
        `);
    }
}
