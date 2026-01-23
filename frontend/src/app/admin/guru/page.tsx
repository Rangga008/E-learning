"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
	guruService,
	kelasService,
	elearningService,
} from "@/lib/api/services";
import {
	ConfirmModal,
	SuccessToast,
	ErrorToast,
} from "@/components/CommonModals";
import { FormModal } from "@/components/FormModal";
import { logger } from "@/lib/logger";

interface Teacher {
	id: number;
	nip: string;
	namaLengkap: string;
	mataPelajaranId?: number;
	userId?: number;
}

interface Kelas {
	id: number;
	nama: string;
	tingkatRef?: {
		nama: string;
	};
	tingkat?: string;
	guruWaliId?: number;
}

interface MapelOption {
	id: number;
	nama: string;
}

export default function GuruPage() {
	const [teachers, setTeachers] = useState<Teacher[]>([]);
	const [kelasList, setKelasList] = useState<Kelas[]>([]);
	const [kelasWithoutWaliList, setKelasWithoutWaliList] = useState<Kelas[]>([]);
	const [mapelList, setMapelList] = useState<MapelOption[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [total, setTotal] = useState(0);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterMapel, setFilterMapel] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
	const [formData, setFormData] = useState({
		nip: "",
		namaLengkap: "",
		mataPelajaranId: "",
	});
	const [showAssignModal, setShowAssignModal] = useState(false);
	const [assigningTeacher, setAssigningTeacher] = useState<Teacher | null>(
		null,
	);
	const [selectedKelasMapel, setSelectedKelasMapel] = useState<number[]>([]);
	const [assignmentMode, setAssignmentMode] = useState<"wali" | "mapel">(
		"wali",
	);
	const [selectedWaliKelas, setSelectedWaliKelas] = useState<number | null>(
		null,
	);
	const [showImportModal, setShowImportModal] = useState(false);
	const [importFile, setImportFile] = useState<File | null>(null);
	const [confirmModal, setConfirmModal] = useState({
		isOpen: false,
		title: "",
		message: "",
		onConfirm: () => {},
		isDangerous: false,
		isLoading: false,
	});
	const [successToast, setSuccessToast] = useState({
		isOpen: false,
		message: "",
	});
	const [errorToast, setErrorToast] = useState({
		isOpen: false,
		message: "",
	});
	const [infoToast, setInfoToast] = useState({
		isOpen: false,
		message: "",
	});

	useEffect(() => {
		setPage(1);
	}, [searchQuery, filterMapel]);

	useEffect(() => {
		fetchTeachers();
		fetchDropdownData();
	}, [page, searchQuery, filterMapel]);

	const fetchDropdownData = async () => {
		try {
			const [kelasRes, mapelRes, kelasNoWaliRes] = await Promise.all([
				kelasService.getKelasDropdown(),
				elearningService.getMataPelajaranDropdown(),
				kelasService.getKelasDropdown(),
			]);

			setKelasList(kelasRes.data || []);
			setMapelList(mapelRes.data || []);
			setKelasWithoutWaliList(kelasNoWaliRes.data || []);
		} catch (error) {
			console.error("Error fetching dropdown data:", error);
		}
	};

	const fetchTeachers = async () => {
		try {
			setLoading(true);
			const response = await guruService.getAllGuru(page, limit, searchQuery);
			setTeachers(response.data);
			setTotal(response.pagination?.total || 0);
		} catch (error) {
			console.error("Error fetching teachers:", error);
		} finally {
			setLoading(false);
		}
	};

	const totalPages = Math.ceil(total / limit);

	const openModal = (teacher?: Teacher) => {
		if (teacher) {
			setEditingTeacher(teacher);
			setFormData({
				nip: teacher.nip,
				namaLengkap: teacher.namaLengkap,
				mataPelajaranId: teacher.mataPelajaranId
					? teacher.mataPelajaranId.toString()
					: "",
			});
		} else {
			setEditingTeacher(null);
			setFormData({
				nip: "",
				namaLengkap: "",
				mataPelajaranId: "",
			});
		}
		setShowModal(true);
	};

	const saveTeacher = async () => {
		if (!formData.nip || !formData.namaLengkap) {
			setErrorToast({
				isOpen: true,
				message: "NIP dan Nama harus diisi",
			});
			return;
		}
		try {
			const dataToSend = {
				nip: formData.nip,
				namaLengkap: formData.namaLengkap,
				mataPelajaranId: formData.mataPelajaranId
					? parseInt(formData.mataPelajaranId)
					: null,
			};

			if (editingTeacher) {
				await guruService.updateGuru(editingTeacher.id, dataToSend as any);
				logger.success("Teacher updated successfully", {
					teacherId: editingTeacher.id,
				});
				setSuccessToast({
					isOpen: true,
					message: "Guru berhasil diperbarui",
				});
			} else {
				await guruService.createGuru(dataToSend as any);
				logger.success("Teacher created successfully", { nip: formData.nip });
				setSuccessToast({
					isOpen: true,
					message: "Guru berhasil ditambahkan",
				});
			}
			setShowModal(false);
			fetchTeachers();
		} catch (error: any) {
			logger.error("Failed to save teacher", error);
			setErrorToast({
				isOpen: true,
				message: error.response?.data?.message || "Gagal menyimpan guru",
			});
		}
	};

	const deleteTeacher = async (teacher: Teacher) => {
		logger.debug("User clicked delete teacher", {
			teacherId: teacher.id,
			name: teacher.namaLengkap,
		});
		setConfirmModal({
			isOpen: true,
			title: "Hapus Guru",
			message: `Apakah Anda yakin ingin menghapus guru "${teacher.namaLengkap}"? Tindakan ini tidak dapat dibatalkan.`,
			isDangerous: true,
			isLoading: false,
			onConfirm: async () => {
				setConfirmModal((prev) => ({ ...prev, isLoading: true }));
				try {
					logger.info("Attempting to delete teacher", {
						teacherId: teacher.id,
					});
					await guruService.deleteGuru(teacher.id);
					logger.success("Teacher deleted successfully", {
						teacherId: teacher.id,
						namaLengkap: teacher.namaLengkap,
					});
					setSuccessToast({
						isOpen: true,
						message: `Guru ${teacher.namaLengkap} berhasil dihapus`,
					});
					setConfirmModal((prev) => ({
						...prev,
						isOpen: false,
						isLoading: false,
					}));
					fetchTeachers();
				} catch (error: any) {
					logger.error("Failed to delete teacher", {
						error: error.message,
						teacherId: teacher.id,
					});
					setErrorToast({
						isOpen: true,
						message: "Gagal menghapus guru. Silakan coba lagi.",
					});
					setConfirmModal((prev) => ({
						...prev,
						isOpen: false,
						isLoading: false,
					}));
				}
			},
		});
	};

	const openAssignModal = (teacher: Teacher) => {
		setAssigningTeacher(teacher);
		setShowAssignModal(true);
		setAssignmentMode("wali");
		setSelectedWaliKelas(null);
		setSelectedKelasMapel([]);
	};

	const saveAssignClasses = async () => {
		if (!assigningTeacher) return;

		try {
			if (assignmentMode === "wali") {
				if (!selectedWaliKelas) {
					setErrorToast({
						isOpen: true,
						message: "Pilih satu kelas untuk wali",
					});
					return;
				}
				await kelasService.assignWaliGuru(
					selectedWaliKelas,
					assigningTeacher.id,
				);
				logger.success("Assign Guru Wali", { guruId: assigningTeacher.id });
				setSuccessToast({
					isOpen: true,
					message: "Guru berhasil diassign sebagai wali kelas",
				});
				logger.success("Teacher assigned", { teacherId: assigningTeacher.id });
				setSuccessToast({
					isOpen: true,
					message: "Guru berhasil diassign sebagai wali kelas",
				});
			} else if (assignmentMode === "mapel") {
				if (selectedKelasMapel.length === 0) {
					setErrorToast({
						isOpen: true,
						message: "Pilih satu atau lebih kelas",
					});
					return;
				}
				await guruService.assignClasses(
					assigningTeacher.id,
					selectedKelasMapel,
				);
				logger.success("Assign Guru Mapel", { guruId: assigningTeacher.id });
				setSuccessToast({
					isOpen: true,
					message: "Guru berhasil diassign mengajar mata pelajaran",
				});
				logger.success("Teacher assigned to classes", {
					teacherId: assigningTeacher.id,
				});
				setSuccessToast({
					isOpen: true,
					message: "Guru berhasil diassign mengajar mata pelajaran",
				});
			}

			setShowAssignModal(false);
			setAssigningTeacher(null);
			setSelectedKelasMapel([]);
			setSelectedWaliKelas(null);
			fetchTeachers();
		} catch (error: any) {
			logger.error("Failed to assign guru", error);
			setErrorToast({
				isOpen: true,
				message: error.response?.data?.message || "Gagal mengassign guru",
			});
		}
	};

	const downloadGuruTemplate = async () => {
		try {
			const XLSX = await import("xlsx");
			const templateData = [
				{
					NIP: "123456789",
					"Nama Lengkap": "Budi Santoso",
					Password: "password123",
					"Mata Pelajaran ID": "1",
				},
				{
					NIP: "987654321",
					"Nama Lengkap": "Siti Nurhaliza",
					Password: "password456",
					"Mata Pelajaran ID": "2",
				},
			];

			const workbook = XLSX.utils.book_new();
			const worksheet = XLSX.utils.json_to_sheet(templateData);
			XLSX.utils.book_append_sheet(workbook, worksheet, "Guru");
			XLSX.writeFile(workbook, "template_guru.xlsx");
		} catch (error) {
			logger.error("Failed to download template", error as any);
			setErrorToast({
				isOpen: true,
				message: "Gagal mendownload template",
			});
		}
	};

	const handleGuruImport = async () => {
		if (!importFile) {
			setErrorToast({
				isOpen: true,
				message: "Pilih file terlebih dahulu",
			});
			return;
		}

		try {
			const XLSX = await import("xlsx");
			const reader = new FileReader();
			reader.onload = async (e) => {
				try {
					const data = new Uint8Array(e.target?.result as ArrayBuffer);
					const workbook = XLSX.read(data, { type: "array" });
					const worksheet = workbook.Sheets[workbook.SheetNames[0]];
					const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

					const dataToImport = [];

					for (let i = 0; i < jsonData.length; i++) {
						const row = jsonData[i];
						const nip = String(row.NIP || "").trim();
						const namaLengkap = String(row["Nama Lengkap"] || "").trim();
						const password = String(row.Password || "").trim();
						const mataPelajaranId = row["Mata Pelajaran ID"]
							? parseInt(row["Mata Pelajaran ID"])
							: null;

						if (!nip || nip.length < 5) {
							setErrorToast({
								isOpen: true,
								message: `Baris ${i + 2}: NIP tidak valid`,
							});
							return;
						}

						if (!namaLengkap || namaLengkap.length < 3) {
							setErrorToast({
								isOpen: true,
								message: `Baris ${i + 2}: Nama lengkap minimal 3 karakter`,
							});
							return;
						}

						if (!password || password.length < 6) {
							setErrorToast({
								isOpen: true,
								message: `Baris ${i + 2}: Password minimal 6 karakter`,
							});
						}

						dataToImport.push({
							nip,
							namaLengkap,
							password,
							mataPelajaranId,
						});
					}

					if (dataToImport.length === 0) {
						setErrorToast({
							isOpen: true,
							message: "Tidak ada data valid untuk diimport",
						});
						return;
					}

					const result = await guruService.importTeachers(dataToImport);
					const successMsg =
						result.data?.message ||
						`Berhasil mengimport ${dataToImport.length} data guru`;
					logger.success("Import Teachers", {
						message: successMsg,
						count: dataToImport.length,
					});
					setSuccessToast({ isOpen: true, message: successMsg });
					setShowImportModal(false);
					setImportFile(null);
					fetchTeachers();
				} catch (error: any) {
					logger.error("Import Teachers Error", { error });
					const errorMsg =
						error.response?.data?.message ||
						error.message ||
						"Gagal mengimport data";
					setErrorToast({ isOpen: true, message: errorMsg });
				}
			};
			reader.readAsArrayBuffer(importFile);
		} catch (error: any) {
			logger.error("Import File Error", { error: error.message });
			setErrorToast({
				isOpen: true,
				message: error.message || "Gagal mengimpor guru",
			});
		}
	};

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center mb-2">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">👨‍🏫 Data Guru</h1>
					<p className="text-gray-600 text-sm mt-1">
						Total: {total} guru terdaftar
					</p>
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
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-blue-600 hover:bg-gray-50"
					>
						👨‍🏫 Data Guru
					</Link>
					<Link
						href="/admin/kelas"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
					>
						🏫 Data Kelas
					</Link>
				</div>
			</div>

			{/* Search and Filter */}
			<div className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
				<div className="flex-1 w-full">
					<input
						type="text"
						placeholder="🔍 Cari NIP atau nama guru..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
					/>
				</div>
				<div className="w-full sm:w-48">
					<select
						value={filterMapel}
						onChange={(e) => setFilterMapel(e.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
					>
						<option value="">📚 Semua Mata Pelajaran</option>
						{mapelList.map((mapel) => (
							<option key={mapel.id} value={mapel.id}>
								{mapel.nama}
							</option>
						))}
					</select>
				</div>
				{(searchQuery || filterMapel) && (
					<button
						onClick={() => {
							setSearchQuery("");
							setFilterMapel("");
						}}
						className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition text-sm"
					>
						✕ Reset
					</button>
				)}
			</div>

			<div className="flex justify-between items-center">
				<div>{/* Empty div for spacing */}</div>
				<div className="space-x-2">
					<button
						onClick={() => setShowImportModal(true)}
						className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md transition"
					>
						⬇️ Impor Excel
					</button>
					<button
						onClick={() => openModal()}
						className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-md transition"
					>
						➕ Tambah Guru
					</button>
				</div>
			</div>

			{loading ? (
				<div className="text-center py-12">
					<p className="text-gray-500">Loading...</p>
				</div>
			) : (
				<div className="bg-white rounded-lg shadow-md overflow-hidden">
					<table className="min-w-full">
						<thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
							<tr>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									No
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									NIP
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									Nama Lengkap
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									Mata Pelajaran
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									Aksi
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{teachers.map((teacher, index) => (
								<tr key={teacher.id} className="hover:bg-gray-50 transition">
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										{index + 1 + (page - 1) * limit}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
										{teacher.nip}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
										{teacher.namaLengkap}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
										{teacher.mataPelajaranId
											? mapelList.find((m) => m.id === teacher.mataPelajaranId)
													?.nama || `ID: ${teacher.mataPelajaranId}`
											: "-"}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm space-x-1 flex items-center">
										<Link
											href={`/admin/users/${teacher.userId}`}
											className="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-medium text-xs transition shadow"
										>
											👁️ Detail
										</Link>
										<button
											onClick={() => openModal(teacher)}
											className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-xs transition shadow"
										>
											✏️ Ubah
										</button>
										<button
											onClick={() => openAssignModal(teacher)}
											className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-xs transition shadow"
										>
											👥 Assign
										</button>
										<button
											onClick={() => deleteTeacher(teacher)}
											className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-xs transition shadow"
										>
											🗑️ Hapus
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					<div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
						<div className="text-sm text-gray-600">
							Halaman <span className="font-semibold">{page}</span> dari{" "}
							<span className="font-semibold">{totalPages}</span>
						</div>
						<div className="space-x-2">
							<button
								disabled={page === 1}
								onClick={() => setPage(page - 1)}
								className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition font-medium text-sm"
							>
								← Sebelumnya
							</button>
							<button
								disabled={page >= totalPages || total === 0}
								onClick={() => setPage(page + 1)}
								className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition font-medium text-sm"
							>
								Selanjutnya →
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Add/Edit Teacher Modal */}
			<FormModal
				isOpen={showModal}
				title={editingTeacher ? "✏️ Edit Guru" : "➕ Tambah Guru"}
				fields={[
					{
						name: "nip",
						label: "NIP",
						type: "text",
						placeholder: "Masukkan NIP",
						required: true,
						value: formData.nip,
						onChange: (e) => setFormData({ ...formData, nip: e.target.value }),
					},
					{
						name: "namaLengkap",
						label: "Nama Lengkap",
						type: "text",
						placeholder: "Masukkan nama lengkap",
						required: true,
						value: formData.namaLengkap,
						onChange: (e) =>
							setFormData({ ...formData, namaLengkap: e.target.value }),
					},
					{
						name: "mataPelajaranId",
						label: "Mata Pelajaran (Opsional)",
						type: "select",
						placeholder: "Pilih Mata Pelajaran",
						value: formData.mataPelajaranId,
						options: mapelList.map((m) => ({ value: m.id, label: m.nama })),
						onChange: (e) =>
							setFormData({
								...formData,
								mataPelajaranId: e.target.value,
							}),
					},
				]}
				onSubmit={saveTeacher}
				onCancel={() => setShowModal(false)}
				submitLabel={editingTeacher ? "Perbarui" : "Simpan"}
				maxWidth="max-w-md"
			/>

			{/* Assign Modal */}
			{showAssignModal && assigningTeacher && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full max-h-96 overflow-y-auto">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							👥 Assign - {assigningTeacher.namaLengkap}
						</h2>

						{/* Mode Tabs */}
						<div className="flex gap-2 mb-4 border-b pb-2">
							<button
								onClick={() => {
									setAssignmentMode("wali");
									setSelectedWaliKelas(null);
									setSelectedKelasMapel([]);
								}}
								className={`px-4 py-2 rounded font-medium transition ${
									assignmentMode === "wali"
										? "bg-blue-600 text-white"
										: "bg-gray-100 text-gray-700"
								}`}
							>
								Wali Kelas
							</button>
							<button
								onClick={() => {
									setAssignmentMode("mapel");
									setSelectedWaliKelas(null);
									setSelectedKelasMapel([]);
								}}
								className={`px-4 py-2 rounded font-medium transition ${
									assignmentMode === "mapel"
										? "bg-purple-600 text-white"
										: "bg-gray-100 text-gray-700"
								}`}
							>
								Guru Mata Pelajaran
							</button>
						</div>

						{/* Wali Kelas Mode */}
						{assignmentMode === "wali" && (
							<div className="mb-4">
								<p className="text-xs text-gray-600 mb-3">
									ℹ️ Satu guru hanya bisa mewakili satu kelas
								</p>
								<div className="space-y-2 max-h-48 overflow-y-auto">
									{kelasWithoutWaliList.length > 0 ? (
										kelasWithoutWaliList.map((kelas) => (
											<div key={kelas.id} className="flex items-center">
												<input
													type="radio"
													id={`wali-${kelas.id}`}
													name="waliKelas"
													checked={selectedWaliKelas === kelas.id}
													onChange={() => setSelectedWaliKelas(kelas.id)}
													className="w-4 h-4 rounded"
												/>
												<label
													htmlFor={`wali-${kelas.id}`}
													className="ml-2 text-sm text-gray-700 cursor-pointer"
												>
													{kelas.nama} (
													{kelas.tingkatRef?.nama || kelas.tingkat || "-"})
												</label>
											</div>
										))
									) : (
										<p className="text-gray-500 text-sm">
											Semua kelas sudah punya wali
										</p>
									)}
								</div>
							</div>
						)}

						{/* Guru Mata Pelajaran Mode */}
						{assignmentMode === "mapel" && (
							<div className="mb-4">
								<p className="text-xs text-gray-600 mb-3">
									ℹ️ Guru bisa mengajar di banyak kelas
								</p>
								<div className="space-y-2 max-h-48 overflow-y-auto">
									{kelasList.length > 0 ? (
										kelasList.map((kelas) => (
											<div key={kelas.id} className="flex items-center">
												<input
													type="checkbox"
													id={`mapel-${kelas.id}`}
													checked={selectedKelasMapel.includes(kelas.id)}
													onChange={(e) => {
														if (e.target.checked) {
															setSelectedKelasMapel([
																...selectedKelasMapel,
																kelas.id,
															]);
														} else {
															setSelectedKelasMapel(
																selectedKelasMapel.filter(
																	(k) => k !== kelas.id,
																),
															);
														}
													}}
													className="w-4 h-4 rounded"
												/>
												<label
													htmlFor={`mapel-${kelas.id}`}
													className="ml-2 text-sm text-gray-700 cursor-pointer"
												>
													{kelas.nama} (
													{kelas.tingkatRef?.nama || kelas.tingkat || "-"})
												</label>
											</div>
										))
									) : (
										<p className="text-gray-500 text-sm">Tidak ada kelas</p>
									)}
								</div>
								{selectedKelasMapel.length > 0 && (
									<p className="text-xs text-purple-600 mt-2">
										✓ {selectedKelasMapel.length} kelas dipilih
									</p>
								)}
							</div>
						)}

						<div className="flex gap-3">
							<button
								onClick={() => {
									setShowAssignModal(false);
									setAssigningTeacher(null);
									setSelectedKelasMapel([]);
									setSelectedWaliKelas(null);
								}}
								className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
							>
								Batal
							</button>
							<button
								onClick={saveAssignClasses}
								className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition shadow-md"
							>
								Assign
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Import Modal */}
			{showImportModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							⬇️ Impor Guru
						</h2>

						<div className="space-y-4 mb-6">
							<div>
								<button
									onClick={downloadGuruTemplate}
									className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium text-sm"
								>
									📥 Download Template
								</button>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Upload File Excel
								</label>
								<input
									type="file"
									accept=".xlsx,.xls"
									onChange={(e) => setImportFile(e.target.files?.[0] || null)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<p className="text-xs text-gray-500 mt-2">
									Format: NIP, Nama Lengkap, Mata Pelajaran ID (opsional)
								</p>
							</div>
						</div>

						<div className="flex gap-3">
							<button
								onClick={() => setShowImportModal(false)}
								className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
							>
								Batal
							</button>
							<button
								onClick={handleGuruImport}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition shadow-md"
							>
								Impor
							</button>
						</div>
					</div>
				</div>
			)}

			<ConfirmModal
				isOpen={confirmModal.isOpen}
				title={confirmModal.title}
				message={confirmModal.message}
				isDangerous={confirmModal.isDangerous}
				isLoading={confirmModal.isLoading}
				onConfirm={confirmModal.onConfirm}
				onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
			/>

			<SuccessToast
				isOpen={successToast.isOpen}
				message={successToast.message}
				onClose={() => setSuccessToast((prev) => ({ ...prev, isOpen: false }))}
			/>

			<ErrorToast
				isOpen={errorToast.isOpen}
				message={errorToast.message}
				onClose={() => setErrorToast((prev) => ({ ...prev, isOpen: false }))}
			/>
		</div>
	);
}
