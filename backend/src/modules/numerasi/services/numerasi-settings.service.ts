import {
	Injectable,
	BadRequestException,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
	SettingsNumerasi,
	Topik,
	HariKerja,
} from "../entities/settings-numerasi.entity";
import { PesertaDidik } from "../../peserta-didik/entities/peserta-didik.entity";

@Injectable()
export class NumerasiSettingsService {
	constructor(
		@InjectRepository(SettingsNumerasi)
		private settingsRepo: Repository<SettingsNumerasi>,
		@InjectRepository(PesertaDidik)
		private pesertaDidikRepo: Repository<PesertaDidik>,
	) {}

	/**
	 * Get atau create default settings
	 */
	async getSettings(): Promise<SettingsNumerasi> {
		let settings = await this.settingsRepo.findOne({ where: {} });
		if (!settings) {
			settings = this.settingsRepo.create({
				faseSistem: "trial",
				tanggalMulaiTrial: new Date("2026-01-19"),
				tanggalSelesaiTrial: new Date("2026-01-23"),
				tanggalReset: new Date("2026-01-24"),
				tanggalGoLive: new Date("2026-01-26"),
				jamMulai: "00:01",
				jamSelesai: "23:59",
				hariKerja: [
					HariKerja.SENIN,
					HariKerja.SELASA,
					HariKerja.RABU,
					HariKerja.KAMIS,
					HariKerja.JUMAT,
				],
				topikSenin: Topik.PENJUMLAHAN,
				topikSelasa: Topik.PENGURANGAN,
				topikRabu: Topik.PERKALIAN,
				topikKamis: Topik.PEMBAGIAN,
				topikJumat: Topik.CAMPURAN,
			});
			await this.settingsRepo.save(settings);
		}
		return settings;
	}

	/**
	 * Update settings (admin only)
	 */
	async updateSettings(
		updateData: Partial<SettingsNumerasi>,
	): Promise<SettingsNumerasi> {
		const settings = await this.getSettings();
		Object.assign(settings, updateData);
		return this.settingsRepo.save(settings);
	}

	/**
	 * Tentukan topik berdasarkan hari
	 */
	async getTopikHarian(): Promise<Topik> {
		const now = new Date();
		const hari = now.getDay(); // 0=Minggu, 1=Senin, ..., 6=Sabtu

		const settings = await this.getSettings();
		const hariKerjaArr: string[] = settings.hariKerja || [
			"senin",
			"selasa",
			"rabu",
			"kamis",
			"jumat",
		];

		// Cek jika hari libur
		const namaHariIni = [
			"minggu",
			"senin",
			"selasa",
			"rabu",
			"kamis",
			"jumat",
			"sabtu",
		][hari];
		if (!hariKerjaArr.includes(namaHariIni)) {
			throw new BadRequestException(
				"Hari ini libur. Menu Berhitung tidak tersedia.",
			);
		}

		const topikMap: { [key: number]: Topik } = {
			1: settings.topikSenin,
			2: settings.topikSelasa,
			3: settings.topikRabu,
			4: settings.topikKamis,
			5: settings.topikJumat,
		};

		return topikMap[hari] || Topik.CAMPURAN;
	}

	/**
	 * Validasi apakah hari ini hari kerja
	 */
	isHariKerja(hariIndex: number): boolean {
		// hariIndex: 0=Minggu, 1=Senin, 5=Jumat, 6=Sabtu
		return hariIndex >= 1 && hariIndex <= 5; // Senin-Jumat
	}

	/**
	 * Get level config berdasarkan level number
	 */
	async getLevelConfig(level: number) {
		const settings = await this.getSettings();
		return settings.levelConfigs.find((cfg) => cfg.level === level);
	}

	/**
	 * Cek apakah user bisa naik level
	 */
	async canUserNaikLevel(
		pesertaDidikId: number,
		nilaiTerkini: number,
	): Promise<boolean> {
		const peserta = await this.pesertaDidikRepo.findOne({
			where: { id: pesertaDidikId },
		});
		if (!peserta) throw new NotFoundException("Peserta tidak ditemukan");

		const currentLevelConfig = await this.getLevelConfig(peserta.level);
		if (!currentLevelConfig)
			throw new BadRequestException("Level config tidak ditemukan");

		return nilaiTerkini >= currentLevelConfig.kkm;
	}

	/**
	 * Naikkan level peserta (max level 7)
	 */
	async naikkanLevel(pesertaDidikId: number): Promise<PesertaDidik> {
		const peserta = await this.pesertaDidikRepo.findOne({
			where: { id: pesertaDidikId },
		});
		if (!peserta) throw new NotFoundException("Peserta tidak ditemukan");

		if (peserta.level < 7) {
			peserta.level += 1;
			await this.pesertaDidikRepo.save(peserta);
		}

		return peserta;
	}

	/**
	 * Reset sistem (BAB IV - Fase 2)
	 * - Hapus seluruh riwayat nilai trial
	 * - Reset level ke 1
	 * - Akun siswa tetap ada
	 */
	async resetSystemTrial(
		pesertaDidikIds?: number[],
	): Promise<{ resetCount: number }> {
		const query = this.pesertaDidikRepo.createQueryBuilder("p");

		if (pesertaDidikIds && pesertaDidikIds.length > 0) {
			query.whereInIds(pesertaDidikIds);
		}

		const pesertaList = await query.getMany();

		// Reset level dan flag
		pesertaList.forEach((p) => {
			p.level = 1;
			p.poin = 0;
			p.absenBerhitung = false;
		});

		await this.pesertaDidikRepo.save(pesertaList);

		return { resetCount: pesertaList.length };
	}

	/**
	 * Update fase sistem (trial -> go_live)
	 */
	async updateFaseSistem(fase: "trial" | "go_live"): Promise<SettingsNumerasi> {
		const settings = await this.getSettings();
		settings.faseSistem = fase;
		return this.settingsRepo.save(settings);
	}

	/**
	 * Cek fase sistem saat ini
	 */
	async getFaseSistem(): Promise<"trial" | "go_live"> {
		const settings = await this.getSettings();
		const now = new Date();

		// Hard-code logic dari BAB IV
		if (
			now < settings.tanggalMulaiTrial ||
			now > new Date(settings.tanggalSelesaiTrial.getTime() + 86400000)
		) {
			return "go_live";
		}

		return settings.faseSistem;
	}
}
