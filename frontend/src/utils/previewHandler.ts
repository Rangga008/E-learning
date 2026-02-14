/**
 * Unified Preview Handler
 * Provides helper functions for displaying different file types in iframe, object tags, or native elements
 */

export interface PreviewOptions {
	width?: string | number;
	height?: string | number;
	className?: string;
	title?: string;
	fallbackText?: string;
}

/**
 * Get the display file path (uses convertedPdfPath if available for Word documents)
 * @param filePath Original file path
 * @param convertedPdfPath Converted PDF path (if available)
 * @param apiUrl API base URL
 * @returns Full URL to display
 */
export const getDisplayUrl = (
	filePath: string | undefined,
	convertedPdfPath: string | undefined,
	apiUrl: string,
): string => {
	if (!filePath) return "";

	// Use converted PDF if available (for Word docs)
	if (convertedPdfPath) {
		return `${apiUrl}${convertedPdfPath}`;
	}

	return `${apiUrl}${filePath}`;
};

/**
 * Get the download file path (always uses original file)
 * @param filePath Original file path
 * @param apiUrl API base URL
 * @returns Full URL to download
 */
export const getDownloadUrl = (
	filePath: string | undefined,
	apiUrl: string,
): string => {
	if (!filePath) return "";
	return `${apiUrl}${filePath}`;
};

/**
 * Create a preview component for PDF files
 * @param displayUrl URL to the PDF
 * @param downloadUrl URL to download original
 * @param fileName Original file name
 * @param options Display options
 * @returns JSX HTML string
 */
export const createPdfPreview = (
	displayUrl: string,
	downloadUrl: string,
	fileName: string,
	options: PreviewOptions = {},
): string => {
	const {
		width = "100%",
		height = "600",
		className = "border border-gray-300 rounded",
		title = fileName,
	} = options;

	return `
		<object
			data="${displayUrl}"
			type="application/pdf"
			width="${width}"
			height="${height}"
			class="${className}"
		>
			<p>
				PDF tidak dapat ditampilkan.
				<a href="${downloadUrl}" download="${fileName}" class="text-blue-600 underline">
					Klik di sini untuk download
				</a>
			</p>
		</object>
	`;
};

/**
 * Create a preview component for images
 * @param displayUrl URL to the image
 * @param fileName Original file name
 * @param options Display options
 * @returns JSX HTML string
 */
export const createImagePreview = (
	displayUrl: string,
	fileName: string,
	options: PreviewOptions = {},
): string => {
	const {
		width = "100%",
		height = "auto",
		className = "",
		title = fileName,
	} = options;

	return `
		<img
			src="${displayUrl}"
			alt="${fileName}"
			width="${width}"
			height="${height}"
			class="${className}"
			title="${title}"
		/>
	`;
};

/**
 * Create a preview component for video files
 * @param displayUrl URL to the video
 * @param fileName Original file name
 * @param options Display options
 * @returns JSX HTML string
 */
export const createVideoPreview = (
	displayUrl: string,
	fileName: string,
	options: PreviewOptions = {},
): string => {
	const {
		width = "100%",
		height = "600",
		className = "border border-gray-300 rounded",
		title = fileName,
	} = options;

	return `
		<video
			width="${width}"
			height="${height}"
			class="${className}"
			controls
			title="${title}"
		>
			<source src="${displayUrl}" />
			Your browser does not support the video tag.
		</video>
	`;
};

/**
 * Create a preview component for YouTube videos
 * @param youtubeUrl YouTube URL or video ID
 * @param fileName Display name
 * @param options Display options
 * @returns JSX HTML string
 */
export const createYoutubePreview = (
	youtubeUrl: string,
	fileName: string,
	options: PreviewOptions = {},
): string => {
	const {
		width = "100%",
		height = "600",
		className = "border border-gray-300 rounded",
		title = fileName,
	} = options;

	const embedUrl = getYoutubeEmbedUrl(youtubeUrl);

	return `
		<iframe
			width="${width}"
			height="${height}"
			src="${embedUrl}"
			class="${className}"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowfullscreen
			title="${title}"
		/>
	`;
};

