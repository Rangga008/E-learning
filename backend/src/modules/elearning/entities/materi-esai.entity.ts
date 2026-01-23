import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity("materi_esai")
export class MateriEsai {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	mataPelajaranId: number; // Reference ke MataPelajaran

	@Column()
	guruId: number; // Reference ke Guru yang membuat

	@Column()
	materiPokok: string; // Judul materi

	@Column("longtext")
	konten: string; // Isi materi (HTML/Rich Text)

	@Column({ nullable: true })
	gambar: string; // URL gambar/cover

	@Column({ default: false })
	isPublished: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
