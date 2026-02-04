import { IsString, IsNumber, IsOptional } from "class-validator";

export class CreateRencanaDto {
	@IsString()
	rencana: string;
}

export class UpdateRencanaDto {
	@IsOptional()
	@IsString()
	rencana?: string;
}
