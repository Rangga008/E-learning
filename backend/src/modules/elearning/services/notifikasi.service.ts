import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notifikasi, TipeNotifikasi } from "../entities/notifikasi.entity";

@Injectable()
export class NotifikasiService {
	constructor(
		@InjectRepository(Notifikasi)
		private readonly notifikasiRepository: Repository<Notifikasi>,
	) {}

	async createNotification(
		pesertaDidikId: number,
		tipe: TipeNotifikasi,
		judul: string,
		pesan: string,
		tugasId?: number,
	): Promise<Notifikasi> {
		const notifikasi = this.notifikasiRepository.create({
			pesertaDidikId,
			tipe,
			judul,
			pesan,
			tugasId: tugasId || null,
			dibaca: false,
		});

		return this.notifikasiRepository.save(notifikasi);
	}

	async getUnreadNotifications(pesertaDidikId: number): Promise<Notifikasi[]> {
		return this.notifikasiRepository
			.createQueryBuilder("notifikasi")
			.where("notifikasi.pesertaDidikId = :pesertaDidikId", { pesertaDidikId })
			.andWhere("notifikasi.dibaca = :dibaca", { dibaca: false })
			.orderBy("notifikasi.createdAt", "DESC")
			.getMany();
	}

	async getAllNotifications(
		pesertaDidikId: number,
		limit: number = 20,
	): Promise<Notifikasi[]> {
		return this.notifikasiRepository
			.createQueryBuilder("notifikasi")
			.where("notifikasi.pesertaDidikId = :pesertaDidikId", { pesertaDidikId })
			.orderBy("notifikasi.createdAt", "DESC")
			.limit(limit)
			.getMany();
	}

	async markAsRead(notifikasiId: number): Promise<Notifikasi> {
		const notifikasi = await this.notifikasiRepository.findOne({
			where: { id: notifikasiId },
		});

		if (!notifikasi) {
			throw new Error("Notifikasi tidak ditemukan");
		}

		notifikasi.dibaca = true;
		return this.notifikasiRepository.save(notifikasi);
	}

	async markAllAsRead(pesertaDidikId: number): Promise<void> {
		await this.notifikasiRepository
			.createQueryBuilder()
			.update(Notifikasi)
			.set({ dibaca: true })
			.where("pesertaDidikId = :pesertaDidikId", { pesertaDidikId })
			.andWhere("dibaca = :dibaca", { dibaca: false })
			.execute();
	}

	async getUnreadCount(pesertaDidikId: number): Promise<number> {
		return this.notifikasiRepository.count({
			where: {
				pesertaDidikId,
				dibaca: false,
			},
		});
	}

	async deleteOldNotifications(
		pesertaDidikId: number,
		daysOld: number = 30,
	): Promise<void> {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - daysOld);

		await this.notifikasiRepository
			.createQueryBuilder()
			.delete()
			.where("pesertaDidikId = :pesertaDidikId", { pesertaDidikId })
			.andWhere("createdAt < :cutoffDate", { cutoffDate })
			.execute();
	}
}
