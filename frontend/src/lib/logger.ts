// Logger utility untuk debugging dan tracking
export enum LogLevel {
	DEBUG = "DEBUG",
	INFO = "INFO",
	WARN = "WARN",
	ERROR = "ERROR",
	SUCCESS = "SUCCESS",
}

interface LogEntry {
	timestamp: string;
	level: LogLevel;
	action: string;
	details?: any;
	error?: any;
}

class Logger {
	private logs: LogEntry[] = [];
	private maxLogs = 100; // Simpan max 100 logs di memory

	log(level: LogLevel, action: string, details?: any, error?: any): LogEntry {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			action,
			details,
			error,
		};

		this.logs.push(entry);

		// Keep only last maxLogs entries
		if (this.logs.length > this.maxLogs) {
			this.logs.shift();
		}

		// Console output dengan styling
		const colors: Record<LogLevel, string> = {
			[LogLevel.DEBUG]: "#808080",
			[LogLevel.INFO]: "#0066cc",
			[LogLevel.WARN]: "#ff9900",
			[LogLevel.ERROR]: "#cc0000",
			[LogLevel.SUCCESS]: "#009900",
		};

		const color = colors[level];
		const time = new Date().toLocaleTimeString();

		console.log(
			`%c[${time}] ${level}`,
			`color: ${color}; font-weight: bold;`,
			`${action}`,
			details ? details : "",
		);

		if (error) {
			console.error("Error details:", error);
		}

		return entry;
	}

	debug(action: string, details?: any) {
		return this.log(LogLevel.DEBUG, action, details);
	}

	info(action: string, details?: any) {
		return this.log(LogLevel.INFO, action, details);
	}

	warn(action: string, details?: any) {
		return this.log(LogLevel.WARN, action, details);
	}

	error(action: string, error?: any, details?: any) {
		return this.log(LogLevel.ERROR, action, details, error);
	}

	success(action: string, details?: any) {
		return this.log(LogLevel.SUCCESS, action, details);
	}

	// Get all logs
	getLogs(): LogEntry[] {
		return [...this.logs];
	}

	// Get logs by level
	getLogsByLevel(level: LogLevel): LogEntry[] {
		return this.logs.filter((log) => log.level === level);
	}

	// Clear logs
	clear() {
		this.logs = [];
		console.log("Logs cleared");
	}

	// Export logs as JSON
	exportLogs(): string {
		return JSON.stringify(this.logs, null, 2);
	}

	// Print logs to console
	printLogs() {
		console.table(this.logs);
	}
}

export const logger = new Logger();
