import { Entity, Column, CreateDateColumn, ManyToOne, JoinColumn, PrimaryColumn, Index } from "typeorm";
import { Academy } from "./Academy";
import { User } from "./User";

export enum AcademyRole {
    OWNER = "owner",
    MEMBER = "member",
}

@Entity("academy_professors")
export class AcademyProfessor {
    @PrimaryColumn({ name: "academy_id", type: "uuid" })
    academyId: string;

    @PrimaryColumn({ name: "professor_id", type: "uuid" })
    professorId: string;

    @ManyToOne(() => Academy, (academy) => academy.professors, { onDelete: "CASCADE" })
    @JoinColumn({ name: "academy_id" })
    academy: Academy;

    @ManyToOne(() => User, (user) => user.academyProfessors, { onDelete: "CASCADE" })
    @JoinColumn({ name: "professor_id" })
    professor: User;

    @Column({ type: "varchar", default: AcademyRole.MEMBER })
    @Index()
    role: AcademyRole;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;
}
