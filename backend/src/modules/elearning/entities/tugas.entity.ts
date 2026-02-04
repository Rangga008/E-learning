import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
	Index,
} from "typeorm";
import { Guru } from "../../guru/entities/guru.entity";
import { Materi } from "./materi.entity";
import { MataPelajaran } from "./mata-pelajaran.entity";
import { JawabanTugas } from "./jawaban-tugas.entity";

export enum TugasStatus {
	DRAFT = "DRAFT",
	PUBLISHED = "PUBLISHED",
	CLOSED = "CLOSED",
}

@Entity("tugas")
@Index(["materiId", "guruId"])
export class Tugas {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	materiId: number;

	@Column({ nullable: true })
	guruId: number;

	@Column({ nullable: true })
	mataPelajaranId: number;

	@Column()
	tipe: string;

	@Column()
	judulTugas: string;

	@Column({ type: "text" })
	deskripsi: string;

	@Column({
		type: "simple-array",
		nullable: false,
	})
	tipeSubmisi: string[];

	@Column({ type: "datetime" })
	tanggalBuka: Date;

	@Column({ type: "datetime", nullable: true })
	tanggalDeadline: Date;

	@Column({
		type: "enum",
		enum: TugasStatus,
		default: TugasStatus.DRAFT,
	})
	status: TugasStatus;

	@Column({ default: true })
	visible: boolean;

	@Column({ default: 100 })
	nilaiMaksimal: number;

	@Column({ nullable: true, type: "text" })
	instruksiTambahan: string;

	@Column({ nullable: true, type: "text" })
	filePath: string;

	@Column({ nullable: true })
	fileName: string;

	@Column({ nullable: true })
	fileType: string;

	@ManyToOne(() => Materi, (materi) => materi.tugas, { onDelete: "CASCADE" })
	@JoinColumn({ name: "materiId" })
	materi: Materi;

	@ManyToOne(() => Guru, { onDelete: "SET NULL", nullable: true })
	@JoinColumn({ name: "guruId" })
	guru: Guru;

	@ManyToOne(() => MataPelajaran, { onDelete: "CASCADE" })
	@JoinColumn({ name: "mataPelajaranId" })
	mataPelajaran: MataPelajaran;

	@OneToMany(() => JawabanTugas, (jawaban) => jawaban.tugas)
	jawaban: JawabanTugas[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
