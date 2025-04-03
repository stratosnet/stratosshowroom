import { apiRequest } from "./queryClient";
import { Video, UploadVideo } from "@shared/schema";

// Default gateway domain for IPFS URLs
export const IPFS_GATEWAY_DOMAIN = 'spfs-gateway.thestratos.net';




export function getFileUri(fileHash: string) {
  if (fileHash.startsWith("Qm")){
    return `https://spfs-gateway.thestratos.net/ipfs/${fileHash}`;
  }
  if(fileHash.startsWith("bafy")){
    return `https://${fileHash}.ipfs.spfs-gateway.thestratos.net`;
  }
  return '';
}
// Extended Video interface with direct streaming URL
export interface ExtendedVideo extends Video {
  directStreamUrl?: string;
}

// Function to upload a video to the Stratos SPFS via the backend
export async function uploadVideo(
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<Video> {
  // Create a custom fetch that supports progress tracking
  const xhr = new XMLHttpRequest();
  
  // Setup a promise to handle the request result
  const promise = new Promise<Video>((resolve, reject) => {
    xhr.open("POST", "/api/videos/upload");
    
    // Setup progress tracking
    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error("Failed to parse server response"));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.message || "Upload failed"));
        } catch (e) {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };
    
    xhr.onerror = () => {
      reject(new Error("Network error during upload"));
    };
    
    xhr.send(formData);
  });
  
  return promise;
}

// New function for direct IPFS upload (doesn't require authentication)
export interface DirectUploadResponse {
  success: boolean;
  fileHash: string;
  fileUri: string;
  size: number;
  name: string;
  directStreamUrl: string;
  fallbackUrl: string;
  videoId?: number;
  title?: string;
  databaseError?: string;
}

export async function uploadDirectToIPFS(
  file: File,
  onProgress?: (progress: number) => void
): Promise<DirectUploadResponse> {
  // Create form data with just the file
  const formData = new FormData();
  formData.append("file", file);
  
  // Create a custom fetch that supports progress tracking
  const xhr = new XMLHttpRequest();
  
  // Setup a promise to handle the request result
  const promise = new Promise<DirectUploadResponse>((resolve, reject) => {
    xhr.open("POST", "/api/ipfs/direct-upload");
    
    // Setup progress tracking
    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error("Failed to parse server response"));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.message || "Upload failed"));
        } catch (e) {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };
    
    xhr.onerror = () => {
      reject(new Error("Network error during upload"));
    };
    
    xhr.send(formData);
  });
  
  return promise;
}

// Function to get the streaming URL for a video
export async function getStreamingUrl(fileHash: string): Promise<string> {
  try {
    // Get the streaming URL from the server
    const response = await fetch(`/api/videos/stream/${fileHash}`);
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error getting streaming URL:', error);
    // Fallback to direct Stratos URL format as a backup
    return `https://${fileHash}.ipfs.${IPFS_GATEWAY_DOMAIN}/`;
  }
}

// Function to fetch videos with direct streaming URLs
export async function fetchVideos(type?: string): Promise<ExtendedVideo[]> {
  const url = type ? `/api/videos?type=${type}` : '/api/videos';
  const response = await apiRequest<Video[]>(url);
  
  // Add directStreamUrl to each video
  if (response) {
    return response.map(video => ({
      ...video,
      directStreamUrl: video.fileHash ? 
        `https://${video.fileHash}.ipfs.${IPFS_GATEWAY_DOMAIN}/` : 
        undefined
    }));
  }
  
  return [];
}

// Function to fetch a single video with direct streaming URL
export async function fetchVideo(id: number): Promise<ExtendedVideo> {
  const response = await apiRequest<Video>(`/api/videos/${id}`);
  if (!response) {
    throw new Error(`Failed to fetch video with ID: ${id}`);
  }
  
  // Add directStreamUrl to the video
  return {
    ...response,
    directStreamUrl: response.fileHash ? 
      `https://${response.fileHash}.ipfs.${IPFS_GATEWAY_DOMAIN}/` : 
      undefined
  };
}

