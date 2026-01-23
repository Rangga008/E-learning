"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import {
	ConfirmModal,
	SuccessToast,
	ErrorToast,
} from "@/components/CommonModals";
import { useNotification } from "@/hooks/useNotification";
import { logger } from "@/lib/logger";

interface Student {
	id: number;
	nisn: string;
	namaLengkap: string;
	jenisKelamin: string;
	level: number;
	poin: number;
	kelas: string;
	kelasId: number;
	userId: number;
}

interface User {
	id: number;
	username: string;
	email: string;
	fullName: string;
}

interface Kelas {
	id: number;
	nama: string;
}

export default function SiswaDetailPage() {
	const router = useRouter();
	const params = useParams();
	const siswaId = params.id as string;
	const {
		successToast,
		errorToast,
		showSuccess,
		showError,
		closeSuccess,
		closeError,
	} = useNotification();

	const [siswa, setSiswa] = useState<Student | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [kelas, setKelas] = useState<Kelas | null>(null);
	const [loading, setLoading] = useState(true);
	const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

	useEffect(() => {
		if (siswaId) {
			fetchSiswaDetail();
		}
	}, [siswaId]);

	const fetchSiswaDetail = async () => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/students/${siswaId}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			setSiswa(response.data.data);

			// Fetch user data
			if (response.data.data.userId) {
				fetchUserData(response.data.data.userId);
			}

			// Fetch kelas data
			if (response.data.data.kelasId) {
				fetchKelasData(response.data.data.kelasId);
			}
		} catch (error) {
			console.error("Error fetching siswa detail:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchUserData = async (userId: number) => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			setUser(response.data.data);
		} catch (error) {
			console.error("Error fetching user data:", error);
		}
	};

	const fetchKelasData = async (kelasId: number) => {
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
		} catch (error) {
			console.error("Error fetching kelas data:", error);
		}
	};

	const resetPassword = async () => {
		if (!newPassword) {
			logger.error("Reset Password", { error: "Password is required" });
			showError("Password tidak boleh kosong");
			return;
		}

		setResetPasswordLoading(true);
		try {
			await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/students/${siswaId}/reset-password`,
				{ password: newPassword },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			logger.success("Reset Password", { siswaId });
			showSuccess("Password berhasil direset");
			setShowResetPasswordModal(false);
			setNewPassword("");
		} catch (error) {
			logger.error("Reset Password", { error });
			showError("Gagal mereset password");
		} finally {
			setResetPasswordLoading(false);
		}
	};

	const resetPoin = async () => {
		if (!confirm("Yakin ingin mereset poin siswa ini?")) return;

		try {
			await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/students/${siswaId}/reset-level`,
				{},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			logger.success("Reset Points", { siswaId });
			showSuccess("Poin berhasil direset");
			fetchSiswaDetail();
		} catch (error) {
			logger.error("Reset Points", { error });
			showError("Gagal mereset poin");
		}
	};

	if (loading) {
		return (
			<div className="p-6 text-center">
				<p className="text-gray-500">Loading...</p>
			</div>
		);
	}

	if (!siswa) {
		return (
			<div className="p-6 text-center">
				<p className="text-red-500">Siswa tidak ditemukan</p>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						👨‍🎓 Detail Siswa: {siswa.namaLengkap}
					</h1>
					<p className="text-gray-600 text-sm mt-1">ID: {siswa.id}</p>
				</div>
				<div className="flex gap-2">
					<Link href="/admin/siswa">
						<button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium">
							← Kembali
						</button>
					</Link>
				</div>
			</div>

			{/* Data Siswa */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-xl font-bold text-gray-900 mb-4">📋 Data Siswa</h2>
				<div className="grid grid-cols-2 gap-6">
					<div>
						<p className="text-gray-600 text-sm">Nama Lengkap</p>
						<p className="text-lg font-semibold text-gray-900">
							{siswa.namaLengkap}
						</p>
					</div>
					<div>
						<p className="text-gray-600 text-sm">NISN</p>
						<p className="text-lg font-semibold text-gray-900">{siswa.nisn}</p>
					</div>
					<div>
						<p className="text-gray-600 text-sm">Jenis Kelamin</p>
						<p className="text-lg font-semibold text-gray-900">
							{siswa.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
						</p>
					</div>
					<div>
						<p className="text-gray-600 text-sm">Level</p>
						<p className="text-lg font-semibold text-gray-900">{siswa.level}</p>
					</div>
					<div>
						<p className="text-gray-600 text-sm">Poin</p>
						<p className="text-lg font-semibold text-gray-900">{siswa.poin}</p>
					</div>
					<div>
						<p className="text-gray-600 text-sm">Kelas</p>
						<p className="text-lg font-semibold text-gray-900">
							{kelas?.nama || "Belum ada kelas"}
						</p>
					</div>
				</div>
			</div>

			{/* Data User */}
			{user && (
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-xl font-bold text-gray-900 mb-4">🔐 Akun User</h2>
					<div className="grid grid-cols-2 gap-6">
						<div>
							<p className="text-gray-600 text-sm">Username</p>
							<p className="text-lg font-semibold text-gray-900">
								{user.username}
							</p>
						</div>
						<div>
							<p className="text-gray-600 text-sm">Email</p>
							<p className="text-lg font-semibold text-gray-900">
								{user.email || "-"}
							</p>
						</div>
					</div>
					<div className="mt-4">
						<button
							onClick={() => setShowResetPasswordModal(true)}
							className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
						>
							🔄 Reset Password
						</button>
					</div>
				</div>
			)}

			{/* Data Kelas */}
			{kelas && (
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-xl font-bold text-gray-900 mb-4">📚 Kelas</h2>
					<div>
						<p className="text-gray-600 text-sm">Nama Kelas</p>
						<p className="text-lg font-semibold text-gray-900">
							<Link
								href={`/admin/kelas/${kelas.id}`}
								className="text-blue-600 hover:underline"
							>
								{kelas.nama}
							</Link>
						</p>
					</div>
				</div>
			)}

			{/* Actions */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ Aksi</h2>
				<button
					onClick={resetPoin}
					className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
				>
					🔄 Reset Poin & Level
				</button>
			</div>

			{/* Reset Password Modal */}
			{showResetPasswordModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							Reset Password
						</h2>
						<div className="mb-4">
							<label className="block text-gray-700 font-medium mb-2">
								Password Baru
							</label>
							<input
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Masukkan password baru"
							/>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => {
									setShowResetPasswordModal(false);
									setNewPassword("");
								}}
								className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
							>
								Batal
							</button>
							<button
								onClick={resetPassword}
								disabled={resetPasswordLoading}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
							>
								{resetPasswordLoading ? "Loading..." : "Reset"}
							</button>
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
	);
}
