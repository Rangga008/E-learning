"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
	kelasService,
	adminService,
	elearningService,
	studentService,
} from "@/lib/api/services";
import {
	ConfirmModal,
	SuccessToast,
	ErrorToast,
} from "@/components/CommonModals";
import { logger } from "@/utils/logger";
import { useNotification } from "@/hooks/useNotification";

interface Kelas {
	id: number;
	nama: string;
	tingkat: string;
	kapasitas?: number;
	status?: string;
	waliKelasId?: number;
	guruWali?: {
		id: number;
		namaLengkap: string;
		nip: string;
		mataPelajaranId?: number;
		kelasMapel?: string[];
	};
	siswa?: Array<{
		id: number;
		nisn: string;
		namaLengkap: string;
		jenisKelamin: string;
	}>;
	guruMapel?: Array<{
		id: number;
		namaLengkap: string;
		nip: string;
		mataPelajaranId?: number;
		mataPelajaran?: {
			id: number;
			nama: string;
		};
		kelasMapel?: string[];
	}>;
	mataPelajaran?: Array<{
		id: number;
		nama: string;
		deskripsi?: string;
	}>;
}

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
}

interface Guru {
	id: number;
	namaLengkap: string;
	nip: string;
	mataPelajaranId?: number;
	mataPelajaran?: {
		id: number;
		nama: string;
	};
	kelasMapel?: string[];
}

interface MataPelajaran {
	id: number;
	nama: string;
	guruId?: number;
	guru?: {
		id: number;
		namaLengkap: string;
	};
}

