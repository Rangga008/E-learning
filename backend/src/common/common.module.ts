import { Module } from "@nestjs/common";
import { CacheService } from "./services/cache.service";

/**
 * Common module that provides shared services used across the application
 * Services in this module should be singleton and stateless
 */
@Module({
	providers: [CacheService],
	exports: [CacheService],
})
export class CommonModule {}
