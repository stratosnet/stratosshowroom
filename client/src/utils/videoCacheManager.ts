class VideoCacheManager {
  private static instance: VideoCacheManager;
  private cacheMap: Map<string, {
    progress: number;
    timestamp: number;
  }> = new Map();

  private constructor() {}

  static getInstance(): VideoCacheManager {
    if (!VideoCacheManager.instance) {
      VideoCacheManager.instance = new VideoCacheManager();
    }
    return VideoCacheManager.instance;
  }

  // 更新缓存进度
  updateCacheProgress(videoId: string, progress: number): void {
    this.cacheMap.set(videoId, {
      progress,
      timestamp: Date.now()
    });
  }

  // 获取缓存进度
  getCacheProgress(videoId: string): number {
    return this.cacheMap.get(videoId)?.progress || 0;
  }

  // 检查是否已缓存
  isCached(videoId: string): boolean {
    const cache = this.cacheMap.get(videoId);
    return cache?.progress === 100;
  }

  // 清理过期缓存（24小时）
  cleanExpiredCache(): void {
    const now = Date.now();
    const expireTime = 24 * 60 * 60 * 1000; // 24小时

    for (const [videoId, cache] of this.cacheMap.entries()) {
      if (now - cache.timestamp > expireTime) {
        this.cacheMap.delete(videoId);
      }
    }
  }
}

export default VideoCacheManager; 