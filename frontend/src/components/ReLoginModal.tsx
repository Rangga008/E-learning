"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/utils/apiClient";

interface ReLoginModalProps {
	isOpen: boolean;
	reason?: "session_expired" | "token_invalid" | "unauthorized";
	onClose?: () => void;
}

export function ReLoginModal({
	isOpen,
	reason = "session_expired",
	onClose,
}: ReLoginModalProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [timeLeft, setTimeLeft] = useState(0);

	const { setUser, setToken } = useAuthStore();
	const { showError, showSuccess } = useNotification();

	// Memoize auto logout function
	const handleAutoLogout = useCallback(() => {
		console.log("Auto logout triggered - session timeout");
		setEmail("");
		setPassword("");
		setError("");
		const { logout } = useAuthStore.getState();
		logout();
		onClose?.();
		showError("Sesi berakhir. Silakan login kembali.");
	}, [onClose, showError]);

	// Countdown timer for auto logout
	useEffect(() => {
		if (!isOpen) {
			setTimeLeft(0);
			return;
		}

		console.log("Opening modal, starting countdown timer...");
		setTimeLeft(300); // 5 minutes

		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				const next = prev - 1;
				if (next <= 0) {
					console.log("Countdown complete, triggering auto logout");
					// Call the memoized function when time runs out
					handleAutoLogout();
					return 0;
				}
				return next;
			});
		}, 1000);

		return () => {
			console.log("Clearing countdown timer");
			clearInterval(timer);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const handleReLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			if (!email || !password) {
				setError("Email dan password harus diisi");
				setLoading(false);
				return;
			}

			console.log("Attempting to re-login with email:", email);

			const response = await apiClient.post("/auth/login", {
				email,
				password,
			});

			const loginData = response.data.data || response.data;
			console.log("Login response received:", loginData);

			if (loginData?.access_token) {
				console.log("Login successful, updating auth store...");
				setToken(loginData.access_token);
				setUser(loginData.user);

				setEmail("");
				setPassword("");
				setError("");
				onClose?.();

				showSuccess("Login berhasil! Sesi dipulihkan.");
				// Refresh halaman untuk reload data dengan token baru
				setTimeout(() => {
					console.log("Reloading page with new token...");
					window.location.reload();
				}, 500);
			} else {
				throw new Error("No access token in response");
			}
		} catch (err: any) {
			console.error("Login error:", err);
			const errorMsg =
				err.response?.data?.message ||
				err.message ||
				"Login gagal. Periksa email dan password Anda.";
			setError(errorMsg);
			showError(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	const reasonMessages: Record<string, string> = {
		session_expired:
			"Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali untuk melanjutkan.",
		token_invalid: "Token autentikasi tidak valid. Silakan login kembali.",
		unauthorized:
			"Anda tidak memiliki akses ke halaman ini. Silakan login kembali dengan akun yang benar.",
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
			<div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
				{/* Header */}
				<div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
					<h2 className="text-xl font-bold text-white flex items-center gap-2">
						⏰ Sesi Berakhir
					</h2>
					<p className="text-orange-100 text-sm mt-1">
						{reasonMessages[reason]}
					</p>
				</div>

				{/* Timer Warning */}
				{timeLeft > 0 && (
					<div className="bg-yellow-50 px-6 py-3 border-b border-yellow-200">
						<p className="text-sm text-yellow-800 text-center">
							<span className="font-semibold">
								Waktu tersisa: {formatTime(timeLeft)}
							</span>
							<br />
							Anda akan logout otomatis jika tidak login dalam waktu ini
						</p>
					</div>
				)}

				{/* Form */}
				<form onSubmit={handleReLogin} className="p-6 space-y-4">
					{error && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-3">
							<p className="text-sm text-red-700">{error}</p>
						</div>
					)}

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Email
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Masukkan email Anda"
							disabled={loading}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100"
						/>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Password
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Masukkan password Anda"
							disabled={loading}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
					>
						{loading ? "Sedang login..." : "🔐 Login Kembali"}
					</button>

					<button
						type="button"
						onClick={handleAutoLogout}
						disabled={loading}
						className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold"
					>
						Logout Sekarang
					</button>
				</form>

				{/* Footer Info */}
				<div className="bg-gray-50 px-6 py-3 border-t border-gray-200 rounded-b-lg">
					<p className="text-xs text-gray-600 text-center">
						💡 Untuk keamanan, sesi Anda akan berakhir jika tidak ada aktivitas
						dalam <strong>15 menit</strong>.
					</p>
				</div>
			</div>
		</div>
	);
}
