"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

interface NumerasiSettings {
	minNilai: number;
	maxNilai: number;
	jumlahSoal: number;
	durasi: number;
	borderPassed: number;
	enableRandomSoal: boolean;
	enableMultiAttempt: boolean;
}

export default function NumerasiPage() {
	const [settings, setSettings] = useState<NumerasiSettings>({
		minNilai: 0,
		maxNilai: 100,
		jumlahSoal: 20,
		durasi: 60,
		borderPassed: 70,
		enableRandomSoal: true,
		enableMultiAttempt: false,
	});

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	useEffect(() => {
		fetchSettings();
	}, []);

	const fetchSettings = async () => {
		try {
			// API call would go here
			// const response = await axios.get('/api/settings/numerasi');
			// setSettings(response.data);
		} catch (error) {
			console.error("Gagal mengambil pengaturan:", error);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, type } = e.target;
		let value: any = e.target.value;

		if (type === "checkbox") {
			value = (e.target as HTMLInputElement).checked;
		} else if (type === "number") {
			value = parseInt(value);
		}

		setSettings((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			// API call would go here
			// await axios.put('/api/settings/numerasi', settings);
			setMessage("✅ Pengaturan numerasi berhasil disimpan");
			setTimeout(() => setMessage(""), 3000);
		} catch (error) {
			setMessage("❌ Gagal menyimpan pengaturan");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-8 max-w-4xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Pengaturan Sistem
				</h1>
				<p className="text-gray-600">
					Konfigurasi parameter tes numerasi dan penilaian
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
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
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
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-blue-600 hover:bg-gray-50"
					>
						🧮 Pengaturan Numerasi
					</Link>
				</div>
			</div>

			{message && (
				<div
					className={`mb-6 p-4 rounded-lg border ${
						message.includes("✅")
							? "bg-green-50 text-green-800 border-green-200"
							: "bg-red-50 text-red-800 border-red-200"
					}`}
				>
					{message}
				</div>
			)}

			<div className="bg-white rounded-lg shadow-md p-8">
				<form onSubmit={handleSave} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Nilai Minimum
							</label>
							<input
								type="number"
								name="minNilai"
								value={settings.minNilai}
								onChange={handleChange}
								min="0"
								max="100"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
							/>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Nilai Maksimum
							</label>
							<input
								type="number"
								name="maxNilai"
								value={settings.maxNilai}
								onChange={handleChange}
								min="0"
								max="100"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Jumlah Soal
							</label>
							<input
								type="number"
								name="jumlahSoal"
								value={settings.jumlahSoal}
								onChange={handleChange}
								min="1"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
							/>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Durasi Tes (menit)
							</label>
							<input
								type="number"
								name="durasi"
								value={settings.durasi}
								onChange={handleChange}
								min="1"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Nilai Batas Lulus (KKM)
						</label>
						<input
							type="number"
							name="borderPassed"
							value={settings.borderPassed}
							onChange={handleChange}
							min="0"
							max="100"
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
						/>
						<p className="text-xs text-gray-500 mt-1">
							Siswa dianggap lulus jika mencapai nilai ini
						</p>
					</div>

					<div className="space-y-4 p-4 bg-gray-50 rounded-lg">
						<h3 className="font-semibold text-gray-800">Opsi Tambahan</h3>

						<label className="flex items-center gap-3 cursor-pointer">
							<input
								type="checkbox"
								name="enableRandomSoal"
								checked={settings.enableRandomSoal}
								onChange={handleChange}
								className="w-4 h-4 rounded border-gray-300"
							/>
							<span className="text-sm text-gray-700">
								🔀 Acak urutan soal untuk setiap siswa
							</span>
						</label>

						<label className="flex items-center gap-3 cursor-pointer">
							<input
								type="checkbox"
								name="enableMultiAttempt"
								checked={settings.enableMultiAttempt}
								onChange={handleChange}
								className="w-4 h-4 rounded border-gray-300"
							/>
							<span className="text-sm text-gray-700">
								🔄 Izinkan siswa mengulang tes
							</span>
						</label>
					</div>

					<div className="flex gap-3 pt-4">
						<button
							type="submit"
							disabled={loading}
							className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-medium transition shadow-md disabled:opacity-50"
						>
							{loading ? "Menyimpan..." : "💾 Simpan Pengaturan"}
						</button>
					</div>
				</form>
			</div>

			<div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
				<h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informasi</h3>
				<ul className="text-sm text-blue-800 space-y-1">
					<li>
						• Pengaturan ini berlaku untuk semua tes numerasi di seluruh sistem
					</li>
					<li>• Perubahan akan berlaku untuk tes yang akan datang</li>
					<li>• Tes yang sedang berjalan tidak akan terpengaruh</li>
				</ul>
			</div>
		</div>
	);
}
