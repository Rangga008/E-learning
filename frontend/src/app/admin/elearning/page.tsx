"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { elearningService } from "@/lib/api/services";
import {
	SuccessToast,
	ErrorToast,
	ConfirmModal,
} from "@/components/CommonModals";
import { FormModal } from "@/components/FormModal";
import { useNotification } from "@/hooks/useNotification";
import { logger } from "@/lib/logger";

interface MataPelajaran {
	id: number;
	nama: string;
	createdAt?: string;
	updatedAt?: string;
}

export default function ELearningPage() {
	const {
		successToast,
		errorToast,
		closeSuccess,
		closeError,
		showSuccess,
		showError,
		showConfirm,
		confirmModal,
		closeConfirm,
	} = useNotification();
	const [mataPelajaran, setMataPelajaran] = useState<MataPelajaran[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [formData, setFormData] = useState({ nama: "" });

	useEffect(() => {
		fetchMataPelajaran();
	}, []);

	const fetchMataPelajaran = async () => {
		try {
			setLoading(true);
			const response = await elearningService.getAllMataPelajaran();
			setMataPelajaran(response.data || []);
		} catch (error) {
			logger.error("Fetch Mata Pelajaran", { error });
			showError("Gagal memuat mata pelajaran");
		} finally {
			setLoading(false);
		}
	};

	const handleAddClick = () => {
		setFormData({ nama: "" });
		setShowAddModal(true);
	};

	const handleEditClick = (mapel: MataPelajaran) => {
		setFormData({ nama: mapel.nama });
		setEditingId(mapel.id);
		setShowEditModal(true);
	};

	const handleSave = async () => {
		if (!formData.nama.trim()) {
			logger.error("Save Mata Pelajaran", { error: "Name is required" });
			showError("Nama mata pelajaran harus diisi");
			return;
		}

		try {
			if (editingId) {
				// Update existing
				await elearningService.updateMataPelajaran(editingId, {
					nama: formData.nama,
				});
				logger.success("Update Mata Pelajaran", { id: editingId });
				showSuccess("Mata pelajaran berhasil diperbarui");
			} else {
				// Create new
				await elearningService.createMataPelajaran({
					nama: formData.nama,
				});
				logger.success("Create Mata Pelajaran", { nama: formData.nama });
				showSuccess("Mata pelajaran berhasil ditambahkan");
			}
			setShowAddModal(false);
			setShowEditModal(false);
			setEditingId(null);
			fetchMataPelajaran();
		} catch (error) {
			logger.error("Save Mata Pelajaran", { error });
			showError("Gagal menyimpan mata pelajaran");
		}
	};

	const handleDelete = async (id: number) => {
		showConfirm({
			title: "Hapus Mata Pelajaran",
			message: "Apakah Anda yakin ingin menghapus mata pelajaran ini?",
			onConfirm: async () => {
				try {
					await elearningService.deleteMataPelajaran(id);
					logger.success("Delete Mata Pelajaran", { id });
					showSuccess("Mata pelajaran berhasil dihapus");
					fetchMataPelajaran();
				} catch (error) {
					logger.error("Delete Mata Pelajaran", { error });
					showError("Gagal menghapus mata pelajaran");
				}
				closeConfirm();
			},
		});
	};

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-800">
					📚 E-Learning Management
				</h1>
				<p className="text-gray-600 text-sm mt-1">
					Kelola mata pelajaran dan materi pembelajaran
				</p>
			</div>

			{/* Navigation Tabs */}
			<div className="bg-white rounded-lg shadow mb-6 border-b-2 border-gray-200">
				<div className="flex flex-wrap">
					<Link
						href="/admin/elearning"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-blue-600 hover:bg-gray-50"
					>
						📖 Mata Pelajaran
					</Link>
					<Link
						href="/admin/elearning/materi"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
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

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Sidebar - Actions */}
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-bold text-gray-800 mb-4">
						🎯 Aksi Cepat
					</h2>
					<div className="space-y-3">
						<button
							onClick={handleAddClick}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition"
						>
							➕ Tambah Mata Pelajaran
						</button>
						<button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition">
							📥 Impor dari Excel
						</button>
						<button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition">
							📊 Lihat Statistik
						</button>
					</div>

					{/* Info Box */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
						<p className="text-sm text-gray-700 font-semibold mb-2">
							💡 Total Mata Pelajaran
						</p>
						<p className="text-3xl font-bold text-blue-600">
							{mataPelajaran.length}
						</p>
					</div>
				</div>

				{/* Main Content - Subject List */}
				<div className="lg:col-span-2">
					<div className="bg-white rounded-lg shadow overflow-hidden">
						{loading ? (
							<div className="p-8 text-center">
								<p className="text-gray-500">Memuat data...</p>
							</div>
						) : mataPelajaran.length === 0 ? (
							<div className="p-8 text-center">
								<p className="text-gray-500">
									Belum ada mata pelajaran. Silakan tambahkan terlebih dahulu.
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
												Nama Mata Pelajaran
											</th>
											<th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
												Aksi
											</th>
										</tr>
									</thead>
									<tbody>
										{mataPelajaran.map((mapel, index) => (
											<tr
												key={mapel.id}
												className="border-b border-gray-200 hover:bg-gray-50 transition"
											>
												<td className="px-6 py-4 text-sm text-gray-900">
													{index + 1}
												</td>
												<td className="px-6 py-4 text-sm text-gray-900">
													{mapel.nama}
												</td>
												<td className="px-6 py-4 text-center space-x-2">
													<button
														onClick={() => handleEditClick(mapel)}
														className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition"
													>
														✏️ Edit
													</button>
													<button
														onClick={() => handleDelete(mapel.id)}
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
				isOpen={showAddModal || showEditModal}
				title={
					editingId ? "✏️ Edit Mata Pelajaran" : "➕ Tambah Mata Pelajaran"
				}
				fields={[
					{
						name: "nama",
						label: "Nama Mata Pelajaran *",
						type: "text",
						value: formData.nama,
						onChange: (e) => setFormData({ ...formData, nama: e.target.value }),
						placeholder: "Masukkan nama mata pelajaran",
						required: true,
					},
				]}
				onSubmit={handleSave}
				onCancel={() => {
					setShowAddModal(false);
					setShowEditModal(false);
					setEditingId(null);
				}}
				submitLabel={editingId ? "Perbarui" : "Simpan"}
				maxWidth="max-w-md"
			/>

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
	);
}
