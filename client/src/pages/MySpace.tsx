import { useState, useEffect } from "react";
import { Video, Music, Picture } from "@shared/schema";
import VideoCard from "@/components/VideoCard";
import AudioPlayer from "@/components/AudioPlayer";
import PictureCard from "@/components/PictureCard";
import UploadModal from "@/components/UploadModal";
import FileDataCard from "@/components/FileDataCard";
import {
  DEFAULT_DATA,
  TAB_OPTIONS,
  MediaType,
  getMySpaceData,
  setMySpaceData,
  clearAllMySpaceData,
  addMySpaceItemAutoType,
  ShareLink,
  getMySpaceDataByType,
} from "@/utils/localStorageData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { v4 as uuidv4 } from "uuid";
import ShareLinkCard from "@/components/ShareLinkCard";
// Define media type options

// Define tab options as constant

interface SelectedItems {
  [key: string]: boolean;
}

export default function MySpace() {
  const [activeTab, setActiveTab] = useState<MediaType>("videos");
  const [mediaData, setMediaData] = useState(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({});
  const [shareTitle, setShareTitle] = useState("");
  const [shareDescription, setShareDescription] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const savedData = await getMySpaceData();
        setMediaData(savedData);
        console.log("Loaded data from IDB:", savedData);
      } catch (error) {
        console.error("Error loading data from IDB:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const initData = async () => {
    try {
      const savedData = await getMySpaceData();
      console.log("Init data from IDB:", savedData);
      setMediaData(savedData);
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  };

  const handleUpload = async (
    file: File,
    title: string,
    description: string,
    category: string
  ) => {
    try {
      setTimeout(() => {
        initData();
      }, 100);
    } catch (error) {
      console.error("Error in upload:", error);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
    // Reset form when opening modal
    setShareTitle("");
    setShareDescription("");
  };

  // Method to reset all checkbox selections
  const resetSelectedItems = () => {
    setSelectedItems({});
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsShareModalOpen(false);
    setShareTitle("");
    setShareDescription("");
    resetSelectedItems(); // Reset all selections
  };

  // Get categorized selected items
  const getSelectedItemsByType = () => {
    const selected = {
      videos: mediaData.videos.filter((video) => selectedItems[video.id]),
      audios: mediaData.audios.filter((audio) => selectedItems[audio.id]),
      pictures: mediaData.pictures.filter(
        (picture) => selectedItems[picture.id]
      ),
      files: mediaData.files.filter((file) => selectedItems[file.id]),
    };

    return selected;
  };

  // Handle share creation
  const handleCreateShare = () => {
    // Process selected items with title and description
    console.log({
      title: shareTitle,
      description: shareDescription,
      selectedItems: Object.keys(selectedItems).filter(
        (key) => selectedItems[key]
      ),
    });

    let newUrl = createShareLinkUrl();
    addMySpaceItemAutoType({
      title: shareTitle,
      type: "sharelink",
      description: shareDescription,
      url: newUrl,
      uuid: uuidv4(),
      isMySpace: true,
    });

    setIsShareModalOpen(false);
    setShareTitle("");
    setShareDescription("");
    resetSelectedItems(); // Reset all selections after successful share creation

    // Instead of copying to clipboard, open in new tab
    window.open(newUrl, "_blank")?.focus();
  };
  const createShareLinkUrl = () => {
    const selectedData = getSelectedItemsByType();

    const jsonString = JSON.stringify(selectedData);

    //get selectedData data 's fileHash, then put it into the string, split by ;
    let selectedDataFileHash = selectedData.videos
      .map((item) => item.fileHash)
      .join(";");
    selectedDataFileHash +=
      ";" + selectedData.audios.map((item) => item.fileHash).join(";");
    selectedDataFileHash +=
      ";" + selectedData.pictures.map((item) => item.fileHash).join(";");
    selectedDataFileHash +=
      ";" + selectedData.files.map((item) => item.fileHash).join(";");

    //get current page url
    const currentUrl = window.location.href;
    //get current server url
    const currentServerUrl = window.location.origin;
    //create a new url with the json string
    const newUrl = `${currentServerUrl}/share?json=${selectedDataFileHash}`;

    return newUrl;
  };

  const getSelectedItemsCount = () => {
    return Object.values(selectedItems).filter(Boolean).length;
  };

  const checkIsMySpace = async (url: string) => {
    try {
      const params = new URLSearchParams(url.split("?")[1]);
      const jsonParam = params.get("json");
      let sharelinks = await getMySpaceDataByType("sharelinks");
      return sharelinks.some((sharelink) => sharelink.url === jsonParam);
    } catch (error) {
      console.error("Error checking isMySpace:", error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section with Upload Buttons */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Space</h1>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
          <button
            className="
              inline-flex items-center justify-center
              bg-gradient-to-r from-blue-500 to-blue-600
              text-white px-4 py-2 rounded-lg
              shadow-md hover:shadow-lg
              transform hover:scale-105
              transition-all duration-200
              font-medium
            "
            onClick={() => setIsUploadModalOpen(true)}
          >
            <svg
              className="w-5 h-5 mr-2"
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
            Upload File
          </button>

          <TooltipProvider>
            <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
              <TooltipTrigger asChild>
                <div
                  onClick={() => {
                    if (getSelectedItemsCount() === 0) {
                      setShowTooltip(true);
                      // 自动隐藏提示
                      setTimeout(() => setShowTooltip(false), 3000);
                    }
                  }}
                >
                  <Button
                    onClick={handleShareClick}
                    disabled={getSelectedItemsCount() === 0}
                    className={
                      getSelectedItemsCount() === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  >
                    Create Share Link{" "}
                    {getSelectedItemsCount() > 0
                      ? "(" + getSelectedItemsCount() + " items)"
                      : ""}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Please select files to share first</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* <button
            onClick={() => setShowConfirmModal(true)}
            className="
              inline-flex items-center justify-center
              bg-gradient-to-r from-red-500 to-red-600
              text-white px-4 py-2 rounded-lg
              shadow-md hover:shadow-lg
              transform hover:scale-105
              transition-all duration-200
              font-medium
            "
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Clear All
          </button> */}
        </div>
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-8">
        {TAB_OPTIONS.map((type) => (
          <div
            key={type}
            className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => setActiveTab(type)}
          >
            <h3
              className={`text-lg font-semibold mb-2 ${
                true ? "text-blue-600" : "text-gray-700"
              }`}
            >
              {type === "sharelinks"
                ? "Share Links"
                : type.charAt(0).toUpperCase() + type.slice(1)}
            </h3>
            <p
              className={`text-3xl font-bold ${
                true ? "text-blue-500" : "text-gray-500"
              }`}
            >
              {mediaData[type]?.length}
            </p>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex min-w-max">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-2 border-b-2 font-medium text-[10px] leading-tight sm:text-sm sm:px-4 sm:py-4 whitespace-nowrap ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Display Section */}
      <div>
        {/* Videos Grid */}
        {activeTab === "videos" && (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {mediaData?.videos?.map((video: Video) => (
              <div key={video.id} className="relative">
                <input
                  type="checkbox"
                  className="absolute top-2 left-2 z-10 w-5 h-5"
                  checked={selectedItems[video.id] || false}
                  onChange={() => handleCheckboxChange(video.id)}
                />
                <VideoCard video={video} />
              </div>
            ))}
            {mediaData.videos.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No videos available
              </div>
            )}
          </div>
        )}

        {/* Audios Grid */}
        {activeTab === "audios" && (
          // <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {mediaData.audios.map((audio: Music) => (
              <div key={audio.id} className="relative">
                <input
                  type="checkbox"
                  className="absolute top-2 left-2 z-10 w-5 h-5"
                  checked={selectedItems[audio.id] || false}
                  onChange={() => handleCheckboxChange(audio.id)}
                />
                <AudioPlayer music={audio} />
              </div>
            ))}
            {mediaData.audios.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No audios available
              </div>
            )}
          </div>
        )}

        {/* Pictures Grid */}
        {activeTab === "pictures" && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-6">
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> */}
            {mediaData.pictures.map((picture: Picture) => (
              <div key={picture.id} className="relative">
                <input
                  type="checkbox"
                  className="absolute top-2 left-2 z-10 w-5 h-5"
                  checked={selectedItems[picture.id] || false}
                  onChange={() => handleCheckboxChange(picture.id)}
                />
                <PictureCard picture={picture} />
              </div>
            ))}
            {mediaData.pictures.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No pictures available
              </div>
            )}
          </div>
        )}

        {/* Files Grid */}
        {activeTab === "files" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-6">
            {mediaData.files.map((file: Video) => (
              <div key={file.id} className="relative">
                <input
                  type="checkbox"
                  className="absolute top-2 left-2 z-10 w-5 h-5"
                  style={{ marginTop: "12px" }}
                  checked={selectedItems[file.id] || false}
                  onChange={() => handleCheckboxChange(file.id)}
                />
                <FileDataCard file={file} />
              </div>
            ))}
            {mediaData.files.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No files available
              </div>
            )}
          </div>
        )}
        {activeTab === "sharelinks" && (
          <div className="space-y-8">
            {/* My Share Links */}
            {mediaData.sharelinks.filter(
              (sharelink) => sharelink.isMySpace === true
            ).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">My Share Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-6">
                  {mediaData.sharelinks
                    .filter((sharelink) => sharelink.isMySpace === true)
                    .map((sharelink: ShareLink) => (
                      <ShareLinkCard key={sharelink.id} sharelink={sharelink} />
                    ))}
                </div>
              </div>
            )}

            {/* Other Share Links */}
            {mediaData.sharelinks.filter(
              (sharelink) => sharelink.isMySpace === false
            ).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Shared Links With Me
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {mediaData.sharelinks
                    .filter((sharelink) => sharelink.isMySpace === false)
                    .map((sharelink: ShareLink) => (
                      <ShareLinkCard key={sharelink.id} sharelink={sharelink} />
                    ))}
                </div>
              </div>
            )}

            {/* No Share Links Message */}
            {mediaData.sharelinks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No share links available
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom clear all data Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl transform transition-all">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Clear Local Cache Data
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This will only clear the cached data stored in your browser's
              localStorage. Your files that have been uploaded to the server are
              safe and will not be deleted.
            </p>
            <div className="mt-2 text-sm text-gray-400 mb-6">
              <ul className="list-disc pl-5 space-y-1">
                <li>Files on server: ✓ Will remain intact</li>
                <li>Browser cache: ✗ Will be cleared</li>
                <li>MySpace layout: ✗ Will be reset</li>
              </ul>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="
                  px-4 py-2 
                  text-sm font-medium 
                  text-gray-700 
                  bg-white 
                  border border-gray-300 
                  rounded-md 
                  hover:bg-gray-50 
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-offset-2 
                  focus:ring-gray-500
                  transition-colors
                "
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllMySpaceData();
                  window.location.reload();
                  setShowConfirmModal(false);
                }}
                className="
                  px-4 py-2 
                  text-sm font-medium 
                  text-white 
                  bg-red-600 
                  border border-transparent 
                  rounded-md 
                  hover:bg-red-700 
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-offset-2 
                  focus:ring-red-500
                  transition-colors
                "
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <Dialog
        open={isShareModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseModal(); // Handle modal close from outside click or escape key
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          {/* Modal Header */}
          <DialogHeader>
            <DialogTitle>Create Share Link</DialogTitle>
            <DialogDescription>
              Fill in the details to create a share link for the selected items.
            </DialogDescription>
          </DialogHeader>

          {/* Form Content */}
          <div className="grid gap-4 py-4">
            {/* Title Input */}
            <div className="grid gap-2">
              <Label htmlFor="share-title">Title</Label>
              <Input
                id="share-title"
                placeholder="Enter share title"
                value={shareTitle}
                onChange={(e) => setShareTitle(e.target.value)}
              />
            </div>

            {/* Description Input */}
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

            {/* Selected Items List */}
            <div className="grid gap-2">
              <Label>Selected Items</Label>
              <div className="space-y-3 max-h-[200px] overflow-y-auto rounded-md border p-3">
                {/* Videos Section */}
                {getSelectedItemsByType().videos.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">
                      Videos ({getSelectedItemsByType().videos.length})
                    </h4>
                    <ul className="text-sm text-muted-foreground pl-4">
                      {getSelectedItemsByType().videos.map((video) => (
                        <li key={video.id} className="truncate">
                          {video.title || video.name || "Untitled Video"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Audios Section */}
                {getSelectedItemsByType().audios.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">
                      Audios ({getSelectedItemsByType().audios.length})
                    </h4>
                    <ul className="text-sm text-muted-foreground pl-4">
                      {getSelectedItemsByType().audios.map((audio) => (
                        <li key={audio.id} className="truncate">
                          {audio.title || audio.name || "Untitled Audio"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pictures Section */}
                {getSelectedItemsByType().pictures.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">
                      Pictures ({getSelectedItemsByType().pictures.length})
                    </h4>
                    <ul className="text-sm text-muted-foreground pl-4">
                      {getSelectedItemsByType().pictures.map((picture) => (
                        <li key={picture.id} className="truncate">
                          {picture.title || picture.name || "Untitled Picture"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Files Section */}
                {getSelectedItemsByType().files.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">
                      Files ({getSelectedItemsByType().files.length})
                    </h4>
                    <ul className="text-sm text-muted-foreground pl-4">
                      {getSelectedItemsByType().files.map((file) => (
                        <li key={file.id} className="truncate">
                          {file.title || file.name || "Untitled File"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* No Selection Message */}
                {getSelectedItemsCount() === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No items selected
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateShare}
              disabled={!shareTitle.trim() || getSelectedItemsCount() === 0}
            >
              Create Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
