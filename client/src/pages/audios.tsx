import { useQuery } from "@tanstack/react-query";
import { Music } from "@shared/schema";
import AudioPlayer from "@/components/AudioPlayer";
import { fetchVideos } from "@/lib/stratosSdk";

async function fetchMusic(): Promise<Music[]> {
  try {
    const response = await fetch("/api/music");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Fetched music data:", data); // For debugging
    return data;
  } catch (error) {
    console.error("Error fetching music:", error);
    throw error;
  }
}

export default function AudiosPage() {
  // const {
  //   data: musicList,
  //   isLoading,
  //   error,
  // } = useQuery({
  //   queryKey: ["music"],
  //   queryFn: fetchMusic,
  // });

  const {
    data: musicList,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/videos", { type: "audio" }],
    queryFn: () => fetchVideos("audio"),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading music...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">
          Error loading music: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Audio Library</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {musicList?.map((music) => (
          <AudioPlayer key={music.id} music={music} />
        ))}
      </div>
    </div>
  );
}
