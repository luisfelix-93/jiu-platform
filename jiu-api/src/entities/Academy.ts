import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Class } from "./Class";

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

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @OneToMany(() => Class, (cls) => cls.academy)
    classes: Class[];
}
