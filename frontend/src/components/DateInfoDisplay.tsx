"use client";

import { formatTanggal, isDeadlinePassed } from "@/utils/dateFormat";

interface DateInfoDisplayProps {
	tanggalBuka: string;
	tanggalDeadline?: string;
	submittedAt?: string;
	isStudent?: boolean;
}

export const DateInfoDisplay = ({
	tanggalBuka,
	tanggalDeadline,
	submittedAt,
	isStudent = false,
}: DateInfoDisplayProps) => {
	const deadlinePassed = tanggalDeadline
		? isDeadlinePassed(tanggalDeadline)
		: false;
	const submissionLate =
		submittedAt &&
		tanggalDeadline &&
		new Date(submittedAt) > new Date(tanggalDeadline);
	return (
		<div className="space-y-3">
			{/* Tanggal Buka */}
			<div className="flex items-start gap-3">
				<span className="text-2xl">📅</span>
				<div className="flex-1">
					<p className="text-sm text-gray-600 font-semibold">Tanggal Buka</p>
					<p className="text-gray-900">{formatTanggal(tanggalBuka)}</p>
				</div>
			</div>

			{/* Deadline */}
			{tanggalDeadline && (
				<div className="flex items-start gap-3">
					<span className={`text-2xl ${deadlinePassed ? "opacity-50" : ""}`}>
						⏰
					</span>
					<div className="flex-1">
						<p className="text-sm text-gray-600 font-semibold">Deadline</p>
						<p
							className={`font-medium ${
								deadlinePassed ? "text-red-600" : "text-gray-900"
							}`}
						>
							{formatTanggal(tanggalDeadline)}
							{deadlinePassed && (
								<span className="ml-2 text-red-600 font-bold">(Terlewat)</span>
							)}
						</p>
					</div>
				</div>
			)}

			{/* Submitted At */}
			{isStudent && submittedAt && (
				<div className="flex items-start gap-3">
					<span
						className={`text-2xl ${
							submissionLate ? "text-red-600" : "text-green-600"
						}`}
					>
						{submissionLate ? "🔴" : "✅"}
					</span>
					<div className="flex-1">
						<p className="text-sm text-gray-600 font-semibold">
							{submissionLate ? "Dikerjakan (Terlambat)" : "Dikerjakan"}
						</p>
						<p
							className={`font-medium ${
								submissionLate ? "text-red-600" : "text-green-600"
							}`}
						>
							{formatTanggal(submittedAt)}
						</p>
					</div>
				</div>
			)}
		</div>
	);
};
