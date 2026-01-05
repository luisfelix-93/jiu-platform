import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("student_progress")
export class StudentProgress {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "student_id" })
    student: User;

    @Column({ name: "student_id" })
    studentId: string;

    @Column({ name: "skill_name" })
    skillName: string;

    @Column({ name: "proficiency_level", default: 1 })
    proficiencyLevel: number; // 1-5

    @Column({ name: "last_practiced", type: "date", nullable: true })
    lastPracticed: string;

    @Column({ type: "text", nullable: true })
    notes: string;

    @Column({ name: "professor_feedback", type: "text", nullable: true })
    professorFeedback: string;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}
