import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
} from "typeorm";
import { Materi } from "./materi.entity";

@Entity("rencana_pembelajaran")
export class RencanaPembelajaran {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	materiId: number;

	@Column({ type: "longtext" })
	rencana: string;

	@ManyToOne(() => Materi, { onDelete: "CASCADE" })
	@JoinColumn({ name: "materiId" })
	materi: Materi;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
