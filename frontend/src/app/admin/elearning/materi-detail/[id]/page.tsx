"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
	SuccessToast,
	ErrorToast,
	ConfirmModal,
} from "@/components/CommonModals";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useNotification } from "@/hooks/useNotification";

interface MateriDetail {
	id: number;
	judulMateri: string;
	deskripsi: string;
	status: "DRAFT" | "PUBLISHED" | "CLOSED";
	createdAt: string;
	updatedAt?: string;
	guru?: {
		nama: string;
	};
	mataPelajaran?: {
		id: number;
		nama: string;
	};
}

interface RencanaElearning {
	id?: number;
	materiId: number;
	rencana: string;
	createdAt?: string;
}

interface KontenMateri {
	id?: number;
	materiId: number;
	tipeKonten: "TEXT" | "FILE" | "VIDEO";
	judul: string;
	kontenTeks?: string;
	filePath?: string;
	fileName?: string;
	fileType?: string;
	convertedPdfPath?: string;
	linkVideo?: string;
	createdAt?: string;
}

interface Tugas {
	id?: number;
	materiId: number;
	judulTugas: string;
	deskripsi: string;
	tipe: "TUGAS" | "KUIS";
	status: "DRAFT" | "PUBLISHED" | "CLOSED";
	tanggalBuka?: string;
	tanggalDeadline?: string;
	createdAt?: string;
	updatedAt?: string;
}

type TabType = "rencana" | "konten" | "tugas" | "pengaturan";

