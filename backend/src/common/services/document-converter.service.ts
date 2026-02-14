import { Injectable, Logger } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import * as mammoth from "mammoth";
import { PDFDocument, rgb } from "pdf-lib";

const execAsync = promisify(exec);

@Injectable()
export class DocumentConverterService {
	private readonly logger = new Logger(DocumentConverterService.name);
	private readonly uploadDir = process.env.UPLOAD_DIR || "uploads";

	constructor() {}

	/**
	 * Check if file is Word document
	 */
	isWordDocument(filePath: string): boolean {
		const ext = path.extname(filePath).toLowerCase();
		return [".doc", ".docx"].includes(ext);
	}

	/**
	 * Convert Word document to PDF using LibreOffice (primary) or Mammoth+pdf-lib (fallback)
	 */
	async convertWordToPdf(filePath: string): Promise<string | null> {
		try {
			const fullPath = path.join(this.uploadDir, filePath.replace(/^\//, ""));
			const fileName = path.basename(fullPath);
			const dirName = path.dirname(fullPath);
			const nameWithoutExt = path.basename(fullPath, path.extname(fullPath));

			// Save PDF to pdf subfolder instead of word subfolder
			const pdfDirName = dirName.replace(/\bword\b/, "pdf");
			const pdfPath = path.join(pdfDirName, `${nameWithoutExt}.pdf`);

			// Check if file exists
			if (!fs.existsSync(fullPath)) {
				this.logger.warn(`File not found: ${fullPath}`);
				return null;
			}

			// Create PDF directory if it doesn't exist
			if (!fs.existsSync(pdfDirName)) {
				fs.mkdirSync(pdfDirName, { recursive: true });
			}

			// Check if PDF already exists
			if (fs.existsSync(pdfPath)) {
				this.logger.log(`PDF already exists: ${pdfPath}`);
				return `/${path.relative(this.uploadDir, pdfPath).replace(/\\/g, "/")}`;
			}

			// Try to convert using LibreOffice (primary method)
			try {
				await execAsync(
					`libreoffice --headless --convert-to pdf --outdir "${pdfDirName}" "${fullPath}"`,
				);

				if (fs.existsSync(pdfPath)) {
					this.logger.log(
						`Successfully converted (LibreOffice): ${fullPath} -> ${pdfPath}`,
					);
					return `/${path
						.relative(this.uploadDir, pdfPath)
						.replace(/\\/g, "/")}`;
				}
			} catch (error) {
				this.logger.warn(
					`LibreOffice conversion failed. Trying Mammoth+pdf-lib fallback. Error: ${error}`,
				);

				// Fallback: Try Mammoth + pdf-lib
				try {
					const converted = await this.convertWithMammoth(fullPath, pdfPath);
					if (converted) {
						this.logger.log(
							`Successfully converted (Mammoth): ${fullPath} -> ${pdfPath}`,
						);
						return `/${path
							.relative(this.uploadDir, pdfPath)
							.replace(/\\/g, "/")}`;
					}
				} catch (mammothError) {
					this.logger.warn(`Mammoth conversion also failed: ${mammothError}`);
					return null;
				}
			}

			return null;
		} catch (error) {
			this.logger.error(`Error converting document: ${error}`);
			return null;
		}
	}

	/**
	 * Convert Word to PDF using Mammoth + pdf-lib
	 */
	private async convertWithMammoth(
		wordPath: string,
		pdfPath: string,
	): Promise<boolean> {
		try {
			const fileBuffer = fs.readFileSync(wordPath);

			// Extract text from Word document
			const result = await mammoth.extractRawText({
				buffer: fileBuffer,
			});

			const textContent = result.value;

			if (!textContent || textContent.trim().length === 0) {
				this.logger.warn(`No text content found in Word document: ${wordPath}`);
				return false;
			}

			// Create PDF document
			const pdfDoc = await PDFDocument.create();
			const page = pdfDoc.addPage([595, 842]); // A4 size: 595x842 points

			const fontSize = 11;
			const margin = 40;
			const lineHeight = 14;
			const maxCharsPerLine = 80;

			// Wrap text
			const lines = this.wrapText(textContent, maxCharsPerLine);

			// Draw text
			let yPosition = page.getHeight() - margin;

			for (const line of lines) {
				if (yPosition < margin) {
					// Create new page if space is needed
					const newPage = pdfDoc.addPage([595, 842]);
					yPosition = newPage.getHeight() - margin;
				}

				page.drawText(line.trim(), {
					x: margin,
					y: yPosition,
					size: fontSize,
					color: rgb(0, 0, 0),
				});

				yPosition -= lineHeight;
			}

			// Save PDF
			const pdfBytes = await pdfDoc.save();
			fs.writeFileSync(pdfPath, pdfBytes);

			return true;
		} catch (error) {
			this.logger.error(`Mammoth conversion error: ${error}`);
			return false;
		}
	}

	/**
	 * Simple text wrapping
	 */
	private wrapText(text: string, maxCharsPerLine: number): string[] {
		const lines: string[] = [];
		const paragraphs = text.split(/\n+/);

		for (const para of paragraphs) {
			if (!para.trim()) {
				lines.push(""); // Empty line
				continue;
			}

			const words = para.split(/\s+/);
			let currentLine = "";

			for (const word of words) {
				if ((currentLine + " " + word).length > maxCharsPerLine) {
					if (currentLine.trim()) {
						lines.push(currentLine.trim());
					}
					currentLine = word;
				} else {
					currentLine += (currentLine ? " " : "") + word;
				}
			}

			if (currentLine.trim()) {
				lines.push(currentLine.trim());
			}
		}

		return lines;
	}

	/**
	 * Convert document if needed and return preview path and original path
	 */
	async getPaths(
		filePath: string,
		fileType: string,
	): Promise<{
		displayPath: string; // Path to show in preview (PDF if converted, original if not)
		downloadPath: string; // Original path for download
		isPdfConverted: boolean; // Whether conversion happened
	}> {
		try {
			const isWord =
				fileType?.includes("word") ||
				fileType?.includes("document") ||
				fileType?.includes("msword");

			if (isWord) {
				const pdfPath = await this.convertWordToPdf(filePath);
				if (pdfPath) {
					return {
						displayPath: pdfPath,
						downloadPath: filePath,
						isPdfConverted: true,
					};
				}
			}

			// No conversion needed or failed - use original file
			return {
				displayPath: filePath,
				downloadPath: filePath,
				isPdfConverted: false,
			};
		} catch (error) {
			this.logger.error(`Error getting paths: ${error}`);
			return {
				displayPath: filePath,
				downloadPath: filePath,
				isPdfConverted: false,
			};
		}
	}
}
