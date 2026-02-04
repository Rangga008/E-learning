"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

interface Notifikasi {
	id: number;
	isi: string;
	tipeNotifikasi: "TUGAS_BARU" | "DEADLINE_REMINDER" | "NILAI_MASUK";
	dibaca: boolean;
	tugas?: {
		judulTugas: string;
	};
	createdAt: string;
}

export default function NotificationBell() {
	const token = useAuthStore((state) => state.token);
	const user = useAuthStore((state) => state.user);

	const [notifications, setNotifications] = useState<Notifikasi[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!user || user.role === "guru") return;

		const loadCount = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/elearning/notifikasi/count`,
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);

				if (response.ok) {
					const data = await response.json();
					setUnreadCount(data.count || 0);
				}
			} catch (error) {
				console.error("Error loading unread count:", error);
			}
		};

		loadCount();
		const interval = setInterval(loadCount, 30000); // Refresh every 30 seconds

		return () => clearInterval(interval);
	}, [user, token]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isOpen]);

	const loadNotifications = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/notifikasi?limit=10`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (response.ok) {
				const data = await response.json();
				setNotifications(data);
			}
		} catch (error) {
			console.error("Error loading notifications:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleOpen = () => {
		setIsOpen(true);
		if (notifications.length === 0 && !loading) {
			loadNotifications();
		}
	};

	const handleMarkAsRead = async (id: number) => {
		try {
			await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/notifikasi/${id}/read`,
				{
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			setNotifications((prev) =>
				prev.map((n) => (n.id === id ? { ...n, dibaca: true } : n)),
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		} catch (error) {
			console.error("Error marking as read:", error);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/notifikasi/read-all`,
				{
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
			setUnreadCount(0);
		} catch (error) {
			console.error("Error marking all as read:", error);
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "TUGAS_BARU":
				return "📝";
			case "DEADLINE_REMINDER":
				return "⏰";
			case "NILAI_MASUK":
				return "✓";
			default:
				return "📢";
		}
	};

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "TUGAS_BARU":
				return "Tugas Baru";
			case "DEADLINE_REMINDER":
				return "Pengingat Deadline";
			case "NILAI_MASUK":
				return "Nilai Masuk";
			default:
				return "Notifikasi";
		}
	};

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return "Baru saja";
		if (diffMins < 60) return `${diffMins}m lalu`;
		if (diffHours < 24) return `${diffHours}h lalu`;
		if (diffDays < 7) return `${diffDays}d lalu`;
		return date.toLocaleDateString("id-ID");
	};

	// Don't show for guru
	if (user?.role === "guru") {
		return null;
	}

	return (
		<div ref={dropdownRef} className="relative">
			{/* Bell Button */}
			<button
				onClick={handleOpen}
				className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
				title="Notifikasi"
			>
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
					/>
				</svg>

				{/* Unread Badge */}
				{unreadCount > 0 && (
					<span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
			</button>

			{/* Dropdown */}
			{isOpen && (
				<div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
					{/* Header */}
					<div className="flex items-center justify-between px-4 py-3 border-b">
						<h3 className="font-semibold text-gray-900">Notifikasi</h3>
						{unreadCount > 0 && (
							<button
								onClick={handleMarkAllAsRead}
								className="text-xs text-blue-600 hover:text-blue-800 font-medium"
							>
								Tandai Semua
							</button>
						)}
					</div>

					{/* Notifications List */}
					<div className="max-h-96 overflow-y-auto">
						{loading && !notifications.length ? (
							<div className="p-4 text-center text-gray-500">Loading...</div>
						) : notifications.length > 0 ? (
							notifications.map((notif) => (
								<button
									key={notif.id}
									onClick={() => !notif.dibaca && handleMarkAsRead(notif.id)}
									className={`w-full px-4 py-3 text-left border-b transition hover:bg-gray-50 ${
										!notif.dibaca ? "bg-blue-50" : "bg-white"
									}`}
								>
									<div className="flex items-start gap-3">
										<span className="text-lg mt-1">
											{getTypeIcon(notif.tipeNotifikasi)}
										</span>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-900">
												{getTypeLabel(notif.tipeNotifikasi)}
											</p>
											<p className="text-sm text-gray-600 mt-1 break-words">
												{notif.isi}
											</p>
											{notif.tugas && (
												<p className="text-xs text-gray-500 mt-1">
													📋 {notif.tugas.judulTugas}
												</p>
											)}
											<p className="text-xs text-gray-400 mt-1">
												{formatTime(notif.createdAt)}
											</p>
										</div>
										{!notif.dibaca && (
											<div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
										)}
									</div>
								</button>
							))
						) : (
							<div className="p-4 text-center text-gray-500">
								Tidak ada notifikasi
							</div>
						)}
					</div>

					{/* Footer */}
					{notifications.length > 0 && (
						<div className="px-4 py-3 border-t bg-gray-50 text-center">
							<Link href="/dashboard/notifikasi">
								<button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
									Lihat Semua Notifikasi
								</button>
							</Link>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
