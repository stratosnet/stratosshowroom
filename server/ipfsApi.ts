// import axios from "axios";
// import { log } from "./vite";

// // Configuration for IPFS endpoints
// let STRATOS_RPC_API = "https://sds-gateway-uswest.thestratos.org/spfs/xxxxxxxxxxxxxxxxxxxxxxxxx/api/v0";
// let STRATOS_PUBLIC_GATEWAY = "https://spfs-gateway.thestratos.net";
// let STRATOS_PATH_GATEWAY = "https://spfs-gateway.thestratos.net";
// const STRATOS_WALLET_ADDRESS = process.env.STRATOS_WALLET_ADDRESS;

// // Function to update the RPC API endpoint
// export function updateRpcApi(newRpcApi: string): void {
//   STRATOS_RPC_API = newRpcApi;
//   log(`Updated RPC API to: ${STRATOS_RPC_API}`, "ipfs");
// }

// // Function to update the public gateway
// export function updatePublicGateway(newGateway: string): void {
//   STRATOS_PUBLIC_GATEWAY = newGateway;
//   log(`Updated Public Gateway to: ${STRATOS_PUBLIC_GATEWAY}`, "ipfs");
// }

// // Function to update the path gateway
// export function updatePathGateway(newGateway: string): void {
//   STRATOS_PATH_GATEWAY = newGateway;
//   log(`Updated Path Gateway to: ${STRATOS_PATH_GATEWAY}`, "ipfs");
// }

// // Function to get current configuration
// export function getGatewayConfig(): { rpcApi: string, publicGateway: string, pathGateway: string } {
//   return {
//     rpcApi: STRATOS_RPC_API,
//     publicGateway: STRATOS_PUBLIC_GATEWAY,
//     pathGateway: STRATOS_PATH_GATEWAY
//   };
// }

// // Log configuration
// log("IPFS Gateway Configuration:", "ipfs");
// log(`- RPC API: ${STRATOS_RPC_API}`, "ipfs");
// log(`- Public Gateway: ${STRATOS_PUBLIC_GATEWAY}`, "ipfs");
// if (STRATOS_WALLET_ADDRESS) {
//   log(`- Wallet Address: ${STRATOS_WALLET_ADDRESS}`, "ipfs");
// } else {
//   log("- No wallet address configured", "ipfs");
// }

// // Create a standard axios instance for public gateway requests
// const publicGatewayAxios = axios.create({
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Create an axios instance for RPC API access (when needed)
// const rpcAxios = axios.create({
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Helper functions for gateway URLs
// export function getSubdomainGatewayUrl(cid: string, filename?: string): string {
//   // Use subdomain-style URL format: <cid>.ipfs.<gateway>
//   // Make sure to strip any protocol prefixes and trailing slashes from the gateway
//   const gatewayDomain = STRATOS_PUBLIC_GATEWAY
//     .replace(/^https?:\/\//, '')  // Remove http:// or https://
//     .replace(/\/$/, '');  // Remove trailing slash
  
//   let url = `https://${cid}.ipfs.${gatewayDomain}`;
  
//   // Add filename as a query parameter if provided
//   if (filename) {
//     url += `?filename=${encodeURIComponent(filename)}`;
//   }
  
//   log(`Generated subdomain gateway URL: ${url}`, 'ipfs');
//   return url;
// }

// export function getPathGatewayUrl(cid: string, filename?: string): string {
//   // Use path-style URL format: <gateway>/ipfs/<cid>
//   // First normalize the gateway URL to ensure consistency
//   let gatewayUrl = STRATOS_PATH_GATEWAY;
//   if (!gatewayUrl.endsWith('/')) {
//     gatewayUrl += '/';
//   }
  
//   // Build the full URL
//   let url = `${gatewayUrl}ipfs/${cid}`;
  
//   // Add filename as a query parameter if provided
//   if (filename) {
//     url += `?filename=${encodeURIComponent(filename)}`;
//   }
  
//   log(`Generated path gateway URL: ${url}`, 'ipfs');
//   return url;
// }

// // Interface for video file information
// export interface IPFSVideoFile {
//   cid: string;
//   size: number;
//   fileType: string;
//   name?: string; 
// }

// // Cat - Display file contents using the public gateway
// export async function catIPFSContent(cid: string): Promise<string> {
//   try {
//     log(`Fetching content from IPFS: ${cid}`, 'ipfs');
    
