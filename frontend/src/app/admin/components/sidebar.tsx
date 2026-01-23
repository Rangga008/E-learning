"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";

export function AdminSidebar() {
	const pathname = usePathname();
	const { logout } = useAuthStore();
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	const menuItems = [
		{
			title: "Dashboard",
			href: "/admin/dashboard",
			icon: "📊",
		},
		{
			title: "Data Master",
			icon: "📁",
			submenu: [
				{ title: "Data Users", href: "/admin/users", icon: "👥" },
				{ title: "Data Siswa", href: "/admin/siswa", icon: "👨‍🎓" },
				{ title: "Data Guru", href: "/admin/guru", icon: "👨‍🏫" },
				{ title: "Manajemen Kelas", href: "/admin/kelas", icon: "📚" },
			],
		},
		{
			title: "E-Learning",
			icon: "📚",
			submenu: [
				{ title: "Mata Pelajaran", href: "/admin/elearning", icon: "📖" },
				{
					title: "Materi & Tugas",
					href: "/admin/elearning/materi",
					icon: "📝",
				},
				{
					title: "Koreksi Jawaban",
					href: "/admin/elearning/koreksi",
					icon: "✅",
				},
			],
		},
		{
			title: "Numerasi",
			icon: "🧮",
			submenu: [
				{ title: "Bank Soal", href: "/admin/numerasi/banksoal", icon: "📚" },
			],
		},
		{
			title: "Pengaturan",
			icon: "⚙️",
			submenu: [
				{
					title: "Konfigurasi Sistem",
					href: "/admin/pengaturan/umum",
					icon: "🔧",
				},
				{
					title: "Pengaturan Numerasi",
					href: "/admin/pengaturan/numerasi",
					icon: "🧮",
				},
			],
		},
		{
			title: "Pelaporan",
			href: "/admin/pelaporan",
			icon: "📊",
		},
	];

	return (
		<aside className="w-64 bg-gradient-to-b from-purple-700 to-purple-900 text-white shadow-lg flex flex-col h-screen overflow-hidden">
			<div className="p-6 border-b border-purple-600 flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">LMS Admin</h1>
					<p className="text-purple-200 text-sm mt-1">Sanggar Belajar</p>
				</div>
				<button
					onClick={() => setIsMobileOpen(!isMobileOpen)}
					className="md:hidden text-2xl hover:bg-purple-600 p-2 rounded transition"
				>
					{isMobileOpen ? "✕" : "☰"}
				</button>
			</div>

			<nav className="p-4 space-y-2 flex-1 overflow-y-auto scrollbar-hide">
				{menuItems.map((item: any) => (
					<div key={item.href || item.title}>
						{item.href ? (
							// Simple menu item
							<Link
								href={item.href}
								className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
									pathname === item.href
										? "bg-purple-600 text-white shadow-lg"
										: "text-purple-100 hover:bg-purple-600"
								}`}
								onClick={() => setIsMobileOpen(false)}
							>
								<span className="text-xl">{item.icon}</span>
								<span>{item.title}</span>
							</Link>
						) : (
							// Menu group with submenu
							<details className="group">
								<summary className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-purple-100 hover:bg-purple-600 transition-all duration-200 hover:scale-105 active:scale-95">
									<span className="text-xl">{item.icon}</span>
									<span>{item.title}</span>
									<span className="ml-auto transform group-open:rotate-90 transition-transform duration-200">
										▶
									</span>
								</summary>
								<div className="pl-8 mt-1 space-y-1">
									{item.submenu?.map((subitem: any) => (
										<Link
											key={subitem.href}
											href={subitem.href}
											className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm hover:scale-105 active:scale-95 ${
												pathname === subitem.href
													? "bg-purple-500 text-white shadow-lg"
													: "text-purple-100 hover:bg-purple-600"
											}`}
											onClick={() => setIsMobileOpen(false)}
										>
											<span>{subitem.icon}</span>
											<span>{subitem.title}</span>
										</Link>
									))}
								</div>
							</details>
						)}
					</div>
				))}
			</nav>

			<div className="mt-auto pt-4 border-t border-purple-600 p-4">
				<button
					onClick={() => {
						logout();
						window.location.href = "/auth/login";
					}}
					className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
				>
					🚪 Logout
				</button>
			</div>
		</aside>
	);
}
