import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Global validation pipe - disabled for now due to class-validator metadata issues
	// app.useGlobalPipes(
	// 	new ValidationPipe({
	// 		whitelist: true,
	// 		forbidNonWhitelisted: true,
	// 	}),
	// );

	// CORS configuration
	app.enableCors({
		origin: process.env.FRONTEND_URL || "http://localhost:3001",
		credentials: true,
	});

	// Global prefix
	app.setGlobalPrefix("api");

	const port = process.env.APP_PORT || 3000;
	await app.listen(port);
	console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
	console.error("Error starting application:", err);
	process.exit(1);
});
