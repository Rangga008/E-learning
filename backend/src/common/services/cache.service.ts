import { Injectable } from "@nestjs/common";

/**
 * Simple in-memory cache service for storing frequently accessed data
 * Provides TTL (time-to-live) support for automatic cache invalidation
 */
@Injectable()
export class CacheService {
	private cache = new Map<string, { data: any; expiresAt: number }>();

	/**
	 * Get cached data
	 * @param key Cache key
	 * @returns Cached data or null if expired or not found
	 */
	get(key: string): any {
		const item = this.cache.get(key);

		if (!item) {
			return null;
		}

		// Check if expired
		if (item.expiresAt < Date.now()) {
			this.cache.delete(key);
			return null;
		}

		return item.data;
	}

	/**
	 * Set cached data with optional TTL
	 * @param key Cache key
	 * @param data Data to cache
	 * @param ttlSeconds Time-to-live in seconds (default: 1 hour)
	 */
	set(key: string, data: any, ttlSeconds: number = 3600): void {
		this.cache.set(key, {
			data,
			expiresAt: Date.now() + ttlSeconds * 1000,
		});
	}

	/**
	 * Clear specific cache entry
	 * @param key Cache key
	 */
	invalidate(key: string): void {
		this.cache.delete(key);
	}

	/**
	 * Clear all cache entries matching a pattern
	 * @param pattern Pattern to match (uses includes)
	 */
	invalidatePattern(pattern: string): void {
		for (const key of this.cache.keys()) {
			if (key.includes(pattern)) {
				this.cache.delete(key);
			}
		}
	}

	/**
	 * Clear all cache entries
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Get cache size
	 */
	size(): number {
		return this.cache.size;
	}
}

/**
 * Cache key constants for common queries
 */
export const CACHE_KEYS = {
	// Mata Pelajaran (Subjects)
	ALL_MAPEL: "all:mapel",
	MAPEL_BY_ID: (id: number) => `mapel:${id}`,

	// Kelas (Classes)
	ALL_KELAS: "all:kelas",
	KELAS_BY_ID: (id: number) => `kelas:${id}`,

	// Guru
	ALL_GURU: "all:guru",
	GURU_BY_ID: (id: number) => `guru:${id}`,
	GURU_MAPEL: (guruId: number) => `guru:${guruId}:mapel`,

	// Status lists
	MATERI_STATUS: "enum:materi:status",
	TUGAS_STATUS: "enum:tugas:status",

	// Student stats (per student)
	SISWA_STATS: (siswaId: number) => `siswa:${siswaId}:stats`,
	SISWA_NILAI: (siswaId: number) => `siswa:${siswaId}:nilai`,

	// Notifications (per student)
	NOTIFIKASI_COUNT: (siswaId: number) => `notifikasi:${siswaId}:count`,
};
