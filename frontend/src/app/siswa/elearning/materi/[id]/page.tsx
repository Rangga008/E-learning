"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/auth.store";
import { useNotification } from "@/hooks/useNotification";
import { SuccessToast, ErrorToast } from "@/components/CommonModals";

interface Materi {
	id: number;
	judulMateri: string;
	deskripsi: string;
	status: string;
	mataPelajaran?: {
		id: number;
		nama: string;
	};
}

interface KontenMateri {
	id: number;
	materiId: number;
	tipeKonten: "TEXT" | "FILE" | "VIDEO";
	judul: string;
	kontenTeks?: string;
	filePath?: string;
	linkVideo?: string;
	fileName?: string;
	fileType?: string;
	convertedPdfPath?: string;
	createdAt?: string;
}

interface Tugas {
	id: number;
	materiId: number;
	judulTugas: string;
	deskripsi: string;
	tipe: "TUGAS" | "KUIS";
	status: string;
	deadline?: string;
	createdAt?: string;
}

export default function SiswaMateriDetailPage() {
	const params = useParams();
	const router = useRouter();
	const materiId = params.id as string;
	const { user, token } = useAuthStore();
	const {
		showSuccess,
		showError,
		successToast,
		errorToast,
		closeSuccess,
		closeError,
	} = useNotification();

	const [loading, setLoading] = useState(true);
	const [materi, setMateri] = useState<Materi | null>(null);
	const [kontenList, setKontenList] = useState<KontenMateri[]>([]);
	const [tugasList, setTugasList] = useState<Tugas[]>([]);
	const [telahDibaca, setTelahDibaca] = useState(false);
	const [savingBacaStatus, setSavingBacaStatus] = useState(false);
	const [showViewer, setShowViewer] = useState<{ [key: number]: boolean }>({});

	// Fetch all data
	const fetchMateriDetail = useCallback(async () => {
		try {
			setLoading(true);

			// Fetch materi
			const materiRes = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materiId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!materiRes.ok) {
				showError("Gagal memuat detail materi");
				return;
			}

			const materiData = await materiRes.json();
			const materi = materiData.data || materiData;
			setMateri(materi);

			// Fetch konten
			const kontenRes = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materiId}/konten`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (kontenRes.ok) {
				const kontenData = await kontenRes.json();
				const list = Array.isArray(kontenData)
					? kontenData
					: kontenData.data || [];
				setKontenList(list);
			}

			// Fetch tugas (only published)
			const tugasRes = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materiId}/tugas`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (tugasRes.ok) {
				const tugasData = await tugasRes.json();
				const list = Array.isArray(tugasData)
					? tugasData
					: tugasData.data || [];
				// Filter only published tugas
				const publishedTugas = list.filter(
					(t: Tugas) => t.status === "PUBLISHED",
				);
				setTugasList(publishedTugas);
			}

			// Check if already marked as read (use localStorage for now)
			const readKey = `materi_${materiId}_read_${user?.id}`;
			const isRead = localStorage.getItem(readKey) === "true";
			setTelahDibaca(isRead);
		} catch (error) {
			console.error("Error fetching materi detail:", error);
			showError("Terjadi kesalahan saat memuat data");
		} finally {
			setLoading(false);
		}
	}, [materiId, token, user, showError]);

	useEffect(() => {
		if (user && token) {
			fetchMateriDetail();
		}
	}, [user, token, fetchMateriDetail]);

	const handleToggleBacaStatus = async () => {
		if (!kontenList.length) {
			showError("Tidak ada konten untuk dibaca");
			return;
		}

		try {
			setSavingBacaStatus(true);
			const newStatus = !telahDibaca;

			// Save to localStorage (can be replaced with API call later)
			const readKey = `materi_${materiId}_read_${user?.id}`;
			if (newStatus) {
				localStorage.setItem(readKey, "true");
			} else {
				localStorage.removeItem(readKey);
			}

			setTelahDibaca(newStatus);
			showSuccess(
				newStatus
					? "Materi berhasil ditandai sebagai telah dibaca"
					: "Status telah dibaca dihapus",
			);
		} catch (error) {
			console.error("Error updating status:", error);
			showError("Gagal mengupdate status");
		} finally {
			setSavingBacaStatus(false);
		}
	};

	// Helper functions
	const getKontenIcon = (tipe: string) => {
		switch (tipe) {
			case "TEXT":
				return "📝";
			case "FILE":
				return "📁";
			case "VIDEO":
				return "🎥";
			default:
				return "📄";
		}
	};

	const getFileIcon = (fileType?: string) => {
		if (!fileType) return "📄";
		if (fileType.includes("pdf")) return "📕";
		if (fileType.includes("word") || fileType.includes("document")) return "📘";
		if (
			fileType.includes("image") ||
			fileType.includes("jpg") ||
			fileType.includes("jpeg") ||
			fileType.includes("png") ||
			fileType.includes("gif")
		)
			return "🖼️";
		if (fileType.includes("sheet") || fileType.includes("excel")) return "📊";
		return "📄";
	};

	const getYoutubeEmbedUrl = (url: string) => {
		let videoId = "";
		if (url.includes("youtube.com")) {
			const urlParams = new URLSearchParams(new URL(url).search);
			videoId = urlParams.get("v") || "";
		} else if (url.includes("youtu.be")) {
			videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
		}
		return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
	};

	const getFileNameFromPath = (filePath: string) => {
		if (!filePath) return "File Materi";
		const parts = filePath.split("/");
		return parts[parts.length - 1] || "File Materi";
	};

	const extractFileName = (filePath: string) => {
		const fileName = getFileNameFromPath(filePath);
		// Extract actual filename if it has timestamp prefix (format: timestamp-actualname)
		const nameParts = fileName.split("-");
		if (nameParts.length > 1) {
			return nameParts.slice(1).join("-");
		}
		return fileName;
	};

	const extractFileType = (filePath: string) => {
		return getFileTypeFromPath(filePath);
	};

	const getFileTypeFromPath = (filePath: string) => {
		if (!filePath) return "unknown";
		const fileName = getFileNameFromPath(filePath);
		const extension = fileName.split(".").pop()?.toLowerCase() || "";

		// Map extensions to MIME types
		if (["pdf"].includes(extension)) return "application/pdf";
		if (["doc", "docx"].includes(extension)) return "application/msword";
		if (["xls", "xlsx"].includes(extension)) return "application/vnd.ms-excel";
		if (["jpg", "jpeg", "png", "gif"].includes(extension))
			return `image/${extension}`;
		if (["txt"].includes(extension)) return "text/plain";
		if (["mp4", "avi", "mov"].includes(extension)) return `video/${extension}`;

		return extension;
	};

	// Handler untuk toggle viewer PDF/Document
	const handleToggleViewer = useCallback(
		(kontenId: number, fileType?: string) => {
			console.log("Toggle viewer untuk konten:", kontenId);
			console.log("File type:", fileType);
			console.log("Current state:", showViewer[kontenId]);

			setShowViewer((prev) => ({
				...prev,
				[kontenId]: !prev[kontenId],
			}));
		},
		[showViewer],
	);

	// Handler untuk close viewer
	const handleCloseViewer = useCallback((kontenId: number) => {
		console.log("Menutup viewer untuk konten:", kontenId);
		setShowViewer((prev) => ({
			...prev,
			[kontenId]: false,
		}));
	}, []);

	// Handler untuk download file
	const handleDownloadFile = useCallback(
		(filePath: string | undefined, fileName: string) => {
			if (!filePath) {
				showError("Path file tidak valid");
				return;
			}
			try {
				const url = `${process.env.NEXT_PUBLIC_API_URL}${filePath}`;
				const link = document.createElement("a");
				link.href = url;
				link.download = fileName || "download";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				console.log("Download dimulai:", fileName);
			} catch (error) {
				console.error("Error downloading file:", error);
				showError("Gagal mengunduh file");
			}
		},
		[showError],
	);

	// Fungsi untuk generate preview component berdasarkan file type
	const renderPreviewComponent = useCallback(
		(konten: KontenMateri, fileName: string, fileType: string | undefined) => {
			const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}${konten.filePath}`;
			// Use converted PDF if available, otherwise use original file
			const displayUrl = konten.convertedPdfPath
				? `${process.env.NEXT_PUBLIC_API_URL}${konten.convertedPdfPath}`
				: fileUrl;

			// PDF Preview
			if (fileType?.includes("pdf") || konten.convertedPdfPath) {
				return (
					<div className="mb-4 border border-gray-300 rounded-lg bg-gray-100 p-4">
						<div className="flex justify-between items-center mb-3">
							<p className="font-semibold text-gray-700">
								📄 Pratinjau{" "}
								{konten.convertedPdfPath ? "PDF (Konversi)" : "PDF"}
							</p>
							<button
								onClick={() => handleCloseViewer(konten.id)}
								className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold"
							>
								✕ Tutup
							</button>
						</div>
						<object
							data={displayUrl}
							type="application/pdf"
							width="100%"
							height="600"
							className="border border-gray-300 rounded"
						>
							<p>
								PDF tidak dapat ditampilkan.{" "}
								<a
									href={fileUrl}
									download={fileName}
									className="text-blue-600 underline"
								>
									Klik di sini untuk download
								</a>
							</p>
						</object>
					</div>
				);
			}

			// Image Preview
			if (fileType?.includes("image")) {
				return (
					<div className="mb-4 border border-gray-300 rounded-lg bg-gray-100 p-4">
						<div className="flex justify-between items-center mb-3">
							<p className="font-semibold text-gray-700">🖼️ Pratinjau Gambar</p>
							<button
								onClick={() => handleCloseViewer(konten.id)}
								className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold"
							>
								✕ Tutup
							</button>
						</div>
						<div className="bg-white rounded overflow-auto max-h-96">
							<Image
								src={fileUrl}
								alt={fileName}
								width={800}
								height={600}
								className="w-full h-auto"
							/>
						</div>
					</div>
				);
			}

			// Word/Document Preview
			if (
				fileType?.includes("word") ||
				fileType?.includes("document") ||
				fileType?.includes("msword")
			) {
				// If converted PDF is available, show it
				if (konten.convertedPdfPath) {
					return (
						<div className="mb-4 border border-gray-300 rounded-lg bg-gray-100 p-4">
							<div className="flex justify-between items-center mb-3">
								<p className="font-semibold text-gray-700">
									📘 Pratinjau Dokumen Word (Konversi ke PDF)
								</p>
								<button
									onClick={() => handleCloseViewer(konten.id)}
									className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold"
								>
									✕ Tutup
								</button>
							</div>
							<object
								data={displayUrl}
								type="application/pdf"
								width="100%"
								height="600"
								className="border border-gray-300 rounded"
							>
								<p>
									PDF tidak dapat ditampilkan.{" "}
									<a
										href={fileUrl}
										download={fileName}
										className="text-blue-600 underline"
									>
										Klik di sini untuk download file original
									</a>
								</p>
							</object>
						</div>
					);
				}

				// If no converted PDF, show message
				return (
					<div className="mb-4 border border-gray-300 rounded-lg bg-yellow-50 p-4">
						<div className="flex justify-between items-center mb-3">
							<p className="font-semibold text-gray-700">
								📘 Pratinjau Dokumen Word
							</p>
							<button
								onClick={() => handleCloseViewer(konten.id)}
								className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold"
							>
								✕ Tutup
							</button>
						</div>
						<div className="bg-white rounded p-4 text-center">
							<p className="text-gray-700 mb-3">
								📝 File Word tidak dapat dipratinjau di browser
							</p>
							<a
								href={fileUrl}
								download={fileName}
								className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
							>
								⬇️ Download untuk membuka di Microsoft Word
							</a>
						</div>
					</div>
				);
			}

			// Excel/Spreadsheet Preview
			if (
				fileType?.includes("excel") ||
				fileType?.includes("spreadsheet") ||
				fileType?.includes("sheet")
			) {
				return (
					<div className="mb-4 border border-gray-300 rounded-lg bg-yellow-50 p-4">
						<div className="flex justify-between items-center mb-3">
							<p className="font-semibold text-gray-700">
								📊 Pratinjau Spreadsheet
							</p>
							<button
								onClick={() => handleCloseViewer(konten.id)}
								className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold"
							>
								✕ Tutup
							</button>
						</div>
						<div className="bg-white rounded p-4 text-center">
							<p className="text-gray-700 mb-3">
								📊 File Excel tidak dapat dipratinjau di browser
							</p>
							<a
								href={fileUrl}
								download={fileName}
								className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
							>
								⬇️ Download untuk membuka di Microsoft Excel
							</a>
						</div>
					</div>
				);
			}

			// Text files
			if (fileType?.includes("text") || fileType?.includes("plain")) {
				return (
					<div className="mb-4 border border-gray-300 rounded-lg bg-gray-100 p-4">
						<div className="flex justify-between items-center mb-3">
							<p className="font-semibold text-gray-700">📄 Pratinjau Text</p>
							<button
								onClick={() => handleCloseViewer(konten.id)}
								className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold"
							>
								✕ Tutup
							</button>
						</div>
						<iframe
							src={fileUrl}
							width="100%"
							height="600"
							className="border border-gray-300 rounded"
							title={fileName}
						/>
					</div>
				);
			}

			// Video Preview (YouTube or direct video)
			if (konten.tipeKonten === "VIDEO" && konten.linkVideo) {
				const embedUrl = getYoutubeEmbedUrl(konten.linkVideo);
				return (
					<div className="mb-4 border border-gray-300 rounded-lg bg-gray-100 p-4">
						<div className="flex justify-between items-center mb-3">
							<p className="font-semibold text-gray-700">🎥 Pratinjau Video</p>
							<button
								onClick={() => handleCloseViewer(konten.id)}
								className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold"
							>
								✕ Tutup
							</button>
						</div>
						<div className="aspect-video rounded-lg overflow-hidden bg-black">
							<iframe
								src={embedUrl}
								className="w-full h-full"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
								title={fileName}
							/>
						</div>
					</div>
				);
			}

			// Default: File tidak dapat dipratinjau
			return (
				<div className="mb-4 border border-gray-300 rounded-lg bg-yellow-50 p-4">
					<div className="flex justify-between items-center">
						<div>
							<p className="font-semibold text-gray-700">
								⚠️ File tidak dapat dipratinjau
							</p>
							<p className="text-sm text-gray-600">
								Tipe file: {fileType || "tidak diketahui"}
							</p>
						</div>
						<button
							onClick={() => handleCloseViewer(konten.id)}
							className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold"
						>
							✕ Tutup
						</button>
					</div>
				</div>
			);
		},
		[handleCloseViewer],
	);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
			</div>
		);
	}

	if (!materi) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Materi tidak ditemukan
					</h1>
					<Link
						href="/siswa/elearning"
						className="text-purple-600 hover:text-purple-700"
					>
						← Kembali ke daftar materi
					</Link>
				</div>
			</div>
		);
	}

	const mapelId = materi.mataPelajaran?.id;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
				<div className="max-w-6xl mx-auto px-4 py-8">
					{mapelId && (
						<Link
							href={`/siswa/elearning/${mapelId}`}
							className="text-purple-100 hover:text-white mb-4 inline-block"
						>
							← Kembali ke Daftar Materi
						</Link>
					)}
					<h1 className="text-3xl font-bold mb-2">{materi.judulMateri}</h1>
					{materi.mataPelajaran && (
						<p className="text-purple-100">
							Mata Pelajaran: {materi.mataPelajaran.nama}
						</p>
					)}
					{materi.deskripsi && (
						<p className="text-purple-100 mt-3 max-w-3xl">{materi.deskripsi}</p>
					)}
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-4 py-8">
				{/* Konten Materi Section */}
				<div className="bg-white rounded-lg shadow-md p-6 mb-8">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-bold text-gray-900">
							📚 Konten Pembelajaran
						</h2>
						<span className="text-sm text-gray-600">
							{kontenList.length} konten tersedia
						</span>
					</div>

					{kontenList.length > 0 ? (
						<div className="space-y-4">
							{kontenList.map((konten, idx) => {
								// Fallback to extract from filePath if not provided
								const fileName =
									konten.fileName || getFileNameFromPath(konten.filePath || "");
								const fileType =
									konten.fileType || getFileTypeFromPath(konten.filePath || "");

								console.log("Rendering konten:", {
									id: konten.id,
									tipeKonten: konten.tipeKonten,
									fileName: fileName,
									fileType: fileType,
									filePath: konten.filePath,
									isPDF: fileType?.includes("pdf"),
									showViewerState: showViewer[konten.id],
								});
								return (
									<div
										key={konten.id}
										className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
									>
										<div className="flex items-start gap-4">
											<div className="text-3xl">
												{getKontenIcon(konten.tipeKonten)}
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
														{konten.tipeKonten}
													</span>
													<h3 className="text-lg font-bold text-gray-900">
														{konten.judul}
													</h3>
												</div>

												{/* TEXT Content */}
												{konten.tipeKonten === "TEXT" && konten.kontenTeks && (
													<div className="bg-gray-50 rounded-lg p-4 mt-3">
														<p className="text-gray-700 whitespace-pre-wrap">
															{konten.kontenTeks}
														</p>
													</div>
												)}

												{/* FILE Content */}
												{konten.tipeKonten === "FILE" &&
													konten.filePath &&
													(() => {
														const fileName =
															konten.fileName ||
															extractFileName(konten.filePath);
														const fileType =
															konten.fileType ||
															extractFileType(konten.filePath);
														return (
															<div className="mt-3">
																{/* Show preview if viewer is open */}
																{showViewer[konten.id] &&
																	renderPreviewComponent(
																		konten,
																		fileName,
																		fileType,
																	)}

																{/* Image Preview - always show for images */}
																{fileType?.includes("image") && (
																	<div className="rounded-lg overflow-hidden mb-4 border border-gray-300">
																		<Image
																			src={`${process.env.NEXT_PUBLIC_API_URL}${konten.filePath}`}
																			alt={fileName}
																			width={800}
																			height={400}
																			className="w-full h-auto max-h-96 object-cover"
																		/>
																	</div>
																)}

																{/* File Info & Buttons */}
																<div className="flex items-center gap-3 bg-gray-50 border border-gray-300 rounded-lg p-4 flex-wrap">
																	<span className="text-2xl">
																		{getFileIcon(fileType)}
																	</span>
																	<div className="flex-1 min-w-40">
																		<p className="font-semibold text-gray-800">
																			{fileName}
																		</p>
																		<p className="text-sm text-gray-600">
																			{fileType}
																		</p>
																	</div>
																	<div className="flex gap-2 flex-wrap">
																		{/* Preview Button - for all files except plain images */}
																		{!fileType?.includes("image") && (
																			<button
																				onClick={() =>
																					handleToggleViewer(
																						konten.id,
																						fileType,
																					)
																				}
																				className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
																			>
																				👁️{" "}
																				{showViewer[konten.id]
																					? "Tutup"
																					: "Lihat"}
																			</button>
																		)}

																		{/* Download Button */}
																		<button
																			onClick={() =>
																				handleDownloadFile(
																					konten.filePath,
																					fileName,
																				)
																			}
																			className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
																		>
																			⬇️ Download
																		</button>
																	</div>
																</div>
															</div>
														);
													})()}
												{/* VIDEO Content */}
												{konten.tipeKonten === "VIDEO" && konten.linkVideo && (
													<div className="mt-3">
														{konten.linkVideo.includes("youtube.com") ||
														konten.linkVideo.includes("youtu.be") ? (
															<div className="aspect-video rounded-lg overflow-hidden shadow-md">
																<iframe
																	src={getYoutubeEmbedUrl(konten.linkVideo)}
																	className="w-full h-full"
																	allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
																	allowFullScreen
																></iframe>
															</div>
														) : (
															<a
																href={konten.linkVideo}
																target="_blank"
																rel="noopener noreferrer"
																className="text-blue-600 hover:text-blue-700 underline"
															>
																{konten.linkVideo}
															</a>
														)}
													</div>
												)}

												<p className="text-xs text-gray-400 mt-3">
													Ditambahkan:{" "}
													{new Date(konten.createdAt || "").toLocaleDateString(
														"id-ID",
													)}
												</p>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="text-center py-12 text-gray-500">
							<div className="text-6xl mb-4">📭</div>
							<p className="text-lg">Belum ada konten pembelajaran</p>
						</div>
					)}

					{/* Telah Dibaca Checkbox */}
					{kontenList.length > 0 && (
						<div className="mt-8 pt-6 border-t border-gray-200">
							<div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
								<div className="flex items-start gap-4">
									<input
										type="checkbox"
										id="telahDibaca"
										checked={telahDibaca}
										onChange={handleToggleBacaStatus}
										disabled={savingBacaStatus}
										className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
									/>
									<div className="flex-1">
										<label
											htmlFor="telahDibaca"
											className="text-lg font-semibold text-gray-900 cursor-pointer"
										>
											Saya telah membaca dan memahami semua konten pembelajaran
										</label>
										<p className="text-sm text-gray-600 mt-1">
											Centang kotak ini untuk mengonfirmasi bahwa Anda telah
											membaca materi. Anda harus mencentang ini sebelum dapat
											mengerjakan tugas/kuis.
										</p>
										{telahDibaca && (
											<p className="text-sm text-green-600 font-semibold mt-2">
												✓ Verifikasi berhasil! Anda sekarang dapat mengerjakan
												tugas/kuis di bawah.
											</p>
										)}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Tugas & Kuis Section */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-xl font-bold text-gray-900 mb-4">
						📝 Tugas & Kuis
					</h2>

					{tugasList.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{tugasList.map((tugas) => {
								const isTugas = tugas.tipe === "TUGAS";
								const isLocked = !telahDibaca && kontenList.length > 0;

								return (
									<div
										key={tugas.id}
										className={`border rounded-lg p-3 transition-all ${
											isLocked
												? "border-gray-300 bg-gray-50 opacity-60"
												: "border-gray-200 hover:shadow-md hover:border-purple-300"
										}`}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<span
														className={`px-2 py-0.5 text-white text-xs font-semibold rounded whitespace-nowrap ${
															isTugas ? "bg-purple-600" : "bg-indigo-600"
														}`}
													>
														{tugas.tipe}
													</span>
												</div>
												<h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
													{tugas.judulTugas}
												</h3>
												{tugas.deadline && (
													<p className="text-xs text-gray-500">
														Deadline:{" "}
														{new Date(tugas.deadline).toLocaleDateString(
															"id-ID",
															{
																day: "numeric",
																month: "short",
																year: "numeric",
															},
														)}
													</p>
												)}
											</div>

											{isLocked ? (
												<div className="px-2 py-1 bg-gray-300 text-gray-600 rounded text-xs font-semibold whitespace-nowrap">
													🔒
												</div>
											) : (
												<Link
													href={
														isTugas
															? `/siswa/elearning/materi/${materiId}/tugas/${tugas.id}`
															: `/siswa/elearning/materi/${materiId}/kuis/${tugas.id}`
													}
													className={`px-2 py-1 rounded text-xs font-semibold text-white transition whitespace-nowrap ${
														isTugas
															? "bg-purple-600 hover:bg-purple-700"
															: "bg-indigo-600 hover:bg-indigo-700"
													}`}
												>
													Kerjakan
												</Link>
											)}
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<p className="text-sm">Belum ada tugas atau kuis</p>
						</div>
					)}
				</div>
			</div>

			<SuccessToast
				isOpen={successToast.isOpen}
				message={successToast.message}
				onClose={closeSuccess}
			/>
			<ErrorToast
				isOpen={errorToast.isOpen}
				message={errorToast.message}
				onClose={closeError}
			/>
		</div>
	);
}
