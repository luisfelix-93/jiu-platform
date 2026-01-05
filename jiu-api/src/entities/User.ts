import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

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

    @Column({ name: "is_active", default: true })
    isActive: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}
