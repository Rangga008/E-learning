import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
} from "typeorm";
import { SoalEsai } from "./soal-esai.entity";
import { PesertaDidik } from "../../peserta-didik/entities/peserta-didik.entity";

@Entity("jawaban_esai")
export class JawabanEsai {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	pesertaDidikId: number;

	@ManyToOne(() => SoalEsai)
	soalEsai: SoalEsai;

	@ManyToOne(() => PesertaDidik, { onDelete: "CASCADE" })
	@JoinColumn({ name: "pesertaDidikId" })
	pesertaDidik: PesertaDidik;

	@Column()
	soalEsaiId: number;

	@Column("text")
	jawaban: string;

	@Column({ nullable: true })
	nilai: number;

	@Column({ default: false })
	sudahDinilai: boolean;

	@Column({ nullable: true })
	catatanGuru: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
