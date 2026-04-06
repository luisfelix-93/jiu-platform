import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Attendance } from "./Attendance";
import { AcademyProfessor } from "./AcademyProfessor";
import { StudentAcademy } from "./StudentAcademy";

export enum UserRole {
    ALUNO = "aluno",
    PROFESSOR = "professor",
    ADMIN = "admin",
}

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ name: "password_hash" })
    passwordHash: string;

    @Column()
    name: string;

    @Column({
        type: "enum",
        enum: UserRole,
    })
    role: UserRole;

    @Column({ name: "belt_color", default: "white" })
    beltColor: string;

    @Column({ name: "stripe_count", default: 0 })
    stripeCount: number;

    @Column({ name: "avatar_url", nullable: true })
    avatarUrl: string;

    @Column({ name: "next_graduation_goal", nullable: true })
    nextGraduationGoal: number;

    @Column({ name: "is_active", default: true })
    isActive: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @Column({ name: "birth_date", type: "date", nullable: true })
    birthDate: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    @Column({ name: "reset_token", type: "varchar", nullable: true })
    resetToken: string | null;

    @Column({ name: "reset_token_expires", type: "timestamp", nullable: true })
    resetTokenExpires: Date | null;

    @OneToMany(() => Attendance, (attendance) => attendance.user)
    attendances: Attendance[];

    @OneToMany(() => AcademyProfessor, (ap) => ap.professor)
    academyProfessors: AcademyProfessor[];

    @OneToMany(() => StudentAcademy, (sa) => sa.student)
    studentAcademies: StudentAcademy[];
}

