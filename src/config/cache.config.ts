import { CacheModuleOptions } from '@nestjs/cache-manager';

export const cacheConfig: CacheModuleOptions = {
  ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 5 * 60,
  max: process.env.CACHE_MAX ? parseInt(process.env.CACHE_MAX) : 100,
};