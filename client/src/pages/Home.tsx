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

// Define direct Stratos videos with streaming URLs
// Export Stratos videos so they can be accessed from other components
export const STRATOS_VIDEOS = [
  // {
  //   id: 101,
  //   title: "Kayaking in Norway",
  //   description:
  //     "Scenic kayaking adventure through the beautiful fjords of Norway",
  //   category: "Travel",
  //   userId: 1,
  //   fileHash: "bafybeiefk4l2nvpwhzzoyhfveq6z3firddfnlmakp3i6jmnjij2f2ggamu",
  //   fileUri:
  //     "https://bafybeiefk4l2nvpwhzzoyhfveq6z3firddfnlmakp3i6jmnjij2f2ggamu.ipfs.spfs-gateway.thestratos.net?filename=kayaking%20in%20Norway.mp4",
  //   views: 20,
  //   thumbnailUri: null,
  //   directStreamUrl:
  //     "https://bafybeiefk4l2nvpwhzzoyhfveq6z3firddfnlmakp3i6jmnjij2f2ggamu.ipfs.spfs-gateway.thestratos.net?filename=kayaking%20in%20Norway.mp4",
  //   createdAt: new Date(),
  //   metadata: {},
  //   size: 52428800,
  //   duration: 180,
  // },
  // {
  //   id: 102,
  //   title: "Kayaking El Rio Claro",
  //   description:
  //     "Exciting kayaking journey through the crystal clear waters of El Rio Claro",
  //   category: "Travel",
  //   userId: 1,
  //   fileHash: "bafybeibpeszcaeccm25wjjq755byzqvhyahfmgue46bos5ijxd2lq32gfy",
  //   fileUri:
  //     "https://bafybeibpeszcaeccm25wjjq755byzqvhyahfmgue46bos5ijxd2lq32gfy.ipfs.spfs-gateway.thestratos.net?filename=kayaking_El%20Rio%20Claro.mp4",
  //   views: 15,
  //   thumbnailUri: null,
  //   directStreamUrl:
  //     "https://bafybeibpeszcaeccm25wjjq755byzqvhyahfmgue46bos5ijxd2lq32gfy.ipfs.spfs-gateway.thestratos.net?filename=kayaking_El%20Rio%20Claro.mp4",
  //   createdAt: new Date(),
  //   metadata: {},
  //   size: 52428800,
  //   duration: 180,
  // },
  // {
  //   id: 103,
  //   title: "MISS MOLDOVA 2023",
  //   description: "Miss Moldova 2023 beauty pageant highlights",
  //   category: "Entertainment",
  //   userId: 1,
  //   fileHash: "bafybeibvndjx5v7fnsdvavlrfcs4jakmjji2gnoh4lddg266bhyafhod7u",
  //   fileUri:
  //     "https://bafybeibvndjx5v7fnsdvavlrfcs4jakmjji2gnoh4lddg266bhyafhod7u.ipfs.spfs-gateway.thestratos.net?filename=MISS%20MOLDOVA%202023_swimsuit.mp4",
  //   views: 25,
  //   thumbnailUri: null,
  //   directStreamUrl:
  //     "https://bafybeibvndjx5v7fnsdvavlrfcs4jakmjji2gnoh4lddg266bhyafhod7u.ipfs.spfs-gateway.thestratos.net?filename=MISS%20MOLDOVA%202023_swimsuit.mp4",
  //   createdAt: new Date(),
  //   metadata: {},
  //   size: 52428800,
  //   duration: 180,
  // },
  // {
  //   id: 104,
  //   title: "The Beauty Of Isa",
  //   description:
  //     "Cinematic fashion film shot on BMPCC 6K PRO with Sigma 18-35 lens",
  //   category: "Entertainment",
  //   userId: 1,
  //   fileHash: "bafybeifuvzkt6e6qbzhof6s6po7l5dqdmjv6mu3vxnsmhmgz3u3ah2xgee",
  //   fileUri:
  //     "https://bafybeifuvzkt6e6qbzhof6s6po7l5dqdmjv6mu3vxnsmhmgz3u3ah2xgee.ipfs.spfs-gateway.thestratos.net?filename=The%20Beauty%20Of%20Isa%20%20BMPCC%206K%20PRO%20%2B%20Sigma%2018-35%20%2B%20Ronin%20RS2%20%20Cinematic%20fashion%20film%20-%20Micha%C5%82%20Palikot%20(720p%2C%20h264).mp4",
  //   views: 18,
  //   thumbnailUri: null,
  //   directStreamUrl:
  //     "https://bafybeifuvzkt6e6qbzhof6s6po7l5dqdmjv6mu3vxnsmhmgz3u3ah2xgee.ipfs.spfs-gateway.thestratos.net?filename=The%20Beauty%20Of%20Isa%20%20BMPCC%206K%20PRO%20%2B%20Sigma%2018-35%20%2B%20Ronin%20RS2%20%20Cinematic%20fashion%20film%20-%20Micha%C5%82%20Palikot%20(720p%2C%20h264).mp4",
  //   createdAt: new Date(),
  //   metadata: {},
  //   size: 52428800,
  //   duration: 180,
  // },
  // {
  //   id: 105,
  //   title: "Chinese Folk Song",
  //   description: "Traditional Chinese folk song performance by Li Ya",
  //   category: "Music",
  //   userId: 1,
  //   fileHash: "bafybeic6inx6bcp2ku2e4z7zcvjdtcxr3vii3a5ufw5jfwulsj2vtinloa",
  //   fileUri:
  //     "https://bafybeic6inx6bcp2ku2e4z7zcvjdtcxr3vii3a5ufw5jfwulsj2vtinloa.ipfs.spfs-gateway.thestratos.net?filename=%E6%B0%91%E8%B0%A3%E5%A5%B3%E5%AD%A9%E6%9D%8E%E9%9B%85%E3%80%8A%E8%B6%8A%E8%BF%87%E5%B1%B1%E4%B8%98%E3%80%8B.mp4",
  //   views: 12,
  //   thumbnailUri: null,
  //   directStreamUrl:
  //     "https://bafybeic6inx6bcp2ku2e4z7zcvjdtcxr3vii3a5ufw5jfwulsj2vtinloa.ipfs.spfs-gateway.thestratos.net?filename=%E6%B0%91%E8%B0%A3%E5%A5%B3%E5%AD%A9%E6%9D%8E%E9%9B%85%E3%80%8A%E8%B6%8A%E8%BF%87%E5%B1%B1%E4%B8%98%E3%80%8B.mp4",
  //   createdAt: new Date(),
  //   metadata: {},
  //   size: 52428800,
  //   duration: 180,
  // },
  // {
  //   id: 106,
  //   title: "001",
  //   description: "Short experimental video clip",
  //   category: "Other",
  //   userId: 1,
  //   fileHash: "bafybeicex3j6xr5fs7cynveqnbjtv5suozsml5ozdl2ll4dzssacii25ia",
  //   fileUri:
  //     "https://bafybeicex3j6xr5fs7cynveqnbjtv5suozsml5ozdl2ll4dzssacii25ia.ipfs.spfs-gateway.thestratos.net?filename=001.mp4",
  //   views: 5,
  //   thumbnailUri: null,
  //   directStreamUrl:
  //     "https://bafybeicex3j6xr5fs7cynveqnbjtv5suozsml5ozdl2ll4dzssacii25ia.ipfs.spfs-gateway.thestratos.net?filename=001.mp4",
  //   createdAt: new Date(),
  //   metadata: {},
  //   size: 52428800,
  //   duration: 180,
  // },
  // {
  //   id: 107,
  //   title: "Bruno Mars Medley",
  //   description: "Musical performance by Victoria Justice & Max Schneider",
  //   category: "Music",
  //   userId: 1,
  //   fileHash: "bafybeid4g4mk3xcfpwccymvoiutpomwhvtu2mvs7l3yajgt42k3d3le",
  //   fileUri:
  //     "https://bafybeid4g4mk3xcfpwccymvoiutpomwhvtu2mvs7l3yajgt42k3d3le.ipfs.spfs-gateway.thestratos.net?filename=Bruno%20Mars%20Medley!%20-%20Victoria%20Justice%20%26%20Max%20Schneider%20-%20Kurt%20Hugo%20Schneider%20(720p%2C%20h264).mp4",
  //   views: 22,
  //   thumbnailUri: null,
  //   directStreamUrl:
  //     "https://bafybeid4g4mk3xcfpwccymvoiutpomwhvtu2mvs7l3yajgt42k3d3le.ipfs.spfs-gateway.thestratos.net?filename=Bruno%20Mars%20Medley!%20-%20Victoria%20Justice%20%26%20Max%20Schneider%20-%20Kurt%20Hugo%20Schneider%20(720p%2C%20h264).mp4",
  //   createdAt: new Date(),
  //   metadata: {},
  //   size: 52428800,
  //   duration: 180,
  // },
];

