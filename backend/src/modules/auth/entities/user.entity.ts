import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";

export enum UserRole {
	SISWA = "siswa",
	GURU = "guru",
	ADMIN = "admin",
}

@Entity("users")
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	username: string;

	@Column()
	password: string;

	@Column({ nullable: true })
	email: string;

	@Column({ nullable: true })
	fullName: string;

	@Column({ type: "enum", enum: UserRole })
	role: UserRole;

	@Column({ default: true })
	isActive: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
