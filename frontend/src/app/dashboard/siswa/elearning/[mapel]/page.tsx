"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";

interface Task {
	id: number;
	title: string;
	description: string;
	dueDate: string;
	status: "pending" | "submitted" | "graded";
	score?: number;
	type: "essay" | "pilihan" | "upload";
}

const mapelData: Record<
	string,
	{ id: number; name: string; color: string; description: string }
> = {
	"1": {
		id: 1,
		name: "Pendidikan Pancasila",
		color: "red",
		description: "Memahami nilai-nilai Pancasila dan implementasinya",
	},
	"2": {
		id: 2,
		name: "Bahasa Indonesia",
		color: "blue",
		description: "Mengembangkan kemampuan berbahasa dan bersastra",
	},
	"3": {
		id: 3,
		name: "Matematika",
		color: "purple",
		description: "Pemahaman konsep dan problem solving matematika",
	},
	"4": {
		id: 4,
		name: "IPAS",
		color: "green",
		description: "Ilmu Pengetahuan Alam dan Sosial",
	},
	"5": {
		id: 5,
		name: "Bahasa Inggris",
		color: "orange",
		description: "English language learning",
	},
	"6": {
		id: 6,
		name: "Seni Musik",
		color: "pink",
		description: "Apresiasi dan kreasi seni musik",
	},
};

