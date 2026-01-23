import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	ManyToOne,
	ManyToMany,
	JoinTable,
	JoinColumn,
} from "typeorm";
import { Guru } from "../../guru/entities/guru.entity";
import { PesertaDidik } from "../../peserta-didik/entities/peserta-didik.entity";
import { Tingkat } from "../../settings/entities/tingkat.entity";
import { MataPelajaran } from "../../elearning/entities/mata-pelajaran.entity";

@Entity("kelas")
export class Kelas {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	nama: string; // e.g., "VII-A", "VIII-B", "IX-C"

	@Column({ nullable: true })
	tingkatId: number;

	@ManyToOne(() => Tingkat, (tingkat) => tingkat.kelas, { nullable: true })
	@JoinColumn({ name: "tingkatId" })
	tingkatRef: Tingkat;

	// Keep this for backward compatibility in responses
	@Column({ nullable: true })
	tingkat: string; // Deprecated - will be replaced by tingkatRef.nama

	@Column({ default: 30 })
	kapasitas: number; // Classroom capacity

	// Guru Wali Kelas (one-to-many: one teacher can have multiple classes)
	@Column({ nullable: true })
	guruWaliId: number;

	@ManyToOne(() => Guru, (guru) => guru.kelasWaliList, { nullable: true })
	@JoinColumn({ name: "guruWaliId" })
	guruWali: Guru;

	// Siswa (one-to-many: one class has many students)
	@OneToMany(() => PesertaDidik, (siswa) => siswa.kelas)
	siswa: PesertaDidik[];

	// Guru Mapel (many-to-many: one class has many subject teachers, one teacher teaches many classes)
	@ManyToMany(() => Guru, (guru) => guru.kelasMapelList)
	@JoinTable({
		name: "kelas_guru_mapel",
		joinColumn: { name: "kelasId", referencedColumnName: "id" },
		inverseJoinColumn: { name: "guruId", referencedColumnName: "id" },
	})
	guruMapel: Guru[];

	// Mata Pelajaran (many-to-many: one class has many subjects, one subject can be in many classes)
	// Synced from assigned teachers' mataPelajaran
	@ManyToMany(() => MataPelajaran, { eager: false, cascade: false })
	@JoinTable({
		name: "kelas_mata_pelajaran",
		joinColumn: { name: "kelasId", referencedColumnName: "id" },
		inverseJoinColumn: { name: "mataPelajaranId", referencedColumnName: "id" },
	})
	mataPelajaran: MataPelajaran[];

	@Column({ default: 0 })
	jumlahSiswa: number;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
