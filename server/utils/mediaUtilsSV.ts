import { fileTypeFromBuffer } from 'file-type'; // Install first: npm install file-type

// Utility functions for media handling
export async function createMediaUrl(file: File): Promise<string> {
  // Create blob URL from file
  return URL.createObjectURL(file);
}

export async function loadMediaFromUrl(url: string): Promise<string> {
  try {
    // Fetch remote media and create local blob URL
    const response = await fetch(url);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error loading media:', error);
    throw error;
  }
}

export function analyseIpfsUrl(url: string) {
  const ipfsRegex = /https:\/\/ipfs\.io\/ipfs\/(.*)/;
  const match = url.match(ipfsRegex);
  return match ? match[1] : null;
}

// Supported media types definition
export const SUPPORTED_MEDIA_TYPES = {
  // Audio formats
  AUDIO: [
    'audio/mpeg',        // MP3
    'audio/wav',         // WAV
    'audio/ogg',         // OGG
    'audio/aac',         // AAC
    'audio/flac'         // FLAC
  ],
  // Video formats
  VIDEO: [
    'video/mp4',         // MP4
    'video/webm',        // WebM
    'video/ogg',         // OGV
    'video/x-matroska'   // MKV
  ],
  // Image formats
  IMAGE: [
    'image/jpeg',        // JPG/JPEG
    'image/png',         // PNG
    'image/gif',         // GIF
    'image/webp',        // WebP
    'image/svg+xml'      // SVG
  ]
} as const;

/**
 * Check file type from buffer content
 * @param content - ArrayBuffer of file content
 * @returns Promise resolving to MIME type string
 */
export const checkFileType = async (content: Buffer): Promise<string> => {
  try {
    // 直接使用 fileTypeFromBuffer，不需要转换为 Buffer
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
    const fileType = await fileTypeFromBuffer(buffer);
    
    
      // Special handling for formats that fileType might not detect
      if (isTextBasedSVG(new Uint8Array(content))) {
        return 'image/svg+xml';
      }
      if (!fileType) {
        return 'unknown';
      }

    return fileType.mime;
  } catch (error) {
    console.error('Error checking file type:', error);
    return 'unknown';
  }
};

/**
 * Check if the given MIME type is supported
 * @param mimeType - MIME type string to check
 * @returns boolean indicating if the type is supported
 */
export const isSupportedMediaType = (mimeType: string): boolean => {
  return [
    ...SUPPORTED_MEDIA_TYPES.AUDIO,
    ...SUPPORTED_MEDIA_TYPES.VIDEO,
    ...SUPPORTED_MEDIA_TYPES.IMAGE
  ].includes(mimeType);
};

/**
 * Get media category from MIME type
 * @param mimeType - MIME type string
 * @returns Category of the media ('audio', 'video', 'image', or 'unknown')
 */
export const getMediaCategory = (mimeType: string): 'audio' | 'video' | 'image' | 'unknown' => {
  if (SUPPORTED_MEDIA_TYPES.AUDIO.includes(mimeType)) return 'audio';
  if (SUPPORTED_MEDIA_TYPES.VIDEO.includes(mimeType)) return 'video';
  if (SUPPORTED_MEDIA_TYPES.IMAGE.includes(mimeType)) return 'image';
  return 'unknown';
};

/**
 * Helper function to check if content is SVG format
 * @param buffer - Buffer containing file content
 * @returns boolean indicating if content is SVG
 */
const isTextBasedSVG = (buffer: Uint8Array): boolean => {
  const content = Buffer.from(buffer).toString().trim();
  return content.startsWith('<svg') || content.includes('<?xml') && content.includes('<svg');
};

/* Usage Examples:

// Example 1: Check file type from URL
async function checkUrlFileType(url: string) {
  const buffer = await fetch(url).then(res => res.arrayBuffer());
  const mimeType = await checkFileType(buffer);
  return mimeType;
}

// Example 2: Handle file upload
async function handleFileUpload(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const mimeType = await checkFileType(arrayBuffer);
  
  if (!isSupportedMediaType(mimeType)) {
    throw new Error('Unsupported file type');
  }
  
  switch (getMediaCategory(mimeType)) {
    case 'audio':
      // Handle audio processing
      break;
    case 'video':
      // Handle video processing
      break;
    case 'image':
      // Handle image processing
      break;
  }
}
*/
