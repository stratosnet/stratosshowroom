import { forwardRef, useEffect, useState } from "react";

// 创建缓存管理
const videoCache = new Map<
  string,
  {
    progress: number;
    timestamp: number;
  }
>();

const CustomVideo = forwardRef<HTMLVideoElement>((props, ref) => {
  const [cacheProgress, setCacheProgress] = useState(0);

  useEffect(() => {
    if (!ref || !("current" in ref) || !ref.current) return;

    const video = ref.current;
    const src = video.src;

    // 检查是否已有缓存
    const cached = videoCache.get(src);
    if (cached) {
      setCacheProgress(cached.progress);
      console.log(`从缓存加载: ${src}, 进度: ${cached.progress}%`);
    }

    // 监听缓冲进度
    const handleProgress = () => {
      const buffered = video.buffered;
      if (buffered && buffered.length > 0) {
        const bufferedEnd = buffered.end(buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          const progress = (bufferedEnd / duration) * 100;
          setCacheProgress(progress);

          // 更新缓存
          videoCache.set(src, {
            progress,
            timestamp: Date.now(),
          });

          console.log(`缓存进度: ${Math.round(progress)}%`);
        }
      }
    };

    // 清理过期缓存（超过24小时）
    const cleanExpiredCache = () => {
      const now = Date.now();
      const expireTime = 24 * 60 * 60 * 1000; // 24小时

      for (const [url, cache] of videoCache.entries()) {
        if (now - cache.timestamp > expireTime) {
          videoCache.delete(url);
          console.log(`清理过期缓存: ${url}`);
        }
      }
    };

    // 添加事件监听
    video.addEventListener("progress", handleProgress);
    video.addEventListener("loadedmetadata", cleanExpiredCache);

    // 设置预加载
    video.preload = "auto";

    return () => {
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("loadedmetadata", cleanExpiredCache);
    };
  }, [ref]);

  return (
    <video
      ref={ref}
      {...props}
      // 添加缓存相关属性
      preload="auto"
      playsInline
      x-webkit-airplay="allow"
      x-webkit-playsinline="true"
      webkit-playsinline="true"
      crossOrigin="anonymous"
    />
  );
});

CustomVideo.displayName = "CustomVideo";

export default CustomVideo;
