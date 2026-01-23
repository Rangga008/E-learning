export default () => ({
	app: {
		port: parseInt(process.env.APP_PORT, 10) || 3000,
		env: process.env.NODE_ENV || "development",
	},
	database: {
		host: process.env.DB_HOST || "localhost",
		port: parseInt(process.env.DB_PORT, 10) || 3306,
		username: process.env.DB_USERNAME || "root",
		password: process.env.DB_PASSWORD || "",
		database: process.env.DB_DATABASE || "lms_sanggar_belajar",
		synchronize: process.env.NODE_ENV !== "production",
		logging: false,
	},
	jwt: {
		secret: process.env.JWT_SECRET || "your_jwt_secret_key_here",
		expiresIn: process.env.JWT_EXPIRATION || "24h",
	},
	file: {
		maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,
		uploadDir: process.env.UPLOAD_DIR || "./uploads",
	},
	timezone: process.env.TZ || "Asia/Jakarta",
});
