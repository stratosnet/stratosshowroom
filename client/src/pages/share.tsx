import { useEffect, useState } from "react";
import { Video } from "@shared/schema";
import { getFileUri } from "../lib/stratosSdk";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const jsonParam = params.get("json");

        if (!jsonParam) {
          setError("No files provided");
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
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shared Content</h1>
          <button
            onClick={() => {
              const currentUrl = window.location.href;
              navigator.clipboard.writeText(currentUrl);
              alert("Share link copied to clipboard!");
            }}
            className="
              inline-flex items-center 
              px-4 py-2 
              border border-gray-300 
              shadow-sm 
              text-sm font-medium 
              rounded-md 
              text-gray-700 
              bg-white 
              hover:bg-gray-50 
              focus:outline-none 
              focus:ring-2 
              focus:ring-offset-2 
              focus:ring-blue-500
              transition-all
              duration-200
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
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            Copy Share Link
          </button>
        </div>

        <div className="space-y-8">
          {["Videos", "Audios", "Pictures", "Files"].map((section) => {
            const sectionKey = section.toLowerCase() as keyof SharedData;
            const items = data[sectionKey];

            if (items.length === 0) return null;

            return (
              <div key={section} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {section}
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="mt-1 text-sm text-gray-500">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="ml-4">
                          <a
                            href={item.fileUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
