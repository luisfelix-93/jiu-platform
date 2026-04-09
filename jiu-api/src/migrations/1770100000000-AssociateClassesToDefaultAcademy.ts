import { MigrationInterface, QueryRunner } from "typeorm";

export class AssociateClassesToDefaultAcademy1770100000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get the default academy ID
        const defaultAcademy = await queryRunner.query(
            `SELECT "id" FROM "academies" WHERE "name" = 'Academia Padrão' LIMIT 1`
        );

        if (defaultAcademy.length === 0) {
            console.warn("Default academy 'Academia Padrão' not found. Skipping class association.");
            return;
        }

        const defaultAcademyId = defaultAcademy[0].id;

        // Associate all orphan classes (academy_id IS NULL) to the default academy
        const result = await queryRunner.query(
            `UPDATE "classes" SET "academy_id" = $1 WHERE "academy_id" IS NULL`,
            [defaultAcademyId]
        );

        console.log(`Associated ${result[1] ?? 0} orphan classes to default academy (${defaultAcademyId})`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert: set academy_id back to NULL for classes associated by this migration
        // Note: This is a best-effort revert — we can't distinguish classes that were
        // originally NULL from those intentionally linked to the default academy.
        const defaultAcademy = await queryRunner.query(
            `SELECT "id" FROM "academies" WHERE "name" = 'Academia Padrão' LIMIT 1`
        );

        if (defaultAcademy.length > 0) {
            await queryRunner.query(
                `UPDATE "classes" SET "academy_id" = NULL WHERE "academy_id" = $1`,
                [defaultAcademy[0].id]
            );
        }
    }
}
