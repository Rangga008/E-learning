import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";
import { Materi } from "./materi.entity";
import { Tugas } from "./tugas.entity";

@Entity("soal_esai")
export class SoalEsai {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	materiId: number;

	@Column({ nullable: true })
	tugasId: number;

	@ManyToOne(() => Materi, { nullable: true })
	materi: Materi;

	@ManyToOne(() => Tugas, { nullable: true })
	tugas: Tugas;

	@Column("text")
	pertanyaan: string;

	@Column({ nullable: true })
	bobot: number; // Bobot nilai soal

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