export default function MateriDetailPage() {
	const params = useParams();
	const router = useRouter();
	const materiId = params.id as string;
	const user = useAuthStore((state) => state.user);
	const token = useAuthStore((state) => state.token);

	const {
		successToast,
		errorToast,
		showSuccess,
		showError,
		closeSuccess,
		closeError,
	} = useNotification();

	// State untuk materi
	const [materi, setMateri] = useState<MateriDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<TabType>("rencana");

	// State untuk Rencana Pembelajaran
	const [rencanaList, setRencanaList] = useState<RencanaElearning[]>([]);
	const [rencanaText, setRencanaText] = useState("");
	const [savingRencana, setSavingRencana] = useState(false);

	// State untuk Konten Materi
	const [kontenList, setKontenList] = useState<KontenMateri[]>([]);
	const [showKontenModal, setShowKontenModal] = useState(false);
	const [kontenForm, setKontenForm] = useState<KontenMateri>({
		materiId: parseInt(materiId),
		tipeKonten: "TEXT",
		judul: "",
		kontenTeks: "",
		filePath: "",
		linkVideo: "",
	});
	const [kontenFile, setKontenFile] = useState<File | null>(null);
	const [uploadProgress, setUploadProgress] = useState<number | null>(null);
	const [savingKonten, setSavingKonten] = useState(false);

	// State untuk Pengaturan
	const [materiStatus, setMateriStatus] = useState<
		"DRAFT" | "PUBLISHED" | "CLOSED"
	>("DRAFT");
	const [savingStatus, setSavingStatus] = useState(false);

	// State untuk Tugas & Kuis
	const [tugasList, setTugasList] = useState<Tugas[]>([]);
	const [showTugasModal, setShowTugasModal] = useState(false);
	const [showKuisModal, setShowKuisModal] = useState(false);
	const [tugasForm, setTugasForm] = useState<Tugas>({
		materiId: parseInt(materiId),
		judulTugas: "",
		deskripsi: "",
		tipe: "TUGAS",
		status: "DRAFT",
		tanggalBuka: new Date().toISOString().split("T")[0],
		tanggalDeadline: "",
	});
	const [kuisForm, setKuisForm] = useState<Tugas>({
		materiId: parseInt(materiId),
		judulTugas: "",
		deskripsi: "",
		tipe: "KUIS",
		status: "DRAFT",
		tanggalBuka: new Date().toISOString().split("T")[0],
		tanggalDeadline: "",
	});
	const [savingTugas, setSavingTugas] = useState(false);
	const [savingKuis, setSavingKuis] = useState(false);

	// State untuk Edit Modal
	const [showEditRencanaModal, setShowEditRencanaModal] = useState(false);
	const [editingRencana, setEditingRencana] = useState<RencanaElearning | null>(
		null,
	);
	const [editRencanaText, setEditRencanaText] = useState("");
	const [savingEditRencana, setSavingEditRencana] = useState(false);

	const [showEditKontenModal, setShowEditKontenModal] = useState(false);
	const [editingKonten, setEditingKonten] = useState<KontenMateri | null>(null);
	const [editKontenForm, setEditKontenForm] = useState<KontenMateri>({
		materiId: parseInt(materiId),
		tipeKonten: "TEXT",
		judul: "",
		kontenTeks: "",
		filePath: "",
		linkVideo: "",
	});
	const [savingEditKonten, setSavingEditKonten] = useState(false);

	// ============= FETCH FUNCTIONS =============
	const fetchMateriDetail = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materiId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.ok) {
				showError("Gagal memuat detail materi");
				return;
			}

			const data = await response.json();
			const materiData = data.data || data;
			setMateri(materiData);
			setMateriStatus(materiData.status || "DRAFT");
		} catch (error) {
			console.error("Error loading materi detail:", error);
			showError("Terjadi kesalahan saat memuat detail materi");
		} finally {
			setLoading(false);
		}
	}, [materiId, token, showError]);

	const fetchRencana = useCallback(async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materiId}/rencana`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (response.ok) {
				const data = await response.json();
				const list = Array.isArray(data) ? data : data.data || [];
				setRencanaList(list);
			}
		} catch (error) {
			console.error("Error loading rencana:", error);
		}
	}, [materiId, token]);

	const fetchKonten = useCallback(async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materiId}/konten`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (response.ok) {
				const data = await response.json();
				const list = Array.isArray(data) ? data : data.data || [];
				setKontenList(list);
			}
		} catch (error) {
			console.error("Error loading konten:", error);
		}
	}, [materiId, token]);

	const fetchTugas = useCallback(async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materiId}/tugas`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (response.ok) {
				const data = await response.json();
				const list = Array.isArray(data) ? data : data.data || [];
				setTugasList(list);
			}
		} catch (error) {
			console.error("Error loading tugas:", error);
		}
	}, [materiId, token]);

	useEffect(() => {
		if (!user || user.role !== "admin") {
			return;
		}
		fetchMateriDetail();
		fetchRencana();
		fetchKonten();
		fetchTugas();
	}, [
		user,
		token,
		materiId,
		fetchMateriDetail,
		fetchRencana,
		fetchKonten,
		fetchTugas,
	]);

	// ============= RENCANA FUNCTIONS =============
	const handleSaveRencana = async () => {
		if (!rencanaText.trim()) {
			showError("Rencana tidak boleh kosong");
			return;
		}

		setSavingRencana(true);
		try {
			const payload = {
				materiId: parseInt(materiId),
				rencana: rencanaText,
			};

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materiId}/rencana`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				showError(errorData.message || "Gagal menambah rencana");
				return;
			}

			showSuccess("Rencana pembelajaran berhasil ditambahkan");
			setRencanaText("");
			fetchRencana();
		} catch (error) {
			console.error("Error saving rencana:", error);
			showError("Terjadi kesalahan saat menambah rencana");
		} finally {
			setSavingRencana(false);
		}
	};

	// ============= IMAGE UPLOAD HANDLER =============
	const handleImageUploadForEditor = async (file: File): Promise<string> => {
		// Validate file type
		const allowedTypes = [
			"image/jpeg",
			"image/png",
			"image/jpg",
			"image/gif",
			"image/webp",
		];
		if (!allowedTypes.includes(file.type)) {
			throw new Error("Hanya file gambar (JPG, PNG, GIF, WebP) yang diizinkan");
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			throw new Error("Ukuran gambar tidak boleh lebih dari 5 MB");
		}

		const formData = new FormData();
		formData.append("file", file);

		const baseUrl =
			process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
			"http://localhost:3001";
		const response = await fetch(`${baseUrl}/elearning/upload/image`, {
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Gagal upload gambar");
		}

		const uploadedImage = await response.json();
		return uploadedImage.data.imageUrl;
	};

	// ============= KONTEN FUNCTIONS =============
	const handleSaveKonten = async () => {
		if (!kontenForm.judul.trim()) {
			showError("Judul konten harus diisi");
			return;
		}

		if (kontenForm.tipeKonten === "TEXT" && !kontenForm.kontenTeks?.trim()) {
			showError("Isi teks harus diisi");
			return;
		}

		if (kontenForm.tipeKonten === "VIDEO" && !kontenForm.linkVideo?.trim()) {
			showError("Link video harus diisi");
			return;
		}

		if (kontenForm.tipeKonten === "FILE" && !kontenFile) {
			showError("File harus dipilih");
			return;
		}

		setSavingKonten(true);
		setUploadProgress(0);
		try {
			// Step 1: Upload file jika ada
			let filePath = null;
			let fileName = null;
			let fileType = null;
			let convertedPdfPath = null;
			if (kontenFile) {
				const fileFormData = new FormData();
				fileFormData.append("file", kontenFile);

				setUploadProgress(50);
				const uploadResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/elearning/upload/konten`,
					{
						method: "POST",
						headers: { Authorization: `Bearer ${token}` },
						body: fileFormData,
					},
				);

				if (!uploadResponse.ok) {
					const errorData = await uploadResponse.json();
					showError(errorData.message || "Gagal upload file");
					setUploadProgress(null);
					setSavingKonten(false);
					return;
				}

				const uploadedFile = await uploadResponse.json();
				filePath = uploadedFile.data.filePath;
				fileName = uploadedFile.data.fileName;
				fileType = uploadedFile.data.fileType;
				convertedPdfPath = uploadedFile.data.convertedPdfPath || null;
				setUploadProgress(75);
			}

			// Step 2: Create konten
			const payload = {
				materiId: parseInt(materiId),
				tipeKonten: kontenForm.tipeKonten,
				judul: kontenForm.judul,
				kontenTeks: kontenForm.kontenTeks || "",
				linkVideo: kontenForm.linkVideo || "",
				filePath: filePath,
				fileName: fileName,
				fileType: fileType,
				convertedPdfPath: convertedPdfPath,
			};

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materiId}/konten`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				showError(errorData.message || "Gagal menambah konten");
				setUploadProgress(null);
				setSavingKonten(false);
				return;
			}

			setUploadProgress(100);
			showSuccess("Konten materi berhasil ditambahkan");
			resetKontenForm();
			setShowKontenModal(false);
			fetchKonten();
		} catch (error) {
			console.error("Error saving konten:", error);
			showError("Terjadi kesalahan saat menambah konten");
		} finally {
			setUploadProgress(null);
			setSavingKonten(false);
		}
	};

	const resetKontenForm = () => {
		setKontenForm({
			materiId: parseInt(materiId),
			tipeKonten: "TEXT",
			judul: "",
			kontenTeks: "",
			filePath: "",
			linkVideo: "",
		});
		setKontenFile(null);
	};

	// ============= TUGAS & KUIS FUNCTIONS =============
	const handleSaveTugas = async () => {
		if (!tugasForm.judulTugas.trim()) {
			showError("Judul tugas harus diisi");
			return;
		}

		if (!tugasForm.deskripsi.trim()) {
			showError("Deskripsi tugas harus diisi");
			return;
		}

		setSavingTugas(true);
		try {
			const payload = {
				materiId: parseInt(materiId),
				judulTugas: tugasForm.judulTugas,
				deskripsi: tugasForm.deskripsi,
				tipe: "TUGAS",
				tipeSubmisi: ["TEXT"],
				tanggalBuka: tugasForm.tanggalBuka
					? new Date(tugasForm.tanggalBuka).toISOString()
					: new Date().toISOString(),
				tanggalDeadline: tugasForm.tanggalDeadline
					? new Date(tugasForm.tanggalDeadline).toISOString()
					: null,
			};

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materiId}/tugas`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				showError(errorData.message || "Gagal menambah tugas");
				return;
			}

			showSuccess("Tugas berhasil ditambahkan");
			resetTugasForm();
			setShowTugasModal(false);
			fetchTugas();
		} catch (error) {
			console.error("Error saving tugas:", error);
			showError("Terjadi kesalahan saat menambah tugas");
		} finally {
			setSavingTugas(false);
		}
	};

	const handleSaveKuis = async () => {
		if (!kuisForm.judulTugas.trim()) {
			showError("Judul kuis harus diisi");
			return;
		}

		if (!kuisForm.deskripsi.trim()) {
			showError("Deskripsi kuis harus diisi");
			return;
		}

		setSavingKuis(true);
		try {
			const payload = {
				materiId: parseInt(materiId),
				judulTugas: kuisForm.judulTugas,
				deskripsi: kuisForm.deskripsi,
				tipe: "KUIS",
				tipeSubmisi: ["MULTIPLE_CHOICE"],
				tanggalBuka: kuisForm.tanggalBuka
					? new Date(kuisForm.tanggalBuka).toISOString()
					: new Date().toISOString(),
				tanggalDeadline: kuisForm.tanggalDeadline
					? new Date(kuisForm.tanggalDeadline).toISOString()
					: null,
			};

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materiId}/tugas`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				showError(errorData.message || "Gagal menambah kuis");
				return;
			}

			showSuccess("Kuis berhasil ditambahkan");
			resetTugasForm();
			setShowKuisModal(false);
			fetchTugas();
		} catch (error) {
			console.error("Error saving kuis:", error);
			showError("Terjadi kesalahan saat menambah kuis");
		} finally {
			setSavingKuis(false);
		}
	};

	const resetTugasForm = () => {
		setTugasForm({
			materiId: parseInt(materiId),
			judulTugas: "",
			deskripsi: "",
			tipe: "TUGAS",
			status: "DRAFT",
			tanggalBuka: new Date().toISOString().split("T")[0],
			tanggalDeadline: "",
		});
		setKuisForm({
			materiId: parseInt(materiId),
			judulTugas: "",
			deskripsi: "",
			tipe: "KUIS",
			status: "DRAFT",
			tanggalBuka: new Date().toISOString().split("T")[0],
			tanggalDeadline: "",
		});
	};

	const handleDeleteTugas = async (tugasId: number) => {
		if (!confirm("Apakah Anda yakin ingin menghapus tugas/kuis ini?")) {
			return;
		}

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/tugas/${tugasId}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.ok) {
				showError("Gagal menghapus tugas/kuis");
				return;
			}

			showSuccess("Tugas/Kuis berhasil dihapus");
			fetchTugas();
		} catch (error) {
			console.error("Error deleting tugas:", error);
			showError("Terjadi kesalahan saat menghapus tugas/kuis");
		}
	};

	// ============= DELETE FUNCTIONS =============
	const handleDeleteRencana = async (rencanaId: number) => {
		if (!confirm("Apakah Anda yakin ingin menghapus rencana ini?")) {
			return;
		}

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/rencana/${rencanaId}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.ok) {
				showError("Gagal menghapus rencana");
				return;
			}

			showSuccess("Rencana pembelajaran berhasil dihapus");
			fetchRencana();
		} catch (error) {
			console.error("Error deleting rencana:", error);
			showError("Terjadi kesalahan saat menghapus rencana");
		}
	};

	const handleDeleteKonten = async (kontenId: number) => {
		if (!confirm("Apakah Anda yakin ingin menghapus konten ini?")) {
			return;
		}

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/konten/${kontenId}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.ok) {
				showError("Gagal menghapus konten");
				return;
			}

			showSuccess("Konten materi berhasil dihapus");
			fetchKonten();
		} catch (error) {
			console.error("Error deleting konten:", error);
			showError("Terjadi kesalahan saat menghapus konten");
		}
	};

	// ============= EDIT FUNCTIONS =============
	const handleEditRencana = (rencana: RencanaElearning) => {
		setEditingRencana(rencana);
		setEditRencanaText(rencana.rencana);
		setShowEditRencanaModal(true);
	};

	const handleSaveEditRencana = async () => {
		if (!editRencanaText.trim()) {
			showError("Rencana tidak boleh kosong");
			return;
		}

		setSavingEditRencana(true);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/rencana/${editingRencana?.id}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						rencana: editRencanaText,
					}),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				showError(errorData.message || "Gagal mengupdate rencana");
				return;
			}

			showSuccess("Rencana pembelajaran berhasil diupdate");
			setShowEditRencanaModal(false);
			setEditingRencana(null);
			setEditRencanaText("");
			fetchRencana();
		} catch (error) {
			console.error("Error saving rencana:", error);
			showError("Terjadi kesalahan saat mengupdate rencana");
		} finally {
			setSavingEditRencana(false);
		}
	};

	const handleEditKonten = (konten: KontenMateri) => {
		setEditingKonten(konten);
		setEditKontenForm({
			...konten,
			materiId: parseInt(materiId),
		});
		setShowEditKontenModal(true);
	};

	const handleSaveEditKonten = async () => {
		if (!editKontenForm.judul.trim()) {
			showError("Judul konten harus diisi");
			return;
		}

		if (
			editKontenForm.tipeKonten === "TEXT" &&
			!editKontenForm.kontenTeks?.trim()
		) {
			showError("Konten teks harus diisi");
			return;
		}

		if (
			editKontenForm.tipeKonten === "VIDEO" &&
			!editKontenForm.linkVideo?.trim()
		) {
			showError("Link video harus diisi");
			return;
		}

		setSavingEditKonten(true);
		setUploadProgress(0);
		try {
			// Step 1: Upload file jika ada file baru
			let filePath = editingKonten?.filePath || null;
			let fileName = editingKonten?.fileName || null;
			let fileType = editingKonten?.fileType || null;
			let convertedPdfPath = editingKonten?.convertedPdfPath || null;
			if (kontenFile) {
				const fileFormData = new FormData();
				fileFormData.append("file", kontenFile);

				setUploadProgress(50);
				const uploadResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/elearning/upload/konten`,
					{
						method: "POST",
						headers: { Authorization: `Bearer ${token}` },
						body: fileFormData,
					},
				);

				if (!uploadResponse.ok) {
					const errorData = await uploadResponse.json();
					showError(errorData.message || "Gagal upload file");
					setUploadProgress(null);
					setSavingEditKonten(false);
					return;
				}

				const uploadedFile = await uploadResponse.json();
				filePath = uploadedFile.data.filePath;
				fileName = uploadedFile.data.fileName;
				fileType = uploadedFile.data.fileType;
				convertedPdfPath = uploadedFile.data.convertedPdfPath || null;
				setUploadProgress(75);
			}

			// Step 2: Update konten
			const payload = {
				tipeKonten: editKontenForm.tipeKonten,
				judul: editKontenForm.judul,
				kontenTeks: editKontenForm.kontenTeks || "",
				linkVideo: editKontenForm.linkVideo || "",
				filePath: filePath,
				fileName: fileName,
				fileType: fileType,
				convertedPdfPath: convertedPdfPath,
			};

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/konten/${editingKonten?.id}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				showError(errorData.message || "Gagal mengupdate konten");
				setUploadProgress(null);
				setSavingEditKonten(false);
				return;
			}

			setUploadProgress(100);
			showSuccess("Konten materi berhasil diupdate");
			setShowEditKontenModal(false);
			setEditingKonten(null);
			fetchKonten();
		} catch (error) {
			console.error("Error saving konten:", error);
			showError("Terjadi kesalahan saat mengupdate konten");
		} finally {
			setUploadProgress(null);
			setSavingEditKonten(false);
		}
	};

	// ============= PENGATURAN FUNCTIONS =============
	const handleUpdateStatus = async (
		newStatus: "DRAFT" | "PUBLISHED" | "CLOSED",
	) => {
		setSavingStatus(true);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materiId}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ status: newStatus }),
				},
			);

			if (!response.ok) {
				showError("Gagal mengubah status materi");
				return;
			}

			setMateriStatus(newStatus);
			if (materi) {
				setMateri({ ...materi, status: newStatus });
			}
			showSuccess(`Status materi berhasil diubah ke ${newStatus}`);
		} catch (error) {
			console.error("Error updating status:", error);
			showError("Terjadi kesalahan saat mengubah status");
		} finally {
			setSavingStatus(false);
		}
	};

	if (loading) {
		return (
			<div className="p-6">
				<div className="text-center py-12">
					<p className="text-gray-600">Memuat detail materi...</p>
				</div>
			</div>
		);
	}

	if (!materi) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-6">
					<p className="text-red-700">Materi tidak ditemukan</p>
					<Link
						href="/admin/elearning/materi"
						className="text-red-600 hover:underline mt-2 inline-block"
					>
						← Kembali ke Daftar Materi
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			{/* HEADER */}
			<div className="mb-6">
				<Link
					href="/admin/elearning/materi"
					className="text-blue-600 hover:underline flex items-center gap-2 mb-4"
				>
					← Kembali ke Daftar Materi
				</Link>
				<div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
					<h1 className="text-3xl font-bold mb-2">{materi.judulMateri}</h1>
					<div className="grid grid-cols-3 gap-4 text-sm">
						<div>
							<p className="text-blue-100">Mata Pelajaran</p>
							<p className="font-semibold">
								{materi.mataPelajaran?.nama || "Unknown"}
							</p>
						</div>
						<div>
							<p className="text-blue-100">Status</p>
							<span
								className={`inline-block px-3 py-1 rounded-full font-semibold text-xs ${
									materiStatus === "PUBLISHED"
										? "bg-green-500"
										: materiStatus === "CLOSED"
										? "bg-red-500"
										: "bg-yellow-500"
								}`}
							>
								{materiStatus}
							</span>
						</div>
						<div>
							<p className="text-blue-100">Dibuat oleh</p>
							<p className="font-semibold">{materi.guru?.nama || "Admin"}</p>
						</div>
					</div>
				</div>
			</div>

			{/* TAB NAVIGATION */}
			<div className="mb-6 border-b border-gray-200">
				<div className="flex gap-0">
					{["rencana", "konten", "tugas", "pengaturan"].map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab as TabType)}
							className={`px-6 py-3 font-medium transition-colors border-b-2 ${
								activeTab === tab
									? "border-blue-600 text-blue-600"
									: "border-transparent text-gray-600 hover:text-gray-900"
							}`}
						>
							{tab === "rencana" && "📚 Rencana Pembelajaran"}
							{tab === "konten" && "📄 Konten Materi"}
							{tab === "tugas" && "✏️ Tugas & Kuis"}
							{tab === "pengaturan" && "⚙️ Pengaturan"}
						</button>
					))}
				</div>
			</div>

			{/* TAB CONTENT */}
			<div>
				{/* RENCANA TAB */}
				{activeTab === "rencana" && (
					<div className="space-y-6">
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-xl font-bold mb-4">
								Tambah Rencana Pembelajaran
							</h2>
							<div className="space-y-4">
								<textarea
									value={rencanaText}
									onChange={(e) => setRencanaText(e.target.value)}
									placeholder="Masukkan rencana pembelajaran (mis: tujuan, metode, durasi, etc.)"
									rows={6}
									className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
								/>
								<button
									onClick={handleSaveRencana}
									disabled={savingRencana}
									className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
								>
									{savingRencana ? "Menyimpan..." : "Simpan Rencana"}
								</button>
							</div>
						</div>

						{rencanaList.length > 0 ? (
							<div className="space-y-3">
								<h3 className="font-bold text-lg">
									Daftar Rencana ({rencanaList.length})
								</h3>
								{rencanaList.map((rencana, idx) => (
									<div
										key={idx}
										className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
									>
										<div className="flex justify-between items-start mb-3">
											<div className="flex-1">
												<p className="text-sm text-gray-500">
													Rencana #{idx + 1}
												</p>
												<p className="text-xs text-gray-400">
													{new Date(rencana.createdAt || "").toLocaleDateString(
														"id-ID",
													)}
												</p>
											</div>
											<div className="flex gap-2">
												<button
													onClick={() => handleEditRencana(rencana)}
													className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
												>
													✏️ Edit
												</button>
												<button
													onClick={() => handleDeleteRencana(rencana.id || 0)}
													className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
												>
													🗑️ Hapus
												</button>
											</div>
										</div>
										<p className="text-gray-700 text-sm line-clamp-2">
											{rencana.rencana}
										</p>
									</div>
								))}
							</div>
						) : (
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
								Belum ada rencana pembelajaran
							</div>
						)}
					</div>
				)}

				{/* KONTEN TAB */}
				{activeTab === "konten" && (
					<div className="space-y-6">
						<div className="flex justify-end mb-4">
							<button
								onClick={() => {
									resetKontenForm();
									setShowKontenModal(true);
								}}
								className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
							>
								+ Tambah Konten
							</button>
						</div>

						{kontenList.length > 0 ? (
							<div className="grid gap-4">
								{kontenList.map((konten, idx) => (
									<div
										key={idx}
										className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
									>
										<div className="flex justify-between items-start mb-3">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
														{konten.tipeKonten}
													</span>
												</div>
												<h4 className="text-lg font-bold text-gray-900">
													{konten.judul}
												</h4>
											</div>
											<div className="flex gap-2 ml-4">
												<button
													onClick={() => handleEditKonten(konten)}
													className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
												>
													✏️
												</button>
												<button
													onClick={() => handleDeleteKonten(konten.id || 0)}
													className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
												>
													🗑️
												</button>
											</div>
										</div>

										{konten.tipeKonten === "TEXT" && (
											<p className="text-sm text-gray-600 mb-3">
												{konten.kontenTeks}
											</p>
										)}

										{konten.tipeKonten === "VIDEO" && (
											<p className="text-sm text-gray-600 mb-3">
												Video:{" "}
												<a
													href={konten.linkVideo}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 hover:underline"
												>
													{konten.linkVideo}
												</a>
											</p>
										)}

										{konten.tipeKonten === "FILE" && (
											<div className="space-y-2">
												<p className="text-sm text-gray-600 mb-2">
													📎 File:{" "}
													<span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
														{konten.fileName ||
															konten.filePath?.split("/").pop()}
													</span>
												</p>
												{konten.filePath && (
													<a
														href={`${process.env.NEXT_PUBLIC_API_URL}${konten.filePath}`}
														target="_blank"
														rel="noopener noreferrer"
														className="text-sm text-blue-600 hover:underline inline-block"
													>
														📥 Download File
													</a>
												)}
												{konten.convertedPdfPath && (
													<div className="text-xs text-green-600">
														✓ Word converted to PDF available
													</div>
												)}
											</div>
										)}

										<p className="text-xs text-gray-400">
											{new Date(konten.createdAt || "").toLocaleDateString(
												"id-ID",
											)}
										</p>
									</div>
								))}
							</div>
						) : (
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
								Belum ada konten materi
							</div>
						)}

						{/* MODAL TAMBAH KONTEN */}
						{showKontenModal && (
							<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
								<div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
									<h3 className="text-xl font-bold mb-4">
										Tambah Konten Materi
									</h3>

									<div className="space-y-4">
										{/* JUDUL */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Judul Konten
											</label>
											<input
												type="text"
												value={kontenForm.judul}
												onChange={(e) =>
													setKontenForm({
														...kontenForm,
														judul: e.target.value,
													})
												}
												placeholder="Masukkan judul konten"
												className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											/>
										</div>

										{/* TIPE KONTEN */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Tipe Konten
											</label>
											<select
												value={kontenForm.tipeKonten}
												onChange={(e) =>
													setKontenForm({
														...kontenForm,
														tipeKonten: e.target.value as
															| "TEXT"
															| "FILE"
															| "VIDEO",
													})
												}
												className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											>
												<option value="TEXT">📝 Teks</option>
												<option value="VIDEO">🎥 Video</option>
												<option value="FILE">📁 File</option>
											</select>
										</div>

										{/* KONTEN BERDASARKAN TIPE */}
										{kontenForm.tipeKonten === "TEXT" && (
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Isi Teks
												</label>
												<RichTextEditor
													value={kontenForm.kontenTeks || ""}
													onChange={(content: string) =>
														setKontenForm({
															...kontenForm,
															kontenTeks: content,
														})
													}
													onImageUpload={handleImageUploadForEditor}
													placeholder="Masukkan konten teks (drag & drop gambar atau gunakan tombol insert image)..."
													isUploading={false}
												/>
											</div>
										)}

										{kontenForm.tipeKonten === "VIDEO" && (
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Link Video (YouTube/URL)
												</label>
												{kontenForm.linkVideo &&
													!kontenForm.linkVideo.includes("youtube.com") &&
													!kontenForm.linkVideo.includes("youtu.be") && (
														<div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
															⚠️ Link video sebaiknya dari YouTube. Format:
															https://youtube.com/watch?v=xxxxx atau
															https://youtu.be/xxxxx
														</div>
													)}
												<input
													type="url"
													value={kontenForm.linkVideo || ""}
													onChange={(e) =>
														setKontenForm({
															...kontenForm,
															linkVideo: e.target.value,
														})
													}
													placeholder="https://youtube.com/watch?v=... atau https://youtu.be/..."
													className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												/>
											</div>
										)}

										{kontenForm.tipeKonten === "FILE" && (
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													📎 Upload File (PDF atau Word)
												</label>
												<div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
													✓ File yang diizinkan: PDF (.pdf), Word (.doc, .docx)
													<br />✓ Ukuran maksimal: 50 MB
												</div>
												<div className="border-2 border-dashed border-blue-300 rounded-lg p-4 hover:border-blue-500 transition cursor-pointer">
													<input
														type="file"
														accept=".pdf,.doc,.docx"
														onChange={(e) => {
															const file = e.target.files?.[0];
															if (file) {
																const allowedTypes = [
																	"application/pdf",
																	"application/msword",
																	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
																];
																if (!allowedTypes.includes(file.type)) {
																	showError(
																		"File harus berupa PDF atau Word (.doc, .docx)",
																	);
																	return;
																}
																if (file.size > 50 * 1024 * 1024) {
																	showError(
																		"Ukuran file tidak boleh lebih dari 50 MB",
																	);
																	return;
																}
																setKontenFile(file);
															}
														}}
														className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer hover:file:bg-blue-600"
													/>
													{kontenFile && (
														<p className="text-sm text-green-600 mt-2">
															✓ {kontenFile.name}
														</p>
													)}
												</div>
											</div>
										)}
									</div>

									{uploadProgress !== null && (
										<div className="mt-4">
											<div className="w-full bg-gray-200 rounded-full h-2">
												<div
													className="bg-blue-600 h-2 rounded-full transition-all"
													style={{ width: `${uploadProgress}%` }}
												></div>
											</div>
											<p className="text-xs text-gray-600 mt-1">
												{uploadProgress}%
											</p>
										</div>
									)}

									{/* BUTTONS */}
									<div className="flex gap-3 mt-6">
										<button
											onClick={() => {
												setShowKontenModal(false);
												resetKontenForm();
											}}
											className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
										>
											Batal
										</button>
										<button
											onClick={handleSaveKonten}
											disabled={savingKonten}
											className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
										>
											{savingKonten ? "Menyimpan..." : "Simpan Konten"}
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				)}

				{/* TUGAS TAB */}
				{activeTab === "tugas" && (
					<div className="space-y-6">
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-xl font-bold mb-4">Kelola Tugas & Kuis</h2>
							<div className="flex gap-4">
								<button
									onClick={() => {
										resetTugasForm();
										setShowTugasModal(true);
									}}
									className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
								>
									+ Tambah Tugas
								</button>
								<button
									onClick={() => {
										setKuisForm({
											materiId: parseInt(materiId),
											judulTugas: "",
											deskripsi: "",
											tipe: "KUIS",
											status: "DRAFT",
										});
										setShowKuisModal(true);
									}}
									className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
								>
									+ Tambah Kuis
								</button>
							</div>
						</div>

						{tugasList.length > 0 ? (
							<div className="grid gap-4">
								{tugasList.map((tugas, idx) => (
									<div
										key={idx}
										className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
									>
										<div className="flex justify-between items-start mb-3">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<span
														className={`inline-block px-3 py-1 text-white text-xs font-semibold rounded ${
															tugas.tipe === "KUIS"
																? "bg-indigo-600"
																: "bg-purple-600"
														}`}
													>
														{tugas.tipe}
													</span>
													<span
														className={`inline-block px-3 py-1 text-white text-xs font-semibold rounded ${
															tugas.status === "PUBLISHED"
																? "bg-green-600"
																: tugas.status === "CLOSED"
																? "bg-red-600"
																: "bg-yellow-600"
														}`}
													>
														{tugas.status}
													</span>
												</div>
												<h4 className="text-lg font-bold text-gray-900">
													{tugas.judulTugas}
												</h4>
											</div>
											<div className="flex gap-2 ml-4">
												<Link
													href={
														tugas.tipe === "KUIS"
															? `/admin/elearning/materi-detail/${materiId}/kuis-detail/${tugas.id}`
															: `/admin/elearning/materi-detail/${materiId}/tugas-detail/${tugas.id}`
													}
													className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
												>
													👁️ Lihat
												</Link>
												<button
													onClick={() => handleDeleteTugas(tugas.id || 0)}
													className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
												>
													🗑️
												</button>
											</div>
										</div>
										<p className="text-sm text-gray-600 mb-3 line-clamp-2">
											{tugas.deskripsi}
										</p>
										<p className="text-xs text-gray-400">
											{new Date(tugas.createdAt || "").toLocaleDateString(
												"id-ID",
											)}
										</p>
									</div>
								))}
							</div>
						) : (
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
								<p className="mb-2">📋 Belum ada tugas atau kuis</p>
								<p className="text-sm">
									Klik tombol di atas untuk membuat tugas atau kuis baru
								</p>
							</div>
						)}

						{/* MODAL TAMBAH TUGAS */}
						{showTugasModal && (
							<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
								<div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
									<h3 className="text-xl font-bold mb-4">Tambah Tugas</h3>

									<div className="space-y-4">
										{/* JUDUL */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Judul Tugas
											</label>
											<input
												type="text"
												value={tugasForm.judulTugas}
												onChange={(e) =>
													setTugasForm({
														...tugasForm,
														judulTugas: e.target.value,
													})
												}
												placeholder="Masukkan judul tugas"
												className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
											/>
										</div>

										{/* DESKRIPSI */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Deskripsi Tugas
											</label>
											<textarea
												value={tugasForm.deskripsi}
												onChange={(e) =>
													setTugasForm({
														...tugasForm,
														deskripsi: e.target.value,
													})
												}
												placeholder="Masukkan deskripsi dan instruksi tugas"
												rows={4}
												className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
											/>
										</div>

										{/* TANGGAL BUKA */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Tanggal Buka
											</label>
											<input
												type="date"
												value={tugasForm.tanggalBuka || ""}
												onChange={(e) =>
													setTugasForm({
														...tugasForm,
														tanggalBuka: e.target.value,
													})
												}
												className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
											/>
										</div>

										{/* TANGGAL DEADLINE */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Deadline (Opsional)
											</label>
											<input
												type="datetime-local"
												value={tugasForm.tanggalDeadline || ""}
												onChange={(e) =>
													setTugasForm({
														...tugasForm,
														tanggalDeadline: e.target.value,
													})
												}
												className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
											/>
										</div>
									</div>

									{/* BUTTONS */}
									<div className="flex gap-3 mt-6">
										<button
											onClick={() => {
												setShowTugasModal(false);
												resetTugasForm();
											}}
											className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
										>
											Batal
										</button>
										<button
											onClick={handleSaveTugas}
											disabled={savingTugas}
											className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
										>
											{savingTugas ? "Menyimpan..." : "Simpan Tugas"}
										</button>
									</div>
								</div>
							</div>
						)}

						{/* MODAL TAMBAH KUIS */}
						{showKuisModal && (
							<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
								<div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
									<h3 className="text-xl font-bold mb-4">Tambah Kuis</h3>

									<div className="space-y-4">
										{/* JUDUL */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Judul Kuis
											</label>
											<input
												type="text"
												value={kuisForm.judulTugas}
												onChange={(e) =>
													setKuisForm({
														...kuisForm,
														judulTugas: e.target.value,
													})
												}
												placeholder="Masukkan judul kuis"
												className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
											/>
										</div>

										{/* DESKRIPSI */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Deskripsi Kuis
											</label>
											<textarea
												value={kuisForm.deskripsi}
												onChange={(e) =>
													setKuisForm({
														...kuisForm,
														deskripsi: e.target.value,
													})
												}
												placeholder="Masukkan deskripsi dan instruksi kuis"
												rows={4}
												className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
											/>
										</div>

										{/* TANGGAL BUKA */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Tanggal Buka
											</label>
											<input
												type="date"
												value={kuisForm.tanggalBuka || ""}
												onChange={(e) =>
													setKuisForm({
														...kuisForm,
														tanggalBuka: e.target.value,
													})
												}
												className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
											/>
										</div>

										{/* TANGGAL DEADLINE */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Deadline (Opsional)
											</label>
											<input
												type="datetime-local"
												value={kuisForm.tanggalDeadline || ""}
												onChange={(e) =>
													setKuisForm({
														...kuisForm,
														tanggalDeadline: e.target.value,
													})
												}
												className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
											/>
										</div>
									</div>

									{/* BUTTONS */}
									<div className="flex gap-3 mt-6">
										<button
											onClick={() => {
												setShowKuisModal(false);
												resetTugasForm();
											}}
											className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
										>
											Batal
										</button>
										<button
											onClick={handleSaveKuis}
											disabled={savingKuis}
											className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
										>
											{savingKuis ? "Menyimpan..." : "Simpan Kuis"}
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				)}

				{/* PENGATURAN TAB */}
				{activeTab === "pengaturan" && (
					<div className="space-y-6">
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-xl font-bold mb-6">Status Materi</h2>

							<div className="grid grid-cols-3 gap-4 mb-6">
								{["DRAFT", "PUBLISHED", "CLOSED"].map((status) => (
									<button
										key={status}
										onClick={() =>
											handleUpdateStatus(
												status as "DRAFT" | "PUBLISHED" | "CLOSED",
											)
										}
										disabled={savingStatus || materiStatus === status}
										className={`py-4 px-4 rounded-lg font-semibold transition-all ${
											materiStatus === status
												? status === "PUBLISHED"
													? "bg-green-600 text-white"
													: status === "CLOSED"
													? "bg-red-600 text-white"
													: "bg-yellow-600 text-white"
												: "bg-gray-100 text-gray-700 hover:bg-gray-200"
										} disabled:opacity-50`}
									>
										{status === "DRAFT" && "📝 DRAFT"}
										{status === "PUBLISHED" && "✅ PUBLISHED"}
										{status === "CLOSED" && "🔒 CLOSED"}
									</button>
								))}
							</div>

							<p className="text-sm text-gray-600 mb-6">
								{materiStatus === "DRAFT" &&
									"Materi masih dalam tahap pembuatan"}
								{materiStatus === "PUBLISHED" &&
									"Materi sudah tersedia untuk siswa"}
								{materiStatus === "CLOSED" &&
									"Materi sudah ditutup dan tidak bisa diakses"}
							</p>
						</div>

						{/* STATISTIK */}
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-xl font-bold mb-4">Statistik Materi</h2>

							<div className="grid grid-cols-2 gap-4">
								<div className="bg-blue-50 rounded-lg p-4">
									<p className="text-gray-600 text-sm">Rencana Pembelajaran</p>
									<p className="text-3xl font-bold text-blue-600">
										{rencanaList.length}
									</p>
								</div>
								<div className="bg-green-50 rounded-lg p-4">
									<p className="text-gray-600 text-sm">Konten Materi</p>
									<p className="text-3xl font-bold text-green-600">
										{kontenList.length}
									</p>
								</div>
							</div>

							<div className="mt-6 pt-6 border-t border-gray-200">
								<p className="text-xs text-gray-500">Informasi Umum</p>
								<div className="grid grid-cols-2 gap-4 mt-3">
									<div>
										<p className="text-gray-600 text-sm">Created At</p>
										<p className="font-medium">
											{new Date(materi.createdAt || "").toLocaleDateString(
												"id-ID",
											)}
										</p>
									</div>
									<div>
										<p className="text-gray-600 text-sm">Updated At</p>
										<p className="font-medium">
											{new Date(materi.updatedAt || "").toLocaleDateString(
												"id-ID",
											)}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* MODAL EDIT RENCANA */}
			{showEditRencanaModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
						<h3 className="text-xl font-bold mb-4">
							Edit Rencana Pembelajaran
						</h3>

						<div className="space-y-4">
							<textarea
								value={editRencanaText}
								onChange={(e) => setEditRencanaText(e.target.value)}
								placeholder="Masukkan rencana pembelajaran"
								rows={8}
								className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
							/>
						</div>

						<div className="flex gap-3 mt-6">
							<button
								onClick={() => {
									setShowEditRencanaModal(false);
									setEditingRencana(null);
									setEditRencanaText("");
								}}
								className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
							>
								Batal
							</button>
							<button
								onClick={handleSaveEditRencana}
								disabled={savingEditRencana}
								className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
							>
								{savingEditRencana ? "Menyimpan..." : "Update Rencana"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* MODAL EDIT KONTEN */}
			{showEditKontenModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
						<h3 className="text-xl font-bold mb-4">Edit Konten Materi</h3>

						<div className="space-y-4">
							{/* JUDUL */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Judul Konten
								</label>
								<input
									type="text"
									value={editKontenForm.judul}
									onChange={(e) =>
										setEditKontenForm({
											...editKontenForm,
											judul: e.target.value,
										})
									}
									placeholder="Judul konten"
									className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>

							{/* TIPE KONTEN */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Jenis Konten
								</label>
								<select
									value={editKontenForm.tipeKonten}
									onChange={(e) =>
										setEditKontenForm({
											...editKontenForm,
											tipeKonten: e.target.value as "TEXT" | "FILE" | "VIDEO",
										})
									}
									className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="TEXT">📝 Teks</option>
									<option value="VIDEO">🎬 Video</option>
									<option value="FILE">📎 File</option>
								</select>
							</div>

							{/* KONTEN TEKS */}
							{editKontenForm.tipeKonten === "TEXT" && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Konten Teks
									</label>
									<RichTextEditor
										value={editKontenForm.kontenTeks || ""}
										onChange={(content: string) =>
											setEditKontenForm({
												...editKontenForm,
												kontenTeks: content,
											})
										}
										onImageUpload={handleImageUploadForEditor}
										placeholder="Masukkan konten teks (drag & drop gambar atau gunakan tombol insert image)..."
										isUploading={false}
									/>
								</div>
							)}

							{/* LINK VIDEO */}
							{editKontenForm.tipeKonten === "VIDEO" && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Link Video
									</label>
									<input
										type="url"
										value={editKontenForm.linkVideo}
										onChange={(e) =>
											setEditKontenForm({
												...editKontenForm,
												linkVideo: e.target.value,
											})
										}
										placeholder="https://youtube.com/..."
										className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
							)}

							{/* FILE UPLOAD */}
							{editKontenForm.tipeKonten === "FILE" && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										📎 Upload File (PDF atau Word)
									</label>
									<div className="border-2 border-dashed border-blue-300 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
										<input
											type="file"
											accept=".pdf,.doc,.docx"
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) {
													const allowedTypes = [
														"application/pdf",
														"application/msword",
														"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
													];

													if (!allowedTypes.includes(file.type)) {
														showError(
															"Format file tidak didukung. Hanya PDF, DOC, atau DOCX.",
														);
														return;
													}

													if (file.size > 50 * 1024 * 1024) {
														showError(
															"Ukuran file terlalu besar. Maksimal 50MB.",
														);
														return;
													}

													setKontenFile(file);
												}
											}}
											className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
										/>
										{kontenFile && (
											<p className="text-sm text-green-600 mt-2">
												✓ {kontenFile.name}
											</p>
										)}
										{!kontenFile && editingKonten?.filePath && (
											<p className="text-sm text-gray-600 mt-2">
												📄 File saat ini:{" "}
												{editingKonten.filePath.split("/").pop()}
											</p>
										)}
									</div>
								</div>
							)}
						</div>

						<div className="flex gap-3 mt-6">
							<button
								onClick={() => {
									setShowEditKontenModal(false);
									setEditingKonten(null);
									resetKontenForm();
								}}
								className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
							>
								Batal
							</button>
							<button
								onClick={handleSaveEditKonten}
								disabled={savingEditKonten}
								className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
							>
								{savingEditKonten ? "Menyimpan..." : "Update Konten"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* NOTIFICATION */}
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
