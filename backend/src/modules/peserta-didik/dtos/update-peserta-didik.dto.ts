import { PartialType } from "@nestjs/mapped-types";
import { CreatePesertaDidikDto } from "./create-peserta-didik.dto";

export class UpdatePesertaDidikDto extends PartialType(CreatePesertaDidikDto) {}
