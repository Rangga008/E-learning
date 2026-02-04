import { Injectable } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileUploadService } from "../services/file-upload.service";

@Injectable()
export class MateriFileInterceptor {
	constructor(private readonly fileUploadService: FileUploadService) {}

	create() {
		return FileInterceptor("file", {
			storage: this.fileUploadService.getStorageConfig("materi"),
			limits: {
				fileSize: 10 * 1024 * 1024, // 10MB
			},
			fileFilter: (req, file, cb) => {
				const allowedMimes = [
					"application/pdf",
					"image/jpeg",
					"image/png",
					"image/jpg",
				];
				if (allowedMimes.includes(file.mimetype)) {
					cb(null, true);
				} else {
					cb(new Error("File type tidak diizinkan"), false);
				}
			},
		});
	}
}

@Injectable()
export class JawabanFileInterceptor {
	constructor(private readonly fileUploadService: FileUploadService) {}

	create() {
		return FileInterceptor("file", {
			storage: this.fileUploadService.getStorageConfig("jawaban"),
			limits: {
				fileSize: 10 * 1024 * 1024, // 10MB
			},
			fileFilter: (req, file, cb) => {
				const allowedMimes = [
					"application/pdf",
					"image/jpeg",
					"image/png",
					"image/jpg",
				];
				if (allowedMimes.includes(file.mimetype)) {
					cb(null, true);
				} else {
					cb(new Error("File type tidak diizinkan"), false);
				}
			},
		});
	}
}

@Injectable()
export class TugasFileInterceptor {
	constructor(private readonly fileUploadService: FileUploadService) {}

	create() {
		return FileInterceptor("file", {
			storage: this.fileUploadService.getStorageConfig("tugas"),
			limits: {
				fileSize: 20 * 1024 * 1024, // 20MB for larger files
			},
			fileFilter: (req, file, cb) => {
				const allowedMimes = [
					"application/pdf",
					"application/msword",
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					"image/jpeg",
					"image/png",
					"image/jpg",
				];
				if (allowedMimes.includes(file.mimetype)) {
					cb(null, true);
				} else {
					cb(
						new Error("File type tidak diizinkan (PDF, Word, atau Foto)"),
						false,
					);
				}
			},
		});
	}
}
