import { useQuery } from "@tanstack/react-query";
import { Picture } from "@shared/schema";
import PictureCard from "@/components/PictureCard";
import { fetchVideos } from "@/lib/stratosSdk";

async function fetchPictures(): Promise<Picture[]> {
  try {
    console.log("Fetching pictures..."); // Debug log
    const response = await fetch("/api/pictures");
    console.log("Response status:", response.status); // Debug log

    if (!response.ok) {
      const text = await response.text();
      console.error("Error response:", text); // Debug log
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched data:", data); // Debug log
    return data;
  } catch (error) {
    console.error("Error fetching pictures:", error);
    throw error;
  }
}

export default function PicturesPage() {
  // const {
  //   data: pictures,
  //   isLoading,
  //   error,
  // } = useQuery({
  //   queryKey: ["pictures"],
  //   queryFn: fetchPictures,
  // });

  const {
    data: pictures,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/videos", { type: "image" }],
    queryFn: () => fetchVideos("image"),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading pictures...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">
          Error loading pictures: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Picture Gallery</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
        {pictures?.map((picture) => (
          <PictureCard key={picture.id} picture={picture} />
        ))}
      </div>
    </div>
  );
}
