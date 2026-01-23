"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

interface GeneralSettings {
	schoolName: string;
	schoolAddress: string;
	headmaster: string;
	contact: string;
	email: string;
	academicYear: string;
}

export default function UmumPage() {
	const [settings, setSettings] = useState<GeneralSettings>({
		schoolName: "Sanggar Belajar",
		schoolAddress: "Jl. Pendidikan No. 123",
		headmaster: "Dr. Kepala Sekolah",
		contact: "08123456789",
		email: "info@sanggar-belajar.id",
		academicYear: "2025/2026",
	});

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
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
			// await axios.put('/api/settings/general', settings);
			setMessage("✅ Pengaturan umum berhasil disimpan");
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
					Kelola informasi dasar sekolah dan konfigurasi sistem
				</p>
			</div>

			<div className="bg-white rounded-lg shadow mb-6 border-b-2 border-gray-200">
				<div className="flex flex-wrap">
					<Link
						href="/admin/pengaturan/umum"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-blue-600 hover:bg-gray-50"
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
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
					>
						🧮 Pengaturan Numerasi
					</Link>
				</div>
			</div>

			{message && (
				<div className="mb-6 p-4 rounded-lg bg-green-50 text-green-800 border border-green-200">
					{message}
				</div>
			)}

			<div className="bg-white rounded-lg shadow-md p-8">
				<form onSubmit={handleSave} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Nama Sekolah
							</label>
							<input
								type="text"
								name="schoolName"
								value={settings.schoolName}
								onChange={handleChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
							/>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Tahun Akademik
							</label>
							<input
								type="text"
								name="academicYear"
								value={settings.academicYear}
								onChange={handleChange}
								placeholder="2025/2026"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Alamat Sekolah
						</label>
						<input
							type="text"
							name="schoolAddress"
							value={settings.schoolAddress}
							onChange={handleChange}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Kepala Sekolah
							</label>
							<input
								type="text"
								name="headmaster"
								value={settings.headmaster}
								onChange={handleChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
							/>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Kontak Telepon
							</label>
							<input
								type="text"
								name="contact"
								value={settings.contact}
								onChange={handleChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Email Sekolah
						</label>
						<input
							type="email"
							name="email"
							value={settings.email}
							onChange={handleChange}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
						/>
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
		</div>
	);
}
