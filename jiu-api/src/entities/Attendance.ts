import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from "typeorm";
import { ScheduledLesson } from "./ScheduledLesson";
import { User } from "./User";

@Entity("attendances")
@Unique(["lessonId", "userId"])
export class Attendance {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => ScheduledLesson, (lesson) => lesson.attendances, { onDelete: "CASCADE" })
    @JoinColumn({ name: "lesson_id" })
    lesson: ScheduledLesson;

    @Column({ name: "lesson_id" })
    lessonId: string;

    @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ name: "user_id" })
    userId: string;

    @Column()
    status: string; // present, absent, late, excused

    @Column({ name: "check_in_time", type: "timestamp", nullable: true })
    checkInTime: Date;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "checked_by" })
    checkedBy: User;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;
}
