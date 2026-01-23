import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from "typeorm";

@Entity("soal_jawaban_esai")
export class SoalJawabanEsai {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	soalEsaiId: number; // Reference ke SoalEsai

	@Column()
	pesertaDidikId: number; // Reference ke PesertaDidik

	@Column("longtext")
	jawaban: string; // Jawaban esai panjang

	@Column({ nullable: true })
	nilai: number; // Nilai 0-100 (diinput guru saat koreksi)

	@Column({ nullable: true })
	feedback: string; // Komentar guru

	@Column({ default: false })
	sudahDiperiksa: boolean;

	@Column({ nullable: true })
	tanggalDiperiksa: Date;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
