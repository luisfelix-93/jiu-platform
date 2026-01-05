import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from "typeorm";
import { Class } from "./Class";
import { User } from "./User";

@Entity("class_enrollments")
@Unique(["classId", "userId"])
export class ClassEnrollment {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Class, (cls) => cls.enrollments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "class_id" })
    class: Class;

    @Column({ name: "class_id" })
    classId: string;

    @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ name: "user_id" })
    userId: string;

    @CreateDateColumn({ name: "enrolled_at" })
    enrolledAt: Date;

    @Column({ default: "active" })
    status: string;
}
