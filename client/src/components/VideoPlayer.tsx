import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import Player from "video.js/dist/types/player";
import {
  PlayIcon,
  PauseIcon,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
} from "lucide-react";
import { Menu } from "@/components/ui/menu";
import CustomVideo from "./CustomVideo";

interface VideoPlayerProps {
  fileHash: string;
  poster?: string;
  autoplay?: boolean;
  className?: string;
  directStreamUrl?: string;
}

const VideoPlayer = ({
  fileHash,
  poster,
  autoplay = false,
  className = "",
  directStreamUrl,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorRetries, setErrorRetries] = useState(0);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retrySourcesRef = useRef<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState("auto");
  const settingsRef = useRef<HTMLDivElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const playbackSpeeds = [
    { label: "0.25x", value: 0.25 },
    { label: "0.5x", value: 0.5 },
    { label: "0.75x", value: 0.75 },
    { label: "Normal", value: 1 },
    { label: "1.25x", value: 1.25 },
    { label: "1.5x", value: 1.5 },
    { label: "1.75x", value: 1.75 },
    { label: "2x", value: 2 },
  ];

  const qualities = [
    { label: "Auto", value: "auto" },
    { label: "1080p", value: "1080" },
    { label: "720p", value: "720" },
    { label: "480p", value: "480" },
    { label: "360p", value: "360" },
  ];

  useEffect(() => {
    async function initializePlayer() {
      if (!videoRef.current) return;
      setIsLoading(true);
      setErrorRetries(0);
      setCurrentSourceIndex(0);

      try {
        const videoElement = videoRef.current;

        // Generate all possible URL formats for the video
        const urlFormats = generateAllUrlFormats(fileHash, directStreamUrl);
        retrySourcesRef.current = urlFormats;

        // Log all URLs being attempted
        console.log(
          "Attempting video playback with the following URLs:",
          urlFormats
        );

        // Initialize video.js player with the first source
        console.log(
          "Initializing video.js player with the following URL:",
          urlFormats[0]
        );
        const player = videojs(videoElement, {
          autoplay,
          controls: false,
          responsive: true,
          fluid: true,
          sources: [
            {
              src: urlFormats[0],
              type: "video/mp4",
            },
          ],
          poster: poster,
        });

        playerRef.current = player;

        // Set up event listeners
        player.on("play", () => setIsPlaying(true));
        player.on("pause", () => setIsPlaying(false));
        player.on("volumechange", () => {
          if (player.muted() !== undefined) {
            setIsMuted(!!player.muted());
          }
        });

        player.on("timeupdate", () => {
          const currentTime = player.currentTime() || 0;
          const duration = player.duration() || 1; // Avoid division by zero
          const progress = (currentTime / duration) * 100;
          setProgress(progress);
          setCurrentTime(formatTime(currentTime));
        });

        player.on("loadedmetadata", () => {
          const duration = player.duration() || 0;
          setDuration(formatTime(duration));
          setIsLoading(false);
        });

        player.on("error", () => {
          const playerError = player.error();
          console.error("Video player error:", playerError);

          // Try the next source URL if available
          if (currentSourceIndex < urlFormats.length - 1) {
            const nextIndex = currentSourceIndex + 1;
            setCurrentSourceIndex(nextIndex);
            console.log(
              `Trying next source URL (${nextIndex + 1}/${urlFormats.length}):`,
              urlFormats[nextIndex]
            );

            // Update the player source and reload
            player.src({
              src: urlFormats[nextIndex],
              type: "video/mp4",
            });

            player.load();
            const playPromise = player.play();
            if (playPromise !== undefined) {
              playPromise.catch((e) => console.log("Autoplay prevented:", e));
            }
          } else {
            // All sources failed
            console.error("All source URLs failed to play");
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error("Error initializing video player:", error);
        setIsLoading(false);
      }
    }

    // Function to generate all possible URL formats for the given fileHash
    function generateAllUrlFormats(
      fileHash: string,
      directStreamUrl?: string
    ): string[] {
      console.log("Generating all URL formats for fileHash:", fileHash);
      const urls: string[] = [];

      // 1. Use provided directStreamUrl if available first (most likely to work)
      if (directStreamUrl) {
        urls.push(directStreamUrl);

        // Also add directStreamUrl without query parameters
        if (directStreamUrl.includes("?")) {
          urls.push(directStreamUrl.split("?")[0]);
        }
      }

      // 2. Try different URL variations with the original CID

      // For CIDs starting with Qm (v0 CIDs) or bafy (v1 CIDs)
      if (fileHash.startsWith("Qm") || fileHash.startsWith("bafy")) {
        // Add path-style URLs first (more reliable)
        urls.push(`https://spfs-gateway.thestratos.net/ipfs/${fileHash}`);
        urls.push(`https://spfs-gateway.thestratos.net/ipfs/${fileHash}/`);

        // Then try subdomain-style URLs
        urls.push(`https://${fileHash}.ipfs.spfs-gateway.thestratos.net/`);
        urls.push(`https://${fileHash}.ipfs.spfs-gateway.thestratos.net`);

        // Add variations with filename hints
        urls.push(
          `https://spfs-gateway.thestratos.net/ipfs/${fileHash}?filename=video.mp4`
        );
        urls.push(
          `https://spfs-gateway.thestratos.net/ipfs/${fileHash}/video.mp4`
        );
        urls.push(
          `https://${fileHash}.ipfs.spfs-gateway.thestratos.net/?filename=video.mp4`
        );
        urls.push(
          `https://${fileHash}.ipfs.spfs-gateway.thestratos.net/video.mp4`
        );
      }

      // 3. Try the direct gateway URL (no /ipfs/ prefix)
      urls.push(`https://spfs-gateway.thestratos.net/${fileHash}`);

      // 4. Try with "raw" query parameter
      urls.push(
        `https://spfs-gateway.thestratos.net/ipfs/${fileHash}?raw=true`
      );

      // 5. Try alternative CID formats if original is v0 (starts with Qm)
      // Note: We don't have conversion function so we try both formats
      if (fileHash.startsWith("Qm")) {
        // Try a direct link to the raw gateway path that some gateways support
        urls.push(`https://spfs-gateway.thestratos.net/ipfs/raw/${fileHash}`);
      }

      // 6. Try with content type query parameter
      urls.push(
        `https://spfs-gateway.thestratos.net/ipfs/${fileHash}?format=mp4`
      );
      urls.push(
        `https://spfs-gateway.thestratos.net/ipfs/${fileHash}?type=video/mp4`
      );

      // Remove duplicates
      return Array.from(new Set(urls));
    }

    initializePlayer();

    return () => {
      // Clean up player on unmount
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [fileHash, poster, autoplay, directStreamUrl]);

  // Format time from seconds to mm:ss
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  // Handle play/pause
  const togglePlay = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pause();
    } else {
      // 存储播放 Promise
      playPromiseRef.current = playerRef.current.play();
      if (playPromiseRef.current) {
        playPromiseRef.current.catch((error) => {
          console.log("播放被中断:", error);
        });
      }
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    if (!playerRef.current) return;
    playerRef.current.muted(!playerRef.current.muted());
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (playerRef.current.isFullscreen()) {
      playerRef.current.exitFullscreen();
    } else {
      playerRef.current.requestFullscreen();
    }
  };

  // Handle click on progress bar
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const duration = playerRef.current.duration() || 0;
    const newTime = duration * pos;

    if (newTime > 0) {
      playerRef.current.currentTime(newTime);
    }
  };

  // Show/hide controls on hover
  const handleMouseMove = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 1000);
  };

  // 处理播放速度变化
  const handleSpeedChange = (speed: number) => {
    if (playerRef.current) {
      playerRef.current.playbackRate(speed);
      setPlaybackSpeed(speed);
      setShowSettings(false);
    }
  };

  // 处理视频质量变化
  const handleQualityChange = (quality: string) => {
    setQuality(quality);
    setShowSettings(false);
    // TODO: 实现质量切换逻辑
  };

  // 点击外部关闭设置菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 修改页面可见性处理的 useEffect
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && playerRef.current) {
        // 如果有正在进行的播放 Promise，需要等待它完成或失败
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              playerRef.current?.pause();
            })
            .catch(() => {
              // 播放已经被中断，不需要额外处理
            });
        } else {
          playerRef.current.pause();
        }
        setIsPlaying(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // 组件卸载时处理
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            playerRef.current?.pause();
          })
          .catch(() => {
            // 播放已经被中断，不需要额外处理
          });
      } else if (playerRef.current) {
        playerRef.current.pause();
      }
    };
  }, []);

  return (
    <div
      className={`relative rounded-lg overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div data-vjs-player>
        <CustomVideo
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          playsInline
        />
      </div>

      {/* Custom video controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Bar */}
        <div
          className="relative w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer group"
          onClick={handleProgressClick}
        >
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute h-3 w-3 bg-white rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition"
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center">
            <button
              onClick={togglePlay}
              className="p-1 rounded-full hover:bg-white/20"
            >
              {isPlaying ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
            </button>
            <button
              onClick={toggleMute}
              className="p-1 rounded-full hover:bg-white/20 ml-2"
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            <span className="ml-2 text-sm">
              {currentTime} / {duration}
            </span>
          </div>

          <div>
            <div className="relative" ref={settingsRef}>
              <button
                onClick={toggleFullscreen}
                className="p-1 rounded-full hover:bg-white/20"
              >
                <Maximize size={24} />
              </button>
              <button
                className="p-1 rounded-full hover:bg-white/20 ml-2"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings size={24} />
              </button>
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-black/90 rounded-lg overflow-hidden">
                  {/* 播放速度设置 */}
                  <div className="p-2">
                    <div className="text-white/80 text-xs mb-2 px-2">
                      Playback Speed
                    </div>
                    {playbackSpeeds.map((speed) => (
                      <button
                        key={speed.value}
                        onClick={() => handleSpeedChange(speed.value)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 ${
                          playbackSpeed === speed.value
                            ? "text-primary"
                            : "text-white"
                        }`}
                      >
                        {speed.label}
                      </button>
                    ))}
                  </div>

                  {/* 视频质量设置 */}
                  <div className="border-t border-white/10 p-2">
                    <div className="text-white/80 text-xs mb-2 px-2">
                      Quality
                    </div>
                    {qualities.map((q) => (
                      <button
                        key={q.value}
                        onClick={() => handleQualityChange(q.value)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 ${
                          quality === q.value ? "text-primary" : "text-white"
                        }`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>

                  {/* 循环播放设置 */}
                  <div className="border-t border-white/10 p-2">
                    <button
                      onClick={() => {
                        if (playerRef.current) {
                          const newLoop = !playerRef.current.loop();
                          playerRef.current.loop(newLoop);
                        }
                        setShowSettings(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center justify-between"
                    >
                      <span>Loop</span>
                      {playerRef.current?.loop() && (
                        <span className="text-primary">✓</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
