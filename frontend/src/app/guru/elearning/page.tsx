"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useNotification } from "@/hooks/useNotification";
import {
	SuccessToast,
	ErrorToast,
	ConfirmModal,
} from "@/components/CommonModals";

interface MataPelajaran {
	id: number;
	nama: string;
}

interface Materi {
	id: number;
	judulMateri: string;
	deskripsi: string;
	status: "DRAFT" | "PUBLISHED" | "CLOSED";
	createdAt: string;
	updatedAt?: string;
	mataPelajaran?: {
		id: number;
		nama: string;
	};
}

export default function GuruElearningPage() {
	const token = useAuthStore((state) => state.token);
	const user = useAuthStore((state) => state.user);
	const isLoading = useAuthStore((state) => state.isLoading);
	const {
		successToast,
		errorToast,
		showSuccess,
		showError,
		closeSuccess,
		closeError,
		showConfirm,
		confirmModal,
		closeConfirm,
	} = useNotification();

	const [loading, setLoading] = useState(true);
	const [materiList, setMateriList] = useState<Materi[]>([]);
	const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
	const [showAddMaterModal, setShowAddMaterModal] = useState(false);
	const [showEditMateriModal, setShowEditMateriModal] = useState(false);
	const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>(
		[],
	);
	const [formLoading, setFormLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<number | null>(null);

	const [materFormData, setMaterFormData] = useState({
		judulMateri: "",
		deskripsi: "",
		mapelId: "",
		file: null as File | null,
	});
	const [editMateriId, setEditMateriId] = useState<number | null>(null);

	useEffect(() => {
		if (!isLoading && user && token) {
			fetchMataPelajaranGuru();
			fetchGuruMateri();
		}
	}, [user, token, isLoading]);

	useEffect(() => {
		if (mataPelajaranList.length > 0 && !materFormData.mapelId) {
			setMaterFormData((prev) => ({
				...prev,
				mapelId: mataPelajaranList[0].id.toString(),
			}));
		}
	}, [mataPelajaranList, materFormData.mapelId]);

	const fetchMataPelajaranGuru = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/guru/mata-pelajaran`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (response.ok) {
				const data = await response.json();
				const list = Array.isArray(data) ? data : data.data || [];
				setMataPelajaranList(list);
			}
		} catch (error) {
			console.error("Error loading mata pelajaran:", error);
		}
	};

	const fetchGuruMateri = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/guru/materi`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (response.ok) {
				const data = await response.json();
				const list = Array.isArray(data) ? data : data.data || [];
				setMateriList(list);
			}
		} catch (error) {
			console.error("Error loading materi:", error);
			showError("Gagal memuat materi");
		} finally {
			setLoading(false);
		}
	};

	const handleAddMateri = () => {
		setMaterFormData({
			judulMateri: "",
			deskripsi: "",
			mapelId: mataPelajaranList[0]?.id.toString() || "",
			file: null,
		});
		setShowAddMaterModal(true);
	};

	const handleSaveMateri = async () => {
		if (!materFormData.judulMateri.trim()) {
			showError("Judul materi harus diisi");
			return;
		}

		if (!materFormData.mapelId) {
			showError("Pilih mata pelajaran terlebih dahulu");
			return;
		}

		setFormLoading(true);
		setUploadProgress(0);
		try {
			// Step 1: Upload file jika ada
			let filePath = null;
			if (materFormData.file) {
				const fileFormData = new FormData();
				fileFormData.append("file", materFormData.file);

				setUploadProgress(50);
				const uploadResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/elearning/upload/materi`,
					{
						method: "POST",
						headers: { Authorization: `Bearer ${token}` },
						body: fileFormData,
					},
				);

				if (!uploadResponse.ok) {
					const errorData = await uploadResponse.json();
					showError(errorData.message || "Gagal upload file");
					return;
				}

				const uploadedFile = await uploadResponse.json();
				filePath = uploadedFile.data.filePath;
				setUploadProgress(75);
			}

			// Step 2: Create materi
			const payload = {
				judulMateri: materFormData.judulMateri,
				deskripsi: materFormData.deskripsi,
				mataPelajaranId: parseInt(materFormData.mapelId),
				filePath: filePath,
			};

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/guru/materi`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				showError(errorData.message || "Gagal membuat materi");
				return;
			}

			setUploadProgress(100);
			showSuccess("Materi berhasil dibuat");
			setShowAddMaterModal(false);
			setMaterFormData({
				judulMateri: "",
				deskripsi: "",
				mapelId: mataPelajaranList[0]?.id.toString() || "",
				file: null,
			});
			fetchGuruMateri();
		} catch (error) {
			console.error("Error saving materi:", error);
			showError("Terjadi kesalahan saat menyimpan materi");
		} finally {
			setFormLoading(false);
			setUploadProgress(null);
		}
	};

	const handleEditMateri = (materi: Materi) => {
		setMaterFormData({
			judulMateri: materi.judulMateri,
			deskripsi: materi.deskripsi,
			mapelId: materi.mataPelajaran?.id.toString() || "",
			file: null,
		});
		setEditMateriId(materi.id);
		setShowEditMateriModal(true);
	};

	const handleSaveEditMateri = async () => {
		if (!materFormData.judulMateri.trim()) {
			showError("Judul materi harus diisi");
			return;
		}

		setFormLoading(true);
		try {
			const payload = {
				judulMateri: materFormData.judulMateri,
				deskripsi: materFormData.deskripsi,
				mataPelajaranId: parseInt(materFormData.mapelId),
			};

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${editMateriId}`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				},
			);

			if (!response.ok) {
				showError("Gagal mengubah materi");
				return;
			}

			const updatedMateri = await response.json();
			setMateriList(
				materiList.map((m) => (m.id === editMateriId ? updatedMateri : m)),
			);
			setShowEditMateriModal(false);
			setEditMateriId(null);
			showSuccess("Materi berhasil diubah");
		} catch (error) {
			console.error("Error updating materi:", error);
			showError("Terjadi kesalahan saat mengubah materi");
		} finally {
			setFormLoading(false);
		}
	};

	const handleDeleteMateri = (materi: Materi) => {
		showConfirm({
			title: "Hapus Materi",
			message: `Yakin ingin menghapus materi "${materi.judulMateri}"?`,
			onConfirm: async () => {
				setDeleteLoading(materi.id);
				try {
					const response = await fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materi.id}`,
						{
							method: "DELETE",
							headers: { Authorization: `Bearer ${token}` },
						},
					);

					if (!response.ok) {
						showError("Gagal menghapus materi");
						return;
					}

					setMateriList(materiList.filter((m) => m.id !== materi.id));
					showSuccess("Materi berhasil dihapus");
				} catch (error) {
					console.error("Error deleting materi:", error);
					showError("Terjadi kesalahan saat menghapus materi");
				} finally {
					setDeleteLoading(null);
					closeConfirm();
				}
			},
		});
	};

	const handlePublishMateri = async (materi: Materi) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materi.id}/publish`,
				{
					method: "PATCH",
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.ok) {
				showError("Gagal mempublikasikan materi");
				return;
			}

			showSuccess("Materi berhasil dipublikasikan");
			fetchGuruMateri();
		} catch (error) {
			console.error("Error publishing materi:", error);
			showError("Terjadi kesalahan");
		}
	};

	const handleCloseMateri = async (materi: Materi) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materi.id}/close`,
				{
					method: "PATCH",
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.ok) {
				showError("Gagal menutup materi");
				return;
			}

			showSuccess("Materi berhasil ditutup");
			fetchGuruMateri();
		} catch (error) {
			console.error("Error closing materi:", error);
			showError("Terjadi kesalahan");
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "DRAFT":
				return "bg-gray-100 text-gray-800";
			case "PUBLISHED":
				return "bg-green-100 text-green-800";
			case "CLOSED":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">
						📚 E-Learning
					</h1>
					<p className="text-gray-600">
						Kelola materi, rencana, tugas, dan kuis pembelajaran
					</p>
				</div>

				{/* Tab Navigation */}
				<div className="mb-6 flex gap-2">
					<button className="px-6 py-2 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold transition">
						📝 Materi
					</button>
				</div>

				{/* Main Content */}
				<div className="grid lg:grid-cols-3 gap-6">
					{/* Sidebar */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-lg shadow-md p-6 space-y-4">
							<h2 className="text-xl font-bold text-gray-900">⚡ Aksi Cepat</h2>

							<button
								onClick={handleAddMateri}
								className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition"
							>
								➕ Tambah Materi
							</button>

							<button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition">
								📥 Impor dari Excel
							</button>

							<button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition">
								📊 Lihat Statistik
							</button>

							<div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
								<p className="text-sm text-gray-600 font-semibold mb-2">
									💡 Total Materi
								</p>
								<p className="text-3xl font-bold text-blue-600">
									{materiList.length}
								</p>
							</div>
						</div>
					</div>

					{/* Materi List */}
					<div className="lg:col-span-2">
						{!loading ? (
							materiList.length > 0 ? (
								<div className="space-y-4">
									{materiList.map((materi) => (
										<div
											key={materi.id}
											className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition"
										>
											<div className="flex justify-between items-start mb-3">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-2">
														<span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
															MATERI
														</span>
														<span
															className={`inline-block px-3 py-1 text-xs font-semibold rounded ${getStatusBadge(
																materi.status,
															)}`}
														>
															{materi.status}
														</span>
													</div>
													<h3 className="text-lg font-bold text-gray-900">
														{materi.judulMateri}
													</h3>
												</div>
											</div>

											<div className="grid grid-cols-3 gap-4 mb-3 text-sm text-gray-600">
												<div>
													<p className="font-semibold text-gray-700">
														{materi.mataPelajaran?.nama}
													</p>
												</div>
												<div>
													<p className="font-semibold text-gray-700">
														{materi.judulMateri}
													</p>
												</div>
												<div>
													<p className="font-semibold text-gray-700">
														{new Date(materi.createdAt).toLocaleDateString(
															"id-ID",
														)}
													</p>
												</div>
											</div>

											<p className="text-sm text-gray-600 line-clamp-2 mb-3">
												{materi.deskripsi}
											</p>

											<div className="flex gap-2 flex-wrap">
												<Link
													href={`/guru/elearning/materi-detail/${materi.id}`}
													className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
												>
													👁️ Detail
												</Link>
												<button
													onClick={() => handleEditMateri(materi)}
													className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition"
												>
													✏️ Edit
												</button>
												{materi.status === "DRAFT" && (
													<button
														onClick={() => handlePublishMateri(materi)}
														className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition"
													>
														✅ Publikasikan
													</button>
												)}
												{materi.status === "PUBLISHED" && (
													<button
														onClick={() => handleCloseMateri(materi)}
														className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm transition"
													>
														🔒 Tutup
													</button>
												)}
												<button
													onClick={() => handleDeleteMateri(materi)}
													disabled={deleteLoading === materi.id}
													className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition disabled:opacity-50"
												>
													{deleteLoading === materi.id ? "..." : "🗑️ Hapus"}
												</button>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="bg-white rounded-lg shadow-md p-12 text-center">
									<p className="text-gray-500 text-lg">
										Belum ada materi. Buat materi baru sekarang!
									</p>
								</div>
							)
						) : (
							<div className="text-center py-12">
								<p className="text-gray-600">Memuat data...</p>
							</div>
						)}
					</div>
				</div>

				{/* Add Materi Modal */}
				{showAddMaterModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto">
							<div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex items-center justify-between sticky top-0">
								<h2 className="text-2xl font-bold">Tambah Materi</h2>
								<button
									onClick={() => setShowAddMaterModal(false)}
									className="text-2xl font-bold hover:opacity-75"
								>
									✕
								</button>
							</div>
							<div className="p-6 space-y-4">
								<div>
									<label className="text-sm text-gray-600 font-semibold">
										Mata Pelajaran
									</label>
									<select
										value={materFormData.mapelId}
										onChange={(e) =>
											setMaterFormData({
												...materFormData,
												mapelId: e.target.value,
											})
										}
										className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value="">Pilih Mata Pelajaran</option>
										{mataPelajaranList.map((mapel) => (
											<option key={mapel.id} value={mapel.id}>
												{mapel.nama}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="text-sm text-gray-600 font-semibold">
										Judul Materi
									</label>
									<input
										type="text"
										value={materFormData.judulMateri}
										onChange={(e) =>
											setMaterFormData({
												...materFormData,
												judulMateri: e.target.value,
											})
										}
										className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Masukkan judul materi"
									/>
								</div>

								<div>
									<label className="text-sm text-gray-600 font-semibold">
										Deskripsi
									</label>
									<textarea
										value={materFormData.deskripsi}
										onChange={(e) =>
											setMaterFormData({
												...materFormData,
												deskripsi: e.target.value,
											})
										}
										rows={3}
										className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Masukkan deskripsi materi"
									/>
								</div>

								<div>
									<label className="text-sm text-gray-600 font-semibold">
										📎 Upload File (Optional)
									</label>
									<div className="mt-2 border-2 border-dashed border-blue-300 rounded-lg p-4 hover:border-blue-500 transition cursor-pointer">
										<input
											type="file"
											onChange={(e) =>
												setMaterFormData({
													...materFormData,
													file: e.target.files?.[0] || null,
												})
											}
											className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer hover:file:bg-blue-600"
											accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.zip"
										/>
										{materFormData.file && (
											<p className="text-sm text-green-600 mt-2">
												✓ {materFormData.file.name}
											</p>
										)}
										<p className="text-xs text-gray-400 mt-2">
											Format: PDF, Word, Excel, PowerPoint, Image, Text, ZIP
											(Max 50MB)
										</p>
									</div>
								</div>

								{uploadProgress !== null && (
									<div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div
												className="bg-blue-600 h-2 rounded-full transition-all"
												style={{ width: `${uploadProgress}%` }}
											></div>
										</div>
										<p className="text-xs text-gray-600 mt-1">
											{uploadProgress}%
										</p>
									</div>
								)}

								<div className="flex gap-3">
									<button
										onClick={() => setShowAddMaterModal(false)}
										className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition"
									>
										Batal
									</button>
									<button
										onClick={handleSaveMateri}
										disabled={formLoading}
										className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
									>
										{formLoading ? "Menyimpan..." : "Simpan"}
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Edit Materi Modal */}
				{showEditMateriModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto">
							<div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex items-center justify-between sticky top-0">
								<h2 className="text-2xl font-bold">Edit Materi</h2>
								<button
									onClick={() => setShowEditMateriModal(false)}
									className="text-2xl font-bold hover:opacity-75"
								>
									✕
								</button>
							</div>
							<div className="p-6 space-y-4">
								<div>
									<label className="text-sm text-gray-600 font-semibold">
										Mata Pelajaran
									</label>
									<select
										value={materFormData.mapelId}
										onChange={(e) =>
											setMaterFormData({
												...materFormData,
												mapelId: e.target.value,
											})
										}
										className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value="">Pilih Mata Pelajaran</option>
										{mataPelajaranList.map((mapel) => (
											<option key={mapel.id} value={mapel.id}>
												{mapel.nama}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="text-sm text-gray-600 font-semibold">
										Judul Materi
									</label>
									<input
										type="text"
										value={materFormData.judulMateri}
										onChange={(e) =>
											setMaterFormData({
												...materFormData,
												judulMateri: e.target.value,
											})
										}
										className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Judul materi"
									/>
								</div>

								<div>
									<label className="text-sm text-gray-600 font-semibold">
										Deskripsi
									</label>
									<textarea
										value={materFormData.deskripsi}
										onChange={(e) =>
											setMaterFormData({
												...materFormData,
												deskripsi: e.target.value,
											})
										}
										rows={3}
										className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Deskripsi materi"
									/>
								</div>

								<div className="flex gap-3">
									<button
										onClick={() => setShowEditMateriModal(false)}
										className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition"
									>
										Batal
									</button>
									<button
										onClick={handleSaveEditMateri}
										disabled={formLoading}
										className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
									>
										{formLoading ? "Menyimpan..." : "Perbarui"}
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

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
				<ConfirmModal
					isOpen={confirmModal.isOpen}
					title={confirmModal.title}
					message={confirmModal.message}
					onConfirm={confirmModal.onConfirm}
					onCancel={closeConfirm}
				/>
			</div>
		</div>
	);
}
