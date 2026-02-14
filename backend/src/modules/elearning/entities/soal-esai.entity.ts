import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	Check,
} from "typeorm";
import { Materi } from "./materi.entity";
import { Tugas } from "./tugas.entity";

/**
 * SoalEsai (Essay Question)
 *
 * CONSTRAINT: Each question must belong to EITHER a Material (for material questions)
 * OR a Task/Quiz (for task/quiz questions), but NOT both and NOT neither.
 *
 * This ensures every question has a clear ownership context.
 */
@Entity("soal_esai")
@Check(
	`(materiId IS NOT NULL AND tugasId IS NULL) OR (materiId IS NULL AND tugasId IS NOT NULL)`,
)
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
