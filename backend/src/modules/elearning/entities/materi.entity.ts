import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";
import { MataPelajaran } from "./mata-pelajaran.entity";

@Entity("materi")
export class Materi {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => MataPelajaran)
	mataPelajaran: MataPelajaran;

	@Column()
	mataPelajaranId: number;

	@Column()
	materiPokok: string;

	@Column("text")
	konten: string;

	@Column()
	tanggalPosting: Date;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
