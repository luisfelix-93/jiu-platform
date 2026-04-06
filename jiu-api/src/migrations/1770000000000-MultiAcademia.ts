import { MigrationInterface, QueryRunner } from "typeorm";

export class MultiAcademia1770000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add logo_url to academies table
        await queryRunner.query(`
            ALTER TABLE "academies"
            ADD COLUMN IF NOT EXISTS "logo_url" varchar
        `);

        // 2. Create academy_professors table (many-to-many professor <-> academy)
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "academy_professors" (
                "academy_id" uuid NOT NULL,
                "professor_id" uuid NOT NULL,
                "role" varchar NOT NULL DEFAULT 'member',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_academy_professors" PRIMARY KEY ("academy_id", "professor_id"),
                CONSTRAINT "FK_academy_professors_academy" FOREIGN KEY ("academy_id")
                    REFERENCES "academies"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_academy_professors_user" FOREIGN KEY ("professor_id")
                    REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        // 3. Create student_academies table (many-to-many student <-> academy)
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "student_academies" (
                "academy_id" uuid NOT NULL,
                "student_id" uuid NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "enrolled_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_student_academies" PRIMARY KEY ("academy_id", "student_id"),
                CONSTRAINT "FK_student_academies_academy" FOREIGN KEY ("academy_id")
                    REFERENCES "academies"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_student_academies_user" FOREIGN KEY ("student_id")
                    REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        // 4. Create indexes for performance
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_academy_professors_role" ON "academy_professors" ("role")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_student_academies_is_active" ON "student_academies" ("is_active")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_student_academies_student" ON "student_academies" ("student_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_academy_professors_professor" ON "academy_professors" ("professor_id")`);

        // 5. Create enum type for academy_professors role (if using native enum)
        // Skipped — using varchar with app-level validation to keep migration simple.

        // 6. Insert default academy
        await queryRunner.query(`
            INSERT INTO "academies" ("id", "name", "address", "phone", "created_at")
            SELECT
                uuid_generate_v4(),
                'Academia Padrão',
                'Endereço a definir',
                '00000000',
                now()
            WHERE NOT EXISTS (
                SELECT 1 FROM "academies" WHERE "name" = 'Academia Padrão'
            )
        `);

        // 7. Get the default academy ID
        const defaultAcademy = await queryRunner.query(`
            SELECT "id" FROM "academies" WHERE "name" = 'Academia Padrão' LIMIT 1
        `);

        if (defaultAcademy.length > 0) {
            const defaultAcademyId = defaultAcademy[0].id;

            // 8. Link all existing professors to default academy as owners
            await queryRunner.query(`
                INSERT INTO "academy_professors" ("academy_id", "professor_id", "role", "created_at")
                SELECT '${defaultAcademyId}', "id", 'owner', now()
                FROM "users"
                WHERE "role" IN ('professor', 'admin')
                AND "id" NOT IN (
                    SELECT "professor_id" FROM "academy_professors"
                    WHERE "academy_id" = '${defaultAcademyId}'
                )
            `);

            // 9. Link all existing students to default academy
            await queryRunner.query(`
                INSERT INTO "student_academies" ("academy_id", "student_id", "is_active", "enrolled_at")
                SELECT '${defaultAcademyId}', "id", true, now()
                FROM "users"
                WHERE "role" = 'aluno'
                AND "id" NOT IN (
                    SELECT "student_id" FROM "student_academies"
                    WHERE "academy_id" = '${defaultAcademyId}'
                )
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_academy_professors_professor"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_student_academies_student"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_student_academies_is_active"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_academy_professors_role"`);

        // Drop tables (cascading will handle FK references)
        await queryRunner.query(`DROP TABLE IF EXISTS "student_academies"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "academy_professors"`);

        // Remove logo_url column
        await queryRunner.query(`ALTER TABLE "academies" DROP COLUMN IF EXISTS "logo_url"`);

        // Remove default academy (optional — keep data by default)
        await queryRunner.query(`DELETE FROM "academies" WHERE "name" = 'Academia Padrão'`);
    }

}
