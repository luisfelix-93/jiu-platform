import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResetTokenToUser1769600000000 implements MigrationInterface {
    name = 'AddResetTokenToUser1769600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_token" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_token_expires" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_token"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_token_expires"`);
    }
}