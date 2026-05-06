import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastGraduationDate1770300000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "last_graduation_date" TIMESTAMP DEFAULT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "last_graduation_date"
        `);
    }
}
