import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	ManyToMany,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { Kelas } from "../../kelas/entities/kelas.entity";
import { MataPelajaran } from "../../elearning/entities/mata-pelajaran.entity";

@Entity("guru")
export class Guru {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	nip: string; // Nomor Induk Pegawai

	@Column()
	namaLengkap: string;

	@Column({ nullable: true })
	mataPelajaranId: number; // Default mata pelajaran

	@ManyToOne(() => MataPelajaran, { nullable: true })
	@JoinColumn({ name: "mataPelajaranId" })
	mataPelajaran: MataPelajaran;

	@Column({ default: "" })
	kelasWali: string; // Kelas wali murid (nullable jika tidak ada)

	@Column("simple-array", { nullable: true })
	kelasMapel: string[]; // Array of kelas yang diampu

	@Column({ nullable: true })
	userId: number;

	@OneToMany(() => Kelas, (kelas) => kelas.guruWali)
	kelasWaliList: Kelas[];

	@ManyToMany(() => Kelas, (kelas) => kelas.guruMapel)
	kelasMapelList: Kelas[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
