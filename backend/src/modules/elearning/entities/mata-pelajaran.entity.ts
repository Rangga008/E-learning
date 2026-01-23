import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity("mata_pelajaran")
export class MataPelajaran {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	nama: string;

	@Column({ nullable: true })
	deskripsi: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