//     // Use the path-style gateway URL for content retrieval
//     const gatewayUrl = getPathGatewayUrl(cid);
//     log(`Using gateway URL: ${gatewayUrl}`, 'ipfs');
    
//     const response = await publicGatewayAxios.get(gatewayUrl, {
//       responseType: 'text'
//     });
    
//     if (response.status !== 200) {
//       throw new Error(`Failed to fetch content: ${response.statusText}`);
//     }
    
//     return response.data;
//   } catch (error) {
//     log(`Error fetching content from IPFS: ${error instanceof Error ? error.message : String(error)}`, 'ipfs');
//     throw error;
//   }
// }

// // Pin - Pin content to the node (using RPC API)
// export async function pinIPFSContent(cid: string): Promise<{status: string, pins: string[]}> {
//   try {
//     log(`Pinning content to IPFS: ${cid}`, 'ipfs');
    
//     // Note: For true pinning, we would need RPC API access.
//     // As a fallback, we'll simulate successful pinning since we're using public gateway.
//     log(`Note: Using public gateway - pin functionality is simulated`, 'ipfs');
    
//     return {
//       status: "pinned",
//       pins: [cid]
//     };
//   } catch (error) {
//     log(`Error pinning content to IPFS: ${error instanceof Error ? error.message : String(error)}`, 'ipfs');
//     throw error;
//   }
// }

// // Unpin - Remove a CID from the node (using RPC API)
// export async function unpinIPFSContent(cid: string): Promise<{status: string, pins: string[]}> {
//   try {
//     log(`Unpinning content from IPFS: ${cid}`, 'ipfs');
    
//     // Note: For true unpinning, we would need RPC API access.
//     // As a fallback, we'll simulate successful unpinning since we're using public gateway.
//     log(`Note: Using public gateway - unpin functionality is simulated`, 'ipfs');
    
//     return {
//       status: "unpinned",
//       pins: [cid]
//     };
//   } catch (error) {
//     log(`Error unpinning content from IPFS: ${error instanceof Error ? error.message : String(error)}`, 'ipfs');
//     throw error;
//   }
// }

// // MFS List - Show files in Mutable File System
// export async function listMFSFiles(path: string = "/"): Promise<{entries: {name: string, type: string, size: number}[]}> {
//   try {
//     log(`Listing MFS files at path: ${path}`, 'ipfs');
    
//     // Note: MFS operations require RPC API access.
//     // Since we're using the public gateway, we'll return an empty list.
//     log(`Note: Using public gateway - MFS functionality is limited`, 'ipfs');
    
//     return {
//       entries: []
//     };
//   } catch (error) {
//     log(`Error listing MFS files: ${error instanceof Error ? error.message : String(error)}`, 'ipfs');
//     throw error;
//   }
// }

// // MFS Add - Add a CID to Mutable File System (MFS)
// export async function addToMFS(cid: string, mfsPath: string): Promise<{added: boolean, path: string}> {
//   try {
//     log(`Adding CID ${cid} to MFS at path: ${mfsPath}`, 'ipfs');
    
//     // Note: MFS operations require RPC API access.
//     // Since we're using the public gateway, we'll simulate success.
//     log(`Note: Using public gateway - MFS functionality is limited`, 'ipfs');
    
//     return {
//       added: true,
//       path: mfsPath
//     };
//   } catch (error) {
//     log(`Error adding CID to MFS: ${error instanceof Error ? error.message : String(error)}`, 'ipfs');
//     throw error;
//   }
// }

// // List all pinned content in IPFS
// export async function listPinnedContent(): Promise<string[]> {
//   try {
//     log(`Listing all pinned content`, 'ipfs');
    
//     // Since we're using the public gateway, we don't have a way to list pinned content directly.
//     // Instead, we'll use a known list of video CIDs from our sample videos.
//     log(`Note: Using public gateway - using predefined list of known CIDs`, 'ipfs');
    
