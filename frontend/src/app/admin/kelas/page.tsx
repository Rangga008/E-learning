"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { kelasService, adminService } from "@/lib/api/services";
import {
	SuccessToast,
	ErrorToast,
	ConfirmModal,
} from "@/components/CommonModals";
import { FormModal } from "@/components/FormModal";
import { logger } from "@/lib/logger";

interface Kelas {
	id: number;
	nama: string;
	tingkat?: string;
	tingkatRef?: {
		id: number;
		nama: string;
	};
	kapasitas?: number;
	guruWaliId?: number;
	createdAt?: string;
}

interface Guru {
	id: number;
	namaLengkap: string;
	nip: string;
}

interface Tingkat {
	id: number;
	nama: string;
	urutan: number;
	deskripsi?: string;
	isActive: boolean;
}

export default function KelasPage() {
	const [kelas, setKelas] = useState<Kelas[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [total, setTotal] = useState(0);
	const [showModal, setShowModal] = useState(false);
	const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
	const [formData, setFormData] = useState({
		nama: "",
		tingkat: "",
		kapasitas: 30,
	});
	const [guru, setGuru] = useState<Guru[]>([]);
	const [tingkat, setTingkat] = useState<Tingkat[]>([]);
	const [selectedGuruWali, setSelectedGuruWali] = useState("");
	const [successToast, setSuccessToast] = useState({
		isOpen: false,
		message: "",
	});
	const [errorToast, setErrorToast] = useState({ isOpen: false, message: "" });
	const [confirmModal, setConfirmModal] = useState({
		isOpen: false,
		title: "",
		message: "",
		onConfirm: () => {},
	});

	useEffect(() => {
		fetchKelas();
		fetchGuru();
		fetchTingkat();
	}, [page]);

	const fetchKelas = async () => {
		try {
			setLoading(true);
			const response = await kelasService.getAllKelas(page, limit);
			setKelas(response.data || []);
			setTotal(response.pagination?.total || 0);
		} catch (error) {
			logger.error("Fetch Classes", { error });
			setErrorToast({ isOpen: true, message: "Gagal mengambil data kelas" });
		} finally {
			setLoading(false);
		}
	};

	const fetchGuru = async () => {
		try {
			const response = await adminService.getTeachersDropdown();
			setGuru(response.data || []);
		} catch (error) {
			console.error("Error fetching guru:", error);
		}
	};

	const fetchTingkat = async () => {
		try {
			// TODO: Add getTingkatDropdown to adminService if needed
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/settings/tingkat`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			const data = await response.json();
			setTingkat(data.data || []);
		} catch (error) {
			console.error("Error fetching tingkat:", error);
		}
	};

	const openModal = (k?: Kelas) => {
		if (k) {
			setEditingKelas(k);
			setFormData({
				nama: k.nama,
				tingkat: k.tingkatRef?.nama || k.tingkat || "",
				kapasitas: k.kapasitas || 30,
			});
			setSelectedGuruWali(k.guruWaliId?.toString() || "");
		} else {
			setEditingKelas(null);
			setFormData({ nama: "", tingkat: "", kapasitas: 30 });
			setSelectedGuruWali("");
		}
		setShowModal(true);
	};

	const saveKelas = async () => {
		if (!formData.nama || !formData.tingkat) {
			logger.error("Save Class", { error: "Name and level required" });
			setErrorToast({ isOpen: true, message: "Nama dan Tingkat harus diisi" });
			return;
		}

		const payload = {
			nama: formData.nama,
			tingkat: formData.tingkat,
			kapasitas: formData.kapasitas || 30,
			guruWaliId: selectedGuruWali ? parseInt(selectedGuruWali) : null,
		};

		try {
			if (editingKelas) {
				await kelasService.updateKelas(editingKelas.id, payload);
				logger.success("Update Class", {
					id: editingKelas.id,
					nama: formData.nama,
				});
				setSuccessToast({ isOpen: true, message: "Kelas berhasil diperbarui" });
			} else {
				await kelasService.createKelas(payload);
				logger.success("Create Class", { nama: formData.nama });
				setSuccessToast({ isOpen: true, message: "Kelas berhasil dibuat" });
			}
			setShowModal(false);
			fetchKelas();
		} catch (error) {
			logger.error("Save Class", { error });
			setErrorToast({ isOpen: true, message: "Gagal menyimpan kelas" });
		}
	};

	const deleteKelas = async (kelasId: number) => {
		setConfirmModal({
			isOpen: true,
			title: "Hapus Kelas",
			message: "Yakin ingin menghapus kelas ini?",
			onConfirm: async () => {
				try {
					await kelasService.deleteKelas(kelasId);
					logger.success("Delete Class", { id: kelasId });
					setSuccessToast({ isOpen: true, message: "Kelas berhasil dihapus" });
					fetchKelas();
				} catch (error) {
					logger.error("Delete Class", { error });
					setErrorToast({ isOpen: true, message: "Gagal menghapus kelas" });
				}
				setConfirmModal({ ...confirmModal, isOpen: false });
			},
		});
	};

	const totalPages = Math.ceil(total / limit);

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">📚 Data Kelas</h1>
					<p className="text-gray-600">Total: {total} kelas</p>
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className="bg-white rounded-lg shadow mb-6 border-b-2 border-gray-200">
				<div className="flex flex-wrap">
					<Link
						href="/admin/siswa"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
					>
						👨‍🎓 Data Siswa
					</Link>
					<Link
						href="/admin/guru"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
					>
						👨‍🏫 Data Guru
					</Link>
					<Link
						href="/admin/kelas"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-blue-600 hover:bg-gray-50"
					>
						🏫 Data Kelas
					</Link>
				</div>
			</div>

			<div className="flex justify-between items-center">
				<div>{/* Empty div for spacing */}</div>
				<button
					onClick={() => openModal()}
					className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
				>
					➕ Tambah Kelas
				</button>
			</div>

			{loading ? (
				<div className="text-center py-12">
					<p>Loading...</p>
				</div>
			) : kelas.length === 0 ? (
				<div className="text-center py-12 bg-white rounded-lg">
					<p className="text-gray-500">Tidak ada data kelas</p>
				</div>
			) : (
				<div className="bg-white rounded-lg shadow overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									No
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Nama Kelas
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Tingkat
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Guru Wali
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Aksi
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{kelas.map((k, index) => {
								const guruWali = guru.find((g) => g.id === k.guruWaliId);
								return (
									<tr key={k.id}>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{(page - 1) * limit + index + 1}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{k.nama}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
											{k.tingkatRef?.nama || k.tingkat || "-"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
											{guruWali ? guruWali.namaLengkap : "-"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm space-x-1">
											<Link
												href={`/admin/kelas/${k.id}`}
												className="inline-block px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 font-medium text-xs"
											>
												👁️ Detail
											</Link>
											<button
												onClick={() => openModal(k)}
												className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium text-xs"
											>
												✏️ Edit
											</button>
											<button
												onClick={() => deleteKelas(k.id)}
												className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 font-medium text-xs"
											>
												🗑️ Hapus
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>

					<div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
						<div>
							Halaman {page} dari {totalPages}
						</div>
						<div className="space-x-2">
							<button
								disabled={page === 1}
								onClick={() => setPage(page - 1)}
								className="px-4 py-2 border rounded disabled:opacity-50"
							>
								Sebelumnya
							</button>
							<button
								disabled={page === totalPages}
								onClick={() => setPage(page + 1)}
								className="px-4 py-2 border rounded disabled:opacity-50"
							>
								Selanjutnya
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Add/Edit Kelas Modal */}
			<FormModal
				isOpen={showModal}
				title={editingKelas ? "✏️ Edit Kelas" : "➕ Tambah Kelas"}
				fields={[
					{
						name: "nama",
						label: "Nama Kelas",
						type: "text",
						placeholder: "Contoh: VII-A",
						required: true,
						value: formData.nama,
						onChange: (e) => setFormData({ ...formData, nama: e.target.value }),
					},
					{
						name: "tingkat",
						label: "Tingkat",
						type: "select",
						placeholder: "Pilih Tingkat",
						required: true,
						value: formData.tingkat,
						options: tingkat.map((t) => ({ value: t.nama, label: t.nama })),
						onChange: (e) =>
							setFormData({ ...formData, tingkat: e.target.value }),
					},
					{
						name: "kapasitas",
						label: "Kapasitas Siswa",
						type: "text",
						placeholder: "Contoh: 30",
						value: formData.kapasitas,
						onChange: (e) =>
							setFormData({
								...formData,
								kapasitas: parseInt(e.target.value) || 30,
							}),
					},
					{
						name: "guruWali",
						label: "Guru Wali Kelas",
						type: "select",
						placeholder: "Pilih Guru Wali",
						value: selectedGuruWali,
						options: guru.map((g) => ({
							value: g.id.toString(),
							label: `${g.namaLengkap} (${g.nip})`,
						})),
						onChange: (e) => setSelectedGuruWali(e.target.value),
					},
				]}
				onSubmit={saveKelas}
				onCancel={() => setShowModal(false)}
				submitLabel="Simpan"
				maxWidth="max-w-md"
			/>

			<SuccessToast
				isOpen={successToast.isOpen}
				message={successToast.message}
				onClose={() => setSuccessToast({ isOpen: false, message: "" })}
			/>
			<ErrorToast
				isOpen={errorToast.isOpen}
				message={errorToast.message}
				onClose={() => setErrorToast({ isOpen: false, message: "" })}
			/>
			<ConfirmModal
				isOpen={confirmModal.isOpen}
				title={confirmModal.title}
				message={confirmModal.message}
				onConfirm={confirmModal.onConfirm}
				onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
			/>
		</div>
	);
}
