import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index
} from "typeorm";

export type ErrorLogLevel = "error" | "warn" | "fatal";

@Entity("error_logs")
export class ErrorLog {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 20, default: "error" })
    level: ErrorLogLevel;

    @Column({ type: "text" })
    message: string;

    @Column({ type: "text", nullable: true })
    stack?: string;

    @Index()
    @Column({ name: "status_code", type: "int", nullable: true })
    statusCode?: number;

    @Index()
    @Column({ type: "varchar", length: 255, nullable: true })
    endpoint?: string;

    @Column({ type: "varchar", length: 10, nullable: true })
    method?: string;

    @Index()
    @Column({ name: "user_id", type: "varchar", nullable: true })
    userId?: string;

    @Column({ name: "user_email", type: "varchar", length: 255, nullable: true })
    userEmail?: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    ip?: string;

    @Column({ name: "user_agent", type: "text", nullable: true })
    userAgent?: string;

    @Column({ type: "jsonb", nullable: true })
    context?: Record<string, any>;

    @Index()
    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;
}
