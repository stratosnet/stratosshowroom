import { Link } from "wouter";
import { Video } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";
import VideoThumbnail from "./VideoThumbnail";
import { ExtendedVideo } from "@/lib/stratosSdk";
import { checkFileType } from "@/utils/mediaUtils";
import { useEffect } from "react";
import { useFocusContext } from "react-day-picker";

const checkVideoFileType = async (fileHash: string) => {
  try {
    const STRATOS_GATEWAY = "spfs-gateway.thestratos.net";
    const getVideoUrl = (fileHash: string) =>
      `https://${fileHash}.ipfs.${STRATOS_GATEWAY}`;

    const response = await fetch(getVideoUrl(fileHash));
    const arrayBuffer = await response.arrayBuffer();

    const fileType = await checkFileType(arrayBuffer);
    console.log("getVideoUrl", getVideoUrl(fileHash));
    console.log("fileHash:", fileHash);
    console.log("File type:", fileType);
    return fileType;
  } catch (error) {
    console.error("Error checking file type:", error);
    return null;
  }
};

interface VideoCardProps {
  video: Video | ExtendedVideo;
  featured?: boolean;
}
const VideoCard = ({ video, featured = false }: VideoCardProps) => {
  useEffect(() => {
    if (video.fileHash) {
      // checkVideoFileType(video.fileHash);// do not check file type, it will download the whole video
    }
  }, [video]);

  const formatViewCount = (views: number | null) => {
    const viewCount = views || 0;
    if (viewCount >= 1000000) {
      return `${(viewCount / 1000000).toFixed(1)}M`;
    }
    if (viewCount >= 1000) {
      return `${(viewCount / 1000).toFixed(1)}K`;
    }
    return viewCount.toString();
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "recently";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  const channelName = "Stratos User";

  // For featured cards, use a different layout
  if (featured) {
    return (
      <Link href={`/video/${video.fileHash}`} className="block">
        <div className="relative group cursor-pointer">
          <div className="rounded-xl overflow-hidden relative aspect-video">
            <VideoThumbnail
              key={video.id}
              thumbnailUri={video.fileHash}
              fileHash={video.fileHash}
              title={video.title}
              duration={video.duration}
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary/90 hover:bg-primary w-16 h-16 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <div className="absolute bottom-0 left-0 p-4 text-white">
              <h3 className="text-xl font-semibold">{video.title}</h3>
              <div className="flex items-center mt-2">
                <span className="text-sm opacity-90">
                  {/* {channelName} */}

                  {video.type}
                </span>
                <span className="mx-2 opacity-75">•</span>
                {/* <span className="text-sm opacity-90">
                  {formatViewCount(video.views)} views
                </span>
                <span className="mx-2 opacity-75">•</span>
                <span className="text-sm opacity-90">
                  {formatDate(video.createdAt)}
                </span> */}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Regular video card
  return (
    <Link href={`/video/${video.fileHash}`} className="block">
      <div className="rounded-lg overflow-hidden group cursor-pointer h-full">
        <div className="relative">
          <VideoThumbnail
            thumbnailUri={video.fileHash}
            fileHash={video.fileHash}
            title={video.title}
            duration={video.duration}
            className="w-full aspect-video"
          />
        </div>
        <div className="p-2">
          <h3 className="font-medium line-clamp-2">{video.title}</h3>
          <p className="text-neutral-600 text-sm mt-1">
            {" "}
            {/* {channelName} */}
            {video.type}
          </p>
          {/* <div className="flex items-center text-neutral-600 text-sm mt-1">
            <span>{formatViewCount(video.views)} views</span>
            <span className="mx-1">•</span>
            <span>{formatDate(video.createdAt)}</span>
          </div> */}
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
