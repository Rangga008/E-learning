"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import {
	ConfirmModal,
	SuccessToast,
	ErrorToast,
} from "@/components/CommonModals";
import { FormModal } from "@/components/FormModal";
import { useNotification } from "@/hooks/useNotification";
import { logger } from "@/lib/logger";

interface Student {
	id: number;
	nisn: string;
	namaLengkap: string;
	jenisKelamin: string;
	kelasId?: number;
	kelas?: {
		id: number;
		nama: string;
		tingkatRef?: {
			nama: string;
		};
		tingkat?: string;
	};
	userId: number;
	createdAt: string;
}

interface FormData {
	nisn: string;
	namaLengkap: string;
	jenisKelamin: string;
	kelasId: string;
}

interface Kelas {
	id: number;
	nama: string;
	tingkat: string;
}

export default function SiswaDetailPage() {
	const params = useParams();
	const siswaId = Number(params.id);
	const {
		successToast,
		errorToast,
		confirmModal,
		showSuccess,
		showError,
		closeSuccess,
		closeError,
		closeConfirm,
	} = useNotification();

	const [siswa, setSiswa] = useState<Student | null>(null);
	const [loading, setLoading] = useState(true);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [kelasList, setKelasList] = useState<Kelas[]>([]);
	const [newPassword, setNewPassword] = useState("");
	const [formData, setFormData] = useState<FormData>({
		nisn: "",
		namaLengkap: "",
		jenisKelamin: "",
		kelasId: "",
	});

	useEffect(() => {
		fetchSiswaDetail();
		fetchKelasList();
	}, []);

	const fetchSiswaDetail = async () => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/peserta-didik/${siswaId}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			setSiswa(response.data);
			setFormData({
				nisn: response.data.nisn,
				namaLengkap: response.data.namaLengkap,
				jenisKelamin: response.data.jenisKelamin,
				kelasId: response.data.kelasId?.toString() || "",
			});
		} catch (error) {
			console.error("Error fetching siswa:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchKelasList = async () => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/kelas/dropdown/all`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			setKelasList(response.data.data || response.data || []);
		} catch (error) {
			console.error("Error fetching kelas:", error);
		}
	};

	const handleEditSave = async () => {
		try {
			await axios.put(
				`${process.env.NEXT_PUBLIC_API_URL}/peserta-didik/${siswaId}`,
				{
					nisn: formData.nisn,
					namaLengkap: formData.namaLengkap,
					jenisKelamin: formData.jenisKelamin,
					kelasId: formData.kelasId ? parseInt(formData.kelasId) : null,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			logger.success("Update Student", { id: siswaId });
			showSuccess("Data siswa berhasil diperbarui");
			setShowEditModal(false);
			fetchSiswaDetail();
		} catch (error) {
			logger.error("Update Student", { error });
			showError("Gagal memperbarui data siswa");
		}
	};

	const handleResetPassword = async () => {
		if (!newPassword.trim()) {
			logger.error("Update Password", { error: "Password is required" });
			showError("Password tidak boleh kosong");
			return;
		}

		try {
			await axios.put(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${siswa?.userId}/reset-password`,
				{ newPassword: newPassword },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			logger.success("Update Password", { userId: siswa?.userId });
			showSuccess("Password berhasil diubah");
			setShowPasswordModal(false);
			setNewPassword("");
		} catch (error) {
			logger.error("Update Password", { error });
			showError("Gagal mengubah password");
		}
	};

	if (loading) {
		return <div className="text-center py-12">Loading...</div>;
	}

	if (!siswa) {
		return (
			<div className="text-center py-12">
				<p className="text-red-600">Siswa tidak ditemukan</p>
				<Link
					href="/admin/siswa"
					className="text-blue-600 hover:underline mt-4"
				>
					Kembali ke daftar siswa
				</Link>
			</div>
		);
	}

	const kelasName =
		siswa.kelas && typeof siswa.kelas === "object"
			? `${siswa.kelas.nama} (${
					siswa.kelas.tingkatRef?.nama || siswa.kelas.tingkat || "-"
			  })`
			: kelasList.find((k) => k.id.toString() === siswa.kelasId?.toString())
					?.nama || "—";

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						{siswa.namaLengkap}
					</h1>
					<p className="text-gray-600">Detail Data Siswa</p>
				</div>
				<Link
					href="/admin/siswa"
					className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
				>
					← Kembali
				</Link>
			</div>

			{/* Detail Section */}
			<div className="bg-white rounded-lg shadow-md p-6 space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="text-sm text-gray-600">NISN</label>
						<p className="font-semibold text-gray-900">{siswa.nisn}</p>
					</div>
					<div>
						<label className="text-sm text-gray-600">Nama Lengkap</label>
						<p className="font-semibold text-gray-900">{siswa.namaLengkap}</p>
					</div>
					<div>
						<label className="text-sm text-gray-600">Jenis Kelamin</label>
						<p className="font-semibold text-gray-900">
							{siswa.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
						</p>
					</div>
					<div>
						<label className="text-sm text-gray-600">Kelas</label>
						<p className="font-semibold text-gray-900">{kelasName}</p>
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
			<FormModal
				isOpen={showEditModal}
				title="✏️ Edit Data Siswa"
				fields={[
					{
						name: "nisn",
						label: "NISN *",
						type: "text",
						value: formData.nisn,
						onChange: (e) => setFormData({ ...formData, nisn: e.target.value }),
						required: true,
					},
					{
						name: "namaLengkap",
						label: "Nama Lengkap *",
						type: "text",
						value: formData.namaLengkap,
						onChange: (e) =>
							setFormData({ ...formData, namaLengkap: e.target.value }),
						required: true,
					},
					{
						name: "jenisKelamin",
						label: "Jenis Kelamin *",
						type: "select",
						value: formData.jenisKelamin,
						onChange: (e) =>
							setFormData({ ...formData, jenisKelamin: e.target.value }),
						options: [
							{ value: "", label: "-- Pilih Jenis Kelamin --" },
							{ value: "L", label: "Laki-laki" },
							{ value: "P", label: "Perempuan" },
						],
						required: true,
					},
					{
						name: "kelasId",
						label: "Kelas *",
						type: "select",
						value: formData.kelasId,
						onChange: (e) =>
							setFormData({ ...formData, kelasId: e.target.value }),
						options: [
							{ value: "", label: "-- Pilih Kelas --" },
							...kelasList.map((kelas) => ({
								value: kelas.id.toString(),
								label: kelas.nama,
							})),
						],
						required: true,
					},
				]}
				onSubmit={handleEditSave}
				onCancel={() => setShowEditModal(false)}
				submitLabel="Simpan"
				maxWidth="max-w-md"
			/>

			{/* Reset Password Modal */}
			{showPasswordModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							🔒 Reset Password
						</h2>

						<div className="space-y-4">
							<p className="text-gray-600 text-sm">
								Masukkan password baru untuk siswa:{" "}
								<strong>{siswa.namaLengkap}</strong>
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
		</div>
	);
}
