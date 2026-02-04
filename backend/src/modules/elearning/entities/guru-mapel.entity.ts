import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
	Index,
} from "typeorm";
import { Guru } from "../../guru/entities/guru.entity";
import { MataPelajaran } from "./mata-pelajaran.entity";

@Entity("guru_mapel")
@Index(["guruId", "mataPelajaranId"], { unique: true })
export class GuruMapel {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	guruId: number;

	@Column()
	mataPelajaranId: number;

	@ManyToOne(() => Guru, { onDelete: "CASCADE" })
	@JoinColumn({ name: "guruId" })
	guru: Guru;

	@ManyToOne(() => MataPelajaran, { onDelete: "CASCADE" })
	@JoinColumn({ name: "mataPelajaranId" })
	mataPelajaran: MataPelajaran;

	@CreateDateColumn()
	createdAt: Date;
}
