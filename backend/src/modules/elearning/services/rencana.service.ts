import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RencanaPembelajaran } from "../entities/rencana.entity";
import { CreateRencanaDto, UpdateRencanaDto } from "../dtos/rencana.dto";

@Injectable()
export class RencanaService {
	constructor(
		@InjectRepository(RencanaPembelajaran)
		private readonly rencanaRepository: Repository<RencanaPembelajaran>,
	) {}

	async create(
		materiId: number,
		dto: CreateRencanaDto,
	): Promise<RencanaPembelajaran> {
		const rencana = this.rencanaRepository.create({
			materiId,
			...dto,
		});
		return this.rencanaRepository.save(rencana);
	}

	async findByMateriId(materiId: number): Promise<RencanaPembelajaran[]> {
		return this.rencanaRepository.find({
			where: { materiId },
			order: { createdAt: "DESC" },
		});
	}

	async findById(id: number): Promise<RencanaPembelajaran> {
		const rencana = await this.rencanaRepository.findOne({ where: { id } });
		if (!rencana) {
			throw new NotFoundException(`Rencana dengan ID ${id} tidak ditemukan`);
		}
		return rencana;
	}

	async update(
		id: number,
		dto: UpdateRencanaDto,
	): Promise<RencanaPembelajaran> {
		const rencana = await this.findById(id);
		Object.assign(rencana, dto);
		return this.rencanaRepository.save(rencana);
	}

	async delete(id: number): Promise<void> {
		const rencana = await this.findById(id);
		await this.rencanaRepository.remove(rencana);
	}
}
