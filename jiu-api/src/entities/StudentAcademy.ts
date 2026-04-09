import { Entity, Column, CreateDateColumn, ManyToOne, JoinColumn, PrimaryColumn, Index } from "typeorm";
import { Academy } from "./Academy";
import { User } from "./User";

@Entity("student_academies")
export class StudentAcademy {
    @PrimaryColumn({ name: "academy_id", type: "uuid" })
    academyId: string;

    @PrimaryColumn({ name: "student_id", type: "uuid" })
    studentId: string;

    @ManyToOne(() => Academy, (academy) => academy.students, { onDelete: "CASCADE" })
    @JoinColumn({ name: "academy_id" })
    academy: Academy;

    @ManyToOne(() => User, (user) => user.studentAcademies, { onDelete: "CASCADE" })
    @JoinColumn({ name: "student_id" })
    student: User;

    @Column({ name: "is_active", default: true })
    @Index()
    isActive: boolean;

    @CreateDateColumn({ name: "enrolled_at" })
    enrolledAt: Date;
}
