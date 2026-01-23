import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";

export enum TopicHarian {
	SENIN = "penjumlahan",
	SELASA = "pengurangan",
	RABU = "perkalian",
	KAMIS = "pembagian",
	JUMAT = "campuran",
}

@Entity("soal_numerasi")
export class SoalNumerasi {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	kategori: string; // penjumlahan, pengurangan, perkalian, pembagian, campuran

	@Column()
	soal: string;

	@Column("int")
	jawaban: number;

	@Column({ nullable: true })
	level: number; // Level (1-7) atau 'latihan'

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
