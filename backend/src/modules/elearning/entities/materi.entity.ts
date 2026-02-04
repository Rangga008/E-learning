import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
	OneToMany,
	Index,
} from "typeorm";
import { Guru } from "../../guru/entities/guru.entity";
import { MataPelajaran } from "./mata-pelajaran.entity";
import { Tugas } from "./tugas.entity";

export enum MateriStatus {
	DRAFT = "DRAFT",
	PUBLISHED = "PUBLISHED",
	CLOSED = "CLOSED",
}

export enum TipeKonten {
	TEXT = "TEXT",
	IMAGE = "IMAGE",
	PDF = "PDF",
}

@Entity("materi")
@Index(["guruId", "mataPelajaranId"])
export class Materi {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	guruId: number | null;

	@Column()
	mataPelajaranId: number;

	@Column()
	judulMateri: string;

	@Column({ nullable: true, type: "text" })
	deskripsi: string;

	@Column({
		type: "enum",
		enum: TipeKonten,
		default: TipeKonten.TEXT,
	})
	tipeKonten: TipeKonten;

	@Column({ nullable: true, type: "longtext" })
	kontenTeks: string;

	@Column({ nullable: true })
	filePath: string;

	@Column({
		type: "enum",
		enum: MateriStatus,
		default: MateriStatus.DRAFT,
	})
	status: MateriStatus;

	@Column({ default: true })
	visible: boolean;

	@Column({ default: 0 })
	urutan: number;

	@ManyToOne(() => Guru, { onDelete: "CASCADE" })
	@JoinColumn({ name: "guruId" })
	guru: Guru;

	@ManyToOne(() => MataPelajaran, { onDelete: "CASCADE" })
	@JoinColumn({ name: "mataPelajaranId" })
	mataPelajaran: MataPelajaran;

	@OneToMany(() => Tugas, (tugas) => tugas.materi)
	tugas: Tugas[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
