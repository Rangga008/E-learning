"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useNotification } from "@/hooks/useNotification";
import {
	SuccessToast,
	ErrorToast,
	ConfirmModal,
} from "@/components/CommonModals";

interface Jawaban {
	id: number;
	pesertaDidikId: number;
	nama: string;
	tugas: string;
	tanggalSubmit: string;
	status: "PENDING" | "DINILAI";
	nilai?: number;
}

export default function KoreksiNilaiPage() {
	const token = useAuthStore((state) => state.token);
	const {
		successToast,
		errorToast,
		showSuccess,
		showError,
		closeSuccess,
		closeError,
	} = useNotification();

	const [loading, setLoading] = useState(true);
	const [jawaban, setJawaban] = useState<Jawaban[]>([]);
	const [selectedJawaban, setSelectedJawaban] = useState<Jawaban | null>(null);
	const [nilaiInput, setNilaiInput] = useState("");
	const [savingNilai, setSavingNilai] = useState(false);
	const [showNilaiModal, setShowNilaiModal] = useState(false);

	useEffect(() => {
		if (token) {
			fetchJawaban();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token]);

	const fetchJawaban = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/guru/jawaban`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.ok) {
				showError("Gagal memuat jawaban siswa");
				return;
			}

			const data = await response.json();
			const jawabanList = Array.isArray(data) ? data : data.data || [];
			setJawaban(jawabanList);
		} catch (error) {
			console.error("Error loading jawaban:", error);
			showError("Terjadi kesalahan saat memuat jawaban");
		} finally {
			setLoading(false);
		}
	};

	const handleBukaJawaban = (item: Jawaban) => {
		setSelectedJawaban(item);
		setNilaiInput(item.nilai?.toString() || "");
		setShowNilaiModal(true);
	};

	const handleSimpanNilai = async () => {
		if (!selectedJawaban) return;

		const nilai = parseInt(nilaiInput);
		if (isNaN(nilai) || nilai < 0 || nilai > 100) {
			showError("Nilai harus antara 0-100");
			return;
		}

		setSavingNilai(true);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/jawaban/${selectedJawaban.id}/nilai`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ nilai }),
				},
			);

			if (!response.ok) {
				showError("Gagal menyimpan nilai");
				return;
			}

			showSuccess("Nilai berhasil disimpan");
			setShowNilaiModal(false);
			fetchJawaban();
		} catch (error) {
			console.error("Error saving nilai:", error);
			showError("Terjadi kesalahan saat menyimpan nilai");
		} finally {
			setSavingNilai(false);
		}
	};

	const statsPending = jawaban.filter((j) => j.status === "PENDING").length;
	const statsDinilai = jawaban.filter((j) => j.status === "DINILAI").length;

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">✏️ Koreksi Nilai</h1>
					<p className="text-gray-600 mt-2">Penilaian jawaban siswa</p>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-3 gap-4 mb-8">
					<div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
						<p className="text-sm text-gray-600">Menunggu Penilaian</p>
						<p className="text-3xl font-bold text-yellow-600 mt-2">
							{statsPending}
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
						<p className="text-sm text-gray-600">Sudah Dinilai</p>
						<p className="text-3xl font-bold text-green-600 mt-2">
							{statsDinilai}
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
						<p className="text-sm text-gray-600">Total Jawaban</p>
						<p className="text-3xl font-bold text-blue-600 mt-2">
							{jawaban.length}
						</p>
					</div>
				</div>

				{/* Loading */}
				{loading && (
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
					</div>
				)}

				{/* Table */}
				{!loading && (
					<div className="bg-white rounded-lg shadow-md overflow-hidden">
						<table className="w-full">
							<thead className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
								<tr>
									<th className="px-6 py-3 text-left text-sm font-semibold">
										No
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold">
										Nama Siswa
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold">
										Tugas
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold">
										Tanggal Submit
									</th>
									<th className="px-6 py-3 text-center text-sm font-semibold">
										Status
									</th>
									<th className="px-6 py-3 text-center text-sm font-semibold">
										Nilai
									</th>
									<th className="px-6 py-3 text-center text-sm font-semibold">
										Aksi
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{jawaban.map((item, idx) => (
									<tr key={item.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 text-sm font-semibold text-gray-700">
											{idx + 1}
										</td>
										<td className="px-6 py-4 text-sm text-gray-900 font-semibold">
											{item.nama}
										</td>
										<td className="px-6 py-4 text-sm text-gray-600">
											{item.tugas}
										</td>
										<td className="px-6 py-4 text-sm text-gray-600">
											{new Date(item.tanggalSubmit).toLocaleDateString("id-ID")}
										</td>
										<td className="px-6 py-4 text-center">
											<span
												className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
													item.status === "PENDING"
														? "bg-yellow-100 text-yellow-800"
														: "bg-green-100 text-green-800"
												}`}
											>
												{item.status === "PENDING" ? "Menunggu" : "Dinilai"}
											</span>
										</td>
										<td className="px-6 py-4 text-center">
											{item.nilai !== undefined ? (
												<span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
													{item.nilai}
												</span>
											) : (
												<span className="text-gray-500 text-sm">-</span>
											)}
										</td>
										<td className="px-6 py-4 text-center">
											<button
												onClick={() => handleBukaJawaban(item)}
												className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-all"
											>
												Buka
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>

						{jawaban.length === 0 && (
							<div className="text-center py-12">
								<p className="text-gray-500">Belum ada jawaban</p>
							</div>
						)}
					</div>
				)}

				{/* Modal Nilai */}
				{showNilaiModal && selectedJawaban && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-lg shadow-lg max-w-md w-full">
							<div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 flex items-center justify-between">
								<h2 className="text-2xl font-bold">Berikan Nilai</h2>
								<button
									onClick={() => setShowNilaiModal(false)}
									className="text-2xl font-bold hover:opacity-75"
								>
									✕
								</button>
							</div>
							<div className="p-6 space-y-4">
								<div>
									<p className="text-sm text-gray-600 font-semibold">
										Nama Siswa
									</p>
									<p className="text-lg text-gray-900">
										{selectedJawaban.nama}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600 font-semibold">Tugas</p>
									<p className="text-lg text-gray-900">
										{selectedJawaban.tugas}
									</p>
								</div>
								<div>
									<label className="text-sm text-gray-600 font-semibold">
										Nilai (0-100)
									</label>
									<input
										type="number"
										min="0"
										max="100"
										value={nilaiInput}
										onChange={(e) => setNilaiInput(e.target.value)}
										className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
										placeholder="Masukkan nilai"
									/>
								</div>
								<div className="flex gap-3">
									<button
										onClick={() => setShowNilaiModal(false)}
										className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-all"
									>
										Batal
									</button>
									<button
										onClick={handleSimpanNilai}
										disabled={savingNilai}
										className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all disabled:opacity-50"
									>
										{savingNilai ? "Menyimpan..." : "Simpan"}
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
			</div>
		</div>
	);
}
