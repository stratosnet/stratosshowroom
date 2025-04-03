import { useState } from "react";
import { Video } from "@shared/schema";
import { getMySpaceData } from "@/utils/localStorageData";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [selectedItems, setSelectedItems] = useState<{
    [key: number]: boolean;
  }>({});
  const data = getMySpaceData();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleCheckboxChange = (id: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCreateLinkClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = () => {
    const selectedData = {
      videos: data.videos.filter((item) => selectedItems[item.id]),
      audios: data.audios.filter((item) => selectedItems[item.id]),
      pictures: data.pictures.filter((item) => selectedItems[item.id]),
      files: data.files.filter((item) => selectedItems[item.id]),
    };

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

    // Instead of copying to clipboard, open in new tab
    window.open(newUrl, "_blank")?.focus();

    setShowConfirmModal(false);
  };

  const ConfirmModal = () => {
    if (!showConfirmModal) return null;

    const selectedFiles = {
      videos: data.videos.filter((item) => selectedItems[item.id]),
      audios: data.audios.filter((item) => selectedItems[item.id]),
      pictures: data.pictures.filter((item) => selectedItems[item.id]),
      files: data.files.filter((item) => selectedItems[item.id]),
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <h3 className="text-lg font-semibold mb-4">Selected Files</h3>

          <div className="max-h-[40vh] overflow-y-auto mb-4">
            {Object.entries(selectedFiles).map(
              ([type, items]) =>
                items.length > 0 && (
                  <div key={type} className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2 capitalize">
                      {type}
                    </h4>
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="text-sm text-gray-600 flex items-center"
                        >
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          {item.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmCreate}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg
                hover:shadow-lg transform hover:scale-105 transition-all duration-200
                flex items-center space-x-2"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Confirm Create</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col">
          {/* Header - Fixed at top */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Create Share Link
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content - Scrollable area */}
          <div className="flex-1 overflow-y-auto p-6">
            {["Videos", "Audios", "Pictures", "Files"].map((section) => {
              const sectionKey = section.toLowerCase();
              return (
                <div key={section} className="mb-8 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center text-gray-700">
                    <span className="mr-2">{section}</span>
                  </h3>
                  <div className="space-y-2">
                    {data[sectionKey].map((item: Video) => (
                      <div
                        key={item.id}
                        className="flex items-center p-3 hover:bg-white rounded-lg transition-colors duration-200"
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems[item.id] || false}
                          onChange={() => handleCheckboxChange(item.id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-gray-700 font-medium">
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLinkClick}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg
                  hover:shadow-lg transform hover:scale-105 transition-all duration-200
                  flex items-center space-x-2"
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span>Create Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal />
    </>
  );
}
