"use client";

import {
	formatTanggal,
	getTimeRemaining,
	isDeadlinePassed,
} from "@/utils/dateFormat";

interface TaskDetailHeaderProps {
	title: string;
	description?: string;
	status?: "DRAFT" | "PUBLISHED" | "CLOSED";
	tanggalBuka: string;
	tanggalDeadline?: string;
	onEditClick?: () => void;
}

export const TaskDetailHeader = ({
	title,
	description,
	status = "PUBLISHED",
	tanggalBuka,
	tanggalDeadline,
	onEditClick,
}: TaskDetailHeaderProps) => {
	const timeRemaining = tanggalDeadline
		? getTimeRemaining(tanggalDeadline)
		: null;
	const deadlinePassed = tanggalDeadline
		? isDeadlinePassed(tanggalDeadline)
		: false;

	const getStatusIcon = () => {
		switch (status) {
			case "DRAFT":
				return <span className="text-2xl mr-2">📝</span>;
			case "PUBLISHED":
				return <span className="text-2xl mr-2">🚀</span>;
			case "CLOSED":
				return <span className="text-2xl mr-2">🔒</span>;
			default:
				return null;
		}
	};

	const getStatusLabel = () => {
		switch (status) {
			case "DRAFT":
				return "Draft";
			case "PUBLISHED":
				return "Published";
			case "CLOSED":
				return "Closed";
			default:
				return "";
		}
	};

	const getStatusColor = () => {
		switch (status) {
			case "DRAFT":
				return "bg-yellow-500";
			case "PUBLISHED":
				return "bg-green-500";
			case "CLOSED":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	return (
		<div className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg p-6 mb-6">
			{/* Header Top - Title dan Status */}
			<div className="flex items-start justify-between mb-4">
				<div className="flex-1">
					<div className="flex items-center gap-3 mb-2">
						{getStatusIcon()}
						<h1 className="text-3xl font-bold">{title}</h1>
					</div>
					{description && (
						<p className="text-purple-100 text-sm mt-2 line-clamp-2">
							{description}
						</p>
					)}
				</div>
				<div className="ml-4 flex items-start gap-2">
					{onEditClick && (
						<button
							onClick={onEditClick}
							className="bg-white hover:bg-purple-100 text-purple-600 px-3 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap"
						>
							✏️ Edit
						</button>
					)}
					<div className="text-purple-200 text-xs font-semibold uppercase tracking-wide">
						📅 Tanggal Buka
					</div>
					<div className="text-white font-medium mt-1">
						{formatTanggal(tanggalBuka)}
					</div>
				</div>

				{tanggalDeadline && (
					<div>
						<div className="text-purple-200 text-xs font-semibold uppercase tracking-wide">
							⏰ Deadline
						</div>
						<div
							className={`font-medium mt-1 ${
								deadlinePassed ? "text-red-200" : "text-white"
							}`}
						>
							{formatTanggal(tanggalDeadline)}
						</div>
						{timeRemaining && (
							<div className="text-purple-200 text-xs mt-1">
								{timeRemaining.isPassed ? (
									<span className="text-red-200">❌ Deadline telah lewat</span>
								) : (
									<span>⏳ Sisa: {timeRemaining.text}</span>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