//     // These are the CIDs of our known Stratos sample videos
//     const knownCids = [
//       'bafybeiazrzwxuf3kti3raxysuwmx4siqabjvhbegydxnoxvgoujvykpv4a', // DOOM - The Only Thing They Fear
//       'bafybeigivvgexk6zft546ckrpy7jck2cbuie6fp772olj6sny3t6hmmr4y', // 20 Small And Cute Exotic Animals
//       'bafybeihp5y7afeun3anx5pyxj4ts3rfcz5n34fgk3iajh7ndy2pn6hdhne', // Ace Ventura in Middle-Earth
//       'bafybeidgf5adbrwf35n7if4xlm34x5vs3742aml5ijt6kjwozogrxv4t7u', // All Aboard To Jurassic Park
//       'bafybeifmlhte7dr6h2iiz2ya2sc36ymtocu5ooam7mdr4k2xf2fbqieody', // Astartes II – Official Teaser
//       'bafybeih6xvwx3zxeykhsccwyjye2vgmx4bdf53lz5uf6y7scu7jlaw3cdm', // Scary Movie 3: Friendly Aliens
//       'bafybeieke3ctwziwunlgpdmjmwk6ira5pinoptjdzuwcipebeo2gytylaq', // SONIC X SHADOW GENERATIONS
//       'bafybeig7fizzmdrastujwkq6xtaqwitc2j4x4ottxrrtrmmf3dzaaym634', // The Alps 4K Drone & iPhone X
//       'bafybeibro5fiyfmnktx5676d5rewpso755rjxnugxszzu3slkvo36xech4', // The T.rex Escapes the Paddock
//       'bafybeidy4hpe7dvkccbttnucduzrbe27xjwzu6narq3lnnibdkdzyea33m', // World of Warcraft: Night Elves
//       'bafybeictwh2f3vjb7yftrvw7mv2vmks2yo5bvcnf2aqiyq34f5ixj5cj6y', // Bulgaria 8K HDR 60P
//       'bafybeidu2hvikonrisopm5bsyloqmq6dc2lrfd4zyspfqixccm3idnvapm', // Hawaii in 8K | HDR 60FPS
//       'bafybeicujsshgrh5scbhuoyktt4rrpnu3ydfdjyxkh3gdbcvlakdatlh6m'  // This is Indonesia - TRAVEL FILM
//     ];
    
//     log(`Found ${knownCids.length} known CIDs`, 'ipfs');
//     return knownCids;
//   } catch (error) {
//     log(`Error listing pinned content: ${error instanceof Error ? error.message : String(error)}`, 'ipfs');
//     throw error;
//   }
// }

// // Get file details from IPFS
// export async function getFileDetails(cid: string): Promise<any> {
//   try {
//     log(`Getting file details for CID: ${cid}`, 'ipfs');
    
//     // Using public gateway, we can't easily get detailed metadata.
//     // We'll simulate a response with basic information.
//     log(`Note: Using public gateway - file details are estimated`, 'ipfs');
    
//     return {
//       CumulativeSize: 1024 * 1024 * 50, // Assume 50MB size as placeholder
//       Hash: cid,
//       DataSize: 1024 * 1024 * 50,
//       NumLinks: 0
//     };
//   } catch (error) {
//     log(`Error getting file details: ${error instanceof Error ? error.message : String(error)}`, 'ipfs');
//     throw error;
//   }
// }

// // Check if a file is likely a video by examining its content type
// export async function isVideoFile(cid: string): Promise<{isVideo: boolean, fileType: string}> {
//   try {
//     log(`Checking if ${cid} is a video file`, 'ipfs');
    
//     // Since this is a known list of sample videos from Stratos, we'll return true for all
//     // In a real implementation with the RPC API, we would fetch the beginning bytes to check the signature
//     log(`Note: Using public gateway - assuming all CIDs are video files`, 'ipfs');
    
//     return { 
//       isVideo: true, 
//       fileType: 'video/mp4' 
//     };
//   } catch (error) {
//     // If we can't determine the file type, assume it's not a video
//     log(`Error checking if file is video: ${error instanceof Error ? error.message : String(error)}`, 'ipfs');
//     return { isVideo: false, fileType: '' };
//   }
// }

// // Find video files from all pinned content
// // Extract frames from a video at different time points for thumbnail selection
// export async function extractVideoFrames(cid: string, numFrames: number = 3): Promise<string[]> {
//   try {
//     log(`Extracting ${numFrames} frames from video ${cid}`, 'ipfs');
    
//     // In a production implementation, we would:
//     // 1. Download the video temporarily
//     // 2. Use FFmpeg to extract frames at different positions
//     // 3. Upload those frames back to IPFS
//     // 4. Return the CIDs of the frame images
    
//     // For this implementation, we'll simulate frame extraction by generating 
//     // frame identifiers that represent specific points in the video
//     const frames = [];
    
//     // Validate and limit the number of frames
//     numFrames = Math.max(1, Math.min(10, numFrames));
    
