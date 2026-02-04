"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import {
	SuccessToast,
	ErrorToast,
	ConfirmModal,
} from "@/components/CommonModals";
import { useNotification } from "@/hooks/useNotification";

interface Materi {
	id: number;
	judulMateri: string;
	deskripsi: string;
	tipeKonten: "TEXT" | "FILE" | "VIDEO";
	kontenTeks?: string;
	filePath?: string;
	status: "DRAFT" | "PUBLISHED" | "CLOSED";
	createdAt: string;
	mapelId: number;
	mataPelajaran?: {
		id: number;
		nama: string;
	};
}

export default function MateriPage() {
	const user = useAuthStore((state) => state.user);
	const token = useAuthStore((state) => state.token);

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

	const [materiList, setMateriList] = useState<Materi[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
	const [showAddModal, setShowAddModal] = useState(false);
	const [mataPelajaranList, setMataPelajaranList] = useState<any[]>([]);
	const [formData, setFormData] = useState({
		judulMateri: "",
		deskripsi: "",
		mapelId: "",
		tipeKonten: "TEXT",
		kontenTeks: "",
	});
	const [formLoading, setFormLoading] = useState(false);

	useEffect(() => {
		if (!user || user.role !== "admin") {
			return;
		}
		fetchMataPelajaran();
		fetchAllMateri();
	}, [user, token]);

	const fetchAllMateri = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/admin/materi`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.ok) {
				showError("Gagal memuat data materi");
				return;
			}

			const data = await response.json();
			// Handle both array and {data: []} format
			const materiList = Array.isArray(data) ? data : data.data || [];
			setMateriList(materiList);
		} catch (error) {
			console.error("Error loading materi:", error);
			showError("Terjadi kesalahan saat memuat materi");
		} finally {
			setLoading(false);
		}
	};

	const fetchMataPelajaran = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/dropdown/mata-pelajaran`,
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

	const handleAddClick = () => {
		setFormData({
			judulMateri: "",
			deskripsi: "",
			mapelId: "",
			tipeKonten: "TEXT",
			kontenTeks: "",
		});
		setShowAddModal(true);
	};

	const handleSaveMateri = async () => {
		if (!formData.judulMateri.trim()) {
			showError("Judul materi harus diisi");
			return;
		}

		if (!formData.mapelId) {
			showError("Mata pelajaran harus dipilih");
			return;
		}

		setFormLoading(true);
		try {
			const payload = {
				judulMateri: formData.judulMateri,
				deskripsi: formData.deskripsi,
				mataPelajaranId: parseInt(formData.mapelId),
				status: "DRAFT",
			};

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/admin/materi`,
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
				showError(errorData.message || "Gagal menambah materi");
				return;
			}

			const result = await response.json();
			const materiId = result.data?.id || result.id;

			showSuccess("Materi berhasil dibuat! Silakan atur detailnya.");
			setShowAddModal(false);

			// Redirect ke halaman detail materi
			setTimeout(() => {
				window.location.href = `/admin/elearning/materi-detail/${materiId}`;
			}, 500);
		} catch (error) {
			console.error("Error saving materi:", error);
			showError("Terjadi kesalahan saat menambah materi");
		} finally {
			setFormLoading(false);
		}
	};

	const handleDelete = (materi: any) => {
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

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-800">📝 Materi & Tugas</h1>
				<p className="text-gray-600 text-sm mt-1">
					Kelola materi pembelajaran dari semua guru
				</p>
			</div>

			{/* Navigation Tabs */}
			<div className="bg-white rounded-lg shadow mb-6 border-b-2 border-gray-200">
				<div className="flex flex-wrap">
					<Link
						href="/admin/elearning"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
					>
						📖 Mata Pelajaran
					</Link>
					<Link
						href="/admin/elearning/materi"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-blue-600 hover:bg-gray-50"
					>
						📝 Materi & Tugas
					</Link>
					<Link
						href="/admin/elearning/koreksi"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
					>
						✅ Koreksi Jawaban
					</Link>
				</div>
			</div>

			{/* Info Box */}
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<p className="text-sm text-gray-700">
					<span className="font-semibold">💡 Total Materi:</span>{" "}
					{materiList.length} materi dari semua guru
				</p>
			</div>

			{/* Add Button */}
			<button
				onClick={handleAddClick}
				className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition"
			>
				➕ Tambah Materi Baru
			</button>

			{/* Loading State */}
			{loading ? (
				<div className="text-center py-12">
					<p className="text-gray-600">Memuat materi...</p>
				</div>
			) : materiList.length === 0 ? (
				<div className="bg-white rounded-lg shadow p-8 text-center">
					<p className="text-gray-600 text-lg">Belum ada materi</p>
				</div>
			) : (
				<div className="space-y-4">
					{materiList.map((materi) => (
						<div
							key={materi.id}
							className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
						>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
								<div>
									<p className="text-sm text-gray-600">Mata Pelajaran</p>
									<p className="font-semibold text-gray-900">
										{materi.mataPelajaran?.nama || "N/A"}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Judul Materi</p>
									<p className="font-semibold text-gray-900">
										{materi.judulMateri}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Status</p>
									<span
										className={`px-3 py-1 rounded-full text-xs font-medium ${
											materi.status === "DRAFT"
												? "bg-gray-100 text-gray-800"
												: materi.status === "PUBLISHED"
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800"
										}`}
									>
										{materi.status}
									</span>
								</div>
							</div>

							<p className="text-gray-700 mb-4 line-clamp-2">
								{materi.deskripsi}
							</p>

							<div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
								<span>
									🕐 {new Date(materi.createdAt).toLocaleDateString("id-ID")}
								</span>
								<span>📄 Tipe: {materi.tipeKonten}</span>
							</div>

							<div className="flex flex-wrap gap-3">
								<Link
									href={`/admin/elearning/materi-detail/${materi.id}`}
									className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
								>
									👁️ Lihat Detail
								</Link>{" "}
								<Link
									href={`/admin/elearning/materi-edit/${materi.id}`}
									className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
								>
									✏️ Edit
								</Link>{" "}
								<button
									onClick={() => handleDelete(materi)}
									disabled={deleteLoading === materi.id}
									className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
								>
									{deleteLoading === materi.id ? "..." : "🗑️ Hapus"}
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Toasts */}
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

			{/* Add Materi Modal */}
			{showAddModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
						<h2 className="text-2xl font-bold text-gray-800 mb-4">
							➕ Buat Materi Baru
						</h2>
						<p className="text-gray-600 text-sm mb-6">
							Isi informasi dasar materi. Anda dapat menambah konten lengkap di
							halaman detail materi.
						</p>

						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleSaveMateri();
							}}
							className="space-y-4"
						>
							{/* Mata Pelajaran */}
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Mata Pelajaran *
								</label>
								<select
									value={formData.mapelId}
									onChange={(e) =>
										setFormData({ ...formData, mapelId: e.target.value })
									}
									className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
									required
								>
									<option value="">Pilih Mata Pelajaran</option>
									{mataPelajaranList.map((mapel) => (
										<option key={mapel.id} value={mapel.id}>
											{mapel.nama}
										</option>
									))}
								</select>
							</div>

							{/* Judul */}
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Judul Materi *
								</label>
								<input
									type="text"
									value={formData.judulMateri}
									onChange={(e) =>
										setFormData({ ...formData, judulMateri: e.target.value })
									}
									placeholder="Masukkan judul materi"
									className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
									required
								/>
							</div>

							{/* Deskripsi */}
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Deskripsi (Opsional)
								</label>
								<textarea
									value={formData.deskripsi}
									onChange={(e) =>
										setFormData({ ...formData, deskripsi: e.target.value })
									}
									placeholder="Deskripsi singkat tentang materi"
									className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
									rows={2}
								></textarea>
							</div>

							<div className="flex gap-3 justify-end pt-6">
								<button
									type="button"
									onClick={() => setShowAddModal(false)}
									className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition"
									disabled={formLoading}
								>
									Batal
								</button>
								<button
									type="submit"
									className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
									disabled={formLoading}
								>
									{formLoading ? "Membuat..." : "Buat Materi"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
