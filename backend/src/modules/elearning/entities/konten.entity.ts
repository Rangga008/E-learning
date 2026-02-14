import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
} from "typeorm";
import { Materi } from "./materi.entity";

export enum TipeKontenMateri {
	TEXT = "TEXT",
	VIDEO = "VIDEO",
	FILE = "FILE",
}

@Entity("konten_materi")
export class KontenMateri {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	materiId: number;

	@Column({
		type: "enum",
		enum: TipeKontenMateri,
		default: TipeKontenMateri.TEXT,
	})
	tipeKonten: TipeKontenMateri;

	@Column()
	judul: string;

	@Column({ type: "longtext", nullable: true })
	kontenTeks: string | null;

	@Column({ nullable: true })
	linkVideo: string | null;

	@Column({ nullable: true })
	filePath: string | null;

	@Column({ nullable: true })
	fileName: string | null;

	@Column({ nullable: true })
	fileType: string | null;

	@Column({ nullable: true })
	convertedPdfPath: string | null;

	@ManyToOne(() => Materi, { onDelete: "CASCADE" })
	@JoinColumn({ name: "materiId" })
	materi: Materi;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
