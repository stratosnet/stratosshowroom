import { log } from "./vite";

/**
 * Generate thumbnail URI for a video
 * @param fileHash IPFS hash of the video file
 * @param thumbnailFile Optional custom thumbnail file
 * @returns Thumbnail URI
 */
export async function generateThumbnailUri(
  fileHash: string,
  thumbnailFile?: Express.Multer.File
): Promise<string> {
  // Default to using video frame as thumbnail
  let thumbnailUri = `https://${fileHash}.ipfs.spfs-gateway.thestratos.net/?frame=25`;
  
  if (thumbnailFile) {
    try {
      if (!thumbnailFile.mimetype.startsWith('image/')) {
        log(`Thumbnail file is not an image: ${thumbnailFile.mimetype}`, "routes");
      } else {
        const thumbnailUpload = await uploadToStratosSPFS(
          thumbnailFile.path,
          thumbnailFile.originalname,
          thumbnailFile.mimetype
        );
        thumbnailUri = thumbnailUpload.fileUri;
        log(`Using custom thumbnail: ${thumbnailUri}`, "routes");
      }
    } catch (thumbnailError) {
      log(`Error uploading custom thumbnail, using default: ${thumbnailError}`, "routes");
    }
  }
  
  return thumbnailUri;
} 