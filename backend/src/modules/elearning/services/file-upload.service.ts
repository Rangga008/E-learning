import { Injectable, BadRequestException } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class FileUploadService {
	private readonly uploadDir = path.join(process.cwd(), "uploads");
	private readonly allowedMimeTypes = {
		pdf: "application/pdf",
		doc: "application/msword",
		docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		xls: "application/vnd.ms-excel",
		xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		ppt: "application/vnd.ms-powerpoint",
		pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		gif: "image/gif",
		txt: "text/plain",
		zip: "application/zip",
	};

	private readonly maxFileSize = 50 * 1024 * 1024; // 50MB

	constructor() {
		// Ensure upload directory exists
		if (!fs.existsSync(this.uploadDir)) {
			fs.mkdirSync(this.uploadDir, { recursive: true });
		}
	}

	/**
	 * Upload file untuk materi (guru/admin)
	 * @param file - Express.Multer.File
	 * @param folder - 'materi' | 'konten' | 'tugas'
	 * @returns Object dengan filePath dan fileName
	 */
	async uploadMateriFile(
		file: Express.Multer.File,
		folder: "materi" | "konten" | "tugas" = "materi",
	): Promise<{ filePath: string; fileName: string; fileSize: number }> {
		if (!file) {
			throw new BadRequestException("File harus diunggah");
		}

		// Validate file size
		if (file.size > this.maxFileSize) {
			throw new BadRequestException(
				`Ukuran file tidak boleh lebih dari 50MB (upload: ${(
					file.size /
					(1024 * 1024)
				).toFixed(2)}MB)`,
			);
		}

		// Validate file type
		const fileExtension = this.getFileExtension(file.originalname);
		const mimeType = this.allowedMimeTypes[fileExtension.toLowerCase()];

		if (!mimeType) {
			throw new BadRequestException(
				`Tipe file tidak diizinkan. File yang diizinkan: ${Object.keys(
					this.allowedMimeTypes,
				).join(", ")}`,
			);
		}

		if (file.mimetype !== mimeType && fileExtension.toLowerCase() !== "xlsx") {
			console.warn(
				`MIME type mismatch: expected ${mimeType}, got ${file.mimetype}`,
			);
		}

		// Generate unique filename
		const timestamp = Date.now();
		const uuid = uuidv4().split("-")[0];
		const fileName = `${timestamp}-${uuid}-${file.originalname}`;

		// Create folder path
		const folderPath = path.join(this.uploadDir, folder);
		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath, { recursive: true });
		}

		// Save file
		const filePath = path.join(folderPath, fileName);
		fs.writeFileSync(filePath, file.buffer);

		// Return relative path for storing in database
		const relativePath = `/uploads/${folder}/${fileName}`;

		return {
			filePath: relativePath,
			fileName: file.originalname,
			fileSize: file.size,
		};
	}

	/**
	 * Delete file
	 * @param filePath - Path yang tersimpan di database
	 */
	async deleteFile(filePath: string): Promise<void> {
		try {
			// Convert relative path to absolute path
			const absolutePath = path.join(process.cwd(), filePath);

			// Check if file exists
			if (!fs.existsSync(absolutePath)) {
				console.warn(`File not found: ${absolutePath}`);
				return;
			}

			// Delete file
			fs.unlinkSync(absolutePath);
		} catch (error) {
			console.error(`Error deleting file: ${filePath}`, error);
			// Don't throw error, just log it
		}
	}

	/**
	 * Get file from upload folder
	 * @param filePath - Path yang tersimpan di database
	 * @returns File buffer
	 */
	async getFile(filePath: string): Promise<Buffer> {
		try {
			const absolutePath = path.join(process.cwd(), filePath);

			if (!fs.existsSync(absolutePath)) {
				throw new BadRequestException("File tidak ditemukan");
			}

			return fs.readFileSync(absolutePath);
		} catch (error) {
			throw new BadRequestException(`Gagal membaca file: ${error.message}`);
		}
	}

	/**
	 * Get file extension dari filename
	 * @param filename - Original filename
	 * @returns File extension tanpa dot
	 */
	private getFileExtension(filename: string): string {
		return filename.split(".").pop() || "";
	}

	/**
	 * Validate file untuk upload
	 * @param file - Express.Multer.File
	 * @returns true jika valid
	 */
	validateFile(file: Express.Multer.File): boolean {
		if (!file) return false;

		// Check size
		if (file.size > this.maxFileSize) return false;

		// Check extension
		const fileExtension = this.getFileExtension(file.originalname);
		if (!this.allowedMimeTypes[fileExtension.toLowerCase()]) return false;

		return true;
	}

	/**
	 * Get file info
	 * @param filePath - Path yang tersimpan di database
	 * @returns File info (size, exists, etc)
	 */
	getFileInfo(filePath: string): {
		exists: boolean;
		size: number;
		name: string;
	} {
		try {
			const absolutePath = path.join(process.cwd(), filePath);
			const stats = fs.statSync(absolutePath);

			return {
				exists: true,
				size: stats.size,
				name: path.basename(filePath),
			};
		} catch (error) {
			return {
				exists: false,
				size: 0,
				name: "",
			};
		}
	}

	/**
	 * Get allowed file types
	 * @returns Array of allowed file extensions
	 */
	getAllowedFileTypes(): string[] {
		return Object.keys(this.allowedMimeTypes);
	}
}