export default function KelasDetailPage() {
	const router = useRouter();
	const params = useParams();
	const id = params.id as string;

	const [kelas, setKelas] = useState<Kelas | null>(null);
	const [loading, setLoading] = useState(true);
	const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
	const [guruList, setGuruList] = useState<Guru[]>([]);
	const [mataPelajaran, setMataPelajaran] = useState<MataPelajaran[]>([]);
	const [showAddStudentModal, setShowAddStudentModal] = useState(false);
	const [showEditKapasitasModal, setShowEditKapasitasModal] = useState(false);
	const [showEditWaliKelasModal, setShowEditWaliKelasModal] = useState(false);
	const [showAssignGuruModal, setShowAssignGuruModal] = useState(false);
	const [selectedStudent, setSelectedStudent] = useState("");
	const [newKapasitas, setNewKapasitas] = useState<number>(0);
	const [newWaliKelasId, setNewWaliKelasId] = useState<number | null>(null);
	const [selectedMapelId, setSelectedMapelId] = useState<number | null>(null);
	const [selectedGuruId, setSelectedGuruId] = useState<number | null>(null);

	// Modal and Toast states
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
	const [errorToast, setErrorToast] = useState({ isOpen: false, message: "" });

	// Initialize notification hook
	const { showSuccess, showError, showConfirm, closeConfirm } =
		useNotification();

	useEffect(() => {
		if (id) {
			fetchKelasDetail();
			fetchAvailableStudents();
			fetchGuruList();
			fetchMapelReference();
		}
	}, [id]);

	const fetchKelasDetail = async () => {
		try {
			const response = await kelasService.getKelasById(parseInt(id));
			const data = response.data;
			setKelas(data);
			setNewKapasitas(data.kapasitas || 30);
			setNewWaliKelasId(data.waliKelasId || null);
		} catch (error) {
			logger.error("Fetch Class Detail", { error });
			showError("Gagal mengambil data kelas");
		} finally {
			setLoading(false);
		}
	};

	const fetchAvailableStudents = async () => {
		try {
			const response = await studentService.getAvailableStudents();
			setAvailableStudents(response.data || []);
		} catch (error) {
			console.error("Error fetching available students:", error);
		}
	};

	const fetchGuruList = async () => {
		try {
			const response = await adminService.getTeachersDropdown();
			setGuruList(response.data || []);
		} catch (error) {
			console.error("Error fetching guru list:", error);
		}
	};

	const fetchMapelReference = async () => {
		try {
			const response = await elearningService.getMataPelajaranDropdown();
			setMataPelajaran(response.data || []);
		} catch (error) {
			console.error("Error fetching mata pelajaran reference:", error);
		}
	};

	const getGuruMapelNames = (kelasMapelIds: string[] | undefined): string => {
		if (!kelasMapelIds || kelasMapelIds.length === 0) {
			return "Tidak ada";
		}

		const names = kelasMapelIds
			.map((id) => {
				const mapel = mataPelajaran.find((mp) => mp.id === parseInt(id));
				return mapel ? mapel.nama : null;
			})
			.filter((name) => name !== null);

		return names.length > 0 ? names.join(", ") : "Tidak ada";
	};

	const addStudentToClass = async () => {
		if (!selectedStudent) {
			logger.error("Add Student", { error: "No student selected" });
			showError("Pilih siswa terlebih dahulu");
			return;
		}

		try {
			await kelasService.addStudentToKelas(
				parseInt(selectedStudent),
				parseInt(id),
			);
			logger.success("Add Student to Class", { studentId: selectedStudent });
			showSuccess("Siswa berhasil ditambahkan ke kelas");
			setShowAddStudentModal(false);
			setSelectedStudent("");
			fetchKelasDetail();
			fetchAvailableStudents();
		} catch (error) {
			console.error("Error adding student:", error);
			logger.error("Add Student", { error });
			showError("Gagal menambahkan siswa ke kelas");
		}
	};

	const updateKapasitas = async () => {
		if (!kelas || newKapasitas <= 0) {
			logger.error("Update Capacity", { error: "Invalid capacity" });
			showError("Kapasitas harus lebih dari 0");
			return;
		}

		try {
			await kelasService.updateKelas(parseInt(id), {
				kapasitas: newKapasitas,
			});
			logger.success("Update Capacity", { newCapacity: newKapasitas });
			showSuccess("Kapasitas berhasil diperbarui");
			setShowEditKapasitasModal(false);
			fetchKelasDetail();
		} catch (error) {
			logger.error("Update Capacity", { error });
			showError("Gagal memperbarui kapasitas");
		}
	};

	const updateWaliKelas = async () => {
		if (!kelas || !newWaliKelasId) return;

		try {
			// Jika guru yang dipilih sebelumnya adalah guru mapel, hapus dari guru mapel dulu
			const isAlreadyGuruMapel = kelas.guruMapel?.some(
				(g) => g.id === newWaliKelasId,
			);
			if (isAlreadyGuruMapel) {
				await kelasService.removeGuruFromKelas(parseInt(id), newWaliKelasId);
			}

			await kelasService.updateKelas(parseInt(id), {
				guruWaliId: newWaliKelasId,
			});
			logger.success("Update Class Guardian", { guruId: newWaliKelasId });
			showSuccess("Wali kelas berhasil diperbarui");
			setNewWaliKelasId(null);
			fetchKelasDetail();
		} catch (error) {
			console.error("Error updating wali kelas:", error);
			logger.error("Update Class Guardian", { error });
			showError("Gagal memperbarui wali kelas");
		}
	};

	const assignGuruToMapel = async () => {
		if (!selectedGuruId) {
			logger.error("Assign Teacher", { error: "No teacher selected" });
			showError("Pilih guru terlebih dahulu");
			return;
		}

		// Cek apakah guru ini adalah wali kelas
		if (kelas?.waliKelasId === selectedGuruId) {
			logger.error("Assign Teacher", {
				error: "Guardian teacher cannot be assigned as subject teacher",
			});
			showError("Guru wali kelas tidak bisa dijadikan guru mapel");
			return;
		}

		try {
			await kelasService.assignGuruToKelas(parseInt(id), selectedGuruId);
			logger.success("Assign Teacher", { guruId: selectedGuruId });
			showSuccess("Guru berhasil diassign ke kelas");
			setShowAssignGuruModal(false);
			setSelectedMapelId(null);
			setSelectedGuruId(null);
			fetchKelasDetail();
		} catch (error) {
			console.error("Error assigning guru:", error);
			logger.error("Assign Teacher", { error });
			showError("Gagal mengassign guru ke kelas");
		}
	};

	const unassignGuruFromMapel = async (guruId: number) => {
		const guru = kelas?.guruMapel?.find((g) => g.id === guruId);
		const guruName = guru?.namaLengkap || `Guru ID ${guruId}`;

		logger.debug("User clicked delete guru from kelas", {
			kelasId: id,
			guruId,
		});

		// Cegah hapus wali kelas dari guru mapel
		if (kelas?.guruWali?.id === guruId) {
			logger.info("Attempted to delete wali kelas from guruMapel", { guruId });
			setErrorToast({
				isOpen: true,
				message:
					"Tidak bisa menghapus wali kelas dari guru mapel. Ubah wali kelas dulu jika ingin menghapus.",
			});
			return;
		}

		// Show confirmation modal
		logger.info("Showing delete confirmation modal for guru", { guruName });
		setConfirmModal({
			isOpen: true,
			title: "Hapus Guru dari Kelas",
			message: `Apakah Anda yakin ingin menghapus ${guruName} dari kelas ${kelas?.nama}? Mata pelajaran yang diajarnya akan otomatis dihapus dari kelas jika tidak ada guru lain yang mengajarnya.`,
			isDangerous: true,
			isLoading: false,
			onConfirm: async () => {
				// Set loading state
				setConfirmModal((prev) => ({ ...prev, isLoading: true }));
				logger.info("Confirmed delete guru from kelas", { guruId, guruName });

				try {
					await kelasService.removeGuruFromKelas(parseInt(id), guruId);
					logger.success("Guru deleted from kelas successfully", {
						guruId,
						guruName,
					});

					// Show success toast
					setSuccessToast({
						isOpen: true,
						message: `${guruName} berhasil dihapus dari kelas ${kelas?.nama}`,
					});

					// Close modal
					setConfirmModal({ ...confirmModal, isOpen: false, isLoading: false });

					// Refresh data
					fetchKelasDetail();
				} catch (error: any) {
					logger.error("Failed to delete guru from kelas", {
						error: error.message,
						guruId,
						guruName,
					});
					console.error("Error unassigning guru:", error);

					setErrorToast({
						isOpen: true,
						message: `Gagal menghapus guru: ${
							error.response?.data?.message || error.message || "Unknown error"
						}`,
					});

					// Close modal
					setConfirmModal({ ...confirmModal, isOpen: false, isLoading: false });
				}
			},
		});
	};

	const removeStudentFromClass = async (studentId: number) => {
		if (!confirm("Yakin ingin mengeluarkan siswa dari kelas ini?")) return;

		try {
			await kelasService.removeStudentFromKelas(studentId, parseInt(id));
			logger.success("Student removed from kelas", { studentId });
			setSuccessToast({
				isOpen: true,
				message: "Siswa berhasil dikeluarkan dari kelas",
			});
			fetchKelasDetail();
			fetchAvailableStudents();
		} catch (error) {
			logger.error("Failed to remove student from kelas", {
				error: error instanceof Error ? error.message : "Unknown error",
				studentId,
			});
			console.error("Error removing student:", error);
			setErrorToast({
				isOpen: true,
				message: "Gagal mengeluarkan siswa dari kelas",
			});
		}
	};

	const removeWaliKelas = async () => {
		if (!confirm("Yakin ingin menghapus wali kelas?")) return;

		try {
			await kelasService.removeWaliKelas(parseInt(id));
			logger.success("Remove Class Guardian", { kelasId: parseInt(id) });
			showSuccess("Wali kelas berhasil dihapus");
			fetchKelasDetail();
		} catch (error) {
			console.error("Error removing wali kelas:", error);
			logger.error("Remove Class Guardian", { error });
			showError("Gagal menghapus wali kelas");
		}
	};

	if (loading) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">Loading...</p>
			</div>
		);
	}

	if (!kelas) {
		return (
			<div className="text-center py-12">
				<p className="text-red-500">Kelas tidak ditemukan</p>
				<Link href="/admin/kelas" className="text-blue-600 hover:underline">
					Kembali ke Kelas
				</Link>
			</div>
		);
	}

	const studentCount = kelas.siswa?.length || 0;
	const capacity = kelas.kapasitas || 30;
	const occupancyPercentage = Math.round((studentCount / capacity) * 100);

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex justify-between items-start mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						📚 Detail Kelas: {kelas.nama}
					</h1>
					<p className="text-gray-600 text-sm mt-1">Tingkat: {kelas.tingkat}</p>
				</div>
				<Link
					href="/admin/kelas"
					className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
				>
					← Kembali
				</Link>
			</div>

			{/* Class Info Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Capacity */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex justify-between items-center mb-2">
						<p className="text-gray-600 text-sm font-medium">Kapasitas Kelas</p>
						<button
							onClick={() => setShowEditKapasitasModal(true)}
							className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
						>
							Edit
						</button>
					</div>
					<div className="flex items-center justify-between mb-3">
						<p className="text-2xl font-bold text-blue-600">
							{kelas.siswa?.length || 0}/{kelas.kapasitas || 30}
						</p>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-600 h-2 rounded-full"
							style={{
								width: `${Math.min(
									((kelas.siswa?.length || 0) / (kelas.kapasitas || 30)) * 100,
									100,
								)}%`,
							}}
						></div>
					</div>
				</div>

				{/* Status */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<p className="text-gray-600 text-sm mb-2 font-medium">Status Kelas</p>
					<span className="inline-block px-3 py-1 rounded-full text-white font-medium bg-green-500">
						{kelas.status || "Aktif"}
					</span>
				</div>
			</div>

			{/* Data Guru */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-xl font-bold text-gray-900 mb-6">👨‍🏫 Data Guru</h2>

				{/* Wali Kelas Section */}
				<div className="mb-8 pb-8 border-b border-gray-200">
					<h3 className="text-lg font-semibold text-gray-800 mb-4">
						📋 Wali Kelas
					</h3>
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div className="flex gap-2 items-end justify-between">
							<div className="flex-1">
								<label className="block text-sm font-semibold text-blue-800 mb-2">
									Wali Kelas Saat Ini
								</label>
								<p className="text-gray-900 font-medium">
									{kelas.guruWali ? (
										<>
											{kelas.guruWali.namaLengkap}{" "}
											<span className="text-gray-600 text-sm">
												(NIP: {kelas.guruWali.nip})
											</span>
										</>
									) : (
										<span className="text-gray-500 italic">
											Belum ada wali kelas
										</span>
									)}
								</p>
							</div>
							<div className="flex gap-2">
								<button
									onClick={() => setShowEditWaliKelasModal(true)}
									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
								>
									✏️ Ubah
								</button>
								{kelas.guruWali && (
									<button
										onClick={removeWaliKelas}
										className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
									>
										🗑️ Hapus
									</button>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Guru Mapel Section */}
				<div>
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-lg font-semibold text-gray-800">
							🎓 Guru Mata Pelajaran
						</h3>
						{guruList.length > (kelas.guruMapel?.length || 0) && (
							<button
								onClick={() => setShowAssignGuruModal(true)}
								className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
							>
								➕ Assign Guru
							</button>
						)}
					</div>

					{kelas.guruMapel && kelas.guruMapel.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="min-w-full border border-gray-300">
								<thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
									<tr>
										<th className="px-6 py-3 text-left text-sm font-semibold">
											No
										</th>
										<th className="px-6 py-3 text-left text-sm font-semibold">
											Nama Guru
										</th>
										<th className="px-6 py-3 text-left text-sm font-semibold">
											NIP
										</th>
										<th className="px-6 py-3 text-left text-sm font-semibold">
											Mata Pelajaran
										</th>
										<th className="px-6 py-3 text-center text-sm font-semibold">
											Aksi
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{kelas.guruMapel.map((guru, index) => (
										<tr key={guru.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 text-sm text-gray-900">
												{index + 1}
											</td>
											<td className="px-6 py-4 text-sm text-gray-900">
												{guru.namaLengkap}
											</td>
											<td className="px-6 py-4 text-sm text-gray-900">
												{guru.nip}
											</td>
											<td className="px-6 py-4 text-sm text-gray-900">
												{guru.mataPelajaran?.nama ||
													getGuruMapelNames(guru.kelasMapel)}
											</td>
											<td className="px-6 py-4 text-center">
												<div className="flex gap-2 justify-center">
													<Link
														href={`/admin/users/${guru.id}`}
														className="px-3 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600 font-medium transition"
													>
														👁️ Detail
													</Link>
													<button
														onClick={() => unassignGuruFromMapel(guru.id)}
														className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 font-medium transition"
													>
														🗑️ Hapus
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<p className="text-gray-500 italic text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
							⚠️ Belum ada guru yang ditugaskan
						</p>
					)}
				</div>
			</div>

			{/* Mata Pelajaran Kelas */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-xl font-bold text-gray-900 mb-6">
					📖 Mata Pelajaran Kelas
				</h2>

				{kelas.mataPelajaran && kelas.mataPelajaran.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{/* Display synced mataPelajaran from backend */}
						{kelas.mataPelajaran.map((mapel) => {
							// Find which guru(s) teach this subject
							const teacherList: Array<{
								name?: string;
								nip?: string;
								role: string;
							}> = [];

							// Check guru mapel
							kelas.guruMapel?.forEach((guru) => {
								if (guru.mataPelajaranId === mapel.id) {
									teacherList.push({
										name: guru.namaLengkap,
										nip: guru.nip,
										role: "Guru Mapel",
									});
								}
							});

							// Check wali
							if (
								kelas.guruWali?.mataPelajaranId === mapel.id &&
								!teacherList.some((t) => t.name === kelas.guruWali?.namaLengkap)
							) {
								teacherList.push({
									name: kelas.guruWali?.namaLengkap,
									nip: kelas.guruWali?.nip,
									role: "Wali Kelas",
								});
							}

							return (
								<div
									key={`mapel-${mapel.id}`}
									className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4"
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<h3 className="font-semibold text-gray-900 text-lg">
												{mapel.nama}
											</h3>
											{mapel.deskripsi && (
												<p className="text-sm text-gray-600 mt-1">
													{mapel.deskripsi}
												</p>
											)}
											<div className="mt-3 space-y-1">
												{teacherList.length > 0 ? (
													teacherList.map((teacher, idx) => (
														<p key={idx} className="text-sm text-gray-600">
															<strong>{teacher.role}:</strong> {teacher.name} (
															{teacher.nip})
														</p>
													))
												) : (
													<p className="text-xs text-gray-500 italic">
														Tidak ada guru terkait
													</p>
												)}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<p className="text-gray-500 italic text-sm bg-gray-50 p-3 rounded border border-gray-200">
						ℹ️ Belum ada mata pelajaran yang ditugaskan
					</p>
				)}
			</div>

			{/* Students List */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold text-gray-900">
						👨‍🎓 Daftar Siswa ({kelas.siswa?.length || 0})
					</h2>
					{(kelas.siswa?.length || 0) < (kelas.kapasitas || 30) && (
						<button
							onClick={() => setShowAddStudentModal(true)}
							className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
						>
							➕ Tambah Siswa
						</button>
					)}
				</div>

				{kelas.siswa && kelas.siswa.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="min-w-full">
							<thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
								<tr>
									<th className="px-6 py-3 text-left text-sm font-semibold">
										No
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold">
										NISN
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold">
										Nama Lengkap
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold">
										Jenis Kelamin
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold">
										Aksi
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{kelas.siswa.map((siswa, index) => (
									<tr key={siswa.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 text-sm text-gray-900">
											{index + 1}
										</td>
										<td className="px-6 py-4 text-sm text-gray-900">
											{siswa.nisn}
										</td>
										<td className="px-6 py-4 text-sm text-gray-900">
											{siswa.namaLengkap}
										</td>
										<td className="px-6 py-4 text-sm text-gray-900">
											{siswa.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
										</td>
										<td className="px-6 py-4 text-sm">
											<div className="flex gap-2">
												<Link
													href={`/admin/users/${siswa.id}`}
													className="text-blue-600 hover:underline"
												>
													👁️ Detail
												</Link>
												<button
													onClick={() => removeStudentFromClass(siswa.id)}
													className="text-red-600 hover:underline"
												>
													🗑️ Keluarkan
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p className="text-gray-500 text-center py-6">
						Belum ada siswa di kelas ini
					</p>
				)}
			</div>

			{/* Modals */}

			{/* Edit Kapasitas Modal */}
			{showEditKapasitasModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							Ubah Kapasitas Kelas
						</h2>
						<div className="mb-4">
							<label className="block text-gray-700 font-medium mb-2">
								Kapasitas Siswa
							</label>
							<input
								type="number"
								min="1"
								value={newKapasitas}
								onChange={(e) => setNewKapasitas(parseInt(e.target.value))}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => setShowEditKapasitasModal(false)}
								className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
							>
								Batal
							</button>
							<button
								onClick={updateKapasitas}
								className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
							>
								Simpan
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Edit Wali Kelas Modal */}
			{showEditWaliKelasModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							Ubah Wali Kelas
						</h2>
						<div className="mb-4">
							<label className="block text-gray-700 font-medium mb-2">
								Pilih Guru Baru
							</label>
							{kelas.guruWali && (
								<div className="mb-3 p-3 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-800">
									⚠️ Anda akan menggantikan wali kelas saat ini:{" "}
									{kelas.guruWali.namaLengkap}
								</div>
							)}
							{newWaliKelasId &&
								kelas.guruMapel?.some((g) => g.id === newWaliKelasId) && (
									<div className="mb-3 p-3 bg-blue-100 border border-blue-400 rounded text-sm text-blue-800">
										ℹ️ Guru ini akan otomatis dihapus dari daftar Guru Mapel
										saat disimpan, tetapi mapelnya tetap ada di kelas.
									</div>
								)}
							<select
								value={newWaliKelasId || ""}
								onChange={(e) =>
									setNewWaliKelasId(
										e.target.value ? parseInt(e.target.value) : null,
									)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">-- Pilih Wali Kelas --</option>
								{guruList
									.filter((guru) => guru.id !== kelas?.guruWali?.id)
									.map((guru) => (
										<option key={guru.id} value={guru.id}>
											{guru.namaLengkap} ({guru.nip})
											{kelas.guruMapel?.some((g) => g.id === guru.id) &&
												" (Guru Mapel)"}
										</option>
									))}
							</select>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => {
									setShowEditWaliKelasModal(false);
									setNewWaliKelasId(null);
								}}
								className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
							>
								Batal
							</button>
							<button
								onClick={updateWaliKelas}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
							>
								Simpan
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Assign Guru Modal */}
			{showAssignGuruModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							Assign Guru ke Kelas
						</h2>
						<div className="mb-4">
							<label className="block text-gray-700 font-medium mb-2">
								Pilih Guru
							</label>
							<select
								value={selectedGuruId || ""}
								onChange={(e) =>
									setSelectedGuruId(
										e.target.value ? parseInt(e.target.value) : null,
									)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">-- Pilih Guru --</option>
								{guruList
									.filter(
										(guru) =>
											!kelas.guruMapel?.some((g) => g.id === guru.id) &&
											guru.id !== kelas?.waliKelasId,
									)
									.map((guru) => (
										<option key={guru.id} value={guru.id}>
											{guru.namaLengkap} ({guru.nip}) -{" "}
											{guru.mataPelajaran && guru.mataPelajaran.nama
												? guru.mataPelajaran.nama
												: "Tidak ada mapel"}
										</option>
									))}
							</select>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => {
									setShowAssignGuruModal(false);
									setSelectedGuruId(null);
								}}
								className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
							>
								Batal
							</button>
							<button
								onClick={assignGuruToMapel}
								className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
							>
								Assign
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Add Student Modal */}
			{showAddStudentModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							Tambah Siswa ke Kelas
						</h2>
						<div className="mb-4">
							<label className="block text-gray-700 font-medium mb-2">
								Pilih Siswa
							</label>
							<select
								value={selectedStudent}
								onChange={(e) => setSelectedStudent(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">-- Pilih Siswa --</option>
								{availableStudents.map((student) => (
									<option key={student.id} value={student.id}>
										{student.namaLengkap} ({student.nisn})
									</option>
								))}
							</select>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => {
									setShowAddStudentModal(false);
									setSelectedStudent("");
								}}
								className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
							>
								Batal
							</button>
							<button
								onClick={addStudentToClass}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
							>
								Tambah
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modals and Toasts */}
			<ConfirmModal
				isOpen={confirmModal.isOpen}
				title={confirmModal.title}
				message={confirmModal.message}
				confirmText="Ya, Hapus"
				cancelText="Batal"
				isDangerous={confirmModal.isDangerous}
				isLoading={confirmModal.isLoading}
				onConfirm={confirmModal.onConfirm}
				onCancel={() =>
					setConfirmModal({ ...confirmModal, isOpen: false, isLoading: false })
				}
			/>

			<SuccessToast
				isOpen={successToast.isOpen}
				title="Berhasil"
				message={successToast.message}
				onClose={() => setSuccessToast({ ...successToast, isOpen: false })}
			/>

			<ErrorToast
				isOpen={errorToast.isOpen}
				title="Gagal"
				message={errorToast.message}
				onClose={() => setErrorToast({ ...errorToast, isOpen: false })}
			/>
		</div>
	);
}
