/**
 * Tiny in-memory TTL cache for read-heavy tourism endpoints.
 *
 * The interface mirrors what a Redis adapter would expose (get/set/del),
 * so swapping in Upstash/ioredis in production is a drop-in change.
 */

interface Entry<T> {
  value: T;
  expiresAt: number;
}

export class TTLCache {
  private store = new Map<string, Entry<unknown>>();

  constructor(private defaultTtlMs = 60_000) {}

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  /** Wrap a loader with caching — memoizes until TTL expiry. */
  async memo<T>(key: string, loader: () => Promise<T>, ttlMs?: number): Promise<T> {
    const hit = this.get<T>(key);
    if (hit !== null) return hit;
    const value = await loader();
    this.set(key, value, ttlMs);
    return value;
  }
}

export const contentCache = new TTLCache(5 * 60_000); // 5 min for content
