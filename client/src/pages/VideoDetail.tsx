import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Video } from "@shared/schema";
import { getFileUri } from "@/lib/stratosSdk";
import VideoPlayer from "@/components/VideoPlayer";

interface VideoDetailProps {
  fileHash?: string;
}

const VideoDetail = ({ fileHash: propFileHash }: VideoDetailProps = {}) => {
  const params = useParams<{ fileHash: string }>();
  const fileHash = propFileHash || params.fileHash;
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setLoading(true);
        if (!fileHash) {
          throw new Error("No file hash provided");
        }

        const fileUri = getFileUri(fileHash);

        // 创建基本的视频对象
        const videoData: Video = {
          id: Date.now(),
          title: `File ${fileHash.slice(0, 8)}...`,
          description: "Shared via IPFS",
          fileUri: fileUri,
          fileHash: fileHash,
          type: "video/mp4",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setVideo(videoData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load video");
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [fileHash]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Error</h2>
          <p className="text-gray-600">{error || "Video not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="aspect-video w-full">
          <VideoPlayer
            fileHash={video.fileHash}
            directStreamUrl={video.fileUri}
          />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-sm text-gray-500">File Hash:</p>
              <p className="font-mono text-sm break-all">{video.fileHash}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">File URI:</p>
              <p className="font-mono text-sm break-all">{video.fileUri}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;