/**
 * Create a preview component for iframe-based viewers (Google Docs, Microsoft Online)
 * @param displayUrl URL to the document
 * @param fileName Display name
 * @param options Display options
 * @returns JSX HTML string
 */
export const createIframePreview = (
	displayUrl: string,
	fileName: string,
	options: PreviewOptions = {},
): string => {
	const {
		width = "100%",
		height = "600",
		className = "border border-gray-300 rounded",
		title = fileName,
	} = options;

	return `
		<iframe
			src="${displayUrl}"
			width="${width}"
			height="${height}"
			class="${className}"
			title="${title}"
		/>
	`;
};

/**
 * Extract YouTube embed URL from various YouTube URL formats
 * @param url YouTube URL (full URL, short URL, or embed URL)
 * @returns Embed URL
 */
export const getYoutubeEmbedUrl = (url: string): string => {
	let videoId = "";

	if (url.includes("youtube.com/embed/")) {
		return url; // Already embed URL
	}

	if (url.includes("youtube.com")) {
		videoId = new URL(url).searchParams.get("v") || "";
	} else if (url.includes("youtu.be/")) {
		videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
	} else {
		videoId = url; // Assume it's just video ID
	}

	return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

/**
 * Determine file type category for display
 * @param filePath File path or filename
 * @param mimeType MIME type of the file
 * @returns File type category: 'pdf' | 'image' | 'word' | 'video' | 'text' | 'other'
 */
export const getFileTypeCategory = (
	filePath: string | undefined,
	mimeType: string | undefined,
): string => {
	if (!filePath && !mimeType) return "other";

	const fileName = filePath?.split("/").pop()?.toLowerCase() || "";
	const ext = fileName.split(".").pop() || "";
	const mime = (mimeType || "").toLowerCase();

	// PDF
	if (ext === "pdf" || mime.includes("pdf")) return "pdf";

	// Word/Documents
	if (["doc", "docx"].includes(ext) || mime.includes("word")) return "word";

	// Images
	if (
		["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext) ||
		mime.includes("image")
	)
		return "image";

	// Videos
	if (
		["mp4", "avi", "mov", "mkv", "webm", "flv"].includes(ext) ||
		mime.includes("video")
	)
		return "video";

	// Text
	if (["txt", "csv", "json"].includes(ext) || mime.includes("text"))
		return "text";

	// Spreadsheets
	if (["xls", "xlsx"].includes(ext) || mime.includes("spreadsheet"))
		return "spreadsheet";

	// Presentations
	if (["ppt", "pptx"].includes(ext) || mime.includes("presentation"))
		return "presentation";

	return "other";
};

/**
 * Get appropriate preview creator function based on file type
 * @param fileTypeCategory File type category from getFileTypeCategory
 * @returns Preview creator function or null if type not supported
 */
export const getPreviewCreator = (
	fileTypeCategory: string,
):
	| ((
			displayUrl: string,
			downloadUrl?: string,
			fileName?: string,
			options?: PreviewOptions,
	  ) => string)
	| null => {
	switch (fileTypeCategory) {
		case "pdf":
			return (displayUrl, downloadUrl, fileName, options) =>
				createPdfPreview(
					displayUrl,
					downloadUrl || "",
					fileName || "",
					options,
				);
		case "image":
			return (displayUrl, _, fileName, options) =>
				createImagePreview(displayUrl, fileName || "", options);
		case "video":
			return (displayUrl, _, fileName, options) =>
				createVideoPreview(displayUrl, fileName || "", options);
		case "text":
			return (displayUrl, _, fileName, options) =>
				createIframePreview(displayUrl, fileName || "", options);
		default:
			return null;
	}
};
