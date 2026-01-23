import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from "typeorm";
import { Kelas } from "@/modules/kelas/entities/kelas.entity";

@Entity("tingkats")
export class Tingkat {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "varchar", length: 50, unique: true })
	nama: string; // e.g., "SD", "SMP", "SMA", "K"

	@Column({ type: "int", default: 1 })
	urutan: number; // For sorting: 1 for SD, 2 for SMP, etc.

	@Column({ type: "varchar", length: 255, nullable: true })
	deskripsi: string;

	@Column({ type: "boolean", default: true })
	isActive: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	// Relations
	@OneToMany(() => Kelas, (kelas) => kelas.tingkatRef)
	kelas: Kelas[];
}
