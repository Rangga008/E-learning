import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToOne,
	Index,
} from "typeorm";
import { Tugas } from "./tugas.entity";
import { PesertaDidik } from "../../peserta-didik/entities/peserta-didik.entity";
import { NilaiTugas } from "./nilai-tugas.entity";

export enum StatusSubmisi {
	DRAFT = "DRAFT",
	SUBMITTED = "SUBMITTED",
}

@Entity("jawaban_tugas")
@Index(["tugasId", "pesertaDidikId"], { unique: true })
export class JawabanTugas {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	tugasId: number;

	@Column()
	pesertaDidikId: number;

	@Column({ nullable: true, type: "longtext" })
	jawabanTeks: string;

	@Column({ nullable: true })
	filePath: string;

	@Column({ nullable: true })
	tipeFile: string;

	@Column({ nullable: true })
	fileName: string;

	@Column({
		type: "enum",
		enum: StatusSubmisi,
		default: StatusSubmisi.DRAFT,
	})
	statusSubmisi: StatusSubmisi;

	@Column({ nullable: true, type: "datetime" })
	submittedAt: Date;

	@Column({ default: false })
	isLate: boolean;

	@ManyToOne(() => Tugas, (tugas) => tugas.jawaban, { onDelete: "CASCADE" })
	@JoinColumn({ name: "tugasId" })
	tugas: Tugas;

	@ManyToOne(() => PesertaDidik, { onDelete: "CASCADE" })
	@JoinColumn({ name: "pesertaDidikId" })
	pesertaDidik: PesertaDidik;

	@OneToOne(() => NilaiTugas, (nilai) => nilai.jawaban, { nullable: true })
	nilai: NilaiTugas;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
