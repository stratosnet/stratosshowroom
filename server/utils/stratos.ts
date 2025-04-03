import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { log } from '../vite';
import { checkFileType } from './mediaUtilsSV';
import mime from 'mime';

// File operations
const unlinkAsync = promisify(fs.unlink);

// SPFS API connection settings

const config = {
  baseUrl: "https://sds-gateway-uswest.thestratos.org",
  path: "/spfs",
  accessToken: process.env.SDS_GATEWAY_ACCESS_TOKEN,
  endpoint: "/api/v0"
};



const STRATOS_API_ENDPOINT = process.env.STRATOS_API_ENDPOINT || `${config.baseUrl}${config.path}/${config.accessToken}${config.endpoint}`;
const STRATOS_PUBLIC_GATEWAY = process.env.STRATOS_PUBLIC_GATEWAY || 'spfs-gateway.thestratos.net';
const STRATOS_WALLET_ADDRESS = process.env.STRATOS_WALLET_ADDRESS || '';
const STRATOS_WALLET_MNEMONIC = process.env.STRATOS_WALLET_MNEMONIC || '';

interface UploadFileResponse {
  cid: string;
  cidUri: string;
  fileHash: string;
  fileUri: string;
  type: string;
  size: number;
  title: string;
  description: string;
  category:string;
  duration: number;
}

interface RetrieveFileInfo {
  fileUri: string;
  fileHash: string; 
  fileName: string;
  contentType: string;
}

// Upload file to Stratos SPFS
export async function uploadToStratosSPFS(
  filePath: string, 
  fileName: string, 
  contentType: string
): Promise<UploadFileResponse> {
  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);
    const fileBuffer = await fs.promises.readFile(filePath);
    const type = await checkFileType(fileBuffer);
    const type1 = mime.lookup(filePath); 
 
    log(`type: ${type}`);
    
    log(`type1: ${type1}`); 
    log(`contentType: ${contentType}`); 

    // formData.append('file', fileStream);
    
    log(`Uploading file to Stratos SPFS: ${fileName}`);


    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: contentType,
    });

    const response = await axios({
      method: 'post',
      url: `${STRATOS_API_ENDPOINT}/add`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });


    // const response = await axios.post(
    //   `${STRATOS_API_ENDPOINT}/add`, 
    //   formData, 
    //   {
    //     headers: {
    //       ...formData.getHeaders(),
    //       'Content-Type': 'multipart/form-data',
    //     },
    //   }
    // );

    if (response.status !== 200) {
      throw new Error(`Failed to upload file to Stratos SPFS: ${response.statusText}`);
    }

    // IPFS response structure, which includes the hash as the CID
    const { Hash: fileHash, Size: size } = response.data;
    let fileUri=getFileUri(fileHash);
    const stats = fs.statSync(filePath);
    
    // Delete the temp file after successful upload
    await unlinkAsync(filePath);
    log(`Successfully uploaded file to Stratos SPFS: ${fileUri}`);
    return {
      cid: '',
      cidUri: '',
      fileHash: fileHash,
      fileUri: fileUri||'',
      type: contentType,
      size: stats.size,
      title: fileName,
      description: '',
      category: '',
      duration: 0
    };
  } catch (error) {
    log(`Error uploading file to Stratos SPFS: ${error instanceof Error ? error.message : String(error)}`);
    
    // Clean up temp file if upload fails
    try {
      await unlinkAsync(filePath);
    } catch (unlinkError) {
      // Ignore errors if file doesn't exist
    }
    
    throw error;
  }
}

// Retrieve file info from Stratos SPFS
export async function retrieveFileInfo(fileHash: string): Promise<RetrieveFileInfo> {
  try {
    log(`Retrieving file info from Stratos SPFS: ${fileHash}`);
    
    // Use the get endpoint with arg parameter for the CID
    const response = await axios.post(
      `${STRATOS_API_ENDPOINT}/get?arg=${fileHash}`
    );

    if (response.status !== 200) {
      throw new Error(`Failed to retrieve file info: ${response.statusText}`);
    }

    // IPFS get doesn't typically return metadata in the way we expect
    // We'll construct our best guess based on the fileHash
    const fileName = fileHash; // Use the hash as filename if we can't determine it
    const contentType = "application/octet-stream"; // Default content type
    
    return {
      fileUri: `spfs://${fileHash}`,
      fileHash,
      fileName,
      contentType
    };
  } catch (error) {
    log(`Error retrieving file info from Stratos SPFS: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

// Get streaming URL from Stratos SPFS
export function getStreamingUrl(fileHash: string): string {
  // Check if we have frame parameters in the fileHash
  let frameParam = '';
  let cleanFileHash = fileHash;
  
  if (fileHash.includes('?')) {
    // Extract the frame parameter
    const [cid, queryParams] = fileHash.split('?');
    cleanFileHash = cid;
    frameParam = queryParams;
  }
  
  // Clean any prefix if present
  cleanFileHash = cleanFileHash.replace(/^ipfs:\/\/|^spfs:\/\//i, '');
  
  // Use subdomain-style URL for the gateway
  // Format: https://<CID>.ipfs.spfs-gateway.thestratos.net/
  let gatewayUrl = `https://${cleanFileHash}.ipfs.spfs-gateway.thestratos.net/`;
  
  // If this is a long CID that might cause issues with subdomain style URLs,
  // fallback to path-style URL
  if (cleanFileHash.length > 60) {
    gatewayUrl = `https://spfs-gateway.thestratos.net/ipfs/${cleanFileHash}/`;
  }
  
  // Append the frame parameter if it exists
  if (frameParam) {
    gatewayUrl = `${gatewayUrl}?${frameParam}`;
  }
  
  return gatewayUrl;
}

// Delete file from Stratos SPFS
export async function deleteFromStratosSPFS(fileHash: string): Promise<boolean> {
  try {
    log(`Deleting file from Stratos SPFS: ${fileHash}`);
    
    // No direct delete endpoint in standard IPFS API
    // This might need to be adjusted based on Stratos implementation
    const response = await axios.post(
      `${STRATOS_API_ENDPOINT}/pin/rm?arg=${fileHash}`
    );

    if (response.status !== 200) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    log(`Error deleting file from Stratos SPFS: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}


export function getFileUri(fileHash: string) {
  if (fileHash.startsWith("Qm")){
    return `https://spfs-gateway.thestratos.net/ipfs/${fileHash}`;
  }
  if(fileHash.startsWith("bafy")){
    return `https://${fileHash}.ipfs.spfs-gateway.thestratos.net`;
  }
  return '';
}
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
  let thumbnailUri = getFileUri(fileHash)+'?frame=25';;
 
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
