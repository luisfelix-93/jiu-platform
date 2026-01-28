import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGraduationGoal1768931739000 implements MigrationInterface {
    name = 'AddGraduationGoal1768931739000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "next_graduation_goal" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "next_graduation_goal"`);
    }
}
