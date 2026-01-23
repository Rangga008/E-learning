import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity("jawaban_numerasi")
export class JawabanNumerasi {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	pesertaDidikId: number;

	@Column()
	tanggal: Date;

	@Column()
	topik: string;

	@Column({ default: 1 })
	level: number;

	@Column({ default: 0 })
	jumlahBenar: number;

	@Column({ default: 0 })
	jumlahSalah: number;

	@Column({ nullable: true })
	nilai: number;

	@Column({ nullable: true })
	waktuMulai: Date;

	@Column({ nullable: true })
	waktuSelesai: Date;

	@Column({ default: false })
	sudahSelesai: boolean;

	@Column({ default: false })
	naik_level: boolean; // Status naik level

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
