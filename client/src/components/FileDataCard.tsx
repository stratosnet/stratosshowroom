import { Video } from "@shared/schema";
import { FileIcon } from "lucide-react";

interface FileDataCardProps {
  file: Video;
}

export default function FileDataCard({ file }: FileDataCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-2">
          <FileIcon className="w-6 h-6 text-gray-500" />
          <h3 className="font-semibold text-lg truncate">{file.title}</h3>
        </div>

        {file.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {file.description}
          </p>
        )}

        <div className="text-sm text-gray-500 space-y-1">
          <p>Type: {file.type}</p>
          <p>
            Size:{" "}
            {file.size
              ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
              : "Unknown"}
          </p>
          {/* <p>
            Uploaded:{" "}
            {file.createdAt
              ? new Date(file.createdAt).toLocaleDateString()
              : "Unknown"}
          </p> */}
        </div>

        <div className="mt-4 flex justify-end">
          <a
            href={file.fileUri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
