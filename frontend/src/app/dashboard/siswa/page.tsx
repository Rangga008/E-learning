"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { dashboardService } from "@/services/dashboard.service";

export default function SiswaDashboard() {
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);

	const [level, setLevel] = useState(1);
	const [poin, setPoin] = useState(0);
	const [isWorkingDay, setIsWorkingDay] = useState(true);
	const [isTodayDone, setIsTodayDone] = useState(false);
	const [currentTopic, setCurrentTopic] = useState("Penjumlahan");
	const [progressPercent, setProgressPercent] = useState(33);
	const [mapelList, setMapelList] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	// Load data from API
	useEffect(() => {
		// Check if user is logged in
		if (!user?.id) {
			console.warn("User not logged in, redirecting to login");
			router.push("/auth/login");
			return;
		}

		const loadDashboardData = async () => {
			try {
				// Get stats
				const stats = await dashboardService.getSiswaStats(user.id);
				if (stats) {
					setLevel(stats.level || 1);
					setPoin(stats.poin || 0);
					setProgressPercent(stats.progressPercent || 33);
				} else {
					// Use fallback data jika API gagal
					setLevel(3);
					setPoin(450);
					setProgressPercent(65);
				}

				// Get mapels
				const mapels = await dashboardService.getSiswaMapels(user.id);
				if (mapels && Array.isArray(mapels)) {
					setMapelList(mapels);
				} else {
					// Fallback mapels
					setMapelList([
						{ id: 1, name: "Pendidikan Pancasila", taskCount: 2, color: "red" },
						{ id: 2, name: "Bahasa Indonesia", taskCount: 1, color: "blue" },
						{ id: 3, name: "Matematika", taskCount: 3, color: "purple" },
						{ id: 4, name: "IPAS", taskCount: 0, color: "green" },
						{ id: 5, name: "Bahasa Inggris", taskCount: 2, color: "orange" },
						{ id: 6, name: "Seni Musik", taskCount: 1, color: "pink" },
					]);
				}
			} catch (error) {
				console.error("Error loading dashboard data:", error);
				// Use fallback data
				setLevel(3);
				setPoin(450);
				setProgressPercent(65);
				setMapelList([
					{ id: 1, name: "Pendidikan Pancasila", taskCount: 2, color: "red" },
					{ id: 2, name: "Bahasa Indonesia", taskCount: 1, color: "blue" },
					{ id: 3, name: "Matematika", taskCount: 3, color: "purple" },
					{ id: 4, name: "IPAS", taskCount: 0, color: "green" },
					{ id: 5, name: "Bahasa Inggris", taskCount: 2, color: "orange" },
					{ id: 6, name: "Seni Musik", taskCount: 1, color: "pink" },
				]);
			} finally {
				setLoading(false);
			}
		};

		loadDashboardData();
	}, [user?.id]);

	// Check working day and topic
	useEffect(() => {
		const day = new Date().getDay();
		setIsWorkingDay(day >= 1 && day <= 5); // 1-5 = Mon-Fri

		// Determine today's topic
		const topics = [
			"Penjumlahan",
			"Pengurangan",
			"Perkalian",
			"Pembagian",
			"Campuran",
		];
		if (day >= 1 && day <= 5) {
			setCurrentTopic(topics[day - 1]);
		}
	}, []);

	const handleLogout = () => {
		authService.logout();
		logout();
		router.push("/");
	};

	const getLevelInfo = (lvl: number) => {
		const levels: Record<number, { soal: number; kkm: number; waktu: number }> =
			{
				1: { soal: 100, kkm: 90, waktu: 30 },
				2: { soal: 120, kkm: 90, waktu: 40 },
				3: { soal: 150, kkm: 85, waktu: 50 },
				4: { soal: 180, kkm: 80, waktu: 60 },
				5: { soal: 200, kkm: 75, waktu: 70 },
				6: { soal: 250, kkm: 70, waktu: 90 },
				7: { soal: 300, kkm: 65, waktu: 120 },
			};
		return levels[lvl] || levels[1];
	};

	const currentLevelInfo = getLevelInfo(level);

	const handleStartMission = () => {
		if (isWorkingDay && !isTodayDone) {
			router.push("/dashboard/siswa/numerasi");
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
				<div className="text-center">
					<div className="mb-4">
						<div className="inline-block animate-spin">
							<div className="text-5xl">📚</div>
						</div>
					</div>
					<p className="text-gray-600 text-lg font-semibold">
						Loading dashboard...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl shadow-lg p-6 mb-6">
				<div className="flex justify-between items-start">
					<div>
						<h1 className="text-3xl font-bold">🎓 LMS SANGGAR BELAJAR</h1>
						<p className="text-blue-100 text-sm mt-1">Siswa Aktif | Grade 7</p>
						<p className="text-blue-100 text-sm">ID: {user?.id || "---"}</p>
						<p className="text-blue-200 text-xs mt-2">
							Selamat datang, {user?.fullName || "Siswa"}!
						</p>
					</div>
					<button
						onClick={handleLogout}
						className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition active:scale-95"
					>
						🚪 Logout
					</button>
				</div>
			</div>

			{/* Gamification Cards */}
			<div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				<div className="bg-white rounded-xl shadow-lg p-4 border-b-4 border-blue-500 hover:shadow-xl transition">
					<p className="text-gray-600 text-xs font-semibold">⭐ LEVEL</p>
					<p className="text-4xl font-bold text-blue-600 mt-2">{level}</p>
					<p className="text-gray-500 text-xs mt-2">dari 7 Level</p>
				</div>

				<div className="bg-white rounded-xl shadow-lg p-4 border-b-4 border-green-500 hover:shadow-xl transition">
					<p className="text-gray-600 text-xs font-semibold">🏆 POIN</p>
					<p className="text-4xl font-bold text-green-600 mt-2">{poin}</p>
					<p className="text-gray-500 text-xs mt-2">Terus tingkatkan</p>
				</div>

				<div className="bg-white rounded-xl shadow-lg p-4 border-b-4 border-purple-500 hover:shadow-xl transition">
					<p className="text-gray-600 text-xs font-semibold">🎯 KKM</p>
					<p className="text-4xl font-bold text-purple-600 mt-2">
						{currentLevelInfo.kkm}
					</p>
					<p className="text-gray-500 text-xs mt-2">Target nilai</p>
				</div>

				<div className="bg-white rounded-xl shadow-lg p-4 border-b-4 border-orange-500 hover:shadow-xl transition">
					<p className="text-gray-600 text-xs font-semibold">📝 SOAL</p>
					<p className="text-4xl font-bold text-orange-600 mt-2">
						{currentLevelInfo.soal}
					</p>
					<p className="text-gray-500 text-xs mt-2">Level {level}</p>
				</div>
			</div>

			{/* Progress Bar */}
			<div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-6">
				<div className="flex justify-between items-center mb-3">
					<h3 className="font-semibold text-gray-700">
						Progress ke Level {level + 1}
					</h3>
					<span className="text-sm font-bold text-blue-600">
						{progressPercent}%
					</span>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-4">
					<div
						className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-500"
						style={{ width: `${progressPercent}%` }}
					></div>
				</div>
				<p className="text-gray-600 text-sm mt-3">
					{progressPercent}% perjalanan menuju level {level + 1}
				</p>
			</div>

			{/* Misi Berhitung */}
			<div
				className={`max-w-6xl mx-auto rounded-2xl shadow-lg p-6 mb-6 text-white transition ${
					isWorkingDay
						? "bg-gradient-to-br from-green-500 to-green-700"
						: "bg-gradient-to-br from-gray-400 to-gray-600"
				}`}
			>
				<div className="flex justify-between items-start mb-4">
					<div>
						<h2 className="text-2xl font-bold">🎯 Misi Berhitung Harian</h2>
						<p className="text-white opacity-90 text-sm mt-1">
							Hari ini topik: <span className="font-bold">{currentTopic}</span>
						</p>
					</div>
					{isWorkingDay && (
						<span className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-bold">
							✓ Hari Kerja
						</span>
					)}
				</div>

				<div className="grid grid-cols-3 gap-3 mb-4">
					<div className="bg-white bg-opacity-20 rounded-lg p-3">
						<p className="text-white text-xs opacity-80">Level</p>
						<p className="text-2xl font-bold">{level}</p>
					</div>
					<div className="bg-white bg-opacity-20 rounded-lg p-3">
						<p className="text-white text-xs opacity-80">KKM</p>
						<p className="text-2xl font-bold">{currentLevelInfo.kkm}%</p>
					</div>
					<div className="bg-white bg-opacity-20 rounded-lg p-3">
						<p className="text-white text-xs opacity-80">Waktu</p>
						<p className="text-2xl font-bold">{currentLevelInfo.waktu}m</p>
					</div>
				</div>

				<button
					onClick={handleStartMission}
					disabled={!isWorkingDay || isTodayDone}
					className={`w-full py-3 rounded-lg font-bold text-lg transition active:scale-95 ${
						isWorkingDay && !isTodayDone
							? "bg-white text-green-600 hover:bg-gray-100 hover:scale-105"
							: "bg-gray-400 text-gray-200 cursor-not-allowed"
					}`}
				>
					{isTodayDone ? "✓ Sudah Selesai" : "▶ MULAI KERJAKAN"}
				</button>
			</div>

			{/* E-Learning */}
			<div className="max-w-6xl mx-auto">
				<h2 className="text-2xl font-bold text-gray-800 mb-4">
					📚 E-Learning Reguler
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{mapelList.map((mapel) => (
						<Link
							key={mapel.id}
							href={`/dashboard/siswa/elearning/${mapel.id}`}
						>
							<div
								className={`bg-gradient-to-br from-${mapel.color}-400 to-${mapel.color}-600 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer`}
								style={
									{
										background: `linear-gradient(to bottom right, var(--color-from), var(--color-to))`,
										"--color-from":
											mapel.color === "red"
												? "#f87171"
												: mapel.color === "blue"
												? "#60a5fa"
												: mapel.color === "purple"
												? "#c084fc"
												: mapel.color === "green"
												? "#4ade80"
												: mapel.color === "orange"
												? "#fb923c"
												: "#f472b6",
										"--color-to":
											mapel.color === "red"
												? "#dc2626"
												: mapel.color === "blue"
												? "#2563eb"
												: mapel.color === "purple"
												? "#9333ea"
												: mapel.color === "green"
												? "#15803d"
												: mapel.color === "orange"
												? "#ea580c"
												: "#be185d",
									} as any
								}
							>
								<h3 className="text-xl font-bold mb-2">📖 {mapel.name}</h3>
								<p className="text-white opacity-90 text-sm">
									{mapel.taskCount === 0
										? "✓ Semua tugas selesai"
										: `${mapel.taskCount} tugas baru`}
								</p>
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
