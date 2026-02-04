import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	OneToOne,
	JoinColumn,
	ManyToOne,
} from "typeorm";
import { Guru } from "../../guru/entities/guru.entity";
import { JawabanTugas } from "./jawaban-tugas.entity";

@Entity("nilai_tugas")
export class NilaiTugas {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	jawabanTugasId: number;

	@Column()
	guruId: number;

	@Column({ type: "decimal", precision: 5, scale: 2 })
	nilai: number;

	@Column({ nullable: true, type: "text" })
	feedback: string;

	@Column({ nullable: true, type: "datetime" })
	gradedAt: Date;

	@OneToOne(() => JawabanTugas, (jawaban) => jawaban.nilai, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "jawabanTugasId" })
	jawaban: JawabanTugas;

	@ManyToOne(() => Guru, { onDelete: "CASCADE" })
	@JoinColumn({ name: "guruId" })
	guru: Guru;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
