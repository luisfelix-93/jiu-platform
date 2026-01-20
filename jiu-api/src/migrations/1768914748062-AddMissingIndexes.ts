import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingIndexes1768914748062 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ScheduledLesson - Professor + Date composite index
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_ScheduledLesson_ProfessorDate" ON "scheduled_lessons" ("professor_id", "date") WHERE "professor_id" IS NOT NULL`);

        // Attendance - Status index
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_Attendance_Status" ON "attendances" ("status")`);

        // StudentProgress - StudentId index
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_StudentProgress_UserId" ON "student_progress" ("student_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_StudentProgress_UserId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_Attendance_Status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ScheduledLesson_ProfessorDate"`);
    }

}