export default function ELearningDetailPage() {
	const router = useRouter();
	const params = useParams();
	const mapel = params.mapel as string;
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);

	const mapelInfo = mapelData[mapel] || mapelData["1"];

	const [tasks, setTasks] = useState<Task[]>([
		{
			id: 1,
			title: "Esai: Penerapan Nilai Gotong Royong",
			description:
				"Tuliskan esai tentang bagaimana nilai gotong royong diterapkan dalam kehidupan sehari-hari",
			dueDate: "2025-01-25",
			status: "pending",
			type: "essay",
		},
		{
			id: 2,
			title: "Quiz: Pancasila dan Ideologi",
			description: "Jawab 20 soal pilihan ganda tentang Pancasila",
			dueDate: "2025-01-24",
			status: "submitted",
			type: "pilihan",
		},
		{
			id: 3,
			title: "Proyek: Video Pendek",
			description:
				"Buat video pendek (max 2 menit) tentang nilai-nilai Pancasila",
			dueDate: "2025-01-28",
			status: "graded",
			score: 95,
			type: "upload",
		},
	]);

	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [showSubmitModal, setShowSubmitModal] = useState(false);
	const [submissionAnswer, setSubmissionAnswer] = useState("");

	const handleLogout = () => {
		authService.logout();
		logout();
		router.push("/");
	};

	const colorMap: Record<string, string> = {
		red: "from-red-500 to-red-600",
		blue: "from-blue-500 to-blue-600",
		purple: "from-purple-500 to-purple-600",
		green: "from-green-500 to-green-600",
		orange: "from-orange-500 to-orange-600",
		pink: "from-pink-500 to-pink-600",
	};

	const getStatusStyle = (status: string) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-700 border border-yellow-300";
			case "submitted":
				return "bg-blue-100 text-blue-700 border border-blue-300";
			case "graded":
				return "bg-green-100 text-green-700 border border-green-300";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "pending":
				return "⏳ Belum Dikerjakan";
			case "submitted":
				return "📤 Sudah Dikumpulkan";
			case "graded":
				return "✓ Sudah Dinilai";
			default:
				return "Status";
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "essay":
				return "✍️";
			case "pilihan":
				return "📝";
			case "upload":
				return "📤";
			default:
				return "📋";
		}
	};

	const handleSubmit = () => {
		if (selectedTask && submissionAnswer.trim()) {
			// Update task status
			const updatedTasks = tasks.map((t) =>
				t.id === selectedTask.id ? { ...t, status: "submitted" as const } : t,
			);
			setTasks(updatedTasks);
			setSelectedTask(null);
			setShowSubmitModal(false);
			setSubmissionAnswer("");
		}
	};

	return (
		<div
			className={`min-h-screen bg-gradient-to-b from-${mapelInfo.color}-50 to-${mapelInfo.color}-100 p-4`}
		>
			{/* Header */}
			<div
				className={`bg-gradient-to-r ${
					colorMap[mapelInfo.color]
				} text-white rounded-2xl shadow-lg p-6 mb-6`}
			>
				<div className="flex justify-between items-start">
					<div>
						<Link
							href="/dashboard/siswa"
							className="text-blue-100 text-sm hover:underline"
						>
							← Kembali ke Dashboard
						</Link>
						<h1 className="text-3xl font-bold mt-2">{mapelInfo.name}</h1>
						<p className="text-white opacity-90 text-sm mt-1">
							{mapelInfo.description}
						</p>
					</div>
					<button
						onClick={handleLogout}
						className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition active:scale-95"
					>
						🚪 Logout
					</button>
				</div>
			</div>

			{/* Statistics */}
			<div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
				<div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-400">
					<p className="text-gray-600 text-sm">Belum Dikerjakan</p>
					<p className="text-3xl font-bold text-yellow-600">
						{tasks.filter((t) => t.status === "pending").length}
					</p>
				</div>
				<div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-400">
					<p className="text-gray-600 text-sm">Sudah Dikumpulkan</p>
					<p className="text-3xl font-bold text-blue-600">
						{tasks.filter((t) => t.status === "submitted").length}
					</p>
				</div>
				<div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-400">
					<p className="text-gray-600 text-sm">Sudah Dinilai</p>
					<p className="text-3xl font-bold text-green-600">
						{tasks.filter((t) => t.status === "graded").length}
					</p>
				</div>
			</div>

			{/* Tasks List */}
			<div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
				<h2 className="text-2xl font-bold mb-6">Tugas & Materi</h2>

				<div className="space-y-4">
					{tasks.map((task) => (
						<div
							key={task.id}
							className={`p-5 rounded-xl border-2 border-gray-200 hover:shadow-lg transition cursor-pointer ${
								selectedTask?.id === task.id ? "border-blue-500 bg-blue-50" : ""
							}`}
							onClick={() => setSelectedTask(task)}
						>
							<div className="flex justify-between items-start mb-3">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<span className="text-2xl">{getTypeIcon(task.type)}</span>
										<h3 className="text-lg font-bold">{task.title}</h3>
									</div>
									<p className="text-gray-600 text-sm">{task.description}</p>
								</div>
								<span
									className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${getStatusStyle(
										task.status,
									)}`}
								>
									{getStatusText(task.status)}
								</span>
							</div>

							<div className="flex justify-between items-center">
								<div className="text-sm text-gray-500">
									📅 Deadline: {task.dueDate}
								</div>
								{task.score && (
									<div className="text-lg font-bold text-green-600">
										Nilai: {task.score}
									</div>
								)}
							</div>

							{selectedTask?.id === task.id && (
								<div className="mt-4 pt-4 border-t border-gray-200">
									<button
										onClick={(e) => {
											e.stopPropagation();
											setShowSubmitModal(true);
										}}
										disabled={task.status !== "pending"}
										className={`px-4 py-2 rounded-lg font-semibold transition ${
											task.status !== "pending"
												? "bg-gray-300 text-gray-500 cursor-not-allowed"
												: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 active:scale-95"
										}`}
									>
										{task.status === "pending"
											? "📤 Kumpulkan Jawaban"
											: task.status === "submitted"
											? "⏳ Menunggu Penilaian"
											: "✓ Sudah Dinilai"}
									</button>
								</div>
							)}
						</div>
					))}
				</div>

				{tasks.length === 0 && (
					<div className="text-center py-12">
						<p className="text-gray-500 text-lg">
							Tidak ada tugas untuk mata pelajaran ini
						</p>
					</div>
				)}
			</div>

			{/* Submit Modal */}
			{showSubmitModal && selectedTask && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
						<div className="p-6">
							<div className="flex justify-between items-start mb-4">
								<h2 className="text-2xl font-bold">Kumpulkan Jawaban</h2>
								<button
									onClick={() => setShowSubmitModal(false)}
									className="text-2xl text-gray-400 hover:text-gray-600"
								>
									✕
								</button>
							</div>

							<p className="text-gray-600 mb-4">{selectedTask.title}</p>

							{selectedTask.type === "essay" && (
								<textarea
									value={submissionAnswer}
									onChange={(e) => setSubmissionAnswer(e.target.value)}
									placeholder="Tuliskan jawaban esai Anda di sini..."
									className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mb-4"
									rows={8}
									autoFocus
								/>
							)}

							{selectedTask.type === "pilihan" && (
								<div className="space-y-3 mb-4">
									<label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50">
										<input type="radio" name="answer" value="A" />
										<span>Pilihan A</span>
									</label>
									<label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50">
										<input type="radio" name="answer" value="B" />
										<span>Pilihan B</span>
									</label>
									<label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50">
										<input type="radio" name="answer" value="C" />
										<span>Pilihan C</span>
									</label>
									<label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50">
										<input type="radio" name="answer" value="D" />
										<span>Pilihan D</span>
									</label>
								</div>
							)}

							{selectedTask.type === "upload" && (
								<div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center mb-4">
									<input
										type="file"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												setSubmissionAnswer(file.name);
											}
										}}
										className="hidden"
										id="file-upload"
									/>
									<label htmlFor="file-upload" className="cursor-pointer">
										<p className="text-gray-600">
											📁 Pilih file untuk diupload
										</p>
										{submissionAnswer && (
											<p className="text-blue-600 font-semibold mt-2">
												{submissionAnswer}
											</p>
										)}
									</label>
								</div>
							)}

							<div className="flex gap-3">
								<button
									onClick={() => setShowSubmitModal(false)}
									className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
								>
									Batal
								</button>
								<button
									onClick={handleSubmit}
									disabled={!submissionAnswer.trim()}
									className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
								>
									✓ Kirim Jawaban
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
