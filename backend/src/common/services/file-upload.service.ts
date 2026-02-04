import { Injectable, BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import * as path from "path";
import * as fs from "fs";

export interface FileUploadOptions {
	directory: string;
	maxSize: number;
	allowedMimes: string[];
}

@Injectable()
export class FileUploadService {
	private readonly uploadDir = process.env.UPLOAD_DIR || "uploads";

	constructor() {
		// Ensure upload directory exists
		if (!fs.existsSync(this.uploadDir)) {
			fs.mkdirSync(this.uploadDir, { recursive: true });
		}
	}

	/**
	 * Get multer storage configuration
	 */
	getStorageConfig(subDir: string) {
		return diskStorage({
			destination: (req, file, cb) => {
				const uploadPath = path.join(this.uploadDir, subDir);
				if (!fs.existsSync(uploadPath)) {
					fs.mkdirSync(uploadPath, { recursive: true });
				}
				cb(null, uploadPath);
			},
			filename: (req, file, cb) => {
				const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
				const ext = path.extname(file.originalname);
				const name = path.basename(file.originalname, ext);
				cb(null, `${name}-${uniqueSuffix}${ext}`);
			},
		});
	}

	/**
	 * Validate file
	 */
	validateFile(file: Express.Multer.File, options: FileUploadOptions): void {
		if (!file) {
			throw new BadRequestException("File tidak ditemukan");
		}

		// Check file size
		if (file.size > options.maxSize) {
			throw new BadRequestException(
				`Ukuran file tidak boleh lebih dari ${options.maxSize / 1024 / 1024}MB`,
			);
		}

		// Check MIME type
		if (!options.allowedMimes.includes(file.mimetype)) {
			throw new BadRequestException(
				`Tipe file tidak didukung. Yang diizinkan: ${options.allowedMimes.join(
					", ",
				)}`,
			);
		}
	}

	/**
	 * Delete file
	 */
	deleteFile(filePath: string): void {
		try {
			const fullPath = path.join(this.uploadDir, filePath);
			if (fs.existsSync(fullPath)) {
				fs.unlinkSync(fullPath);
			}
		} catch (error) {
			console.error("Error deleting file:", error);
		}
	}

	/**
	 * Get file URL
	 */
	getFileUrl(filePath: string): string {
		return `/uploads/${filePath}`;
	}

	/**
	 * Save file path to database format (relative to uploads dir)
	 */
	getSavePathForDb(file: Express.Multer.File, subDir: string): string {
		return `${subDir}/${file.filename}`;
	}

	/**
	 * Materi file validation (PDF, Image, Text)
	 */
	validateMateriFile(file: Express.Multer.File): void {
		const options: FileUploadOptions = {
			directory: "materi",
			maxSize: 10 * 1024 * 1024, // 10MB
			allowedMimes: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
		};
		this.validateFile(file, options);
	}

	/**
	 * Jawaban file validation (PDF, Image, Photo, Text)
	 */
	validateJawabanFile(file: Express.Multer.File): void {
		const options: FileUploadOptions = {
			directory: "jawaban",
			maxSize: 10 * 1024 * 1024, // 10MB
			allowedMimes: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
		};
		this.validateFile(file, options);
	}

	/**
	 * Get file extension
	 */
	getFileExtension(filename: string): string {
		return path.extname(filename).toLowerCase();
	}

	/**
	 * Check if file is image
	 */
	isImage(mimetype: string): boolean {
		return mimetype.startsWith("image/");
	}

	/**
	 * Check if file is PDF
	 */
	isPdf(mimetype: string): boolean {
		return mimetype === "application/pdf";
	}
}
