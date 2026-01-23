import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { Kelas } from "../../kelas/entities/kelas.entity";
import { User } from "../../auth/entities/user.entity";

@Entity("peserta_didik")
export class PesertaDidik {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true, nullable: true })
	nipd: string; // Nomor Induk Peserta Didik

	@Column({ unique: true })
	nisn: string; // Nomor Induk Siswa Nasional

	@Column()
	namaLengkap: string;

	@Column()
	jenisKelamin: string;

	@Column({ nullable: true })
	kelasId: number;

	@ManyToOne(() => Kelas, (kelas) => kelas.siswa, { nullable: true })
	@JoinColumn({ name: "kelasId" })
	kelas: Kelas;

	@Column({ nullable: true })
	userId: number;

	@ManyToOne(() => User, { nullable: true })
	@JoinColumn({ name: "userId" })
	user: User;

	@Column({ default: 1 })
	level: number; // Level gamifikasi (1-7)

	@Column({ default: 0 })
	poin: number;

	@Column({ default: false })
	absenBerhitung: boolean; // Absen mengerjakan numerasi hari ini

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
