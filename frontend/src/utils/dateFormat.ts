/**
 * Format tanggal untuk tampilan
 */
export const formatTanggal = (dateStr: string | Date): string => {
	if (!dateStr) return "-";
	const date = new Date(dateStr);
	return date.toLocaleDateString("id-ID", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

/**
 * Format tanggal ringkas
 */
export const formatTanggalRingkas = (dateStr: string | Date): string => {
	if (!dateStr) return "-";
	const date = new Date(dateStr);
	return date.toLocaleDateString("id-ID", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
};

/**
 * Check apakah sudah bisa dikerjakan (tanggalBuka sudah lewat)
 */
export const canWorkNow = (tanggalBuka: string | Date): boolean => {
	const openDate = new Date(tanggalBuka);
	return new Date() >= openDate;
};

/**
 * Check apakah deadline sudah lewat
 */
export const isDeadlinePassed = (tanggalDeadline: string | Date): boolean => {
	if (!tanggalDeadline) return false;
	const deadline = new Date(tanggalDeadline);
	return new Date() > deadline;
};

/**
 * Get waktu tersisa sampai deadline
 */
export const getTimeRemaining = (tanggalDeadline: string | Date) => {
	if (!tanggalDeadline) return null;

	const deadline = new Date(tanggalDeadline);
	const now = new Date();
	const diff = deadline.getTime() - now.getTime();

	if (diff <= 0) {
		return {
			isPassed: true,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			text: "Deadline telah lewat",
		};
	}

	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
	const minutes = Math.floor((diff / 1000 / 60) % 60);
	const seconds = Math.floor((diff / 1000) % 60);

	return {
		isPassed: false,
		days,
		hours,
		minutes,
		seconds,
		text: `${days} hari ${hours} jam ${minutes} menit`,
	};
};

/**
 * Format status badge color
 */
export const getStatusColor = (
	status: "DRAFT" | "PUBLISHED" | "CLOSED" | string,
): { bg: string; text: string; icon: string } => {
	switch (status) {
		case "DRAFT":
			return {
				bg: "bg-yellow-100",
				text: "text-yellow-800",
				icon: "📝",
			};
		case "PUBLISHED":
			return {
				bg: "bg-green-100",
				text: "text-green-800",
				icon: "🚀",
			};
		case "CLOSED":
			return {
				bg: "bg-red-100",
				text: "text-red-800",
				icon: "🔒",
			};
		default:
			return {
				bg: "bg-gray-100",
				text: "text-gray-800",
				icon: "❓",
			};
	}
};
