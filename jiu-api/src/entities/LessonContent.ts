import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { ScheduledLesson } from "./ScheduledLesson";
import { User } from "./User";

@Entity("lesson_content")
export class LessonContent {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => ScheduledLesson, (lesson) => lesson.contents, { onDelete: "CASCADE" })
    @JoinColumn({ name: "lesson_id" })
    lesson: ScheduledLesson;

    @Column({ name: "lesson_id" })
    lessonId: string;

    @Column()
    title: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ name: "content_type" })
    contentType: string; // video, pdf, image, note

    @Column({ name: "file_url", nullable: true })
    fileUrl: string;

    @Column({ name: "file_name", nullable: true })
    fileName: string;

    @Column({ name: "file_size", nullable: true })
    fileSize: number;

    @Column({ nullable: true })
    duration: number;

    @Column("text", { array: true, nullable: true })
    positions: string[];

    @Column("text", { array: true, nullable: true })
    techniques: string[];

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "created_by" })
    createdBy: User;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;
}
