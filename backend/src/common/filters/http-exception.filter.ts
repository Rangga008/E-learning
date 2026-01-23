import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	private logger = new Logger("HttpExceptionFilter");

	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception.getStatus();
		const exceptionResponse = exception.getResponse();

		this.logger.error(`[${status}] ${exception.message}`);

		const errorResponse = {
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: ctx.getRequest().url,
			message: exceptionResponse["message"] || exception.message,
			error: exceptionResponse["error"] || "Internal Server Error",
		};

		response.status(status).json(errorResponse);
	}
}
