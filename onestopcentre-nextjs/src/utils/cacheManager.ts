export interface CacheItem<T = unknown> {
  data: T;
  timestamp: number;
  expiry: number;
  key: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}

class CacheManager {
  private memoryCache = new Map<string, CacheItem>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 100;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupInterval();
    this.loadFromStorage();
  }

  /**
   * Set an item in the cache
   */
  public set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): void {
    const { ttl = this.defaultTTL, storage = 'memory' } = options;
    const timestamp = Date.now();
    const expiry = timestamp + ttl;

    const cacheItem: CacheItem<T> = {
      data,
      timestamp,
      expiry,
      key
    };

    switch (storage) {
      case 'memory':
        this.setMemoryCache(key, cacheItem);
        break;
      case 'localStorage':
        this.setLocalStorageCache(key, cacheItem);
        break;
      case 'sessionStorage':
        this.setSessionStorageCache(key, cacheItem);
        break;
    }
  }

  /**
   * Get an item from the cache
   */
  public get<T>(
    key: string, 
    storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'
  ): T | null {
    let cacheItem: CacheItem<T> | null = null;

    switch (storage) {
      case 'memory':
        cacheItem = this.getMemoryCache<T>(key);
        break;
      case 'localStorage':
        cacheItem = this.getLocalStorageCache<T>(key);
        break;
      case 'sessionStorage':
        cacheItem = this.getSessionStorageCache<T>(key);
        break;
    }

    if (!cacheItem) {
      return null;
    }

    // Check if item has expired
    if (Date.now() > cacheItem.expiry) {
      this.delete(key, storage);
      return null;
    }

    return cacheItem.data;
  }

  /**
   * Delete an item from the cache
   */
  public delete(
    key: string, 
    storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'
  ): boolean {
    switch (storage) {
      case 'memory':
        return this.memoryCache.delete(key);
      case 'localStorage':
        return this.deleteFromWebStorage(key, localStorage);
      case 'sessionStorage':
        return this.deleteFromWebStorage(key, sessionStorage);
      default:
        return false;
    }
  }

  /**
   * Check if an item exists and is not expired
   */
  public has(
    key: string, 
    storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'
  ): boolean {
    return this.get(key, storage) !== null;
  }

  /**
   * Clear all items from a specific storage
   */
  public clear(storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'): void {
    switch (storage) {
      case 'memory':
        this.memoryCache.clear();
        break;
      case 'localStorage':
        this.clearWebStorage(localStorage);
        break;
      case 'sessionStorage':
        this.clearWebStorage(sessionStorage);
        break;
    }
  }

  /**
   * Get or set pattern - get item if exists, otherwise set and return
   */
  public async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T> | T,
    options: CacheOptions = {}
  ): Promise<T> {
    const { storage = 'memory' } = options;
    
    // Try to get from cache first
    const cached = this.get<T>(key, storage);
    if (cached !== null) {
      return cached;
    }

    // Fetch data and cache it
    const data = await fetchFunction();
    this.set(key, data, options);
    return data;
  }

  /**
   * Invalidate cache items by pattern
   */
  public invalidatePattern(pattern: string, storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'): void {
    const regex = new RegExp(pattern);

    switch (storage) {
      case 'memory':
        for (const key of this.memoryCache.keys()) {
          if (regex.test(key)) {
            this.memoryCache.delete(key);
          }
        }
        break;
      case 'localStorage':
        this.invalidateWebStoragePattern(localStorage, regex);
        break;
      case 'sessionStorage':
        this.invalidateWebStoragePattern(sessionStorage, regex);
        break;
    }
  }

  /**
   * Get cache statistics
   */
  public getStats(): {
    memory: { size: number; keys: string[] };
    localStorage: { size: number; keys: string[] };
    sessionStorage: { size: number; keys: string[] };
  } {
    return {
      memory: {
        size: this.memoryCache.size,
        keys: Array.from(this.memoryCache.keys())
      },
      localStorage: this.getWebStorageStats(localStorage),
      sessionStorage: this.getWebStorageStats(sessionStorage)
    };
  }

  /**
   * Memory cache operations
   */
  private setMemoryCache<T>(key: string, cacheItem: CacheItem<T>): void {
    // Remove oldest items if cache is full
    if (this.memoryCache.size >= this.maxSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }

    this.memoryCache.set(key, cacheItem);
  }

  private getMemoryCache<T>(key: string): CacheItem<T> | null {
    return this.memoryCache.get(key) as CacheItem<T> || null;
  }

  /**
   * Web storage operations (localStorage/sessionStorage)
   */
  private setLocalStorageCache<T>(key: string, cacheItem: CacheItem<T>): void {
    this.setWebStorageCache(localStorage, key, cacheItem);
  }

  private setSessionStorageCache<T>(key: string, cacheItem: CacheItem<T>): void {
    this.setWebStorageCache(sessionStorage, key, cacheItem);
  }

  private setWebStorageCache<T>(storage: Storage, key: string, cacheItem: CacheItem<T>): void {
    if (typeof window === 'undefined') return;

    try {
      const cacheKey = `cache_${key}`;
      storage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn(`Failed to set cache item in ${storage === localStorage ? 'localStorage' : 'sessionStorage'}:`, error);
    }
  }

  private getLocalStorageCache<T>(key: string): CacheItem<T> | null {
    return this.getWebStorageCache<T>(localStorage, key);
  }

  private getSessionStorageCache<T>(key: string): CacheItem<T> | null {
    return this.getWebStorageCache<T>(sessionStorage, key);
  }

  private getWebStorageCache<T>(storage: Storage, key: string): CacheItem<T> | null {
    if (typeof window === 'undefined') return null;

    try {
      const cacheKey = `cache_${key}`;
      const item = storage.getItem(cacheKey);
      if (!item) return null;

      return JSON.parse(item) as CacheItem<T>;
    } catch (error) {
      console.warn(`Failed to get cache item from ${storage === localStorage ? 'localStorage' : 'sessionStorage'}:`, error);
      return null;
    }
  }

  private deleteFromWebStorage(key: string, storage: Storage): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const cacheKey = `cache_${key}`;
      storage.removeItem(cacheKey);
      return true;
    } catch (error) {
      console.warn(`Failed to delete cache item from ${storage === localStorage ? 'localStorage' : 'sessionStorage'}:`, error);
      return false;
    }
  }

  private clearWebStorage(storage: Storage): void {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(storage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          storage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn(`Failed to clear cache from ${storage === localStorage ? 'localStorage' : 'sessionStorage'}:`, error);
    }
  }

  private invalidateWebStoragePattern(storage: Storage, regex: RegExp): void {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(storage);
      keys.forEach(storageKey => {
        if (storageKey.startsWith('cache_')) {
          const key = storageKey.replace('cache_', '');
          if (regex.test(key)) {
            storage.removeItem(storageKey);
          }
        }
      });
    } catch (error) {
      console.warn(`Failed to invalidate cache pattern in ${storage === localStorage ? 'localStorage' : 'sessionStorage'}:`, error);
    }
  }

  private getWebStorageStats(storage: Storage): { size: number; keys: string[] } {
    if (typeof window === 'undefined') return { size: 0, keys: [] };

    try {
      const keys = Object.keys(storage)
        .filter(key => key.startsWith('cache_'))
        .map(key => key.replace('cache_', ''));
      
      return {
        size: keys.length,
        keys
      };
    } catch (error) {
      console.warn(`Failed to get stats from ${storage === localStorage ? 'localStorage' : 'sessionStorage'}:`, error);
      return { size: 0, keys: [] };
    }
  }

  /**
   * Load expired items from storage on initialization
   */
  private loadFromStorage(): void {
    // Clean up expired items from web storage
    this.cleanupExpiredItems('localStorage');
    this.cleanupExpiredItems('sessionStorage');
  }

  /**
   * Clean up expired items from a specific storage
   */
  private cleanupExpiredItems(storageType: 'localStorage' | 'sessionStorage'): void {
    if (typeof window === 'undefined') return;

    const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
    
    try {
      const keys = Object.keys(storage);
      const now = Date.now();

      keys.forEach(storageKey => {
        if (storageKey.startsWith('cache_')) {
          try {
            const item = storage.getItem(storageKey);
            if (item) {
              const cacheItem = JSON.parse(item);
              if (now > cacheItem.expiry) {
                storage.removeItem(storageKey);
              }
            }
          } catch {
            // Remove invalid items
            storage.removeItem(storageKey);
          }
        }
      });
    } catch (error) {
      console.warn(`Failed to cleanup expired items from ${storageType}:`, error);
    }
  }

  /**
   * Start periodic cleanup of expired items
   */
  private startCleanupInterval(): void {
    // Clean up every 5 minutes
    this.cleanupInterval = setInterval(() => {
      // Clean memory cache
      const now = Date.now();
      for (const [key, item] of this.memoryCache.entries()) {
        if (now > item.expiry) {
          this.memoryCache.delete(key);
        }
      }

      // Clean web storage
      this.cleanupExpiredItems('localStorage');
      this.cleanupExpiredItems('sessionStorage');
    }, 5 * 60 * 1000);
  }

  /**
   * Stop cleanup interval
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

export default cacheManager;

// Export convenience functions
export const setCache = <T>(key: string, data: T, options?: CacheOptions) => 
  cacheManager.set(key, data, options);

export const getCache = <T>(key: string, storage?: 'memory' | 'localStorage' | 'sessionStorage') => 
  cacheManager.get<T>(key, storage);

export const deleteCache = (key: string, storage?: 'memory' | 'localStorage' | 'sessionStorage') => 
  cacheManager.delete(key, storage);

export const clearCache = (storage?: 'memory' | 'localStorage' | 'sessionStorage') => 
  cacheManager.clear(storage);

export const getOrSetCache = <T>(
  key: string,
  fetchFunction: () => Promise<T> | T,
  options?: CacheOptions
) => cacheManager.getOrSet(key, fetchFunction, options);

export { cacheManager };