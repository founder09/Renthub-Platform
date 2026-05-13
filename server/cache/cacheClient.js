/**
 * Cache Client — Redis-first with in-memory fallback (node-cache).
 *
 * If REDIS_URL is set and Redis is reachable → uses Redis.
 * Otherwise → falls back to in-memory node-cache so the app never crashes.
 *
 * Usage:
 *   const cache = require('./cacheClient');
 *   await cache.set('key', data, 300);   // TTL in seconds
 *   const val = await cache.get('key');  // null if miss
 *   await cache.del('key');
 *   await cache.delPattern('listings:*');
 */

const NodeCache = require('node-cache');

// In-memory fallback (always available)
const memCache = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false });

let redisClient = null;
let useRedis = false;

// ── Try connecting to Redis ───────────────────────────────────────────────────
if (process.env.REDIS_URL) {
  try {
    const Redis = require('ioredis');
    redisClient = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy: (times) => (times > 3 ? null : times * 200),
      maxRetriesPerRequest: 1,
    });

    redisClient.on('connect', () => {
      useRedis = true;
      console.log('✅ Redis connected — using Redis cache');
    });
    redisClient.on('error', (err) => {
      if (useRedis) console.warn('[Cache] Redis error — falling back to memory:', err.message);
      useRedis = false;
    });

    redisClient.connect().catch(() => {
      useRedis = false;
      console.warn('[Cache] Redis unavailable — using in-memory cache');
    });
  } catch {
    console.warn('[Cache] ioredis init failed — using in-memory cache');
  }
} else {
  console.log('[Cache] No REDIS_URL — using in-memory cache (node-cache)');
}

// ── Public API ────────────────────────────────────────────────────────────────
const cache = {
  async get(key) {
    try {
      if (useRedis) {
        const val = await redisClient.get(key);
        return val ? JSON.parse(val) : null;
      }
      const val = memCache.get(key);
      return val !== undefined ? val : null;
    } catch {
      return null;
    }
  },

  async set(key, value, ttlSeconds = 300) {
    try {
      if (useRedis) {
        await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
      } else {
        memCache.set(key, value, ttlSeconds);
      }
    } catch { /* ignore */ }
  },

  async del(key) {
    try {
      if (useRedis) await redisClient.del(key);
      else memCache.del(key);
    } catch { /* ignore */ }
  },

  /**
   * Delete all keys matching a prefix pattern (e.g. 'analytics:*').
   * For in-memory cache, scans all keys.
   */
  async delPattern(pattern) {
    try {
      const prefix = pattern.replace('*', '');
      if (useRedis) {
        const keys = await redisClient.keys(pattern);
        if (keys.length) await redisClient.del(...keys);
      } else {
        const keys = memCache.keys().filter(k => k.startsWith(prefix));
        memCache.del(keys);
      }
    } catch { /* ignore */ }
  },

  async flush() {
    try {
      if (useRedis) await redisClient.flushdb();
      else memCache.flushAll();
    } catch { /* ignore */ }
  },
};

module.exports = cache;
