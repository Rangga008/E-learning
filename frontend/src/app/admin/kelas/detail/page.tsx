"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { SuccessToast, ErrorToast } from "@/components/CommonModals";
import { logger } from "@/utils/logger";

interface Kelas {
	id: number;
	nama: string;
	tingkat: string;
	kapasitas: number;
	waliKelasId: number;
	status: string;
	createdAt: string;
	updatedAt: string;
}

interface Guru {
	id: number;
	namaLengkap: string;
	email: string;
}

interface MataPelajaran {
	id: number;
	nama: string;
	guru: Guru;
}

interface Student {
	id: number;
	nisn: string;
	namaLengkap: string;
	jenisKelamin: string;
	level: number;
	poin: number;
}

export default function KelasDetailPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const kelasId = searchParams.get("id");

	const [kelas, setKelas] = useState<Kelas | null>(null);
	const [waliKelas, setWaliKelas] = useState<Guru | null>(null);
	const [mataPelajaran, setMataPelajaran] = useState<MataPelajaran[]>([]);
	const [siswa, setSiswa] = useState<Student[]>([]);
	const [availableSiswa, setAvailableSiswa] = useState<Student[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAddSiswaModal, setShowAddSiswaModal] = useState(false);
	const [selectedSiswaId, setSelectedSiswaId] = useState<number | null>(null);
	const [successToast, setSuccessToast] = useState({
		isOpen: false,
		message: "",
	});
	const [errorToast, setErrorToast] = useState({ isOpen: false, message: "" });

	useEffect(() => {
		if (kelasId) {
			fetchKelasDetail();
			fetchSiswaInKelas();
			fetchAvailableSiswa();
		}
	}, [kelasId]);

	const fetchKelasDetail = async () => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/kelas/${kelasId}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			setKelas(response.data.data);
			if (response.data.data.waliKelasId) {
				fetchWaliKelas(response.data.data.waliKelasId);
			}
			fetchMataPelajaran();
		} catch (error) {
			console.error("Error fetching kelas detail:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchWaliKelas = async (waliId: number) => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/teachers/${waliId}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			setWaliKelas(response.data.data);
		} catch (error) {
			console.error("Error fetching wali kelas:", error);
		}
	};

	const fetchMataPelajaran = async () => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/dropdown/mata-pelajaran?kelas=${kelasId}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			setMataPelajaran(response.data.data || []);
		} catch (error) {
			console.error("Error fetching mata pelajaran:", error);
		}
	};

	const fetchSiswaInKelas = async () => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/students?kelas=${kelasId}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			setSiswa(response.data.data || []);
		} catch (error) {
			console.error("Error fetching siswa in kelas:", error);
		}
	};

	const fetchAvailableSiswa = async () => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/peserta-didik/available/list`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			setAvailableSiswa(response.data || []);
		} catch (error) {
			console.error("Error fetching available siswa:", error);
		}
	};

	const addSiswaToKelas = async () => {
		if (!selectedSiswaId) {
			logger.error("Add Student to Class", { error: "No student selected" });
			setErrorToast({ isOpen: true, message: "Pilih siswa terlebih dahulu" });
			return;
		}

		try {
			await axios.put(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/students/${selectedSiswaId}`,
				{ kelasId },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			logger.success("Add Student to Class", { studentId: selectedSiswaId });
			setSuccessToast({
				isOpen: true,
				message: "Siswa berhasil ditambahkan ke kelas",
			});
			setShowAddSiswaModal(false);
			setSelectedSiswaId(null);
			fetchSiswaInKelas();
			fetchAvailableSiswa();
		} catch (error) {
			logger.error("Add Student to Class", { error });
			setErrorToast({
				isOpen: true,
				message: "Gagal menambahkan siswa ke kelas",
			});
		}
	};

	const removeSiswaFromKelas = async (siswaId: number) => {
		if (!confirm("Yakin ingin mengeluarkan siswa ini dari kelas?")) return;

		try {
			await axios.put(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/students/${siswaId}`,
				{ kelasId: null },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			logger.success("Remove Student from Class", { studentId: siswaId });
			setSuccessToast({
				isOpen: true,
				message: "Siswa berhasil dikeluarkan dari kelas",
			});
			fetchSiswaInKelas();
			fetchAvailableSiswa();
		} catch (error) {
			logger.error("Remove Student from Class", { error });
			setErrorToast({
				isOpen: true,
				message: "Gagal mengeluarkan siswa dari kelas",
			});
		}
	};

	if (loading) {
		return (
			<div className="p-6 text-center">
				<p className="text-gray-500">Loading...</p>
			</div>
		);
	}

	if (!kelas) {
		return (
			<div className="p-6 text-center">
				<p className="text-red-500">Kelas tidak ditemukan</p>
			</div>
		);
	}

	const currentSiswaCount = siswa.length;
	const kapasitasText = `${currentSiswaCount} / ${kelas.kapasitas} siswa`;
	const kapasitasPercentage = (currentSiswaCount / kelas.kapasitas) * 100;

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						📚 Detail Kelas: {kelas.nama}
					</h1>
					<p className="text-gray-600 text-sm mt-1">
						Kelola informasi dan siswa kelas {kelas.nama}
					</p>
				</div>
				<Link href="/admin/kelas">
					<button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium">
						← Kembali
					</button>
				</Link>
			</div>

			{/* Kelas Info */}
			<div className="bg-white rounded-lg shadow-md p-6 grid grid-cols-2 gap-6">
				<div>
					<p className="text-gray-600 text-sm">Nama Kelas</p>
					<p className="text-xl font-semibold text-gray-900">{kelas.nama}</p>
				</div>
				<div>
					<p className="text-gray-600 text-sm">Tingkat</p>
					<p className="text-xl font-semibold text-gray-900">{kelas.tingkat}</p>
				</div>
				<div>
					<p className="text-gray-600 text-sm">Status</p>
					<span
						className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
							kelas.status === "Aktif"
								? "bg-green-100 text-green-700"
								: "bg-red-100 text-red-700"
						}`}
					>
						{kelas.status}
					</span>
				</div>
				<div>
					<p className="text-gray-600 text-sm">Kapasitas</p>
					<div className="space-y-1">
						<p className="text-xl font-semibold text-gray-900">
							{kapasitasText}
						</p>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className="bg-blue-600 h-2 rounded-full"
								style={{ width: `${Math.min(kapasitasPercentage, 100)}%` }}
							></div>
						</div>
					</div>
				</div>
			</div>

			{/* Wali Kelas */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-xl font-bold text-gray-900 mb-4">👨‍🏫 Wali Kelas</h2>
				{waliKelas ? (
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-gray-600 text-sm">Nama</p>
							<p className="text-lg font-semibold text-gray-900">
								{waliKelas.namaLengkap}
							</p>
						</div>
						<div>
							<p className="text-gray-600 text-sm">Email</p>
							<p className="text-lg font-semibold text-gray-900">
								{waliKelas.email}
							</p>
						</div>
					</div>
				) : (
					<p className="text-gray-500 italic">Belum ada wali kelas</p>
				)}
			</div>

			{/* Mata Pelajaran */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-xl font-bold text-gray-900 mb-4">
					📖 Mata Pelajaran
				</h2>
				{mataPelajaran.length > 0 ? (
					<div className="grid grid-cols-1 gap-3">
						{mataPelajaran.map((mp) => (
							<div
								key={mp.id}
								className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200"
							>
								<div>
									<p className="font-semibold text-gray-900">{mp.nama}</p>
									<p className="text-sm text-gray-600">
										{mp.guru ? mp.guru.namaLengkap : "Belum ada guru"}
									</p>
								</div>
								<p className="text-sm text-gray-500">
									{mp.guru ? mp.guru.email : "-"}
								</p>
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-500 italic">
						Belum ada mata pelajaran. Mata pelajaran akan muncul otomatis dari
						guru yang ditetapkan untuk kelas ini.
					</p>
				)}
			</div>

			{/* Daftar Siswa */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold text-gray-900">
						👨‍🎓 Daftar Siswa ({siswa.length})
					</h2>
					{currentSiswaCount < kelas.kapasitas && (
						<button
							onClick={() => setShowAddSiswaModal(true)}
							className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
						>
							➕ Tambah Siswa
						</button>
					)}
				</div>

				{siswa.length > 0 ? (
					<div className="overflow-hidden">
						<table className="min-w-full">
							<thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
								<tr>
									<th className="px-6 py-3 text-left text-sm font-semibold">
										NISN
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold">
										Nama
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold">
										Jenis Kelamin
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold">
										Level
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold">
										Poin
									</th>
									<th className="px-6 py-3 text-center text-sm font-semibold">
										Aksi
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{siswa.map((s) => (
									<tr key={s.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 text-sm text-gray-900">
											{s.nisn}
										</td>
										<td className="px-6 py-4 text-sm text-gray-900">
											{s.namaLengkap}
										</td>
										<td className="px-6 py-4 text-sm text-gray-900">
											{s.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
										</td>
										<td className="px-6 py-4 text-sm text-gray-900">
											{s.level}
										</td>
										<td className="px-6 py-4 text-sm text-gray-900">
											{s.poin}
										</td>
										<td className="px-6 py-4 text-center">
											<button
												onClick={() => removeSiswaFromKelas(s.id)}
												className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
											>
												Keluarkan
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p className="text-gray-500 italic py-4">
						Belum ada siswa di kelas ini
					</p>
				)}
			</div>

			{/* Add Siswa Modal */}
			{showAddSiswaModal && (
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
								value={selectedSiswaId || ""}
								onChange={(e) =>
									setSelectedSiswaId(
										e.target.value ? parseInt(e.target.value) : null,
									)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">-- Pilih Siswa --</option>
								{availableSiswa.map((s) => (
									<option key={s.id} value={s.id}>
										{s.namaLengkap} ({s.nisn})
									</option>
								))}
							</select>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => {
									setShowAddSiswaModal(false);
									setSelectedSiswaId(null);
								}}
								className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
							>
								Batal
							</button>
							<button
								onClick={addSiswaToKelas}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
							>
								Tambah
							</button>
						</div>
					</div>
				</div>
			)}

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
		</div>
	);
}
