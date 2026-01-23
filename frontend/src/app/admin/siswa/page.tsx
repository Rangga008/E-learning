"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { studentService, kelasService } from "@/lib/api/services";
import {
	ConfirmModal,
	SuccessToast,
	ErrorToast,
} from "@/components/CommonModals";
import { FormModal } from "@/components/FormModal";
import { logger } from "@/lib/logger";

interface Student {
	id: number;
	nisn: string;
	namaLengkap: string;
	jenisKelamin: string;
	kelas?: {
		id: number;
		nama: string;
		tingkatRef?: {
			nama: string;
		};
		tingkat?: string;
	};
	kelasId?: number;
	level?: number;
	poin?: number;
	userId?: number;
}

interface Kelas {
	id: number;
	nama: string;
	tingkatRef?: {
		nama: string;
	};
	tingkat?: string;
}

export default function SiswaPage() {
	const [students, setStudents] = useState<Student[]>([]);
	const [kelasList, setKelasList] = useState<Kelas[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [total, setTotal] = useState(0);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterKelas, setFilterKelas] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [editingStudent, setEditingStudent] = useState<Student | null>(null);
	const [formData, setFormData] = useState({
		nisn: "",
		namaLengkap: "",
		kelas: "",
		jenisKelamin: "L",
		password: "",
	});
	const [showImportModal, setShowImportModal] = useState(false);
	const [importFile, setImportFile] = useState<File | null>(null);
	const [importKelasOption, setImportKelasOption] = useState("with-kelas");
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
	}, [searchQuery, filterKelas]);

	useEffect(() => {
		fetchStudents();
		fetchKelasList();
	}, [page, searchQuery, filterKelas]);

	const fetchKelasList = async () => {
		try {
			const response = await kelasService.getKelasDropdown();
			setKelasList(response.data || []);
		} catch (error) {
			console.error("Error fetching kelas:", error);
		}
	};

	const fetchStudents = async () => {
		try {
			setLoading(true);
			const response = await studentService.getAllStudents(
				page,
				limit,
				searchQuery,
			);
			setStudents(response.data);
			setTotal(response.pagination?.total || 0);
		} catch (error) {
			console.error("Error fetching students:", error);
		} finally {
			setLoading(false);
		}
	};

	const resetLevel = async (studentId: number) => {
		try {
			await studentService.updateStudent(studentId, {
				level: 1,
				poin: 0,
			} as any);
			logger.success("Level reset successfully", { studentId });
			setSuccessToast({
				isOpen: true,
				message: "Level berhasil direset",
			});
			fetchStudents();
		} catch (error: any) {
			logger.error("Failed to reset level", {
				error: error.message,
				studentId,
			});
			setErrorToast({
				isOpen: true,
				message: error.response?.data?.message || "Gagal mereset level",
			});
		}
	};

	const openModal = (student?: Student) => {
		if (student) {
			setEditingStudent(student);
			const kelasValue =
				typeof student.kelas === "object" ? student.kelas.id : student.kelas;
			setFormData({
				nisn: student.nisn,
				namaLengkap: student.namaLengkap,
				kelas: kelasValue ? kelasValue.toString() : "",
				jenisKelamin: student.jenisKelamin,
				password: "",
			});
		} else {
			setEditingStudent(null);
			setFormData({
				nisn: "",
				namaLengkap: "",
				kelas: "",
				jenisKelamin: "L",
				password: "",
			});
		}
		setShowModal(true);
	};

	const saveStudent = async () => {
		if (!formData.nisn || !formData.namaLengkap) {
			setErrorToast({
				isOpen: true,
				message: "NISN dan Nama Lengkap harus diisi",
			});
			return;
		}
		try {
			if (editingStudent) {
				await studentService.updateStudent(editingStudent.id, formData as any);
				logger.success("Student updated successfully", {
					studentId: editingStudent.id,
				});
				setSuccessToast({
					isOpen: true,
					message: "Siswa berhasil diperbarui",
				});
			} else {
				await studentService.createStudent(formData as any);
				logger.success("Student created successfully", { nisn: formData.nisn });
				setSuccessToast({
					isOpen: true,
					message: "Siswa berhasil ditambahkan",
				});
			}
			setShowModal(false);
			fetchStudents();
		} catch (error: any) {
			logger.error("Failed to save student", error);
			setErrorToast({
				isOpen: true,
				message: error.response?.data?.message || "Gagal menyimpan siswa",
			});
		}
	};

	const deleteStudent = async (student: Student) => {
		logger.debug("User clicked delete student", {
			studentId: student.id,
			name: student.namaLengkap,
		});
		setConfirmModal({
			isOpen: true,
			title: "Hapus Siswa",
			message: `Apakah Anda yakin ingin menghapus siswa "${student.namaLengkap}"? Tindakan ini tidak dapat dibatalkan.`,
			isDangerous: true,
			isLoading: false,
			onConfirm: async () => {
				setConfirmModal((prev) => ({ ...prev, isLoading: true }));
				try {
					logger.info("Attempting to delete student", {
						studentId: student.id,
					});
					await studentService.deleteStudent(student.id);
					logger.success("Student deleted successfully", {
						studentId: student.id,
						namaLengkap: student.namaLengkap,
					});
					setSuccessToast({
						isOpen: true,
						message: `Siswa ${student.namaLengkap} berhasil dihapus`,
					});
					setConfirmModal((prev) => ({
						...prev,
						isOpen: false,
						isLoading: false,
					}));
					fetchStudents();
				} catch (error: any) {
					logger.error("Failed to delete student", {
						error: error.message,
						studentId: student.id,
					});
					setErrorToast({
						isOpen: true,
						message: "Gagal menghapus siswa. Silakan coba lagi.",
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

	const downloadTemplate = async () => {
		try {
			const XLSX = await import("xlsx");
			const templateData: any[] = [
				{
					NISN: "001",
					"Nama Lengkap": "Contoh Siswa 1",
					"Jenis Kelamin": "L",
					Password: "password123",
				},
				{
					NISN: "002",
					"Nama Lengkap": "Contoh Siswa 2",
					"Jenis Kelamin": "P",
					Password: "password456",
				},
			];

			const workbook = XLSX.utils.book_new();
			const worksheet = XLSX.utils.json_to_sheet(templateData);
			XLSX.utils.book_append_sheet(workbook, worksheet, "Siswa");
			XLSX.writeFile(workbook, "template_siswa.xlsx");
			logger.success("Template downloaded successfully");
		} catch (error: any) {
			logger.error("Failed to download template", error);
			setErrorToast({
				isOpen: true,
				message: "Gagal mendownload template",
			});
		}
	};

	const handleImport = async () => {
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
					const skippedNISN = [];
					const existingNISN = new Set(students.map((s) => s.nisn));

					for (let i = 0; i < jsonData.length; i++) {
						const row = jsonData[i];
						const nisn = String(row.NISN || "").trim();
						const namaLengkap = String(row["Nama Lengkap"] || "").trim();
						const jenisKelamin = String(row["Jenis Kelamin"] || "")
							.trim()
							.toUpperCase();
						const password = String(row.Password || "").trim();

						if (!nisn || nisn.length < 1) {
							setErrorToast({
								isOpen: true,
								message: `Baris ${i + 2}: NISN tidak valid`,
							});
							return;
						}

						// Skip if NISN already exists
						if (existingNISN.has(nisn)) {
							skippedNISN.push({ nisn, namaLengkap });
							continue;
						}

						if (!namaLengkap || namaLengkap.length < 3) {
							setErrorToast({
								isOpen: true,
								message: `Baris ${i + 2}: Nama lengkap minimal 3 karakter`,
							});
							return;
						}

						if (!["L", "P"].includes(jenisKelamin)) {
							setErrorToast({
								isOpen: true,
								message: `Baris ${i + 2}: Jenis Kelamin harus L atau P`,
							});
							return;
						}

						if (!password || password.length < 1) {
							setErrorToast({
								isOpen: true,
								message: `Baris ${i + 2}: Password tidak boleh kosong`,
							});
						}

						const importData: any = {
							nisn,
							namaLengkap,
							jenisKelamin,
							password,
						};

						if (importKelasOption) {
							importData.kelasId = parseInt(importKelasOption);
						}

						dataToImport.push(importData);
					}

					if (dataToImport.length === 0) {
						setErrorToast({
							isOpen: true,
							message: "Tidak ada data valid untuk diimport",
						});
						return;
					}

					const result = await studentService.importStudents(dataToImport);
					logger.success("Students imported", {
						count: dataToImport.length,
						skipped: skippedNISN.length,
					});

					let message = `Berhasil mengimport ${dataToImport.length} data siswa`;
					if (skippedNISN.length > 0) {
						message += ` (${skippedNISN.length} data dengan NISN duplikat di-skip)`;
					}

					setSuccessToast({
						isOpen: true,
						message: result.data?.message || message,
					});
					setShowImportModal(false);
					setImportFile(null);
					fetchStudents();
				} catch (error: any) {
					logger.error("Failed to import students", error);
					setErrorToast({
						isOpen: true,
						message:
							error.response?.data?.message ||
							error.message ||
							"Gagal mengimpor siswa",
					});
				}
			};
			reader.readAsArrayBuffer(importFile);
		} catch (error: any) {
			logger.error("Failed to import students", error);
			setErrorToast({
				isOpen: true,
				message: error.message || "Gagal mengimpor siswa",
			});
		}
	};

	const totalPages = Math.ceil(total / limit);

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center mb-2">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">👨‍🎓 Data Siswa</h1>
					<p className="text-gray-600 text-sm mt-1">
						Total: {total} siswa terdaftar
					</p>
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className="bg-white rounded-lg shadow mb-6 border-b-2 border-gray-200">
				<div className="flex flex-wrap">
					<Link
						href="/admin/siswa"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-blue-600 hover:bg-gray-50"
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
						placeholder="🔍 Cari NISN, nama, atau jenis kelamin..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
					/>
				</div>
				<div className="w-full sm:w-48">
					<select
						value={filterKelas}
						onChange={(e) => setFilterKelas(e.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
					>
						<option value="">📚 Semua Kelas</option>
						{kelasList.map((kelas) => (
							<option key={kelas.id} value={kelas.id}>
								{kelas.nama} ({kelas.tingkatRef?.nama || kelas.tingkat || "-"})
							</option>
						))}
					</select>
				</div>
				{(searchQuery || filterKelas) && (
					<button
						onClick={() => {
							setSearchQuery("");
							setFilterKelas("");
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
						➕ Tambah Siswa
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
									NISN
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									Nama Lengkap
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									JK
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									Kelas
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									Level
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									Poin
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									Aksi
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{students.map((student, index) => (
								<tr key={student.id} className="hover:bg-gray-50 transition">
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										{index + 1 + (page - 1) * limit}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
										{student.nisn}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
										{student.namaLengkap}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
										{student.jenisKelamin === "L"
											? "👦 Laki-laki"
											: "👧 Perempuan"}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
										{typeof student.kelas === "object"
											? student.kelas.nama
											: student.kelas}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
											Level {student.level}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-yellow-600">
										⭐ {student.poin}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm space-x-1 flex items-center">
										<Link
											href={`/admin/users/${student.userId}`}
											className="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-medium text-xs transition shadow"
											title="Lihat detail"
										>
											👁️ Detail
										</Link>
										<button
											onClick={() => openModal(student)}
											className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-xs transition shadow"
										>
											✏️ Ubah
										</button>
										<button
											onClick={() => resetLevel(student.id)}
											className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium text-xs transition shadow"
										>
											🔄 Reset Level
										</button>
										<button
											onClick={() => deleteStudent(student)}
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

			{/* Add/Edit Student Modal */}
			<FormModal
				isOpen={showModal}
				title={editingStudent ? "✏️ Edit Siswa" : "➕ Tambah Siswa"}
				fields={[
					{
						name: "nisn",
						label: "NISN",
						type: "text",
						placeholder: "Masukkan NISN",
						required: true,
						value: formData.nisn,
						onChange: (e) => setFormData({ ...formData, nisn: e.target.value }),
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
						name: "kelas",
						label: "Kelas",
						type: "select",
						placeholder: "Pilih Kelas",
						value: formData.kelas,
						options: kelasList.map((k) => ({
							value: k.id,
							label: `${k.nama} (${k.tingkatRef?.nama || k.tingkat || "-"})`,
						})),
						onChange: (e) =>
							setFormData({ ...formData, kelas: e.target.value }),
					},
					{
						name: "jenisKelamin",
						label: "Jenis Kelamin",
						type: "select",
						value: formData.jenisKelamin,
						options: [
							{ value: "L", label: "👦 Laki-laki" },
							{ value: "P", label: "👧 Perempuan" },
						],
						onChange: (e) =>
							setFormData({ ...formData, jenisKelamin: e.target.value }),
					},
					{
						name: "password",
						label: "Password",
						type: "password",
						placeholder: editingStudent
							? "Kosongkan jika tidak ingin mengubah"
							: "Masukkan password",
						value: formData.password,
						onChange: (e) =>
							setFormData({ ...formData, password: e.target.value }),
					},
				]}
				onSubmit={saveStudent}
				onCancel={() => setShowModal(false)}
				submitLabel={editingStudent ? "Perbarui" : "Simpan"}
				maxWidth="max-w-md"
			/>

			{/* Import Modal */}
			{showImportModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
						<h2 className="text-2xl font-bold text-gray-900 mb-1">
							Import Siswa dari Excel
						</h2>
						<p className="text-gray-600 text-sm mb-6">
							Siswa akan ditambahkan ke semester:{" "}
							<span className="font-semibold">Semester Genap - 2025/2026</span>
						</p>

						{/* Step 1: Download Template */}
						<div className="mb-6">
							<h3 className="font-semibold text-gray-900 text-sm mb-3">
								1. Download Template Excel
							</h3>
							<button
								onClick={downloadTemplate}
								className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium text-sm transition"
							>
								📥 Download Template
							</button>
							<p className="text-xs text-gray-600 mt-2">
								Template berisi kolom: Nama, Email, NIS, Password
							</p>
						</div>

						{/* Step 2: Upload File */}
						<div className="mb-6">
							<h3 className="font-semibold text-gray-900 text-sm mb-3">
								2. Upload File Excel
							</h3>
							<label className="block w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition">
								<input
									type="file"
									accept=".xlsx,.xls"
									onChange={(e) => setImportFile(e.target.files?.[0] || null)}
									className="hidden"
								/>
								<div className="text-sm">
									{importFile ? (
										<span className="text-green-600 font-medium">
											✓ {importFile.name}
										</span>
									) : (
										<span className="text-gray-600">
											📁 Klik untuk memilih file atau drag & drop
										</span>
									)}
								</div>
							</label>
						</div>

						{/* Step 3: Kelas Opsional */}
						<div className="mb-6">
							<h3 className="font-semibold text-gray-900 text-sm mb-3">
								3. Kelas (Opsional)
							</h3>
							<select
								value={importKelasOption}
								onChange={(e) => setImportKelasOption(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Tanpa kelas</option>
								{kelasList.map((kelas) => (
									<option key={kelas.id} value={kelas.id}>
										{kelas.nama}
									</option>
								))}
							</select>
							<p className="text-xs text-gray-600 mt-2">
								Pilih kelas tujuan untuk semua siswa yang diimpor
							</p>
						</div>

						{/* Informasi Penting */}
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
							<p className="font-semibold text-blue-900 text-sm mb-2">
								📋 Informasi Penting:
							</p>
							<ul className="text-xs text-blue-800 space-y-1">
								<li>• Siswa dengan NISN yang sama akan dilewati</li>
								<li>• Password akan di-hash otomatis oleh sistem</li>
								<li>• Semua siswa masuk ke kelas yang dipilih</li>
							</ul>
						</div>

						<div className="flex gap-3">
							<button
								onClick={() => setShowImportModal(false)}
								className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
							>
								Batal
							</button>
							<button
								onClick={handleImport}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition shadow-md"
							>
								📥 Import Siswa
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
