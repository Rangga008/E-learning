import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity("angkatans")
export class Angkatan {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "int" })
	levelAngkatan: number; // 1-12 based on school type

	@Column({ type: "varchar", length: 50 })
	sekolah: string; // "SD", "SMP", "SMA", "K"

	@Column({ type: "varchar", length: 255 })
	namaAngkatan: string; // e.g., "Kelas 1 SD 2025/2026"

	@Column({ type: "boolean", default: true })
	aktifkan: boolean; // Active/Inactive status

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
