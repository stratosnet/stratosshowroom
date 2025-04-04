import { ShareLink } from "@/utils/localStorageData";

interface ShareLinkCardProps {
  sharelink: ShareLink;
}

export default function ShareLinkCard({ sharelink }: ShareLinkCardProps) {
  const handleClick = () => {
    window.open(sharelink.url, "_self");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Card Header */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {sharelink.title || "Untitled Share"}
        </h3>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {sharelink.description || "No description provided"}
        </p>

        {/* Created Date */}
        <div className="text-xs text-gray-500 mb-4">
          Created:{" "}
          {new Date(sharelink.createdAt || Date.now()).toLocaleDateString()}
        </div>

        {/* Share Link Button */}
        <button
          onClick={handleClick}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Open Share Link
        </button>
      </div>
    </div>
  );
}
