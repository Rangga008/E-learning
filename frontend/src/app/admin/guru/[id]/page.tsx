"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SuccessToast, ErrorToast } from "@/components/CommonModals";
import { useNotification } from "@/hooks/useNotification";
import { logger } from "@/utils/logger";

interface Guru {
	id: number;
	nip: string;
	namaLengkap: string;
	mataPelajaranId?: number;
	userId?: number;
}

interface MapelOption {
	id: number;
	nama: string;
}

interface FormData {
	nip: string;
	namaLengkap: string;
	mataPelajaranId: string;
}

export default function GuruDetailPage() {
	const params = useParams();
	const guruId = Number(params.id);
	const {
		successToast,
		errorToast,
		closeSuccess,
		closeError,
		showSuccess,
		showError,
	} = useNotification();

	const [guru, setGuru] = useState<Guru | null>(null);
	const [loading, setLoading] = useState(true);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		nip: "",
		namaLengkap: "",
		mataPelajaranId: "",
	});
	const [newPassword, setNewPassword] = useState("");
	const [mapelList, setMapelList] = useState<MapelOption[]>([]);

	useEffect(() => {
		fetchGuruDetail();
		fetchMapelList();
	}, []);

	const fetchGuruDetail = async () => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/guru/${guruId}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			setGuru(response.data);
			setFormData({
				nip: response.data.nip,
				namaLengkap: response.data.namaLengkap,
				mataPelajaranId: response.data.mataPelajaranId?.toString() || "",
			});
		} catch (error) {
			console.error("Error fetching guru:", error);
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
			console.error("Error fetching mapel:", error);
		}
	};

	const handleEditSave = async () => {
		try {
			await axios.put(
				`${process.env.NEXT_PUBLIC_API_URL}/guru/${guruId}`,
				{
					nip: formData.nip,
					namaLengkap: formData.namaLengkap,
					mataPelajaranId: formData.mataPelajaranId
						? parseInt(formData.mataPelajaranId)
						: null,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			logger.success("Update Teacher", { id: guruId });
			showSuccess("Data guru berhasil diperbarui");
			setShowEditModal(false);
			fetchGuruDetail();
		} catch (error) {
			logger.error("Update Teacher", { error });
			showError("Gagal memperbarui data guru");
		}
	};

	const handleResetPassword = async () => {
		if (!newPassword.trim()) {
			logger.error("Reset Password", { error: "Password is required" });
			showError("Password tidak boleh kosong");
			return;
		}

		if (!guru?.userId) {
			logger.error("Reset Password", { error: "User ID not found" });
			showError("User ID tidak ditemukan. Hubungi administrator.");
			return;
		}

		try {
			await axios.put(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${guru.userId}/reset-password`,
				{ newPassword: newPassword },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			logger.success("Reset Password", { userId: guru.userId });
			showSuccess("Password berhasil diubah");
			setShowPasswordModal(false);
			setNewPassword("");
		} catch (error: any) {
			logger.error("Reset Password", { error });
			if (error.response?.status === 404) {
				showError("User tidak ditemukan di sistem");
			} else {
				showError("Gagal mengubah password");
			}
		}
	};

	if (loading) {
		return <div className="text-center py-12">Loading...</div>;
	}

	if (!guru) {
		return (
			<div className="text-center py-12">
				<p className="text-red-600">Guru tidak ditemukan</p>
				<Link href="/admin/guru" className="text-blue-600 hover:underline mt-4">
					Kembali ke daftar guru
				</Link>
			</div>
		);
	}

	const mapelName =
		mapelList.find((m) => m.id.toString() === guru.mataPelajaranId?.toString())
			?.nama || "—";

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						{guru.namaLengkap}
					</h1>
					<p className="text-gray-600">Detail Data Guru</p>
				</div>
				<Link
					href="/admin/guru"
					className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
				>
					← Kembali
				</Link>
			</div>

			{/* Detail Section */}
			<div className="bg-white rounded-lg shadow-md p-6 space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="text-sm text-gray-600">NIP</label>
						<p className="font-semibold text-gray-900">{guru.nip}</p>
					</div>
					<div>
						<label className="text-sm text-gray-600">Nama Lengkap</label>
						<p className="font-semibold text-gray-900">{guru.namaLengkap}</p>
					</div>
					<div>
						<label className="text-sm text-gray-600">Mata Pelajaran</label>
						<p className="font-semibold text-gray-900">{mapelName}</p>
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-3">
				<button
					onClick={() => setShowEditModal(true)}
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
				>
					✏️ Edit Data
				</button>
				<button
					onClick={() => setShowPasswordModal(true)}
					className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
				>
					🔒 Reset Password
				</button>
			</div>

			{/* Edit Modal */}
			{showEditModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							✏️ Edit Data Guru
						</h2>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									NIP
								</label>
								<input
									type="text"
									value={formData.nip}
									onChange={(e) =>
										setFormData({ ...formData, nip: e.target.value })
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Nama Lengkap
								</label>
								<input
									type="text"
									value={formData.namaLengkap}
									onChange={(e) =>
										setFormData({ ...formData, namaLengkap: e.target.value })
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Mata Pelajaran
								</label>
								<select
									value={formData.mataPelajaranId}
									onChange={(e) =>
										setFormData({
											...formData,
											mataPelajaranId: e.target.value,
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="">-- Pilih Mata Pelajaran --</option>
									{mapelList.map((mapel) => (
										<option key={mapel.id} value={mapel.id}>
											{mapel.nama}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="flex gap-3 mt-6">
							<button
								onClick={() => setShowEditModal(false)}
								className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
							>
								Batal
							</button>
							<button
								onClick={handleEditSave}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
							>
								Simpan
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Reset Password Modal */}
			{showPasswordModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							🔒 Reset Password
						</h2>

						<div className="space-y-4">
							<p className="text-gray-600 text-sm">
								Masukkan password baru untuk guru:{" "}
								<strong>{guru.namaLengkap}</strong>
							</p>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Password Baru
								</label>
								<input
									type="password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									placeholder="Masukkan password baru"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
								/>
							</div>
						</div>

						<div className="flex gap-3 mt-6">
							<button
								onClick={() => setShowPasswordModal(false)}
								className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
							>
								Batal
							</button>
							<button
								onClick={handleResetPassword}
								className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
							>
								Ubah Password
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
