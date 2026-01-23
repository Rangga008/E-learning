"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
	adminService,
	elearningService,
	kelasService,
} from "@/lib/api/services";
import {
	ConfirmModal,
	SuccessToast,
	ErrorToast,
} from "@/components/CommonModals";
import { FormModal } from "@/components/FormModal";
import { useNotification } from "@/hooks/useNotification";
import { logger } from "@/lib/logger";

interface User {
	id: number;
	username: string;
	email: string;
	fullName: string;
	role: string;
	isActive: boolean;
	createdAt?: string;
}

interface EditUser {
	id: number;
	username: string;
	email: string;
	fullName: string;
	role: string;
}

interface Kelas {
	id: number;
	nama: string;
	tingkat: string;
	guruWaliId?: number;
}

interface MapelOption {
	id: number;
	nama: string;
}

export default function UsersPage() {
	const {
		successToast,
		errorToast,
		confirmModal,
		showSuccess,
		showError,
		showConfirm,
		closeSuccess,
		closeError,
		closeConfirm,
	} = useNotification();

	const [users, setUsers] = useState<User[]>([]);
	const [kelasList, setKelasList] = useState<Kelas[]>([]);
	const [mapelList, setMapelList] = useState<MapelOption[]>([]);
	const [kelasWithoutWaliList, setKelasWithoutWaliList] = useState<Kelas[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [total, setTotal] = useState(0);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterRole, setFilterRole] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [editingUser, setEditingUser] = useState<EditUser | null>(null);
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		fullName: "",
		role: "siswa",
		password: "",
		nisn: "",
		jenisKelamin: "L",
		kelas: "",
		nip: "",
		kelasWali: "",
		kelasMapel: [] as number[],
	});
	const [passwordError, setPasswordError] = useState("");

	useEffect(() => {
		setPage(1);
	}, [searchQuery, filterRole]);

	useEffect(() => {
		fetchUsers();
		fetchDropdownData();
	}, [page, searchQuery, filterRole]);

	const fetchDropdownData = async () => {
		try {
			const [kelasRes, mapelRes, kelasNoWaliRes] = await Promise.all([
				kelasService.getKelasDropdown(),
				elearningService.getMataPelajaranDropdown(),
				kelasService.getKelasDropdown(),
			]);

			setKelasList(kelasRes.data || []);
			setMapelList(mapelRes.data || []);
			setKelasWithoutWaliList(kelasNoWaliRes.data || []);
		} catch (error) {
			console.error("Error fetching dropdown data:", error);
		}
	};

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await adminService.getAllUsers(
				page,
				limit,
				searchQuery || undefined,
				filterRole || undefined,
			);
			setUsers(response.data || []);
			setTotal(response.pagination?.total || 0);
		} catch (error) {
			console.error("Error fetching users:", error);
		} finally {
			setLoading(false);
		}
	};

	const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
		try {
			await adminService.updateUserStatus(userId, !currentStatus);
			fetchUsers();
		} catch (error) {
			console.error("Error updating user status:", error);
			logger.error("Change User Status", { error });
			showError("Gagal mengubah status user");
		}
	};

	const openModal = (user?: User) => {
		if (user) {
			setEditingUser({
				id: user.id,
				username: user.username,
				email: user.email,
				fullName: user.fullName,
				role: user.role,
			});
			setFormData({
				username: user.username,
				email: user.email,
				fullName: user.fullName,
				role: user.role,
				password: "",
				nisn: "",
				jenisKelamin: "L",
				kelas: "",
				nip: "",
				kelasWali: "",
				kelasMapel: [],
			});
		} else {
			setEditingUser(null);
			setFormData({
				username: "",
				email: "",
				fullName: "",
				role: "siswa",
				password: "",
				nisn: "",
				jenisKelamin: "L",
				kelas: "",
				nip: "",
				kelasWali: "",
				kelasMapel: [],
			});
		}
		setPasswordError("");
		setShowModal(true);
	};

	const saveUser = async () => {
		if (!formData.username || !formData.fullName) {
			logger.error("Save User", {
				error: "Username and fullname are required",
			});
			showError("Username dan Nama Lengkap harus diisi");
			return;
		}

		// Validate role-specific required fields
		if (formData.role === "siswa" && !formData.nisn) {
			logger.error("Save User", { error: "NISN is required for students" });
			showError("NISN harus diisi untuk siswa");
			return;
		}
		if (formData.role === "guru" && !formData.nip) {
			logger.error("Save User", { error: "NIP is required for teachers" });
			showError("NIP harus diisi untuk guru");
			return;
		}

		if (!editingUser && !formData.password) {
			setPasswordError("Password harus diisi untuk user baru");
			return;
		}
		if (formData.password && formData.password.length < 6) {
			setPasswordError("Password minimal 6 karakter");
			return;
		}
		try {
			let dataToSend: any = {
				username: formData.username,
				email: formData.email,
				fullName: formData.fullName,
				role: formData.role,
			};

			// Add role-specific fields for new users
			if (!editingUser) {
				if (formData.role === "siswa") {
					dataToSend = {
						...dataToSend,
						nisn: formData.nisn,
						jenisKelamin: formData.jenisKelamin,
						kelasId: formData.kelas ? parseInt(formData.kelas) : null,
						password: formData.password,
					};
				} else if (formData.role === "guru") {
					dataToSend = {
						...dataToSend,
						nip: formData.nip,
						kelasWaliId: formData.kelasWali
							? parseInt(formData.kelasWali)
							: null,
						kelasMapel: formData.kelasMapel.map((id) => parseInt(String(id))),
						password: formData.password,
					};
				} else if (formData.role === "admin") {
					dataToSend = {
						...dataToSend,
						password: formData.password,
					};
				}
			} else {
				// For editing user, only update if new password provided
				if (formData.password) {
					dataToSend.password = formData.password;
				}
			}

			if (editingUser) {
				await adminService.updateUser(editingUser.id, dataToSend);
				logger.success("Update User", { id: editingUser.id });
				showSuccess("User berhasil diperbarui");
			} else {
				await adminService.createUser(dataToSend);
				logger.success("Create User", { username: formData.username });
				showSuccess("User berhasil ditambahkan");
			}
			setShowModal(false);
			setEditingUser(null);
			fetchUsers();
		} catch (error) {
			console.error("Error saving user:", error);
			logger.error("Save User", { error });
			showError("Gagal menyimpan user");
		}
	};

	const deleteUser = async (userId: number) => {
		if (!confirm("Yakin ingin menghapus user ini?")) return;
		try {
			await adminService.deleteUser(userId);
			logger.success("Delete User", { userId });
			showSuccess("User berhasil dihapus");
			fetchUsers();
		} catch (error) {
			console.error("Error deleting user:", error);
			logger.error("Delete User", { error });
			showError("Gagal menghapus user");
		}
	};

	const totalPages = Math.ceil(total / limit);

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center mb-2">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						👤 Manajemen User
					</h1>
					<p className="text-gray-600 text-sm mt-1">
						Total: {total} user terdaftar
					</p>
				</div>
				<button
					onClick={() => openModal()}
					className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-md transition"
				>
					➕ Tambah User
				</button>
			</div>

			{/* Search and Filter */}
			<div className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
				<div className="flex-1 w-full">
					<input
						type="text"
						placeholder="🔍 Cari username, email, atau nama..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
					/>
				</div>
				<div className="w-full sm:w-48">
					<select
						value={filterRole}
						onChange={(e) => setFilterRole(e.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
					>
						<option value="">📋 Semua Role</option>
						<option value="admin">🔐 Admin</option>
						<option value="guru">👨‍🏫 Guru</option>
						<option value="siswa">👨‍🎓 Siswa</option>
					</select>
				</div>
				{(searchQuery || filterRole) && (
					<button
						onClick={() => {
							setSearchQuery("");
							setFilterRole("");
						}}
						className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition text-sm"
					>
						✕ Reset
					</button>
				)}
			</div>

			{loading ? (
				<div className="text-center py-12">
					<p className="text-gray-500">Loading...</p>
				</div>
			) : (
				<div className="bg-white rounded-lg shadow-md overflow-hidden">
					<table className="min-w-full">
						<thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
							<tr>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									No
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									Username
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									Email
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									Nama Lengkap
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									Role
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									Status
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold">
									Aksi
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{users.map((user, index) => (
								<tr key={user.id} className="hover:bg-gray-50 transition">
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										{index + 1 + (page - 1) * limit}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										{user.username}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
										{user.email}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
										{user.fullName}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-3 py-1 text-xs font-semibold rounded-full ${
												user.role === "admin"
													? "bg-purple-100 text-purple-800"
													: user.role === "guru"
													? "bg-blue-100 text-blue-800"
													: "bg-green-100 text-green-800"
											}`}
										>
											{user.role === "admin"
												? "🔐 Admin"
												: user.role === "guru"
												? "👨‍🏫 Guru"
												: "👨‍🎓 Siswa"}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-3 py-1 text-xs font-semibold rounded-full ${
												user.isActive
													? "bg-green-100 text-green-800"
													: "bg-red-100 text-red-800"
											}`}
										>
											{user.isActive ? "✓ Aktif" : "✕ Nonaktif"}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm space-x-1 flex items-center">
										<Link
											href={`/admin/users/${user.id}`}
											className="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-medium text-xs transition shadow"
											title="Lihat detail user"
										>
											👁️ Detail
										</Link>
										<button
											onClick={() => openModal(user)}
											className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-xs transition shadow"
											title="Edit user"
										>
											✏️ Ubah
										</button>
										<button
											onClick={() => toggleUserStatus(user.id, user.isActive)}
											className={`px-3 py-1 rounded-lg text-white font-medium text-xs transition shadow ${
												user.isActive
													? "bg-orange-500 hover:bg-orange-600"
													: "bg-green-500 hover:bg-green-600"
											}`}
											title={
												user.isActive ? "Nonaktifkan user" : "Aktifkan user"
											}
										>
											{user.isActive ? "🔒 Nonaktif" : "🔓 Aktif"}
										</button>
										<button
											onClick={() => deleteUser(user.id)}
											className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-xs transition shadow"
											title="Hapus user"
										>
											🗑️ Hapus
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					<div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
						<div className="text-sm text-gray-600">
							Halaman <span className="font-semibold">{page}</span> dari{" "}
							<span className="font-semibold">{totalPages}</span>
						</div>
						<div className="space-x-2">
							<button
								disabled={page === 1}
								onClick={() => setPage(page - 1)}
								className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition font-medium text-sm"
							>
								← Sebelumnya
							</button>
							<button
								disabled={page >= totalPages || total === 0}
								onClick={() => setPage(page + 1)}
								className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition font-medium text-sm"
							>
								Selanjutnya →
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Add/Edit User Modal */}
			<FormModal
				isOpen={showModal}
				title={editingUser ? "✏️ Edit User" : "➕ Tambah User Baru"}
				fields={[
					{
						name: "username",
						label: "Username",
						type: "text",
						placeholder: "Masukkan username",
						required: true,
						value: formData.username,
						onChange: (e) =>
							setFormData({ ...formData, username: e.target.value }),
					},
					{
						name: "fullName",
						label: "Nama Lengkap",
						type: "text",
						placeholder: "Masukkan nama lengkap",
						required: true,
						value: formData.fullName,
						onChange: (e) =>
							setFormData({ ...formData, fullName: e.target.value }),
					},
					{
						name: "email",
						label: "Email (Opsional)",
						type: "email",
						placeholder: "nama@email.com",
						value: formData.email,
						onChange: (e) =>
							setFormData({ ...formData, email: e.target.value }),
					},
					{
						name: "role",
						label: "Role",
						type: "select",
						required: true,
						value: formData.role,
						options: [
							{ value: "admin", label: "🔐 Admin - Pengelola Sistem" },
							{ value: "guru", label: "👨‍🏫 Guru - Pendidik" },
							{ value: "siswa", label: "👨‍🎓 Siswa - Peserta Didik" },
						],
						onChange: (e) => {
							setFormData({
								...formData,
								role: e.target.value,
								nisn: "",
								nip: "",
								kelas: "",
								kelasWali: "",
								kelasMapel: [],
							});
						},
					},
					...(formData.role === "siswa"
						? [
								{
									name: "nisn",
									label: "NISN",
									type: "text" as const,
									placeholder: "Masukkan NISN",
									required: true,
									value: formData.nisn,
									onChange: (e: any) =>
										setFormData({ ...formData, nisn: e.target.value }),
								},
								{
									name: "jenisKelamin",
									label: "Jenis Kelamin",
									type: "select" as const,
									value: formData.jenisKelamin,
									options: [
										{ value: "L", label: "👦 Laki-laki" },
										{ value: "P", label: "👧 Perempuan" },
									],
									onChange: (e: any) =>
										setFormData({
											...formData,
											jenisKelamin: e.target.value,
										}),
								},
								{
									name: "kelas",
									label: "Kelas",
									type: "select" as const,
									placeholder: "Pilih Kelas",
									required: true,
									value: formData.kelas,
									options: kelasList.map((k) => ({
										value: k.id,
										label: `${k.nama} (${k.tingkat})`,
									})),
									onChange: (e: any) =>
										setFormData({ ...formData, kelas: e.target.value }),
								},
						  ]
						: []),
					...(formData.role === "guru"
						? [
								{
									name: "nip",
									label: "NIP",
									type: "text" as const,
									placeholder: "Masukkan NIP",
									required: true,
									value: formData.nip,
									onChange: (e: any) =>
										setFormData({ ...formData, nip: e.target.value }),
								},
								{
									name: "kelasWali",
									label: "Wali Kelas (Opsional)",
									type: "select" as const,
									placeholder: "Pilih Kelas",
									value: formData.kelasWali,
									options: [
										{ value: "", label: "Tidak Ada Wali Kelas" },
										...kelasWithoutWaliList.map((k) => ({
											value: k.id,
											label: `${k.nama} (${k.tingkat})`,
										})),
									],
									onChange: (e: any) =>
										setFormData({
											...formData,
											kelasWali: e.target.value,
										}),
								},
						  ]
						: []),
					...(formData.role !== "admin"
						? [
								{
									name: "password",
									label: editingUser
										? "Password (Kosongkan jika tidak ingin mengubah)"
										: "Password",
									type: "password" as const,
									placeholder: "Masukkan password (minimal 6 karakter)",
									required: !editingUser,
									value: formData.password,
									onChange: (e: any) =>
										setFormData({ ...formData, password: e.target.value }),
								},
						  ]
						: []),
				]}
				onSubmit={saveUser}
				onCancel={() => {
					setShowModal(false);
					setPasswordError("");
				}}
				submitLabel={editingUser ? "Perbarui" : "Simpan"}
				maxWidth="max-w-2xl"
			/>

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
			{confirmModal && confirmModal.isOpen && (
				<ConfirmModal
					isOpen={confirmModal.isOpen}
					title={confirmModal.title}
					message={confirmModal.message}
					onConfirm={confirmModal.onConfirm}
					onCancel={closeConfirm}
				/>
			)}
		</div>
	);
}
