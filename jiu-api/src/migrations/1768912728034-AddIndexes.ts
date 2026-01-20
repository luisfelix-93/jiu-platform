import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexes1768912728034 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ScheduledLesson
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_ScheduledLesson_ClassId" ON "scheduled_lessons" ("class_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_ScheduledLesson_ProfessorId" ON "scheduled_lessons" ("professor_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_ScheduledLesson_Date" ON "scheduled_lessons" ("date")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_ScheduledLesson_ClassDate" ON "scheduled_lessons" ("class_id", "date")`);

        // Attendance
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_Attendance_LessonId" ON "attendances" ("lesson_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_Attendance_UserId" ON "attendances" ("user_id")`);

        // ClassEnrollment
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_ClassEnrollment_ClassId" ON "class_enrollments" ("class_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_ClassEnrollment_UserId" ON "class_enrollments" ("user_id")`);

        // LessonContent
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_LessonContent_LessonId" ON "lesson_content" ("lesson_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_LessonContent_LessonId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ClassEnrollment_UserId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ClassEnrollment_ClassId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_Attendance_UserId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_Attendance_LessonId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ScheduledLesson_ClassDate"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ScheduledLesson_Date"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ScheduledLesson_ProfessorId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ScheduledLesson_ClassId"`);
    }

}