//     for (let i = 0; i < numFrames; i++) {
//       // Calculate position as percentage (0%, 25%, 50%, 75%, etc.)
//       const position = Math.floor((i / (numFrames - 1 || 1)) * 100);
      
//       // For a more realistic implementation, we would:
//       // 1. Extract an actual frame from the video at this position
//       // 2. Save it as an image (e.g., JPEG)
//       // 3. Upload the image to IPFS
//       // 4. Store the resulting CID
      
//       // For now, we'll simulate this by encoding the position in the CID
//       // This allows the client to request different frame positions
//       frames.push(`${cid}?frame=${position}`);
//     }
    
//     log(`Generated ${frames.length} frame references for video ${cid}`, 'ipfs');
//     return frames;
//   } catch (error) {
//     log(`Error extracting frames from ${cid}: ${error instanceof Error ? error.message : String(error)}`, 'ipfs');
//     throw error;
//   }
// }

// // Function to test auth and connectivity with Stratos gateways
// export async function testAuth(): Promise<boolean> {
//   try {
//     log("Testing connectivity with Stratos public gateway...", "ipfs");
    
//     // Try a basic request to the public gateway
//     const testCid = 'bafybeiazrzwxuf3kti3raxysuwmx4siqabjvhbegydxnoxvgoujvykpv4a'; // DOOM video
//     const gatewayUrl = getPathGatewayUrl(testCid);
    
//     // Just do a HEAD request to check if the gateway responds
//     const response = await publicGatewayAxios.head(gatewayUrl);
    
//     if (response.status >= 200 && response.status < 300) {
//       log("Successfully connected to Stratos public gateway", "ipfs");
//       return true;
//     } else {
//       log(`Failed to connect to Stratos public gateway: ${response.status} - ${response.statusText}`, "ipfs");
//       return false;
//     }
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       log(`Gateway connectivity error: ${error.response?.status} - ${error.message}`, "ipfs");
//     } else {
//       log(`Gateway connectivity error: ${error instanceof Error ? error.message : String(error)}`, "ipfs");
//     }
//     return false;
//   }
// }

// // Direct IPFS file upload using RPC API
// export async function uploadFileToIPFS(
//   fileBuffer: Buffer,
//   fileName: string
// ): Promise<{ Hash: string; Name: string; Size: string }> {
//   try {
//     log(`Uploading file directly to IPFS via RPC API: ${fileName}`, 'ipfs');
    
//     // Create form data object for the file upload
//     const formData = new FormData();
//     formData.append('file', new Blob([fileBuffer]), fileName);
    
//     // Format the URL for the IPFS add operation
//     const url = `${STRATOS_RPC_API}/add`;
    
//     log(`Using IPFS API endpoint: ${url}`, 'ipfs');
    
//     // Upload the file using axios
//     const response = await axios.post(url, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//       // Include wallet address if available
//       ...(STRATOS_WALLET_ADDRESS ? {
//         params: {
//           'wallet-address': STRATOS_WALLET_ADDRESS
//         }
//       } : {})
//     });
    
//     if (response.status !== 200) {
//       throw new Error(`IPFS add failed: ${response.statusText}`);
//     }
    
//     log(`Successfully uploaded file to IPFS: ${response.data.Hash}`, 'ipfs');
//     return response.data;
//   } catch (error) {
//     log(`Error uploading file to IPFS: ${error instanceof Error ? error.message : String(error)}`, 'ipfs');
//     throw error;
//   }
// }

// export async function findVideoFiles(): Promise<IPFSVideoFile[]> {
//   try {
//     log(`Searching for video files in IPFS`, 'ipfs');
    
//     // Get all sample CIDs
//     const cids = await listPinnedContent();
//     const videoFiles: IPFSVideoFile[] = [];
  
//     // Process each sample CID
//     for (const cid of cids) {
//       try {
//         // Get file details
//         const details = await getFileDetails(cid);
        
//         // Add to video files list
//         videoFiles.push({
//           cid,
//           size: details.CumulativeSize || 0,
//           fileType: 'video/mp4',
         
//         });
      
//       } catch (error) {
//         // Skip files that cause errors
//         log(`Error processing CID ${cid}: ${error instanceof Error ? error.message : String(error)}`, 'ipfs');
//       }
//     }
    
//     log(`Found ${videoFiles.length} video files out of ${cids.length} CIDs`, 'ipfs');
//     return videoFiles;
//   } catch (error) {
//     log(`Error finding video files: ${error instanceof Error ? error.message : String(error)}`, 'ipfs');
//     throw error;
//   }
// }