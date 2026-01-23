"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import {
	SuccessToast,
	ErrorToast,
	ConfirmModal,
} from "@/components/CommonModals";
import { useNotification } from "@/hooks/useNotification";
import { logger } from "@/lib/logger";

interface User {
	id: number;
	username: string;
	email?: string;
	fullName?: string;
	role: string;
	isActive: boolean;
}

interface Student {
	id: number;
	nisn: string;
	namaLengkap: string;
	jenisKelamin: string;
	kelasId?: number;
	kelas?: {
		id: number;
		nama: string;
		tingkatRef?: { nama: string };
		tingkat?: string;
	};
	level: number;
	poin: number;
	userId: number;
}

interface Teacher {
	id: number;
	nip: string;
	namaLengkap: string;
	mataPelajaranId?: number;
	userId: number;
	kelasWaliList?: Array<{
		id: number;
		nama: string;
		tingkatRef?: {
			nama: string;
		};
		tingkat?: string;
	}>;
	kelasMapelList?: Array<{
		id: number;
		nama: string;
		tingkatRef?: {
			nama: string;
		};
		tingkat?: string;
	}>;
}

export default function UserDetailPage() {
	const params = useParams();
	const userId = params.id as string;
	const {
		successToast,
		errorToast,
		closeSuccess,
		closeError,
		showSuccess,
		showError,
	} = useNotification();

	const [user, setUser] = useState<User | null>(null);
	const [student, setStudent] = useState<Student | null>(null);
	const [teacher, setTeacher] = useState<Teacher | null>(null);
	const [mapelList, setMapelList] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("user");
	const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
	const [newPassword, setNewPassword] = useState("");

	useEffect(() => {
		fetchUserDetail();
		fetchMapelList();
	}, [userId]);

	const fetchUserDetail = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			const userData = response.data.data;
			setUser(userData);

			// Fetch siswa or guru data based on role
			if (userData.role === "siswa") {
				fetchStudentDetail(userData.id);
			} else if (userData.role === "guru") {
				fetchTeacherDetail(userData.id);
			}
		} catch (error) {
			console.error("Error fetching user:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchMapelList = async () => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/dropdown/mata-pelajaran`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			setMapelList(response.data.data || []);
		} catch (error) {
			console.error("Error fetching mapel list:", error);
		}
	};

	const fetchStudentDetail = async (userId: number) => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/peserta-didik?page=1&limit=1000`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			const students = response.data.data || [];
			const foundStudent = students.find((s: Student) => s.userId === userId);
			if (foundStudent) {
				setStudent(foundStudent);
			}
		} catch (error) {
			console.error("Error fetching student detail:", error);
		}
	};

	const fetchTeacherDetail = async (userId: number) => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/guru?page=1&limit=1000`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			const teachers = response.data.data || [];
			const foundTeacher = teachers.find((t: Teacher) => t.userId === userId);
			if (foundTeacher) {
				setTeacher(foundTeacher);
			}
		} catch (error) {
			console.error("Error fetching teacher detail:", error);
		}
	};

	const handleResetPassword = async () => {
		if (!newPassword || newPassword.length < 6) {
			logger.error("Reset Password", {
				error: "Password must be at least 6 characters",
			});
			showError("Password minimal 6 karakter");
			return;
		}

		try {
			await axios.put(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/reset-password`,
				{ newPassword },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			logger.success("Reset Password", { userId });
			showSuccess("Password berhasil direset");
			setShowResetPasswordModal(false);
			setNewPassword("");
		} catch (error) {
			logger.error("Reset Password", { error });
			showError("Gagal mereset password");
		}
	};

	const handleDeleteUser = async () => {
		const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
		if (currentUser.id === parseInt(userId)) {
			logger.error("Delete User", { error: "Cannot delete own account" });
			showError("❌ Anda tidak dapat menghapus akun sendiri!");
			return;
		}
		if (!confirm(`Yakin ingin menghapus user ${user?.username}?`)) return;
		try {
			await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/delete`,
				{},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			logger.success("Delete User", { userId });
			showSuccess("User berhasil dihapus");
			window.location.href = "/admin/users";
		} catch (error) {
			alert("Gagal menghapus user");
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-gray-500">Loading...</p>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-gray-500">User tidak ditemukan</p>
			</div>
		);
	}

	const roleIcon =
		user.role === "admin" ? "🔐" : user.role === "guru" ? "👨‍🏫" : "👨‍🎓";

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex justify-between items-start">
				<div>
					<Link
						href={
							user.role === "siswa"
								? "/admin/siswa"
								: user.role === "guru"
								? "/admin/guru"
								: "/admin/users"
						}
						className="text-blue-600 hover:underline mb-2"
					>
						← Kembali
					</Link>
					<h1 className="text-3xl font-bold text-gray-900">
						{roleIcon} {user.fullName || user.username}
					</h1>
					<p className="text-gray-600 text-sm mt-1">
						{user.role === "siswa"
							? "NISN: "
							: user.role === "guru"
							? "NIP: "
							: "Username: "}
						{student?.nisn || teacher?.nip || user.username}
					</p>
				</div>
				<div className="space-x-2 flex">
					<button
						onClick={() => setShowResetPasswordModal(true)}
						className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
					>
						🔐 Reset Password
					</button>
					<button
						onClick={handleDeleteUser}
						className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
					>
						🗑️ Hapus User
					</button>
				</div>
			</div>

			{/* Tabs */}
			<div className="bg-white rounded-lg shadow border-b-2 border-gray-200">
				<div className="flex flex-wrap">
					<button
						onClick={() => setActiveTab("user")}
						className={`px-6 py-4 font-semibold border-b-4 transition ${
							activeTab === "user"
								? "text-blue-600 border-blue-600"
								: "text-gray-700 border-transparent hover:bg-gray-50"
						}`}
					>
						👤 Informasi User
					</button>
					{user.role === "siswa" && (
						<button
							onClick={() => setActiveTab("siswa")}
							className={`px-6 py-4 font-semibold border-b-4 transition ${
								activeTab === "siswa"
									? "text-blue-600 border-blue-600"
									: "text-gray-700 border-transparent hover:bg-gray-50"
							}`}
						>
							📚 Data Siswa
						</button>
					)}
					{user.role === "guru" && (
						<button
							onClick={() => setActiveTab("guru")}
							className={`px-6 py-4 font-semibold border-b-4 transition ${
								activeTab === "guru"
									? "text-blue-600 border-blue-600"
									: "text-gray-700 border-transparent hover:bg-gray-50"
							}`}
						>
							📖 Data Guru
						</button>
					)}
					<button
						onClick={() => setActiveTab("activity")}
						className={`px-6 py-4 font-semibold border-b-4 transition ${
							activeTab === "activity"
								? "text-blue-600 border-blue-600"
								: "text-gray-700 border-transparent hover:bg-gray-50"
						}`}
					>
						📋 Log Aktivitas
					</button>
				</div>
			</div>

			{/* User Information Tab */}
			{activeTab === "user" && (
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-bold text-gray-900 mb-4">
						Informasi User
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<p className="text-gray-600 text-sm">Username</p>
							<p className="font-semibold text-gray-900">{user.username}</p>
						</div>
						<div>
							<p className="text-gray-600 text-sm">Email</p>
							<p className="font-semibold text-gray-900">{user.email || "-"}</p>
						</div>
						<div>
							<p className="text-gray-600 text-sm">Nama Lengkap</p>
							<p className="font-semibold text-gray-900">
								{user.fullName || "-"}
							</p>
						</div>
						<div>
							<p className="text-gray-600 text-sm">Role / Level</p>
							<span
								className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
									user.role === "admin"
										? "bg-purple-100 text-purple-700"
										: user.role === "guru"
										? "bg-blue-100 text-blue-700"
										: "bg-green-100 text-green-700"
								}`}
							>
								{user.role === "admin"
									? "🔐 Admin"
									: user.role === "guru"
									? "👨‍🏫 Guru"
									: "👨‍🎓 Siswa"}
							</span>
						</div>
						<div>
							<p className="text-gray-600 text-sm">Status</p>
							<span
								className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
									user.isActive
										? "bg-green-100 text-green-700"
										: "bg-red-100 text-red-700"
								}`}
							>
								{user.isActive ? "✓ Aktif" : "✕ Nonaktif"}
							</span>
						</div>
					</div>
				</div>
			)}

			{/* Student Information Tab */}
			{activeTab === "siswa" && student && (
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-bold text-gray-900 mb-4">
						📚 Data Siswa
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<p className="text-gray-600 text-sm">NISN</p>
							<p className="font-semibold text-gray-900">{student.nisn}</p>
						</div>
						<div>
							<p className="text-gray-600 text-sm">Nama Lengkap</p>
							<p className="font-semibold text-gray-900">
								{student.namaLengkap}
							</p>
						</div>
						<div>
							<p className="text-gray-600 text-sm">Jenis Kelamin</p>
							<p className="font-semibold text-gray-900">
								{student.jenisKelamin === "L" ? "👦 Laki-laki" : "👧 Perempuan"}
							</p>
						</div>
						<div>
							<p className="text-gray-600 text-sm">Kelas</p>
							<p className="font-semibold text-gray-900">
								{student.kelas
									? `${student.kelas.nama} (${
											student.kelas.tingkatRef?.nama ||
											student.kelas.tingkat ||
											"-"
									  })`
									: "-"}
							</p>
						</div>
						<div>
							<p className="text-gray-600 text-sm">Level</p>
							<span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
								Level {student.level}
							</span>
						</div>
						<div>
							<p className="text-gray-600 text-sm">Poin</p>
							<p className="font-semibold text-yellow-600">⭐ {student.poin}</p>
						</div>
					</div>
				</div>
			)}

			{/* Teacher Information Tab */}
			{activeTab === "guru" && teacher && (
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-bold text-gray-900 mb-4">📖 Data Guru</h2>
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<p className="text-gray-600 text-sm">NIP</p>
								<p className="font-semibold text-gray-900">{teacher.nip}</p>
							</div>
							<div>
								<p className="text-gray-600 text-sm">Nama Lengkap</p>
								<p className="font-semibold text-gray-900">
									{teacher.namaLengkap}
								</p>
							</div>
							<div className="md:col-span-2">
								<p className="text-gray-600 text-sm">Mata Pelajaran</p>
								<p className="font-semibold text-gray-900">
									{teacher.mataPelajaranId
										? mapelList.find((m) => m.id === teacher.mataPelajaranId)
												?.nama || `ID: ${teacher.mataPelajaranId}`
										: "Belum diisi"}
								</p>
							</div>
						</div>

						{teacher.kelasWaliList && teacher.kelasWaliList.length > 0 && (
							<div>
								<p className="text-gray-600 text-sm mb-3 font-semibold">
									👨‍🏫 Wali Kelas yang Diampu
								</p>
								<div className="space-y-2">
									{teacher.kelasWaliList.map((kelas) => (
										<div
											key={kelas.id}
											className="bg-blue-50 border border-blue-200 rounded-lg p-3"
										>
											<p className="font-semibold text-blue-900">
												{kelas.nama}
											</p>
											<p className="text-sm text-blue-700">
												Tingkat:{" "}
												{kelas.tingkatRef?.nama || kelas.tingkat || "-"}
											</p>
										</div>
									))}
								</div>
							</div>
						)}

						{teacher.kelasMapelList && teacher.kelasMapelList.length > 0 && (
							<div>
								<p className="text-gray-600 text-sm mb-3 font-semibold">
									📚 Kelas yang Mengajar Mata Pelajaran
								</p>
								<div className="space-y-2">
									{teacher.kelasMapelList.map((kelas) => (
										<div
											key={kelas.id}
											className="bg-green-50 border border-green-200 rounded-lg p-3"
										>
											<p className="font-semibold text-green-900">
												{kelas.nama}
											</p>
											<p className="text-sm text-green-700">
												Tingkat:{" "}
												{kelas.tingkatRef?.nama || kelas.tingkat || "-"}
											</p>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Password Reset Modal */}
			{showResetPasswordModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
						<h2 className="text-lg font-bold text-gray-900 mb-4">
							🔒 Reset Password
						</h2>
						<input
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder="Password baru (minimal 6 karakter)"
							className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<div className="flex gap-2 justify-end">
							<button
								onClick={() => {
									setShowResetPasswordModal(false);
									setNewPassword("");
								}}
								className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
							>
								Batal
							</button>
							<button
								onClick={handleResetPassword}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
							>
								Reset
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
