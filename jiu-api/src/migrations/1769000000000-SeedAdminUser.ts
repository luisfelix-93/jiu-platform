import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcrypt";

export class SeedAdminUser1769000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const passwordHash = await bcrypt.hash("admin123", 10);

        // Using raw SQL to avoid dependency on Entity logic during migration
        await queryRunner.query(`
            INSERT INTO "users" (
                "id", 
                "email", 
                "password_hash", 
                "name", 
                "role", 
                "belt_color", 
                "stripe_count", 
                "is_active", 
                "created_at", 
                "updated_at"
            ) VALUES (
                uuid_generate_v4(), 
                'arcieri.bjj@gmail.com', 
                '${passwordHash}', 
                'Administrador', 
                'admin', 
                'black', 
                0, 
                true, 
                now(), 
                now()
            ) ON CONFLICT ("email") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "users" WHERE "email" = 'admin@jiu.com'`);
    }

}
