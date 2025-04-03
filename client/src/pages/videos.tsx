import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchVideos,
  ExtendedVideo,
  IPFS_GATEWAY_DOMAIN,
} from "@/lib/stratosSdk";
import VideoGrid from "@/components/VideoGrid";
import VideoCard from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import UploadModal from "@/components/UploadModal";
import { Video } from "@shared/schema";

const VideosPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [allVideos, setAllVideos] = useState<ExtendedVideo[]>();

  const [featuredVideo, setFeaturedVideo] = useState<ExtendedVideo | null>(
    null
  );

  // Fetch video data
  const {
    data: apiVideos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/videos", { type: "video" }],
    queryFn: () => fetchVideos("video"),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Update video list
  useEffect(() => {
    if (!apiVideos) return;

    const enhancedApiVideos = apiVideos?.map((video) => ({
      ...video,
      // directStreamUrl: video.fileHash
      //   ? `https://${video.fileHash}.ipfs.${IPFS_GATEWAY_DOMAIN}`
      //   : undefined,
    }));

    const combined = [...enhancedApiVideos];
    setAllVideos(combined);
    // Set featured video (most viewed)
    if (combined.length) {
      const sorted = [...combined].sort((a, b) => {
        const viewsA = a.views || 0;
        const viewsB = b.views || 0;
        return viewsB - viewsA;
      });
      setFeaturedVideo(sorted[0]);
    }
  }, [apiVideos]);

  // Filter videos by category
  const filteredVideos = allVideos?.filter(
    (video) => selectedCategory === "All" || video.category === selectedCategory
  );

  // Add cleanup effect for stopping all videos when leaving page
  useEffect(() => {
    // Cleanup function to stop all videos
    const stopAllVideos = () => {
      document.querySelectorAll("video").forEach((video) => {
        video.pause();
        video.currentTime = 0;
      });
    };

    // Return cleanup function that will run when component unmounts
    return () => {
      stopAllVideos();
    };
  }, []); // Empty dependency array means this runs on mount and cleanup on unmount

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Video Library</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Video list will be rendered here */}
      </div>

      {/* Category filter buttons */}
      {/* <div className="mb-6 border-b border-neutral-200">
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div> */}

      {/* Featured Video */}
      {featuredVideo && selectedCategory === "All" && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Featured</h2>
          <VideoCard video={featuredVideo} featured={true} />
        </div>
      )}

      {/* Video grid */}
      <VideoGrid
        videos={filteredVideos}
        title="All Videos"
        loading={isLoading}
      />

      {/* Error message */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md mt-4">
          <p>Error loading videos. Please try again later.</p>
        </div>
      )}

      {/* Upload modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

export default VideosPage;
