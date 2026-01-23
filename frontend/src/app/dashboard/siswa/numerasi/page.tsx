"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { dashboardService } from "@/services/dashboard.service";

interface Question {
	id: number;
	operand1: number;
	operand2: number;
	operator: string;
	answer: number;
}

export default function NumerasiPage() {
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);

	const [level, setLevel] = useState(1);
	const [topic, setTopic] = useState("Penjumlahan");
	const [questions, setQuestions] = useState<Question[]>([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
	const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [score, setScore] = useState(0);
	const [loading, setLoading] = useState(true);

	// Generate questions based on level
	const generateQuestions = (lvl: number) => {
		const topicMap: Record<number, string> = {
			1: "Penjumlahan",
			2: "Pengurangan",
			3: "Perkalian",
			4: "Pembagian",
			5: "Campuran",
		};

		const currentTopic = topicMap[new Date().getDay()] || "Penjumlahan";
		setTopic(currentTopic);

		const difficultyMap: Record<
			number,
			{ min: number; max: number; operator: string }
		> = {
			1: { min: 1, max: 10, operator: "+" },
			2: { min: 1, max: 20, operator: "-" },
			3: { min: 1, max: 12, operator: "*" },
			4: { min: 2, max: 10, operator: "/" },
			5: { min: 1, max: 20, operator: "mixed" },
		};

		const diff = difficultyMap[lvl] || difficultyMap[1];
		const newQuestions: Question[] = [];

		for (let i = 0; i < 10; i++) {
			const operand1 =
				Math.floor(Math.random() * (diff.max - diff.min + 1)) + diff.min;
			const operand2 =
				Math.floor(Math.random() * (diff.max - diff.min + 1)) + diff.min;

			let operator = diff.operator;
			let answer = 0;

			if (diff.operator === "mixed") {
				operator = ["+", "-", "*"][Math.floor(Math.random() * 3)];
			}

			switch (operator) {
				case "+":
					answer = operand1 + operand2;
					break;
				case "-":
					answer = operand1 - operand2;
					break;
				case "*":
					answer = operand1 * operand2;
					break;
				case "/":
					answer = Math.floor(operand1 / operand2);
					break;
			}

			newQuestions.push({
				id: i + 1,
				operand1,
				operand2,
				operator,
				answer,
			});
		}

		setQuestions(newQuestions);
		setUserAnswers(new Array(newQuestions.length).fill(null));
		setLevel(lvl);
		setLoading(false);
	};

	// Timer countdown
	useEffect(() => {
		generateQuestions(1);
	}, []);

	useEffect(() => {
		if (timeLeft <= 0 || isSubmitted) return;

		const timer = setInterval(() => {
			setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
		}, 1000);

		return () => clearInterval(timer);
	}, [timeLeft, isSubmitted]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	const handleAnswerChange = (index: number, value: number | null) => {
		const newAnswers = [...userAnswers];
		newAnswers[index] = value;
		setUserAnswers(newAnswers);
	};

	const handleSubmit = () => {
		let correct = 0;
		userAnswers.forEach((answer, idx) => {
			if (answer === questions[idx].answer) {
				correct++;
			}
		});

		const percentage = Math.round((correct / questions.length) * 100);
		setScore(percentage);
		setIsSubmitted(true);

		// Save to database
		if (user?.id) {
			dashboardService.submitNumerasiResult(
				user.id,
				level,
				topic,
				correct,
				questions.length - correct,
				percentage,
			);
		}
	};

	const handleLogout = () => {
		authService.logout();
		logout();
		router.push("/");
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				Loading...
			</div>
		);
	}

	if (isSubmitted) {
		const kkm = 90;
		const passed = score >= kkm;

		return (
			<div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
				{/* Header */}
				<div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl shadow-lg p-6 mb-6">
					<div className="flex justify-between items-start">
						<div>
							<h1 className="text-3xl font-bold">Hasil Misi Berhitung</h1>
							<p className="text-blue-100 text-sm mt-1">
								Level {level} • {topic}
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

				{/* Result Card */}
				<div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 mb-6">
					<div className="text-center">
						<div
							className={`text-8xl font-bold mb-4 ${
								passed ? "text-green-500" : "text-red-500"
							}`}
						>
							{score}%
						</div>
						<p className="text-2xl font-bold mb-2">
							{passed ? "🎉 Selamat! Kamu Lulus!" : "⚠️ Belum Mencapai KKM"}
						</p>
						<p className="text-gray-600 mb-6">
							KKM yang diperlukan: {kkm}% | Nilai kamu: {score}%
						</p>

						{/* Score Details */}
						<div className="grid grid-cols-3 gap-4 mb-8">
							<div className="bg-blue-50 rounded-lg p-4">
								<p className="text-gray-600 text-sm">Benar</p>
								<p className="text-2xl font-bold text-blue-600">
									{
										userAnswers.filter((a, i) => a === questions[i].answer)
											.length
									}
									/{questions.length}
								</p>
							</div>
							<div className="bg-red-50 rounded-lg p-4">
								<p className="text-gray-600 text-sm">Salah</p>
								<p className="text-2xl font-bold text-red-600">
									{
										userAnswers.filter((a, i) => a !== questions[i].answer)
											.length
									}
									/{questions.length}
								</p>
							</div>
							<div className="bg-purple-50 rounded-lg p-4">
								<p className="text-gray-600 text-sm">Poin</p>
								<p className="text-2xl font-bold text-purple-600">
									+{Math.floor(score / 10)}
								</p>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-4 justify-center flex-wrap">
							<Link href="/dashboard/siswa">
								<button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 active:scale-95 transition">
									← Kembali ke Dashboard
								</button>
							</Link>
							{!passed && (
								<button
									onClick={() => {
										setIsSubmitted(false);
										setUserAnswers(new Array(questions.length).fill(null));
										setCurrentQuestionIndex(0);
										setTimeLeft(1800);
										generateQuestions(level);
									}}
									className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 active:scale-95 transition"
								>
									🔄 Coba Lagi
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Review Answers */}
				<div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
					<h2 className="text-xl font-bold mb-6">Ulasan Jawaban</h2>
					<div className="space-y-4">
						{questions.map((q, idx) => {
							const isCorrect = userAnswers[idx] === q.answer;
							return (
								<div
									key={q.id}
									className={`p-4 rounded-lg border-2 ${
										isCorrect
											? "border-green-300 bg-green-50"
											: "border-red-300 bg-red-50"
									}`}
								>
									<p className="font-semibold mb-2">
										Soal {q.id}: {q.operand1} {q.operator} {q.operand2}
									</p>
									<p className="text-sm">
										Jawaban kamu:{" "}
										<span className="font-bold">{userAnswers[idx]}</span>
									</p>
									<p className="text-sm">
										Jawaban benar: <span className="font-bold">{q.answer}</span>
									</p>
									<p className="text-sm mt-1">
										{isCorrect ? "✅ Benar" : "❌ Salah"}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		);
	}

	const currentQuestion = questions[currentQuestionIndex];

	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl shadow-lg p-6 mb-6">
				<div className="flex justify-between items-start">
					<div>
						<h1 className="text-3xl font-bold">Misi Berhitung Harian</h1>
						<p className="text-blue-100 text-sm mt-1">
							Level {level} • {topic} • Soal {currentQuestionIndex + 1}/
							{questions.length}
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

			{/* Progress and Timer */}
			<div className="max-w-2xl mx-auto mb-6">
				<div className="bg-white rounded-xl shadow-lg p-4 mb-4">
					<div className="flex justify-between items-center mb-2">
						<span className="font-semibold">Progress</span>
						<span className="text-sm text-gray-600">
							{currentQuestionIndex + 1} dari {questions.length}
						</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-3">
						<div
							className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all"
							style={{
								width: `${
									((currentQuestionIndex + 1) / questions.length) * 100
								}%`,
							}}
						></div>
					</div>
				</div>

				<div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-4 text-center">
					<p className="text-sm opacity-90">Waktu Tersisa</p>
					<p className="text-4xl font-bold font-mono">{formatTime(timeLeft)}</p>
					{timeLeft < 300 && (
						<p className="text-xs mt-2 opacity-75">⚠️ Waktu hampir habis!</p>
					)}
				</div>
			</div>

			{/* Question Card */}
			<div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 mb-6">
				<div className="mb-8">
					<p className="text-gray-600 text-sm mb-2">
						Soal {currentQuestionIndex + 1}
					</p>
					<div className="text-5xl font-bold text-center text-blue-600 mb-4">
						<span>{currentQuestion.operand1}</span>
						<span className="mx-4">{currentQuestion.operator}</span>
						<span>{currentQuestion.operand2}</span>
						<span className="mx-4">=</span>
						<span className="text-gray-400">?</span>
					</div>
				</div>

				{/* Answer Input */}
				<div className="mb-8">
					<label className="block text-gray-700 font-semibold mb-3">
						Jawaban Kamu
					</label>
					<input
						type="number"
						value={userAnswers[currentQuestionIndex] ?? ""}
						onChange={(e) =>
							handleAnswerChange(
								currentQuestionIndex,
								e.target.value ? parseInt(e.target.value) : null,
							)
						}
						placeholder="Masukkan jawaban"
						className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 text-2xl text-center font-semibold"
						autoFocus
					/>
				</div>

				{/* Navigation Buttons */}
				<div className="flex gap-4 justify-between flex-wrap">
					<button
						onClick={() =>
							setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
						}
						disabled={currentQuestionIndex === 0}
						className={`px-6 py-3 rounded-lg font-semibold transition active:scale-95 ${
							currentQuestionIndex === 0
								? "bg-gray-300 text-gray-500 cursor-not-allowed"
								: "bg-gray-400 text-white hover:bg-gray-500 hover:scale-105"
						}`}
					>
						← Sebelumnya
					</button>

					{currentQuestionIndex === questions.length - 1 ? (
						<button
							onClick={handleSubmit}
							className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:scale-105 active:scale-95 transition"
						>
							✓ Selesai & Kirim
						</button>
					) : (
						<button
							onClick={() =>
								setCurrentQuestionIndex(
									Math.min(questions.length - 1, currentQuestionIndex + 1),
								)
							}
							className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:scale-105 active:scale-95 transition"
						>
							Selanjutnya →
						</button>
					)}
				</div>

				{/* Quick Navigation */}
				<div className="mt-8 pt-6 border-t">
					<p className="text-sm font-semibold text-gray-600 mb-3">
						Navigasi Soal
					</p>
					<div className="grid grid-cols-5 gap-2">
						{questions.map((_, idx) => (
							<button
								key={idx}
								onClick={() => setCurrentQuestionIndex(idx)}
								className={`py-2 rounded-lg font-semibold transition ${
									idx === currentQuestionIndex
										? "bg-blue-600 text-white"
										: userAnswers[idx] !== null
										? "bg-green-100 text-green-700 hover:scale-105"
										: "bg-gray-100 text-gray-600 hover:scale-105"
								}`}
							>
								{idx + 1}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
