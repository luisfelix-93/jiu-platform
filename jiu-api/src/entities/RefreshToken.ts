import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("refresh_tokens")
export class RefreshToken {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ name: "user_id" })
    userId: string;

    @Column()
    token: string;

    @Column({ name: "expires_at", type: "timestamp" })
    expiresAt: Date;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;
}
