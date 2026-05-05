import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { ScheduledLesson } from "./ScheduledLesson";
import { User } from "./User";

@Entity("attendances")
export class Attendance {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => ScheduledLesson, (lesson) => lesson.attendances, { onDelete: "CASCADE", nullable: true })
    @JoinColumn({ name: "lesson_id" })
    lesson: ScheduledLesson;

    @Column({ name: "lesson_id", nullable: true })
    @Index()
    lessonId: string;

    @Column({ name: "is_manual_credit", default: false })
    isManualCredit: boolean;

    @ManyToOne(() => User, (user) => user.attendances, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ name: "user_id" })
    @Index()
    userId: string;

    @Column()
    @Index()
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
