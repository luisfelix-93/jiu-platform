import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique, OneToMany } from "typeorm";
import { Class } from "./Class";
import { User } from "./User";
import { Attendance } from "./Attendance";
import { LessonContent } from "./LessonContent";

@Entity("scheduled_lessons")
@Unique(["classId", "date", "startTime"])
export class ScheduledLesson {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Class, (cls) => cls.lessons, { onDelete: "CASCADE" })
    @JoinColumn({ name: "class_id" })
    class: Class;

    @Column({ name: "class_id" })
    classId: string;

    @Column({ type: "date" })
    date: string;

    @Column({ name: "start_time", type: "time" })
    startTime: string;

    @Column({ name: "end_time", type: "time" })
    endTime: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "professor_id" })
    professor: User;

    @Column({ name: "professor_id", nullable: true })
    professorId: string;

    @Column({ nullable: true })
    topic: string;

    @Column({ default: "scheduled" })
    status: string; // scheduled, in_progress, completed, cancelled

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @OneToMany(() => Attendance, (attendance) => attendance.lesson)
    attendances: Attendance[];

    @OneToMany(() => LessonContent, (content) => content.lesson)
    contents: LessonContent[];
}
