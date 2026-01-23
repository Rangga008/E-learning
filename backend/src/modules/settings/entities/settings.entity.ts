import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity("settings")
export class Settings {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ default: "LMS Sanggar Belajar" })
	appName: string;

	@Column({ default: "Platform Pembelajaran Interaktif" })
	appSlogan: string;

	@Column({ nullable: true })
	appLogo: string; // Path to logo file

	@Column({ nullable: true })
	appIcon: string; // Path to icon file

	@Column({ default: "Sanggar Belajar" })
	schoolName: string;

	@Column({ default: "Indonesia" })
	schoolAddress: string;

	@Column({ default: "info@sanggar-belajar.id" })
	schoolEmail: string;

	@Column({ default: "+62-123-456-7890" })
	schoolPhone: string;

	@Column({ nullable: true })
	schoolWebsite: string;

	@Column("simple-json", { nullable: true })
	levels: any[];

	@Column({ default: 100 })
	pointsPerLevel: number;

	@Column({ default: 10 })
	pointsPerQuestion: number;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
