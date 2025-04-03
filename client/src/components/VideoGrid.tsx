import { Video } from "@shared/schema";
import VideoCard from "./VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ExtendedVideo } from "@/lib/stratosSdk";

interface VideoGridProps {
  videos: (Video | ExtendedVideo)[];
  title?: string;
  loading?: boolean;
}

const VideoGrid = ({ videos, title, loading = false }: VideoGridProps) => {
  // Create placeholder videos for loading state
  const placeholderVideos = Array.from({ length: 8 }).map((_, index) => (
    <div key={`skeleton-${index}`} className="rounded-lg overflow-hidden">
      <Skeleton className="w-full aspect-video" />
      <div className="p-2">
        <Skeleton className="h-5 w-full mt-2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </div>
    </div>
  ));

  return (
    <div>
      {/* {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>} */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading
          ? placeholderVideos
          : videos?.map((video) => <VideoCard key={video.id} video={video} />)}

        {!loading && videos?.length === 0 && (
          <div className="col-span-full py-8 text-center">
            <p className="text-neutral-600">No videos found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGrid;
