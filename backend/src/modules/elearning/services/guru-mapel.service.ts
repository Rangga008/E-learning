import {
	Injectable,
	NotFoundException,
	BadRequestException,
	ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GuruMapel } from "../entities/guru-mapel.entity";
import { CreateGuruMapelDto } from "../dtos/guru-mapel.dto";

@Injectable()
export class GuruMapelService {
	constructor(
		@InjectRepository(GuruMapel)
		private readonly guruMapelRepository: Repository<GuruMapel>,
	) {}

	async assign(dto: CreateGuruMapelDto): Promise<GuruMapel> {
		// Check if assignment already exists
		const existing = await this.guruMapelRepository.findOne({
			where: {
				guruId: dto.guruId,
				mataPelajaranId: dto.mataPelajaranId,
			},
		});

		if (existing) {
			throw new ConflictException("Guru sudah diberikan mapel ini");
		}

		const guruMapel = this.guruMapelRepository.create(dto);
		return this.guruMapelRepository.save(guruMapel);
	}

	async getMapelByGuru(guruId: number): Promise<GuruMapel[]> {
		return this.guruMapelRepository.find({
			where: { guruId },
			relations: ["mataPelajaran"],
		});
	}

	async removeAssignment(id: number): Promise<void> {
		const guruMapel = await this.guruMapelRepository.findOne({ where: { id } });

		if (!guruMapel) {
			throw new NotFoundException("Assignment tidak ditemukan");
		}

		await this.guruMapelRepository.remove(guruMapel);
	}

	async checkGuruHasMapel(
		guruId: number,
		mataPelajaranId: number,
	): Promise<boolean> {
		const assignment = await this.guruMapelRepository.findOne({
			where: {
				guruId,
				mataPelajaranId,
			},
		});

		return !!assignment;
	}
}
