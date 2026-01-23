/**
 * Logger utility for consistent logging across the application
 * Provides color-coded console output with different log levels
 */

type LogLevel = "DEBUG" | "INFO" | "SUCCESS" | "ERROR";

interface LogEntry {
	timestamp: string;
	level: LogLevel;
	action: string;
	details?: any;
}

const colors = {
	DEBUG: "\x1b[36m", // Cyan
	INFO: "\x1b[34m", // Blue
	SUCCESS: "\x1b[32m", // Green
	ERROR: "\x1b[31m", // Red
	RESET: "\x1b[0m",
	DIM: "\x1b[2m",
};

const formatLog = (entry: LogEntry): string => {
	const color = colors[entry.level];
	const timestamp = `[${entry.timestamp}]`;
	const level = `${entry.level}`;
	const action = `${entry.action}`;

	let message = `${color}${timestamp} ${level}: ${action}${colors.RESET}`;

	if (entry.details) {
		message += `\n${colors.DIM}${JSON.stringify(entry.details, null, 2)}${
			colors.RESET
		}`;
	}

	return message;
};

const createLogEntry = (
	level: LogLevel,
	action: string,
	details?: any,
): LogEntry => {
	return {
		timestamp: new Date().toISOString(),
		level,
		action,
		details,
	};
};

export const logger = {
	debug: (action: string, details?: any) => {
		const entry = createLogEntry("DEBUG", action, details);
		console.log(formatLog(entry));
	},

	info: (action: string, details?: any) => {
		const entry = createLogEntry("INFO", action, details);
		console.log(formatLog(entry));
	},

	success: (action: string, details?: any) => {
		const entry = createLogEntry("SUCCESS", action, details);
		console.log(formatLog(entry));
	},

	error: (action: string, details?: any) => {
		const entry = createLogEntry("ERROR", action, details);
		console.error(formatLog(entry));
	},
};
