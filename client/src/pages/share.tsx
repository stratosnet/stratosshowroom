import { useEffect, useState } from "react";
import { Video } from "@shared/schema";
import { getFileUri } from "../lib/stratosSdk";
import VideoCard from "@/components/VideoCard";
import AudioPlayer from "@/components/AudioPlayer";
import PictureCard from "@/components/PictureCard";
import FileDataCard from "@/components/FileDataCard";
import { getMySpaceDataByType, ShareLink } from "@/utils/localStorageData";
import { Button } from "@/components/ui/button";
import { addMySpaceItemAutoType } from "@/utils/localStorageData";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { json } from "stream/consumers";
import ShareLinkCard from "@/components/ShareLinkCard";
import { useShare } from "@/contexts/ShareContext";

interface SharedData {
  videos: Video[];
  audios: Video[];
  pictures: Video[];
  files: Video[];
}

export default function SharePage() {
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInMySpace, setIsInMySpace] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [shareTitle, setShareTitle] = useState("");
  const [shareDescription, setShareDescription] = useState("");
  const [sharedlinksWithMeList, setSharedlinksWithMeList] = useState<
    ShareLink[]
  >([]);
  const [jsonParam, setJsonParam] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const jsonParam = params.get("json");
        setJsonParam(jsonParam || null);
        if (!jsonParam) {
          const sharelinks = (await getMySpaceDataByType(
            "sharelinks"
          )) as ShareLink[];
          const sharedlinksWithMeList = sharelinks.filter((sharelink) => {
            return !sharelink.isMySpace;
          });
          setSharedlinksWithMeList(sharedlinksWithMeList);
          if (sharedlinksWithMeList.length === 0) {
            setError("No Shared Links With Me");
            setLoading(false);
            return;
          }
          setLoading(false);
          return;
        }

        // Split CIDs (separated by semicolons) and filter invalid ones
        const cids = jsonParam
          .split(";")
          .map((cid) => cid.trim())
          .filter(Boolean)
          .map((cid) => (cid.startsWith("@") ? cid.substring(1) : cid));

        if (cids.length === 0) {
          setError("No valid CIDs found");
          setLoading(false);
          return;
        }

        // Create base data structure
        const combinedData = {
          videos: [] as Video[],
          audios: [] as Video[],
          pictures: [] as Video[],
          files: [] as Video[],
        };

        try {
          // Process CIDs sequentially
          for (let i = 0; i < cids.length; i++) {
            const cid = cids[i];
            try {
              // Determine if we need to use getFileUri
              let url: string;
              if (cid.toLowerCase().includes("stratos")) {
                // If URL contains 'stratos', use it directly
                url = cid.startsWith("https://") ? cid : `https://${cid}`;
              } else {
                // If no 'stratos' in the string, use getFileUri
                url = getFileUri(cid);
              }

              const response = await fetch(url);

              if (!response.ok) {
                console.error(`Failed to fetch ${url}`);
                continue;
              }

              const contentType = response.headers.get("content-type") || "";

              if (contentType.includes("application/json")) {
                // Process JSON file
                try {
                  const jsonData = await response.json();
                  if (jsonData.videos)
                    combinedData.videos.push(...jsonData.videos);
                  if (jsonData.audios)
                    combinedData.audios.push(...jsonData.audios);
                  if (jsonData.pictures)
                    combinedData.pictures.push(...jsonData.pictures);
                  if (jsonData.files)
                    combinedData.files.push(...jsonData.files);
                } catch (jsonError) {
                  console.error(`Invalid JSON from ${url}`);
                }
              } else {
                // Process single file
                const baseItem: Video = {
                  id: Date.now() + i,
                  title: `Shared File ${i + 1}`,
                  description: "Shared via CID",
                  fileUri: url,
                  type: contentType,
                  fileHash: cid, // Use original CID as fileHash
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };

                // Categorize based on file type
                if (contentType.startsWith("video/")) {
                  combinedData.videos.push(baseItem);
                } else if (contentType.startsWith("audio/")) {
                  combinedData.audios.push(baseItem);
                } else if (contentType.startsWith("image/")) {
                  combinedData.pictures.push(baseItem);
                } else {
                  combinedData.files.push(baseItem);
                }
              }
            } catch (fetchError) {
              console.error(`Error fetching CID ${cid}:`, fetchError);
              // Continue with next CID
            }
          }

          // Display error if all categories are empty
          if (
            [
              ...combinedData.videos,
              ...combinedData.audios,
              ...combinedData.pictures,
              ...combinedData.files,
            ].length === 0
          ) {
            setError("No valid files could be loaded");
          } else {
            setData(combinedData);
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to process files"
          );
        } finally {
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const jsonParam = params.get("json");
      setCurrentUrl(window.location.href);
      const isMySpace = await checkIsMySpace();
      setIsInMySpace(isMySpace);
    };
    init();
  }, []);

  const checkIsMySpace = async () => {
    const sharelinks = (await getMySpaceDataByType(
      "sharelinks"
    )) as ShareLink[];
    const params = new URLSearchParams(window.location.search);
    const jsonParam = params.get("json") || "no json";

    const isMySpace = sharelinks.some((sharelink) => {
      const sharelinkUrl = sharelink.url?.split("share?json=")[0]; // http://localhost:3003
      const jsonParamWithoutShareLink = sharelink.url?.replace(
        sharelinkUrl + "share?json=",
        ""
      );
      console.log("sharelink.url");
      console.log(sharelink.url);
      console.log("sharelinkUrl");
      console.log(sharelinkUrl);
      console.log("jsonParamWithoutShareLink");
      console.log(jsonParamWithoutShareLink);
      console.log("jsonParam");
      console.log(jsonParam);
      return jsonParamWithoutShareLink === jsonParam;
    });
    setIsInMySpace(isMySpace);
    return isMySpace;
  };

  const handleAddToMySpace = async () => {
    setIsAddModalOpen(true);
  };

  const handleConfirmAdd = async () => {
    try {
      await addMySpaceItemAutoType({
        title: shareTitle || "Shared Items",
        type: "sharelink",
        description: shareDescription || "Added from share page",
        url: window.location.href,
        uuid: uuidv4(),
        createdAt: new Date().toISOString(),
        isMySpace: false,
      });
      setIsInMySpace(true);
      setIsAddModalOpen(false);
      // Reset form
      setShareTitle("");
      setShareDescription("");
    } catch (error) {
      console.error("Error adding to MySpace:", error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        // 可以添加一个提示复制成功的 toast
        alert("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shared content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Oops!</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!jsonParam && sharedlinksWithMeList) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sharedlinksWithMeList
          .filter((sharelink) => sharelink.isMySpace === false)
          .map((sharelink: ShareLink) => (
            <ShareLinkCard key={sharelink.id} sharelink={sharelink} />
          ))}
      </div>
      // <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      //   <div className="text-center">
      //     <div className="text-red-500 text-xl mb-4">dfdfdfdfdf</div>
      //     <div className="text-gray-600">
      //       {sharedlinksWithMeList.map((sharelink) => (
      //         <ShareLinkCard key={sharelink.id} sharelink={sharelink} />
      //       ))}
      //     </div>
      //   </div>
      // </div>
    );
  }
  if (!jsonParam && !sharedlinksWithMeList) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }
  if (jsonParam && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  ">
      {/* 如果jsonParam为空，则显示分享内容 */}
      {/* dd{JSON.stringify(jsonParam)} */}
      {/* {!jsonParam && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shared Content</h1>
          </div>
        </div>
      )}
      {!jsonParam && (
        <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Shared Content
              </h1>
            </div>
          </div>
        </div>
      )} */}
      {jsonParam && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  top-4">
          <div className="">
            {/* <h1 className="text-3xl font-bold text-gray-900">Shared Content</h1> */}
            {/* Buttons */}
            <div className=" flex justify-end">
              {!isInMySpace ? (
                <Button
                  onClick={handleAddToMySpace}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 "
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add to MySpaceded
                </Button>
              ) : (
                <Button
                  onClick={handleCopyLink}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Copy Share Link
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Videos Section */}
            {data.videos.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            )}

            {/* Audios Section */}
            {data.audios.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Audios</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.audios.map((audio) => (
                    <AudioPlayer key={audio.id} music={audio} />
                  ))}
                </div>
              </div>
            )}

            {/* Pictures Section */}
            {data.pictures.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Pictures</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {data.pictures.map((picture) => (
                    <PictureCard key={picture.id} picture={picture} />
                  ))}
                </div>
              </div>
            )}

            {/* Files Section */}
            {data.files.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Files</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {data.files.map((file) => (
                    <FileDataCard key={file.id} file={file} />
                  ))}
                </div>
              </div>
            )}

            {/* No Items Message */}
            {data.videos.length === 0 &&
              data.audios.length === 0 &&
              data.pictures.length === 0 &&
              data.files.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No items to display
                </div>
              )}
          </div>

          {/* Add Modal */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add to MySpace</DialogTitle>
                <DialogDescription>
                  Enter a title and description for this shared content.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="share-title">Title</Label>
                  <Input
                    id="share-title"
                    placeholder="Enter share title"
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="share-description">Description</Label>
                  <Textarea
                    id="share-description"
                    placeholder="Enter share description"
                    value={shareDescription}
                    onChange={(e) => setShareDescription(e.target.value)}
                    className="h-24"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setShareTitle("");
                    setShareDescription("");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleConfirmAdd}>Add to MySpace</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
