import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("profiles")
export class Profile {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ name: "user_id" })
    userId: string;

    @Column({ name: "birth_date", type: "date", nullable: true })
    birthDate: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ name: "emergency_contact", nullable: true })
    emergencyContact: string;

    @Column({ name: "medical_notes", type: "text", nullable: true })
    medicalNotes: string;

    @Column({ name: "start_date", type: "date", default: () => "CURRENT_DATE" })
    startDate: string;

    @Column({ name: "graduation_date", type: "date", nullable: true })
    graduationDate: string;
}
