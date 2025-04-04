import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getFileUri, IPFS_GATEWAY_DOMAIN } from "@/lib/stratosSdk";

interface VideoThumbnailProps {
  thumbnailUri?: string | null;
  fileHash?: string;
  title: string;
  duration?: number | null;
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
}

const VideoThumbnail = ({
  thumbnailUri,
  fileHash,
  title,
  duration,
  onClick,
  isLoading = false,
  className = "",
}: VideoThumbnailProps) => {
  const [isImageError, setIsImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasVideoLoaded, setHasVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const VIDEO_FRAME = 72;
  const STRATOS_GATEWAY = "spfs-gateway.thestratos.net";

  // Set maximum load size to 5MB
  const MAX_BYTES = 5 * 1024 * 1024; // 5MB in bytes

  useEffect(() => {
    if (!isHovered) {
      const timer = setTimeout(() => {
        console.log("Timer triggered, stopping video");
        setIsPlaying(false);
        if (videoRef.current) {
          videoRef.current.pause();
        }
      }, 5000);

      return () => {
        console.log("Cleaning up timer");
        clearTimeout(timer);
      };
    }
  }, [isHovered]);

  const loadVideoPreview = async (fileHash: string) => {
    if (!videoRef.current) return;

    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (videoRef.current) {
        videoRef.current.src = getFileUri(fileHash);
        setHasVideoLoaded(true);
        console.log("Video preview loaded successfully");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Video preview loading cancelled");
      } else {
        console.error("Failed to load video preview:", error);
        setHasVideoLoaded(false);
      }
    }
  };

  useEffect(() => {
    if (fileHash) {
      loadVideoPreview(fileHash);
    }

    return () => {
      // Cleanup
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (videoRef.current) {
        URL.revokeObjectURL(videoRef.current.src);
      }
    };
  }, [fileHash]);

  if (isLoading) {
    return <Skeleton className={`aspect-video ${className}`} />;
  }

  const handleImageError = () => {
    console.log("Image error occurred");
    setIsImageError(true);
  };

  // Format duration from seconds to mm:ss
  const formatDuration = (seconds?: number | null) => {
    if (seconds === undefined || seconds === null) return "";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleMouseEnter = () => {
    if (
      videoRef.current &&
      hasVideoLoaded &&
      videoRef.current.readyState >= 3
    ) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => console.error("Error playing video:", error));
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current && hasVideoLoaded) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg cursor-pointer ${className}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* <video
        src={`https://${fileHash}.ipfs.spfs-gateway.thestratos.net/?frame=25`}
        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
      /> */}
      {fileHash && !isImageError ? (
        // <video
        //   src={`https://${fileHash}.ipfs.spfs-gateway.thestratos.net/?frame=250`}
        //   className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
        // />
        <video
          ref={videoRef}
          crossOrigin="anonymous"
          muted
          playsInline
          loop={true}
          preload="metadata"
          x-webkit-playsinline="true"
          webkit-playsinline="true"
          onEnded={() => setIsPlaying(false)}
          onLoadedData={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
              setHasVideoLoaded(true);
              console.log("Video is ready to play");
            }
          }}
          onError={(e) => {
            console.error("Video loading error:", e);
            setHasVideoLoaded(false);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.preload = "metadata";
              videoRef.current.buffered;
              if ("mediaSource" in window) {
                videoRef.current.setBufferSize?.(1);
              }
            }
          }}
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
          style={{
            visibility: hasVideoLoaded ? "visible" : "hidden",
            opacity: hasVideoLoaded ? 1 : 0,
            transition: "visibility 0.3s, opacity 0.3s",
          }}
        />
      ) : (
        // <img
        //   src={`https://${fileHash}.ipfs.spfs-gateway.thestratos.net/?frame=25`}
        //   alt={title}
        //   className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
        //   onError={handleImageError}
        // />
        // Improved fallback placeholder with video icon
        <div className="w-full h-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center">
          <svg
            className={`${
              className?.includes("h-24") ? "h-6 w-6 mb-1" : "h-12 w-12 mb-2"
            } text-primary/80`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
            />
          </svg>
          <span
            className={`${
              className?.includes("h-24") ? "text-[10px]" : "text-xs"
            } text-gray-400 font-medium truncate max-w-full px-2`}
          >
            {title}
          </span>
        </div>
      )}

      {duration !== undefined && duration !== null && (
        <span
          className={`absolute ${
            className?.includes("h-24")
              ? "bottom-1 right-1"
              : "bottom-2 right-2"
          } bg-black/70 text-white text-xs px-1 rounded`}
        >
          {formatDuration(duration)}
        </span>
      )}

      {/* Only show play button overlay on hover if onClick is provided */}
      {onClick && (
        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-primary/90 rounded-full p-3">
            <svg
              className="w-8 h-8 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoThumbnail;