// Function to fetch videos by category with direct streaming URLs
export async function fetchVideosByCategory(category: string): Promise<ExtendedVideo[]> {
  const response = await apiRequest<Video[]>(`/api/videos/category/${category}`);
  
  // Add directStreamUrl to each video
  if (response) {
    return response.map(video => ({
      ...video,
      directStreamUrl: video.fileHash ? 
        `https://${video.fileHash}.ipfs.${IPFS_GATEWAY_DOMAIN}/` : 
        undefined
    }));
  }
  
  return [];
}

// Function to upload a thumbnail for a video
export async function uploadThumbnail(
  videoId: number,
  thumbnailFile: File,
  onProgress?: (progress: number) => void
): Promise<Video> {
  const formData = new FormData();
  formData.append("thumbnail", thumbnailFile);
  
  // Create a custom fetch that supports progress tracking
  const xhr = new XMLHttpRequest();
  
  // Setup a promise to handle the request result
  const promise = new Promise<Video>((resolve, reject) => {
    xhr.open("POST", `/api/videos/${videoId}/thumbnail`);
    
    // Setup progress tracking
    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error("Failed to parse server response"));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.message || "Upload failed"));
        } catch (e) {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };
    
    xhr.onerror = () => {
      reject(new Error("Network error during upload"));
    };
    
    xhr.send(formData);
  });
  
  return promise;
}

// Function to prepare a video upload
export function prepareVideoUpload(data: UploadVideo, file: File, thumbnailFile?: File | null): FormData {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("metadata", JSON.stringify({
    title: data.title,
    description: data.description,
    category: data.category
  }));
  
  // Add thumbnail file if provided
  if (thumbnailFile) {
    formData.append("thumbnail", thumbnailFile);
  }
  
  return formData;
}

// IPFS Direct Operations

// Fetch content from IPFS using its CID
export async function fetchIPFSContent(cid: string): Promise<string> {
  const response = await fetch(`/api/ipfs/cat?cid=${encodeURIComponent(cid)}`);
  await throwIfNotOk(response);
  return response.text();
}

