import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
	Index,
} from "typeorm";
import { PesertaDidik } from "../../peserta-didik/entities/peserta-didik.entity";
import { Tugas } from "./tugas.entity";

export enum TipeNotifikasi {
	TUGAS_BARU = "TUGAS_BARU",
	DEADLINE_REMINDER = "DEADLINE_REMINDER",
	NILAI_MASUK = "NILAI_MASUK",
}

@Entity("notifikasi")
@Index(["pesertaDidikId", "dibaca"])
export class Notifikasi {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	pesertaDidikId: number;

	@Column({
		type: "enum",
		enum: TipeNotifikasi,
	})
	tipe: TipeNotifikasi;

	@Column()
	judul: string;

	@Column({ type: "text" })
	pesan: string;

	@Column({ nullable: true })
	tugasId: number;

	@Column({ default: false })
	dibaca: boolean;

	@ManyToOne(() => PesertaDidik, { onDelete: "CASCADE" })
	@JoinColumn({ name: "pesertaDidikId" })
	pesertaDidik: PesertaDidik;

	@ManyToOne(() => Tugas, { onDelete: "CASCADE", nullable: true })
	@JoinColumn({ name: "tugasId" })
	tugas: Tugas;

	@CreateDateColumn()
	createdAt: Date;
}
