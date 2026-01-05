import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Academy } from "./Academy";
import { ClassEnrollment } from "./ClassEnrollment";
import { ScheduledLesson } from "./ScheduledLesson";

@Entity("classes")
export class Class {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Academy, (academy) => academy.classes)
    @JoinColumn({ name: "academy_id" })
    academy: Academy;

    @Column({ name: "academy_id", nullable: true })
    academyId: string;

    @Column()
    name: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "jsonb" })
    schedule: object;

    @Column({ name: "max_students", default: 20 })
    maxStudents: number;

    @Column({ name: "is_active", default: true })
    isActive: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @OneToMany(() => ClassEnrollment, (enrollment) => enrollment.class)
    enrollments: ClassEnrollment[];

    @OneToMany(() => ScheduledLesson, (lesson) => lesson.class)
    lessons: ScheduledLesson[];
}