// Define categories for filtering
const CATEGORIES = [
  "All",
  "Travel",
  "Music",
  "Entertainment",
  "Other",
  "Gaming",
  "Sports",
];

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [allVideos, setAllVideos] = useState<ExtendedVideo[]>(STRATOS_VIDEOS);
  const [featuredVideo, setFeaturedVideo] = useState<ExtendedVideo | null>(
    null
  );

  // Fetch all videos from API
  const {
    data: apiVideos,
    isLoading,
    error,
  } = useQuery({
    // queryKey: ["/api/videos"],
    // queryFn: fetchVideos("video"),

    queryKey: ["/api/videos", { type: "audio" }],
    queryFn: () => fetchVideos("audio"),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Update combined videos when API videos change
  useEffect(() => {
    console.log("apiVideos?.length");
    console.log(apiVideos?.length);
    if (!apiVideos) return;

    // Convert API videos to use direct streaming URLs
    const enhancedApiVideos = apiVideos.map((video) => ({
      ...video,
      directStreamUrl: video.fileHash
        ? `https://${video.fileHash}.ipfs.${IPFS_GATEWAY_DOMAIN}`
        : undefined,
    }));

    const combined = [...enhancedApiVideos, ...STRATOS_VIDEOS];
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
  }, [apiVideos, setAllVideos, setFeaturedVideo]);

  // Filter videos by category
  const filteredVideos = allVideos.filter(
    (video) => selectedCategory === "All" || video.category === selectedCategory
  );

  // Remove featured video from grid if it's shown as featured
  const gridVideos =
    featuredVideo && selectedCategory === "All"
      ? filteredVideos.filter((v) => v.id !== featuredVideo.id)
      : filteredVideos;

  return (
    <div>
      {/* Category/Filter Tabs */}
      {/* <div className="mb-6 border-b border-neutral-200">
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === category 
                  ? 'bg-neutral-900 text-white' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
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

      {/* Video Grid */}
      <VideoGrid videos={gridVideos} title="Recommended" loading={isLoading} />

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md mt-4">
          <p>Error loading videos. Please try again later.</p>
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

export default Home;
