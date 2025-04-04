import { getFileUri } from "@/lib/stratosSdk";
import { Picture } from "@shared/schema";
import { useEffect } from "react";

interface PictureCardProps {
  picture: Picture;
}

export default function PictureCard({ picture }: PictureCardProps) {
  useEffect(() => {
    console.log(picture);
    if (!picture.fileUri || picture.fileUri.length <= 1) {
      picture.fileUri = getFileUri(picture.fileHash);
    }
  }, [picture]);

  // Add click handler
  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (picture.fileUri) {
      window.open(picture.fileUri, "_blank");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="aspect-w-16 aspect-h-9 relative">
        <img
          src={picture.fileUri}
          alt={picture.title}
          className="object-contain w-full h-full cursor-pointer"
          onClick={handleImageClick}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {picture.title}
        </h3>
        <p className="text-gray-600 text-sm mb-2">{picture.description}</p>
        {picture.type && (
          <p className="text-gray-500 text-sm">{picture.type}</p>
        )}
        {picture.tags && (
          <div className="flex flex-wrap gap-2 mt-2">
            {picture.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