// Helper function to check response status
async function throwIfNotOk(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text}`);
  }
}

// Pin content to IPFS
export async function pinContent(cid: string): Promise<{status: string, pins: string[]}> {
  const response = await apiRequest<{status: string, pins: string[]}>(`/api/ipfs/pin?cid=${encodeURIComponent(cid)}`, { method: "POST" });
  return response || { status: 'failed', pins: [] };
}

// Unpin content from IPFS
export async function unpinContent(cid: string): Promise<{status: string, pins: string[]}> {
  const response = await apiRequest<{status: string, pins: string[]}>(`/api/ipfs/unpin?cid=${encodeURIComponent(cid)}`, { method: "POST" });
  return response || { status: 'failed', pins: [] };
}

// List files in MFS
export async function listMFSFiles(path: string = "/"): Promise<{entries: {name: string, type: string, size: number}[]}> {
  const response = await apiRequest<{entries: {name: string, type: string, size: number}[]}>(`/api/ipfs/mfs/ls?path=${encodeURIComponent(path)}`);
  return response || { entries: [] };
}

// Add content to MFS
export async function addToMFS(cid: string, mfsPath: string): Promise<{added: boolean, path: string}> {
  const response = await apiRequest<{added: boolean, path: string}>(`/api/ipfs/mfs/add?cid=${encodeURIComponent(cid)}&path=${encodeURIComponent(mfsPath)}`, { method: "POST" });
  return response || { added: false, path: "" };
}

// Interface to describe IPFS video file information
export interface IPFSVideoFile {
  cid: string;
  size: number;
  fileType: string;
  name?: string;
}

// Find all video files in IPFS
export async function findIPFSVideos(): Promise<IPFSVideoFile[]> {
  const response = await apiRequest<{videos: IPFSVideoFile[]}>(`/api/ipfs/videos`);
  return response?.videos || [];
}

// Import video files from IPFS to the platform
export async function importIPFSVideos(): Promise<{
  total: number;
  imported: number;
  skipped: number;
  videos: Video[];
}> {
  const response = await apiRequest<{
    total: number;
    imported: number;
    skipped: number;
    videos: Video[];
  }>(`/api/ipfs/videos/import`, { method: "POST" });
  
  return response || { total: 0, imported: 0, skipped: 0, videos: [] };
}

// Interface for the manual import video data
export interface ManualImportVideo {
  cid: string;
  title?: string;
  description?: string;
  category?: string;
  size?: number;
  duration?: number;
}

// Manually import specific videos from IPFS to the platform
export async function importManualVideos(videos: ManualImportVideo[]): Promise<{
  total: number;
  imported: number;
  skipped: number;
  videos: Video[];
}> {
  const response = await apiRequest<{
    total: number;
    imported: number;
    skipped: number;
    videos: Video[];
  }>(`/api/ipfs/videos/import/manual`, { 
    method: "POST",
    body: JSON.stringify({ videos }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  
  return response || { total: 0, imported: 0, skipped: 0, videos: [] };
}

// We no longer need VideoFrames interface or frame selection
// as thumbnails are now automatically generated during upload

// Get IPFS gateway configuration
export async function getGatewayConfig(): Promise<{
  rpcApi: string;
  publicGateway: string;
  pathGateway: string;
}> {
  const response = await apiRequest<{
    rpcApi: string;
    publicGateway: string;
    pathGateway: string;
  }>(`/api/ipfs/config`);
  
  return response || { 
    rpcApi: '', 
    publicGateway: '', 
    pathGateway: '' 
  };
}

// Update RPC API endpoint
export async function updateRpcApi(rpcApi: string): Promise<{
  status: string;
  message: string;
  config: {
    rpcApi: string;
    publicGateway: string;
    pathGateway: string;
  };
}> {
  const response = await apiRequest<{
    status: string;
    message: string;
    config: {
      rpcApi: string;
      publicGateway: string;
      pathGateway: string;
    };
  }>(`/api/ipfs/config/rpc`, {
    method: "POST",
    body: JSON.stringify({ rpcApi }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  
  return response || { 
    status: 'error', 
    message: 'Failed to update RPC API endpoint',
    config: { rpcApi: '', publicGateway: '', pathGateway: '' }
  };
}

// Update Public Gateway
export async function updatePublicGateway(gateway: string): Promise<{
  status: string;
  message: string;
  config: {
    rpcApi: string;
    publicGateway: string;
    pathGateway: string;
  };
}> {
  const response = await apiRequest<{
    status: string;
    message: string;
    config: {
      rpcApi: string;
      publicGateway: string;
      pathGateway: string;
    };
  }>(`/api/ipfs/config/public-gateway`, {
    method: "POST",
    body: JSON.stringify({ gateway }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  
  return response || { 
    status: 'error', 
    message: 'Failed to update public gateway',
    config: { rpcApi: '', publicGateway: '', pathGateway: '' }
  };
}

// Update Path Gateway
export async function updatePathGateway(gateway: string): Promise<{
  status: string;
  message: string;
  config: {
    rpcApi: string;
    publicGateway: string;
    pathGateway: string;
  };
}> {
  const response = await apiRequest<{
    status: string;
    message: string;
    config: {
      rpcApi: string;
      publicGateway: string;
      pathGateway: string;
    };
  }>(`/api/ipfs/config/path-gateway`, {
    method: "POST",
    body: JSON.stringify({ gateway }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  
  return response || { 
    status: 'error', 
    message: 'Failed to update path gateway',
    config: { rpcApi: '', publicGateway: '', pathGateway: '' }
  };
}

// Test the gateway connection
export async function testGatewayConnection(): Promise<{
  status: string;
  message: string;
}> {
  const response = await apiRequest<{status: string, message: string}>(`/api/ipfs/test-connection`);
  return response || { status: 'error', message: 'Failed to connect to gateway' };
}

// Add a single video by CID (simplified function)
export async function addVideoByCID(cid: string, title?: string, description?: string, category?: string): Promise<{
  success: boolean;
  video?: Video;
  message: string;
}> {
  try {
    const response = await importManualVideos([
      {
        cid,
        title: title || `IPFS Video ${cid.substring(0, 8)}`,
        description: description || `Video added from IPFS with CID: ${cid}`,
        category: category || 'Other'
      }
    ]);
    
    if (response.imported > 0 && response.videos.length > 0) {
      return { 
        success: true, 
        video: response.videos[0], 
        message: 'Video added successfully' 
      };
    }
    
    return { 
      success: false, 
      message: response.skipped > 0 ? 'Video already exists in library' : 'Failed to add video' 
    };
  } catch (error) {
    console.error('Error adding video by CID:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}
