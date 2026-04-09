import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Class } from "./Class";
import { AcademyProfessor } from "./AcademyProfessor";
import { StudentAcademy } from "./StudentAcademy";

@Entity("academies")
export class Academy {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({ type: "text", nullable: true })
    address: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ name: "logo_url", nullable: true })
    logoUrl: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @OneToMany(() => Class, (cls) => cls.academy)
    classes: Class[];

    @OneToMany(() => AcademyProfessor, (ap) => ap.academy)
    professors: AcademyProfessor[];

    @OneToMany(() => StudentAcademy, (sa) => sa.academy)
    students: StudentAcademy[];
}
