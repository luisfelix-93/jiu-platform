import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBirthDate1768932000000 implements MigrationInterface {
    name = 'AddBirthDate1768932000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birth_date" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "birth_date"`);
    }
}
