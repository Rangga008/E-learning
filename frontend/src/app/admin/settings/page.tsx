"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
	ConfirmModal,
	SuccessToast,
	ErrorToast,
} from "@/components/CommonModals";
import { useNotification } from "@/hooks/useNotification";
import { logger } from "@/lib/logger";

interface Level {
	id: number;
	name: string;
	description: string;
}

interface SettingsData {
	id: number;
	appName: string;
	appSlogan: string;
	appLogo: string;
	appIcon: string;
	schoolName: string;
	schoolAddress: string;
	schoolEmail: string;
	schoolPhone: string;
	schoolWebsite: string;
	levels: Level[];
	pointsPerLevel: number;
	pointsPerQuestion: number;
}

export default function SettingsPage() {
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

	const [settings, setSettings] = useState<SettingsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("aplikasi");
	const [editingLevel, setEditingLevel] = useState<Level | null>(null);
	const [showLevelModal, setShowLevelModal] = useState(false);

	useEffect(() => {
		fetchSettings();
	}, []);

	const fetchSettings = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/settings`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			setSettings(response.data.data);
		} catch (error) {
			console.error("Error fetching settings:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSettingsChange = (field: string, value: string | number) => {
		if (settings) {
			setSettings({ ...settings, [field]: value });
		}
	};

	const saveSettings = async () => {
		try {
			await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/settings`, settings, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			logger.success("Save Settings", { appName: settings?.appName });
			showSuccess("Settings berhasil disimpan");
		} catch (error) {
			logger.error("Save Settings", { error });
			showError("Gagal menyimpan settings");
		}
	};

	const openLevelModal = (level?: Level) => {
		if (level) {
			setEditingLevel({ ...level });
		} else {
			setEditingLevel({
				id: Math.max(...(settings?.levels.map((l) => l.id) || [0])) + 1,
				name: "",
				description: "",
			});
		}
		setShowLevelModal(true);
	};

	const saveLevelModal = () => {
		if (!editingLevel || !settings) return;
		if (!editingLevel.name) {
			logger.error("Add Level", { error: "Level name is required" });
			showError("Nama level harus diisi");
			return;
		}

		const levelIndex = settings.levels.findIndex(
			(l) => l.id === editingLevel.id,
		);
		let newLevels;
		if (levelIndex >= 0) {
			newLevels = [...settings.levels];
			newLevels[levelIndex] = editingLevel;
		} else {
			newLevels = [...settings.levels, editingLevel];
		}

		setSettings({ ...settings, levels: newLevels });
		setShowLevelModal(false);
		setEditingLevel(null);
	};

	const deleteLevel = (id: number) => {
		if (!settings) return;
		if (confirm("Yakin ingin menghapus level ini?")) {
			setSettings({
				...settings,
				levels: settings.levels.filter((l) => l.id !== id),
			});
		}
	};

	if (loading) {
		return <div className="p-6 text-center">Loading...</div>;
	}

	if (!settings) {
		return <div className="p-6 text-center">Settings tidak ditemukan</div>;
	}

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-3xl font-bold text-gray-900">⚙️ Settings</h1>

			{/* Tabs */}
			<div className="flex gap-4 border-b border-gray-200">
				<button
					onClick={() => setActiveTab("aplikasi")}
					className={`px-4 py-2 font-medium ${
						activeTab === "aplikasi"
							? "border-b-2 border-blue-600 text-blue-600"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					📱 Aplikasi
				</button>
				<button
					onClick={() => setActiveTab("sekolah")}
					className={`px-4 py-2 font-medium ${
						activeTab === "sekolah"
							? "border-b-2 border-blue-600 text-blue-600"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					🏫 Sekolah
				</button>
				<button
					onClick={() => setActiveTab("level")}
					className={`px-4 py-2 font-medium ${
						activeTab === "level"
							? "border-b-2 border-blue-600 text-blue-600"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					📊 Tingkatan
				</button>
				<button
					onClick={() => setActiveTab("gamifikasi")}
					className={`px-4 py-2 font-medium ${
						activeTab === "gamifikasi"
							? "border-b-2 border-blue-600 text-blue-600"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					🎮 Gamifikasi
				</button>
			</div>

			{/* Tab Content */}
			<div className="bg-white rounded-lg shadow p-6">
				{/* Aplikasi Tab */}
				{activeTab === "aplikasi" && (
					<div className="space-y-4">
						<h2 className="text-xl font-bold mb-4">Pengaturan Aplikasi</h2>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Nama Aplikasi
							</label>
							<input
								type="text"
								value={settings.appName}
								onChange={(e) =>
									handleSettingsChange("appName", e.target.value)
								}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Slogan Aplikasi
							</label>
							<input
								type="text"
								value={settings.appSlogan}
								onChange={(e) =>
									handleSettingsChange("appSlogan", e.target.value)
								}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Logo Aplikasi
							</label>
							<input
								type="text"
								value={settings.appLogo || ""}
								onChange={(e) =>
									handleSettingsChange("appLogo", e.target.value)
								}
								placeholder="Path atau URL logo"
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Icon Aplikasi
							</label>
							<input
								type="text"
								value={settings.appIcon || ""}
								onChange={(e) =>
									handleSettingsChange("appIcon", e.target.value)
								}
								placeholder="Path atau URL icon"
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<button
							onClick={saveSettings}
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							💾 Simpan
						</button>
					</div>
				)}

				{/* Sekolah Tab */}
				{activeTab === "sekolah" && (
					<div className="space-y-4">
						<h2 className="text-xl font-bold mb-4">Pengaturan Sekolah</h2>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Nama Sekolah
							</label>
							<input
								type="text"
								value={settings.schoolName}
								onChange={(e) =>
									handleSettingsChange("schoolName", e.target.value)
								}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Alamat Sekolah
							</label>
							<textarea
								value={settings.schoolAddress}
								onChange={(e) =>
									handleSettingsChange("schoolAddress", e.target.value)
								}
								rows={3}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Email Sekolah
							</label>
							<input
								type="email"
								value={settings.schoolEmail}
								onChange={(e) =>
									handleSettingsChange("schoolEmail", e.target.value)
								}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Telepon Sekolah
							</label>
							<input
								type="text"
								value={settings.schoolPhone}
								onChange={(e) =>
									handleSettingsChange("schoolPhone", e.target.value)
								}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Website Sekolah
							</label>
							<input
								type="url"
								value={settings.schoolWebsite || ""}
								onChange={(e) =>
									handleSettingsChange("schoolWebsite", e.target.value)
								}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<button
							onClick={saveSettings}
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							💾 Simpan
						</button>
					</div>
				)}

				{/* Level Tab */}
				{activeTab === "level" && (
					<div className="space-y-4">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-bold">Pengaturan Tingkatan</h2>
							<button
								onClick={() => openLevelModal()}
								className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
							>
								➕ Tambah Level
							</button>
						</div>

						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200 border">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
											No
										</th>
										<th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
											Nama Level
										</th>
										<th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
											Deskripsi
										</th>
										<th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
											Aksi
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{settings.levels.map((level, index) => (
										<tr key={level.id}>
											<td className="px-6 py-4 text-sm">{index + 1}</td>
											<td className="px-6 py-4 text-sm font-medium">
												{level.name}
											</td>
											<td className="px-6 py-4 text-sm">{level.description}</td>
											<td className="px-6 py-4 text-sm space-x-2">
												<button
													onClick={() => openLevelModal(level)}
													className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
												>
													✏️ Edit
												</button>
												<button
													onClick={() => deleteLevel(level.id)}
													className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
												>
													🗑️ Hapus
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<button
							onClick={saveSettings}
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							💾 Simpan
						</button>
					</div>
				)}

				{/* Gamifikasi Tab */}
				{activeTab === "gamifikasi" && (
					<div className="space-y-4">
						<h2 className="text-xl font-bold mb-4">Pengaturan Gamifikasi</h2>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Poin per Level
							</label>
							<input
								type="number"
								value={settings.pointsPerLevel}
								onChange={(e) =>
									handleSettingsChange(
										"pointsPerLevel",
										parseInt(e.target.value),
									)
								}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Poin per Pertanyaan
							</label>
							<input
								type="number"
								value={settings.pointsPerQuestion}
								onChange={(e) =>
									handleSettingsChange(
										"pointsPerQuestion",
										parseInt(e.target.value),
									)
								}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<button
							onClick={saveSettings}
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							💾 Simpan
						</button>
					</div>
				)}
			</div>

			{/* Level Modal */}
			{showLevelModal && editingLevel && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-8 max-w-md w-full">
						<h2 className="text-2xl font-bold mb-4">
							{settings.levels.find((l) => l.id === editingLevel.id)
								? "✏️ Edit Level"
								: "➕ Tambah Level"}
						</h2>
						<div className="space-y-4">
							<input
								type="text"
								placeholder="Nama Level"
								value={editingLevel.name}
								onChange={(e) =>
									setEditingLevel({ ...editingLevel, name: e.target.value })
								}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<textarea
								placeholder="Deskripsi"
								value={editingLevel.description}
								onChange={(e) =>
									setEditingLevel({
										...editingLevel,
										description: e.target.value,
									})
								}
								rows={3}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div className="flex gap-2 mt-6">
							<button
								onClick={() => setShowLevelModal(false)}
								className="flex-1 px-3 py-2 border rounded hover:bg-gray-100"
							>
								Batal
							</button>
							<button
								onClick={saveLevelModal}
								className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
							>
								Simpan
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
