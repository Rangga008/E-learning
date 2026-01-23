"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import {
	ConfirmModal,
	SuccessToast,
	ErrorToast,
} from "@/components/CommonModals";
import { FormModal } from "@/components/FormModal";
import { useNotification } from "@/hooks/useNotification";
import { logger } from "@/lib/logger";

interface Tingkat {
	id: number;
	nama: string;
	urutan: number;
	deskripsi?: string;
	isActive: boolean;
}

export default function TingkatPage() {
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

	const [tingkats, setTingkats] = useState<Tingkat[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [showImportModal, setShowImportModal] = useState(false);
	const [importFile, setImportFile] = useState<File | null>(null);
	const [formData, setFormData] = useState({
		level: 1,
		sekolah: "SD",
		nama: "",
	});

	useEffect(() => {
		fetchTingkat();
	}, []);

	const fetchTingkat = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/settings/tingkat`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			setTingkats(response.data.data || []);
		} catch (error) {
			console.error("Error fetching tingkat:", error);
			logger.error("Fetch Tingkat", { error });
			showError("Gagal memuat data tingkat");
		} finally {
			setLoading(false);
		}
	};

	const handleAddClick = () => {
		setFormData({ level: 1, sekolah: "SD", nama: "" });
		setEditingId(null);
		setShowModal(true);
	};

	const handleEditClick = (tingkat: Tingkat) => {
		setFormData({
			level: parseInt(tingkat.nama.split(" ")[1]) || 1,
			sekolah: tingkat.deskripsi?.includes("Dasar")
				? "SD"
				: tingkat.deskripsi?.includes("Pertama")
				? "SMP"
				: tingkat.deskripsi?.includes("Atas")
				? "SMA"
				: tingkat.deskripsi?.includes("Kejuruan")
				? "SMK"
				: "SD",
			nama: tingkat.nama,
		});
		setEditingId(tingkat.id);
		setShowEditModal(true);
	};

	const handleSave = async () => {
		if (!formData.nama.trim()) {
			logger.error("Save Tingkat", { error: "Name is required" });
			showError("Nama tingkatan harus diisi");
			return;
		}
		if (formData.level < 1 || formData.level > 12) {
			logger.error("Save Tingkat", { error: "Level must be 1-12" });
			showError("Level harus antara 1-12");
			return;
		}

		try {
			const dataToSend = {
				nama: formData.nama,
				urutan: formData.level,
				deskripsi: `Kelas ${formData.level} ${
					formData.sekolah === "SD"
						? "Sekolah Dasar"
						: formData.sekolah === "SMP"
						? "Sekolah Menengah Pertama"
						: formData.sekolah === "SMA"
						? "Sekolah Menengah Atas"
						: "Sekolah Menengah Kejuruan"
				}`,
			};
			if (editingId) {
				await axios.put(
					`${process.env.NEXT_PUBLIC_API_URL}/settings/tingkat/${editingId}`,
					dataToSend,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					},
				);
				logger.success("Update Tingkat", { id: editingId });
				showSuccess("Tingkat berhasil diperbarui");
			} else {
				await axios.post(
					`${process.env.NEXT_PUBLIC_API_URL}/settings/tingkat`,
					dataToSend,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					},
				);
				logger.success("Create Tingkat", { nama: formData.nama });
				showSuccess("Tingkat berhasil ditambahkan");
			}
			setShowModal(false);
			setShowEditModal(false);
			setEditingId(null);
			fetchTingkat();
		} catch (error) {
			console.error("Error saving tingkat:", error);
			logger.error("Save Tingkat", { error });
			showError("Gagal menyimpan tingkat");
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirm("Apakah Anda yakin ingin menghapus tingkat ini?")) return;

		try {
			await axios.delete(
				`${process.env.NEXT_PUBLIC_API_URL}/settings/tingkat/${id}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			logger.success("Delete Tingkat", { id });
			showSuccess("Tingkat berhasil dihapus");
			fetchTingkat();
		} catch (error) {
			console.error("Error deleting tingkat:", error);
			logger.error("Delete Tingkat", { error });
			showError("Gagal menghapus tingkat");
		}
	};

	const downloadTemplate = () => {
		const templateData = [
			["Kelas (1-12)", "Sekolah (SD/SMP/SMA/SMK)", "Nama Tingkatan"],
			["1", "SD", "Contoh: Kelas 1 SD"],
			["2", "SD", "Contoh: Kelas 2 SD"],
		];

		const csvContent = templateData
			.map((row) => row.map((cell) => `"${cell}"`).join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "template_tingkat.csv";
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	};

	const handleImport = async () => {
		if (!importFile) {
			logger.error("Import Tingkat", { error: "No file selected" });
			showError("Pilih file terlebih dahulu");
			return;
		}

		const reader = new FileReader();
		reader.onload = async (e) => {
			try {
				const text = e.target?.result as string;
				const lines = text.trim().split("\n");
				const headers = lines[0]
					.split(",")
					.map((h) => h.replace(/"/g, "").trim());

				const dataToImport = [];
				for (let i = 1; i < lines.length; i++) {
					const values = lines[i]
						.split(",")
						.map((v) => v.replace(/"/g, "").trim());
					if (values.length < 3 || !values[0] || !values[1] || !values[2])
						continue;

					const level = parseInt(values[0]);
					const sekolah = values[1];
					const nama = values[2];

					if (level < 1 || level > 12) {
						logger.error("Import Tingkat", {
							error: `Row ${i + 1}: Kelas must be 1-12`,
						});
						showError(`Baris ${i + 1}: Kelas harus 1-12`);
						return;
					}

					if (!["SD", "SMP", "SMA", "SMK"].includes(sekolah)) {
						logger.error("Import Tingkat", {
							error: `Row ${i + 1}: Sekolah must be SD/SMP/SMA/SMK`,
						});
						showError(`Baris ${i + 1}: Sekolah harus SD/SMP/SMA/SMK`);
						return;
					}

					dataToImport.push({
						nama: nama,
						urutan: level,
						deskripsi: `Kelas ${level} ${
							sekolah === "SD"
								? "Sekolah Dasar"
								: sekolah === "SMP"
								? "Sekolah Menengah Pertama"
								: sekolah === "SMA"
								? "Sekolah Menengah Atas"
								: "Sekolah Menengah Kejuruan"
						}`,
					});
				}

				if (dataToImport.length === 0) {
					logger.error("Import Tingkat", { error: "No valid data to import" });
					showError("Tidak ada data valid untuk diimport");
					return;
				}

				for (const data of dataToImport) {
					await axios.post(
						`${process.env.NEXT_PUBLIC_API_URL}/settings/tingkat`,
						data,
						{
							headers: {
								Authorization: `Bearer ${localStorage.getItem("token")}`,
							},
						},
					);
				}

				logger.success("Import Tingkat", { count: dataToImport.length });
				showSuccess(
					`Berhasil mengimport ${dataToImport.length} data tingkatan`,
				);
				setShowImportModal(false);
				setImportFile(null);
				fetchTingkat();
			} catch (error) {
				console.error("Error importing:", error);
				logger.error("Import Tingkat", { error });
				showError("Gagal mengimport data. Periksa format file.");
			}
		};
		reader.readAsText(importFile);
	};

	return (
		<div className="p-6 space-y-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-800">
					⚙️ Manajemen Tingkatan
				</h1>
				<p className="text-gray-600 text-sm mt-1">
					Kelola tingkatan kelas (SD, SMP, SMA, K)
				</p>
			</div>

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
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-blue-600 hover:bg-gray-50"
					>
						📚 Tingkatan Kelas
					</Link>
					<Link
						href="/admin/pengaturan/angkatan"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
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

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-bold text-gray-800 mb-4">
						🎯 Aksi Cepat
					</h2>
					<div className="space-y-3">
						<button
							onClick={handleAddClick}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition"
						>
							➕ Tambah Tingkatan
						</button>
						<button
							onClick={() => setShowImportModal(true)}
							className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition"
						>
							📥 Import Data
						</button>
						<button
							onClick={downloadTemplate}
							className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition"
						>
							📋 Download Template
						</button>
					</div>

					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
						<p className="text-sm text-gray-700 font-semibold mb-2">
							💡 Total Tingkatan
						</p>
						<p className="text-3xl font-bold text-blue-600">
							{tingkats.length}
						</p>
					</div>
				</div>

				<div className="lg:col-span-2">
					<div className="bg-white rounded-lg shadow overflow-hidden">
						{loading ? (
							<div className="p-8 text-center">
								<p className="text-gray-500">Memuat data...</p>
							</div>
						) : tingkats.length === 0 ? (
							<div className="p-8 text-center">
								<p className="text-gray-500">
									Belum ada tingkatan. Silakan tambahkan terlebih dahulu.
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="bg-gray-100 border-b-2 border-gray-200">
										<tr>
											<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
												No
											</th>
											<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
												Level
											</th>
											<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
												Sekolah
											</th>
											<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
												Nama Tingkatan
											</th>
											<th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
												Status
											</th>
											<th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
												Aksi
											</th>
										</tr>
									</thead>
									<tbody>
										{tingkats.map((tingkat, index) => (
											<tr
												key={tingkat.id}
												className="border-b border-gray-200 hover:bg-gray-50 transition"
											>
												<td className="px-6 py-4 text-sm text-gray-900">
													{index + 1}
												</td>
												<td className="px-6 py-4 text-sm text-gray-900">
													<span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-semibold">
														Kelas {tingkat.urutan}
													</span>
												</td>
												<td className="px-6 py-4 text-sm text-gray-900">
													<span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-semibold">
														{tingkat.deskripsi?.includes("Dasar")
															? "SD"
															: tingkat.deskripsi?.includes("Pertama")
															? "SMP"
															: tingkat.deskripsi?.includes("Atas")
															? "SMA"
															: "SMK"}
													</span>
												</td>
												<td className="px-6 py-4 text-sm text-gray-900">
													<span className="font-semibold">{tingkat.nama}</span>
												</td>
												<td className="px-6 py-4 text-center">
													<span
														className={`px-3 py-1 rounded-full text-xs font-semibold ${
															tingkat.isActive
																? "bg-green-100 text-green-700"
																: "bg-red-100 text-red-700"
														}`}
													>
														{tingkat.isActive ? "✓ Aktif" : "✕ Nonaktif"}
													</span>
												</td>
												<td className="px-6 py-4 text-center space-x-2">
													<button
														onClick={() => handleEditClick(tingkat)}
														className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition"
													>
														✏️ Edit
													</button>
													<button
														onClick={() => handleDelete(tingkat.id)}
														className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
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
					</div>
				</div>
			</div>

			{/* Add/Edit Modal */}
			<FormModal
				isOpen={showModal || showEditModal}
				title={editingId ? "✏️ Edit Tingkatan" : "➕ Tambah Tingkatan"}
				fields={[
					{
						name: "level",
						label: "Level Tingkatan *",
						type: "select",
						value: formData.level.toString(),
						onChange: (e) =>
							setFormData({
								...formData,
								level: parseInt(e.target.value),
							}),
						options: Array.from({ length: 12 }, (_, i) => ({
							value: (i + 1).toString(),
							label: `Kelas ${i + 1}`,
						})),
						required: true,
					},
					{
						name: "sekolah",
						label: "Sekolah *",
						type: "select",
						value: formData.sekolah,
						onChange: (e) =>
							setFormData({ ...formData, sekolah: e.target.value }),
						options: [
							{ value: "SD", label: "Sekolah Dasar (SD)" },
							{ value: "SMP", label: "Sekolah Menengah Pertama (SMP)" },
							{ value: "SMA", label: "Sekolah Menengah Atas (SMA)" },
							{ value: "SMK", label: "Sekolah Menengah Kejuruan (SMK)" },
						],
						required: true,
					},
					{
						name: "nama",
						label: "Nama Tingkatan *",
						type: "text",
						value: formData.nama,
						onChange: (e) => setFormData({ ...formData, nama: e.target.value }),
						placeholder: "Contoh: Tingkat 1, Kelas X, dll",
						required: true,
					},
				]}
				onSubmit={handleSave}
				onCancel={() => {
					setShowModal(false);
					setShowEditModal(false);
					setEditingId(null);
				}}
				submitLabel={editingId ? "Perbarui" : "Simpan"}
				maxWidth="max-w-md"
			/>

			{/* Import Modal */}
			{showImportModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-lg p-6 w-96">
						<h2 className="text-xl font-bold text-gray-800 mb-4">
							📥 Import Data Tingkatan
						</h2>
						<div className="space-y-4">
							<div>
								<p className="text-sm text-gray-600 mb-3">
									Pilih file CSV untuk mengimport data tingkatan. Format: Kelas,
									Sekolah, Nama Tingkatan
								</p>
								<input
									type="file"
									accept=".csv"
									onChange={(e) => setImportFile(e.target.files?.[0] || null)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
								/>
								{importFile && (
									<p className="text-xs text-green-600 mt-2">
										✓ File dipilih: {importFile.name}
									</p>
								)}
							</div>
						</div>
						<div className="flex gap-3 mt-6">
							<button
								onClick={() => {
									setShowImportModal(false);
									setImportFile(null);
								}}
								className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-semibold transition"
							>
								Batal
							</button>
							<button
								onClick={handleImport}
								className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition"
							>
								Import
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
