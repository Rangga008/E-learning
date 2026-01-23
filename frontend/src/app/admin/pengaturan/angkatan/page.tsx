"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import {
	ConfirmModal,
	SuccessToast,
	ErrorToast,
} from "@/components/CommonModals";
import { useNotification } from "@/hooks/useNotification";
import { logger } from "@/lib/logger";

interface Angkatan {
	id: number;
	levelAngkatan: number;
	sekolah: string;
	namaAngkatan: string;
	aktifkan: boolean;
	createdAt?: string;
}

export default function AngkatanPage() {
	const {
		successToast,
		errorToast,
		confirmModal,
		showSuccess,
		showError,
		showConfirm,
		closeSuccess,
		closeError,
		closeConfirm,
	} = useNotification();

	const [angkatans, setAngkatans] = useState<Angkatan[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [formData, setFormData] = useState({
		levelAngkatan: 1,
		sekolah: "SD",
		namaAngkatan: "",
		aktifkan: true,
	});

	useEffect(() => {
		fetchAngkatan();
	}, []);

	const fetchAngkatan = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/settings/angkatan`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			setAngkatans(response.data.data || []);
		} catch (error) {
			console.error("Error fetching angkatan:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddClick = () => {
		setFormData({
			levelAngkatan: 1,
			sekolah: "SD",
			namaAngkatan: "",
			aktifkan: true,
		});
		setEditingId(null);
		setShowModal(true);
	};

	const handleEditClick = (angkatan: Angkatan) => {
		setFormData({
			levelAngkatan: angkatan.levelAngkatan,
			sekolah: angkatan.sekolah,
			namaAngkatan: angkatan.namaAngkatan,
			aktifkan: angkatan.aktifkan,
		});
		setEditingId(angkatan.id);
		setShowEditModal(true);
	};

	const handleSave = async () => {
		if (!formData.namaAngkatan.trim()) {
			logger.error("Save Angkatan", { error: "Name is required" });
			showError("Nama angkatan harus diisi");
			return;
		}

		try {
			if (editingId) {
				await axios.put(
					`${process.env.NEXT_PUBLIC_API_URL}/settings/angkatan/${editingId}`,
					formData,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					},
				);
				logger.success("Update Angkatan", { id: editingId });
				showSuccess("Angkatan berhasil diperbarui");
				setShowEditModal(false);
			} else {
				await axios.post(
					`${process.env.NEXT_PUBLIC_API_URL}/settings/angkatan`,
					formData,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					},
				);
				logger.success("Create Angkatan", { nama: formData.namaAngkatan });
				showSuccess("Angkatan berhasil ditambahkan");
				setShowModal(false);
			}
			fetchAngkatan();
		} catch (error) {
			console.error("Error saving angkatan:", error);
			logger.error("Save Angkatan", { error });
			showError("Gagal menyimpan angkatan");
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirm("Yakin ingin menghapus angkatan ini?")) return;
		try {
			await axios.delete(
				`${process.env.NEXT_PUBLIC_API_URL}/settings/angkatan/${id}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			logger.success("Delete Angkatan", { id });
			showSuccess("Angkatan berhasil dihapus");
			fetchAngkatan();
		} catch (error) {
			console.error("Error deleting angkatan:", error);
			logger.error("Delete Angkatan", { error });
			showError("Gagal menghapus angkatan");
		}
	};

	const getLevelRange = (sekolah: string) => {
		switch (sekolah) {
			case "SD":
				return { min: 1, max: 6 };
			case "SMP":
				return { min: 7, max: 9 };
			case "SMA":
				return { min: 10, max: 12 };
			case "K":
				return { min: 1, max: 4 };
			default:
				return { min: 1, max: 6 };
		}
	};

	const levelRange = getLevelRange(formData.sekolah);

	return (
		<div className="p-8 max-w-5xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					📅 Pengaturan Angkatan
				</h1>
				<p className="text-gray-600">Kelola tahun ajaran dan tingkat kelas</p>
			</div>

			{/* Navigation Tabs */}
			<div className="bg-white rounded-lg shadow mb-6 border-b-2 border-gray-200">
				<div className="flex flex-wrap">
					<Link
						href="/admin/pengaturan/umum"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
					>
						⚙️ Pengaturan Umum
					</Link>
					<Link
						href="/admin/pengaturan/tingkat"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
					>
						📚 Tingkatan Kelas
					</Link>
					<Link
						href="/admin/pengaturan/angkatan"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-blue-600 hover:bg-gray-50"
					>
						📅 Angkatan
					</Link>
					<Link
						href="/admin/pengaturan/numerasi"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
					>
						🧮 Pengaturan Numerasi
					</Link>
				</div>
			</div>

			{/* Add Button */}
			<div className="mb-6 flex justify-end">
				<button
					onClick={handleAddClick}
					className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
				>
					➕ Tambah Angkatan
				</button>
			</div>

			{loading ? (
				<div className="text-center py-12 bg-white rounded-lg">
					<p className="text-gray-500">Loading...</p>
				</div>
			) : angkatans.length === 0 ? (
				<div className="text-center py-12 bg-white rounded-lg">
					<p className="text-gray-500">Belum ada data angkatan</p>
				</div>
			) : (
				<div className="bg-white rounded-lg shadow overflow-x-auto">
					<table className="min-w-full">
						<thead className="bg-gray-50 border-b">
							<tr>
								<th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
									No
								</th>
								<th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
									Level
								</th>
								<th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
									Sekolah
								</th>
								<th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
									Nama Angkatan
								</th>
								<th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
									Status
								</th>
								<th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
									Aksi
								</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{angkatans.map((angkatan, index) => (
								<tr key={angkatan.id} className="hover:bg-gray-50">
									<td className="px-6 py-3 text-sm text-gray-900">
										{index + 1}
									</td>
									<td className="px-6 py-3 text-sm text-gray-900">
										{angkatan.levelAngkatan}
									</td>
									<td className="px-6 py-3 text-sm text-gray-900">
										{angkatan.sekolah}
									</td>
									<td className="px-6 py-3 text-sm text-gray-900">
										{angkatan.namaAngkatan}
									</td>
									<td className="px-6 py-3 text-sm">
										<span
											className={`px-3 py-1 rounded-full text-xs font-semibold ${
												angkatan.aktifkan
													? "bg-green-100 text-green-800"
													: "bg-gray-100 text-gray-800"
											}`}
										>
											{angkatan.aktifkan ? "Aktif" : "Nonaktif"}
										</span>
									</td>
									<td className="px-6 py-3 text-sm text-center space-x-2">
										<button
											onClick={() => handleEditClick(angkatan)}
											className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-medium"
										>
											✏️ Edit
										</button>
										<button
											onClick={() => handleDelete(angkatan.id)}
											className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-medium"
										>
											🗑️ Hapus
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Add Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-8 max-w-lg w-full">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-2xl font-bold">Tambah Angkatan</h2>
							<button
								onClick={() => setShowModal(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								✕
							</button>
						</div>

						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Level Angkatan *
									</label>
									<select
										value={formData.levelAngkatan}
										onChange={(e) =>
											setFormData({
												...formData,
												levelAngkatan: parseInt(e.target.value),
											})
										}
										className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										{Array.from(
											{ length: levelRange.max - levelRange.min + 1 },
											(_, i) => levelRange.min + i,
										).map((level) => (
											<option key={level} value={level}>
												Kelas {level}
											</option>
										))}
									</select>
									<p className="text-xs text-gray-500 mt-1">
										Pilih level 1-6 untuk SD, 7-9 untuk SMP, 10-12 untuk SMA
									</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Sekolah *
									</label>
									<select
										value={formData.sekolah}
										onChange={(e) =>
											setFormData({
												...formData,
												sekolah: e.target.value,
												levelAngkatan:
													e.target.value === "SD"
														? 1
														: e.target.value === "SMP"
														? 7
														: e.target.value === "SMA"
														? 10
														: 1,
											})
										}
										className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value="SD">Sekolah Dasar (SD)</option>
										<option value="SMP">Sekolah Menengah Pertama (SMP)</option>
										<option value="SMA">Sekolah Menengah Atas (SMA)</option>
										<option value="K">Kejuruan (K)</option>
									</select>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Nama Angkatan *
								</label>
								<input
									type="text"
									placeholder={`Contoh: Kelas ${formData.levelAngkatan} ${formData.sekolah}`}
									value={formData.namaAngkatan}
									onChange={(e) =>
										setFormData({
											...formData,
											namaAngkatan: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Nama yang akan ditampilkan di sistem
								</p>
							</div>

							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="aktifkan"
									checked={formData.aktifkan}
									onChange={(e) =>
										setFormData({
											...formData,
											aktifkan: e.target.checked,
										})
									}
									className="w-4 h-4 text-blue-600 rounded cursor-pointer"
								/>
								<label
									htmlFor="aktifkan"
									className="text-sm font-medium text-gray-700 cursor-pointer"
								>
									Aktifkan Angkatan
								</label>
							</div>
							<p className="text-xs text-gray-500">
								Angkatan aktif dapat dipilih saat membuat kelas dan ujian
							</p>
						</div>

						<div className="flex gap-3 mt-8">
							<button
								onClick={() => setShowModal(false)}
								className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-medium"
							>
								Batal
							</button>
							<button
								onClick={handleSave}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
							>
								Tambah Angkatan
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Edit Modal */}
			{showEditModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-8 max-w-lg w-full">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-2xl font-bold">Edit Angkatan</h2>
							<button
								onClick={() => setShowEditModal(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								✕
							</button>
						</div>

						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Level Angkatan *
									</label>
									<select
										value={formData.levelAngkatan}
										onChange={(e) =>
											setFormData({
												...formData,
												levelAngkatan: parseInt(e.target.value),
											})
										}
										className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										{Array.from(
											{ length: levelRange.max - levelRange.min + 1 },
											(_, i) => levelRange.min + i,
										).map((level) => (
											<option key={level} value={level}>
												Kelas {level}
											</option>
										))}
									</select>
									<p className="text-xs text-gray-500 mt-1">
										Pilih level 1-6 untuk SD, 7-9 untuk SMP, 10-12 untuk SMA
									</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Sekolah *
									</label>
									<select
										value={formData.sekolah}
										onChange={(e) =>
											setFormData({
												...formData,
												sekolah: e.target.value,
											})
										}
										className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value="SD">Sekolah Dasar (SD)</option>
										<option value="SMP">Sekolah Menengah Pertama (SMP)</option>
										<option value="SMA">Sekolah Menengah Atas (SMA)</option>
										<option value="K">Kejuruan (K)</option>
									</select>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Nama Angkatan *
								</label>
								<input
									type="text"
									placeholder={`Contoh: Kelas ${formData.levelAngkatan} ${formData.sekolah}`}
									value={formData.namaAngkatan}
									onChange={(e) =>
										setFormData({
											...formData,
											namaAngkatan: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Nama yang akan ditampilkan di sistem
								</p>
							</div>

							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="aktifkan-edit"
									checked={formData.aktifkan}
									onChange={(e) =>
										setFormData({
											...formData,
											aktifkan: e.target.checked,
										})
									}
									className="w-4 h-4 text-blue-600 rounded cursor-pointer"
								/>
								<label
									htmlFor="aktifkan-edit"
									className="text-sm font-medium text-gray-700 cursor-pointer"
								>
									Aktifkan Angkatan
								</label>
							</div>
							<p className="text-xs text-gray-500">
								Angkatan aktif dapat dipilih saat membuat kelas dan ujian
							</p>
						</div>

						<div className="flex gap-3 mt-8">
							<button
								onClick={() => setShowEditModal(false)}
								className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-medium"
							>
								Batal
							</button>
							<button
								onClick={handleSave}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
							>
								Simpan Perubahan
							</button>
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
			{confirmModal && confirmModal.isOpen && (
				<ConfirmModal
					isOpen={confirmModal.isOpen}
					title={confirmModal.title}
					message={confirmModal.message}
					onConfirm={confirmModal.onConfirm}
					onCancel={closeConfirm}
				/>
			)}
		</div>
	);
}
