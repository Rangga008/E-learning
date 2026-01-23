"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";

export default function AdminDashboard() {
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);
	const [totalSiswa] = useState(150);
	const [totalGuru] = useState(12);
	const [totalSoal] = useState(500);

	const handleLogout = () => {
		authService.logout();
		logout();
		router.push("/");
	};

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Header */}
			<header className="bg-purple-600 text-white p-4">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold">LMS Sanggar Belajar - Admin</h1>
						<p className="text-sm">Belajar Tanpa Batas</p>
					</div>
					<div className="flex items-center space-x-4">
						<span className="text-sm">{user?.fullName}</span>
						<button
							onClick={handleLogout}
							className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
						>
							Logout
						</button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto p-6">
				{/* Statistics */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
					<div className="bg-blue-500 text-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-semibold mb-2">👨‍🎓 Total Siswa</h3>
						<p className="text-4xl font-bold">{totalSiswa}</p>
					</div>

					<div className="bg-green-500 text-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-semibold mb-2">👨‍🏫 Total Guru</h3>
						<p className="text-4xl font-bold">{totalGuru}</p>
					</div>

					<div className="bg-orange-500 text-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-semibold mb-2">📝 Total Soal</h3>
						<p className="text-4xl font-bold">{totalSoal}</p>
					</div>

					<div className="bg-red-500 text-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-semibold mb-2">🔔 Notifikasi</h3>
						<p className="text-4xl font-bold">3</p>
					</div>
				</div>

				{/* Control Panels */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-xl font-bold text-gray-800 mb-4">
							📊 Data Master
						</h3>
						<ul className="space-y-2">
							<li>
								<a href="#" className="text-purple-600 hover:underline">
									• Kelola Data Siswa
								</a>
							</li>
							<li>
								<a href="#" className="text-purple-600 hover:underline">
									• Kelola Data Guru
								</a>
							</li>
							<li>
								<a href="#" className="text-purple-600 hover:underline">
									• Kelola Mata Pelajaran
								</a>
							</li>
							<li>
								<a href="#" className="text-purple-600 hover:underline">
									• Impor Data (Excel)
								</a>
							</li>
						</ul>
					</div>

					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-xl font-bold text-gray-800 mb-4">
							⚙️ Pengaturan Sistem
						</h3>
						<ul className="space-y-2">
							<li>
								<a href="#" className="text-purple-600 hover:underline">
									• Reset Sistem
								</a>
							</li>
							<li>
								<a href="#" className="text-purple-600 hover:underline">
									• Pengaturan Level
								</a>
							</li>
							<li>
								<a href="#" className="text-purple-600 hover:underline">
									• Log Sistem
								</a>
							</li>
							<li>
								<a href="#" className="text-purple-600 hover:underline">
									• Backup Data
								</a>
							</li>
						</ul>
					</div>
				</div>

				{/* Additional Controls */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-xl font-bold text-gray-800 mb-4">
							📈 Laporan & Analisis
						</h3>
						<ul className="space-y-2">
							<li>
								<a href="#" className="text-purple-600 hover:underline">
									• Laporan E-Learning
								</a>
							</li>
							<li>
								<a href="#" className="text-purple-600 hover:underline">
									• Laporan Numerasi
								</a>
							</li>
							<li>
								<a href="#" className="text-purple-600 hover:underline">
									• Analisis Keseluruhan
								</a>
							</li>
							<li>
								<a href="#" className="text-purple-600 hover:underline">
									• Export Data
								</a>
							</li>
						</ul>
					</div>

					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-xl font-bold text-gray-800 mb-4">
							🔐 Keamanan
						</h3>
						<ul className="space-y-2">
							<li>
								<a href="#" className="text-purple-600 hover:underline">
									• Kelola User
								</a>
							</li>
							<li>
								<a href="#" className="text-purple-600 hover:underline">
									• Atur Hak Akses
								</a>
							</li>
							<li>
								<a href="#" className="text-purple-600 hover:underline">
									• Aktivitas Login
								</a>
							</li>
							<li>
								<a href="#" className="text-purple-600 hover:underline">
									• Pengaturan Keamanan
								</a>
							</li>
						</ul>
					</div>
				</div>
			</main>
		</div>
	);
}
