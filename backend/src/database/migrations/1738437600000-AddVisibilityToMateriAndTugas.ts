import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddVisibilityToMateriAndTugas1738437600000
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		// Add visible column to materi table
		await queryRunner.addColumn(
			"materi",
			new TableColumn({
				name: "visible",
				type: "boolean",
				default: true,
			}),
		);

		// Add visible column to tugas table
		await queryRunner.addColumn(
			"tugas",
			new TableColumn({
				name: "visible",
				type: "boolean",
				default: true,
			}),
		);

		// Create indices for better query performance
		await queryRunner.query(
			`CREATE INDEX idx_materi_visible ON materi(guruId, visible)`,
		);
		await queryRunner.query(
			`CREATE INDEX idx_tugas_visible ON tugas(materiId, visible)`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Drop indices
		await queryRunner.query(`DROP INDEX idx_materi_visible ON materi`);
		await queryRunner.query(`DROP INDEX idx_tugas_visible ON tugas`);

		// Drop columns
		await queryRunner.dropColumn("materi", "visible");
		await queryRunner.dropColumn("tugas", "visible");
	}
}
