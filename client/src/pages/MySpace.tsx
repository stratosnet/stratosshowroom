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
} from "@/utils/localStorageData";
import ShareModal from "@/components/ShareModal";

// Define media type options

// Define tab options as constant

export default function MySpace() {
  const [activeTab, setActiveTab] = useState<MediaType>("videos");
  const [mediaData, setMediaData] = useState(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      try {
        initData();
        console.log("savedData", JSON.stringify(mediaData));
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  const initData = () => {
    const savedData = getMySpaceData();
    if (savedData) {
      setMediaData(savedData);
    }
  };

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("myspace-data", JSON.stringify(mediaData));
  }, [mediaData]);

  const handleUpload = async (
    file: File,
    title: string,
    description: string,
    category: string
  ) => {
    // TODO: Implement file upload logic
    initData();
    console.log("Uploading file:", { file, title, description, category });
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
        <div className="flex space-x-4">
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

          <button
            className="
              inline-flex items-center justify-center
              bg-gradient-to-r from-indigo-500 to-indigo-600
              text-white px-4 py-2 rounded-lg
              shadow-md hover:shadow-lg
              transform hover:scale-105
              transition-all duration-200
              font-medium
            "
            onClick={() => setIsShareModalOpen(true)}
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
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Create Share Link
          </button>

          <button
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
          </button>
        </div>
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {TAB_OPTIONS.map((type) => (
          <div key={type} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </h3>
            <p className="text-3xl font-bold text-blue-500">
              {mediaData[type].length}
            </p>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaData.videos.map((video: Video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}

        {/* Audios Grid */}
        {activeTab === "audios" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mediaData.audios.map((audio: Music) => (
              <AudioPlayer key={audio.id} music={audio} />
            ))}
          </div>
        )}

        {/* Pictures Grid */}
        {activeTab === "pictures" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mediaData.pictures.map((picture: Picture) => (
              <PictureCard key={picture.id} picture={picture} />
            ))}
          </div>
        )}

        {/* Files Grid */}
        {activeTab === "files" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mediaData.files.map((file: Video) => (
              <FileDataCard key={file.id} file={file} />
            ))}
          </div>
        )}
      </div>

      {/* Custom Confirm Modal */}
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
    </div>
  );
}
