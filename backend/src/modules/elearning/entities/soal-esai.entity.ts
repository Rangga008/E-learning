import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";
import { Materi } from "./materi.entity";

@Entity("soal_esai")
export class SoalEsai {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Materi)
	materi: Materi;

	@Column()
	materiId: number;

	@Column("text")
	pertanyaan: string;

	@Column({ nullable: true })
	bobot: number; // Bobot nilai soal

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
