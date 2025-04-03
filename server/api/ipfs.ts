// import { Router, Request, Response } from "express";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
// import { log } from "../vite";
// import { requireAdmin } from "../middleware";
// import { 
//   catIPFSContent, 
//   pinIPFSContent, 
//   unpinIPFSContent, 
//   listMFSFiles, 
//   addToMFS,
//   findVideoFiles,
//   extractVideoFrames,
//   testAuth,
//   getGatewayConfig,
//   updateRpcApi,
//   updatePublicGateway,
//   updatePathGateway,
//   uploadFileToIPFS,
//   getSubdomainGatewayUrl,
//   getPathGatewayUrl
// } from "../ipfsApi";
// import { storage } from "../storage";
// import { getStreamingUrl } from "../utils/stratos";

// // Get __dirname equivalent in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Configure multer for file uploads
// const upload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       const uploadDir = path.join(__dirname, "../../uploads");
//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//       }
//       cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//       const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       cb(null, uniqueSuffix + path.extname(file.originalname));
//     },
//   }),
//   limits: {
//     fileSize: 500 * 1024 * 1024, // 500MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     const filetypes = /mp4|mov|avi|wmv|flv|mkv|webm/;
//     const mimetype = filetypes.test(file.mimetype);
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

//     if (mimetype && extname) {
//       return cb(null, true);
//     }
//     cb(new Error("Only video files are allowed"));
//   },
// });

// const router = Router();

// /**
//  * Cat - Display file contents
//  * GET /api/ipfs/cat
//  */
// router.get("/cat", requireAdmin, async (req: Request, res: Response) => {
//   try {
//     const { cid } = req.query;
    
//     if (!cid || typeof cid !== 'string') {
//       return res.status(400).json({ message: "CID parameter is required" });
//     }
    
//     const content = await catIPFSContent(cid);
    
//     res.setHeader('Content-Type', 'text/plain');
//     return res.send(content);
//   } catch (error) {
//     log(`Error fetching IPFS content: ${error instanceof Error ? error.message : String(error)}`);
//     return res.status(500).json({ 
//       message: "Failed to fetch IPFS content", 
//       error: error instanceof Error ? error.message : String(error)
//     });
//   }
// });

// /**
//  * Pin - Pin content to the node
//  * POST /api/ipfs/pin
//  */
// router.post("/pin", requireAdmin, async (req: Request, res: Response) => {
//   try {
//     const { cid } = req.query;
    
//     if (!cid || typeof cid !== 'string') {
//       return res.status(400).json({ message: "CID parameter is required" });
//     }
    
//     const result = await pinIPFSContent(cid);
    
//     return res.json(result);
//   } catch (error) {
//     log(`Error pinning IPFS content: ${error instanceof Error ? error.message : String(error)}`);
//     return res.status(500).json({ 
//       message: "Failed to pin IPFS content", 
//       error: error instanceof Error ? error.message : String(error)
//     });
//   }
// });

// /**
//  * Unpin - Remove a CID from the node
//  * POST /api/ipfs/unpin
//  */
// router.post("/unpin", async (req: Request, res: Response) => {
//   try {
//     const { cid } = req.query;
    
//     if (!cid || typeof cid !== 'string') {
//       return res.status(400).json({ message: "CID parameter is required" });
//     }
    
//     const result = await unpinIPFSContent(cid);
    
//     return res.json(result);
//   } catch (error) {
//     log(`Error unpinning IPFS content: ${error instanceof Error ? error.message : String(error)}`);
//     return res.status(500).json({ 
//       message: "Failed to unpin IPFS content", 
//       error: error instanceof Error ? error.message : String(error)
//     });
//   }
// });

// /**
//  * MFS List - Show files in Mutable File System
//  * GET /api/ipfs/mfs/ls
//  */
// router.get("/mfs/ls", async (req: Request, res: Response) => {
//   try {
//     const { path } = req.query;
//     const mfsPath = typeof path === 'string' ? path : '/';
    
//     const result = await listMFSFiles(mfsPath);
    
//     return res.json(result);
//   } catch (error) {
//     log(`Error listing MFS files: ${error instanceof Error ? error.message : String(error)}`);
//     return res.status(500).json({ 
//       message: "Failed to list MFS files", 
//       error: error instanceof Error ? error.message : String(error)
//     });
//   }
// });

// /**
//  * MFS Add - Add a CID to Mutable File System (MFS)
//  * POST /api/ipfs/mfs/add
//  */
// router.post("/mfs/add", async (req: Request, res: Response) => {
//   try {
//     const { cid, path } = req.query;
    
//     if (!cid || typeof cid !== 'string') {
//       return res.status(400).json({ message: "CID parameter is required" });
//     }
    
//     if (!path || typeof path !== 'string') {
//       return res.status(400).json({ message: "Path parameter is required" });
//     }
    
//     const result = await addToMFS(cid, path);
    
//     return res.json(result);
//   } catch (error) {
//     log(`Error adding to MFS: ${error instanceof Error ? error.message : String(error)}`);
//     return res.status(500).json({ 
//       message: "Failed to add to MFS", 
//       error: error instanceof Error ? error.message : String(error)
//     });
//   }
// });

// /**
//  * Find all video files in IPFS
//  * GET /api/ipfs/videos
//  */
// router.get("/videos", async (req: Request, res: Response) => {
//   try {
//     log("Searching for video files in IPFS", "routes");
    
//     const videoFiles = await findVideoFiles();
    
//     return res.json({ videos: videoFiles });
//   } catch (error) {
//     log(`Error finding video files in IPFS: ${error instanceof Error ? error.message : String(error)}`, "routes");
//     return res.status(500).json({ 
//       message: "Failed to find video files in IPFS", 
//       error: error instanceof Error ? error.message : String(error)
//     });
//   }
// });

// /**
//  * Public endpoint for direct IPFS upload (no auth required)
//  * POST /api/ipfs/direct-upload
//  */
// router.post("/direct-upload", upload.single("file"), async (req: Request, res: Response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }
    
//     log(`Processing direct IPFS upload: ${req.file.originalname}`, "routes");
    
//     // Read the file buffer
//     const fileBuffer = fs.readFileSync(req.file.path);
    
//     // Upload directly to IPFS using RPC API
//     const ipfsResponse = await uploadFileToIPFS(
//       fileBuffer,
//       req.file.originalname
//     );
    
//     // Clean up temp file
//     try {
//       fs.unlinkSync(req.file.path);
//     } catch (unlinkError) {
//       log(`Warning: Failed to clean up temp file: ${unlinkError instanceof Error ? unlinkError.message : String(unlinkError)}`, "routes");
//     }
    
//     // Get the file hash and generate streaming URLs
//     const fileHash = ipfsResponse.Hash;
//     const fileUri = `ipfs://${fileHash}`;
    
//     // Generate gateway URLs for streaming
//     const directStreamUrl = getSubdomainGatewayUrl(fileHash, req.file.originalname);
//     const fallbackUrl = getPathGatewayUrl(fileHash, req.file.originalname);
    
//     // Extract a title from the filename by removing extension and replacing underscores/hyphens
//     const fileNameWithoutExt = req.file.originalname.replace(/\.[^/.]+$/, "");
//     const title = fileNameWithoutExt.replace(/[-_]/g, " ");
    
//     // Create a simplified size in MB
//     const sizeInMB = Math.round(parseInt(ipfsResponse.Size, 10) / (1024 * 1024));
    
//     // Save the uploaded video to the database so it appears in the video list
//     try {
//       // Create video entry with default values
//       const video = await storage.createVideo({
//         title: title || "Untitled Video",
//         description: `Uploaded via IPFS - Size: ${sizeInMB}MB`,
//         category: "Other",
//         fileHash: fileHash,
//         fileUri: fileUri,
//         thumbnailUri: null, // No thumbnail for direct uploads
//         duration: 0, // Unknown duration
//         size: parseInt(ipfsResponse.Size, 10),
//         userId: 1 // Default user ID for unauthenticated uploads
//       });
      
//       log(`Added IPFS upload to video database with ID: ${video.id}`, "routes");
      
//       // Return the response with IPFS hash, gateway URLs, and new video ID
//       return res.status(201).json({
//         success: true,
//         fileHash,
//         fileUri,
//         size: parseInt(ipfsResponse.Size, 10),
//         name: ipfsResponse.Name,
//         directStreamUrl,
//         fallbackUrl,
//         videoId: video.id,
//         title: video.title
//       });
//     } catch (dbError) {
//       // If saving to database fails, still return the upload info
//       log(`Warning: Failed to save IPFS upload to database: ${dbError instanceof Error ? dbError.message : String(dbError)}`, "routes");
      
//       return res.status(201).json({
//         success: true,
//         fileHash,
//         fileUri,
//         size: parseInt(ipfsResponse.Size, 10),
//         name: ipfsResponse.Name,
//         directStreamUrl,
//         fallbackUrl,
//         databaseError: "Failed to save to video database, but upload succeeded."
//       });
//     }
//   } catch (error) {
//     log(`Error in direct IPFS upload: ${error instanceof Error ? error.message : String(error)}`, "routes");
    
//     // Clean up temp file if it exists
//     if (req.file && req.file.path) {
//       try {
//         fs.unlinkSync(req.file.path);
//       } catch (unlinkError) {
//         // Ignore
//       }
//     }
    
//     return res.status(500).json({ 
//       success: false,
//       message: "Failed to upload file to IPFS", 
//       error: error instanceof Error ? error.message : String(error)
//     });
//   }
// });

// /**
//  * Get gateway configuration
//  * GET /api/ipfs/config
//  */
// router.get("/config", async (req: Request, res: Response) => {
//   try {
//     const config = getGatewayConfig();
//     res.json(config);
//   } catch (error) {
//     res.status(500).json({ 
//       status: "error", 
//       message: error instanceof Error ? error.message : String(error) 
//     });
//   }
// });

// /**
//  * Update RPC API endpoint
//  * POST /api/ipfs/config/rpc
//  */
// router.post("/config/rpc", async (req: Request, res: Response) => {
//   try {
//     const { rpcApi } = req.body;
    
//     if (!rpcApi || typeof rpcApi !== 'string') {
//       return res.status(400).json({ message: "RPC API endpoint is required" });
//     }
    
//     updateRpcApi(rpcApi);
//     res.json({ 
//       status: "success", 
//       message: "RPC API endpoint updated successfully",
//       config: getGatewayConfig()
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       status: "error", 
//       message: error instanceof Error ? error.message : String(error) 
//     });
//   }
// });

// /**
//  * Update public gateway
//  * POST /api/ipfs/config/public-gateway
//  */
// router.post("/config/public-gateway", async (req: Request, res: Response) => {
//   try {
//     const { gateway } = req.body;
    
//     if (!gateway || typeof gateway !== 'string') {
//       return res.status(400).json({ message: "Public gateway URL is required" });
//     }
    
//     updatePublicGateway(gateway);
//     res.json({ 
//       status: "success", 
//       message: "Public gateway updated successfully",
//       config: getGatewayConfig()
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       status: "error", 
//       message: error instanceof Error ? error.message : String(error) 
//     });
//   }
// });

// /**
//  * Update path gateway
//  * POST /api/ipfs/config/path-gateway
//  */
// router.post("/config/path-gateway", async (req: Request, res: Response) => {
//   try {
//     const { gateway } = req.body;
    
//     if (!gateway || typeof gateway !== 'string') {
//       return res.status(400).json({ message: "Path gateway URL is required" });
//     }
    
//     updatePathGateway(gateway);
//     res.json({ 
//       status: "success", 
//       message: "Path gateway updated successfully",
//       config: getGatewayConfig()
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       status: "error", 
//       message: error instanceof Error ? error.message : String(error) 
//     });
//   }
// });

// /**
//  * Test gateway connectivity
//  * GET /api/ipfs/test-connection
//  */
// router.get("/test-connection", async (req: Request, res: Response) => {
//   try {
//     const isConnected = await testAuth();
//     if (isConnected) {
//       res.json({ 
//         status: "success", 
//         message: "Successfully connected to Stratos public gateway" 
//       });
//     } else {
//       res.status(503).json({ 
//         status: "error", 
//         message: "Failed to connect to Stratos public gateway" 
//       });
//     }
//   } catch (error) {
//     res.status(500).json({ 
//       status: "error", 
//       message: error instanceof Error ? error.message : String(error) 
//     });
//   }
// });

// /**
//  * Import all video files from IPFS to the platform
//  * POST /api/ipfs/videos/import
//  */
// router.post("/videos/import", async (req: Request, res: Response) => {
//   try {
//     log("Starting import of all video files from IPFS", "routes");
    
//     // Find all video files on IPFS
//     const videoFiles = await findVideoFiles();
//     log(`Found ${videoFiles.length} video files to import`, "routes");
    
//     const importResults = {
//       total: videoFiles.length,
//       imported: 0,
//       skipped: 0,
//       videos: [] as any[]
//     };
    
//     // Import each video file
//     for (const videoFile of videoFiles) {
//       try {
//         // Check if the video is already in our system
//         const existingVideo = await storage.getVideoByHash(videoFile.cid);
        
//         if (existingVideo) {
//           log(`Video with CID ${videoFile.cid} already exists, skipping`, "routes");
//           importResults.skipped++;
//           continue;
//         }
        
//         // Generate a title from the CID if needed
//         const title = videoFile.name || `IPFS Video ${videoFile.cid.substring(0, 8)}`;
        
//         // Get the streaming URL but don't generate automatic thumbnails
//         const streamingUrl = getStreamingUrl(videoFile.cid);
//         // Set thumbnailUri to null - no automatic thumbnails
//         const thumbnailUri = null;
//         log(`Disabled automatic thumbnail generation for imported video`, "routes");
        
//         // Create video record in storage
//         const video = await storage.createVideo({
//           title,
//           description: `Imported from IPFS with CID: ${videoFile.cid}`,
//           fileHash: videoFile.cid,
//           fileUri: streamingUrl,
//           thumbnailUri,
//           duration: 0,
//           size: videoFile.size,
//           userId: 1,
//           category: "Imported",
//           metadata: {
//             source: "ipfs-import",
//             fileType: videoFile.fileType,
//             importDate: new Date().toISOString()
//           }
//         });
        
//         log(`Imported video: ${title} (${videoFile.cid})`, "routes");
//         importResults.imported++;
//         importResults.videos.push(video);
//       } catch (error) {
//         log(`Error importing video ${videoFile.cid}: ${error instanceof Error ? error.message : String(error)}`, "routes");
//       }
//     }
    
//     return res.json(importResults);
//   } catch (error) {
//     log(`Error importing videos from IPFS: ${error instanceof Error ? error.message : String(error)}`, "routes");
//     return res.status(500).json({ 
//       message: "Failed to import videos from IPFS", 
//       error: error instanceof Error ? error.message : String(error)
//     });
//   }
// });

// /**
//  * Manually import specific videos with CIDs
//  * POST /api/ipfs/videos/import/manual
//  */
// router.post("/videos/import/manual", async (req: Request, res: Response) => {
//   try {
//     const { videos } = req.body;
    
//     if (!videos || !Array.isArray(videos)) {
//       return res.status(400).json({ message: "Videos array is required" });
//     }
    
//     log(`Starting manual import of ${videos.length} specified videos`, "routes");
    
//     const importResults = {
//       total: videos.length,
//       imported: 0,
//       skipped: 0,
//       videos: [] as any[]
//     };
    
//     // Import each specified video
//     for (const videoData of videos) {
//       try {
//         if (!videoData.cid) {
//           log("Missing CID in video data, skipping", "routes");
//           importResults.skipped++;
//           continue;
//         }
        
//         // Check if the video is already in our system
//         const existingVideo = await storage.getVideoByHash(videoData.cid);
        
//         if (existingVideo) {
//           log(`Video with CID ${videoData.cid} already exists, skipping`, "routes");
//           importResults.skipped++;
//           continue;
//         }
        
//         // Use provided title or generate one from CID
//         const title = videoData.title || `IPFS Video ${videoData.cid.substring(0, 8)}`;
        
//         // Get the streaming URL but don't generate automatic thumbnails
//         const streamingUrl = getStreamingUrl(videoData.cid);
//         // Set thumbnailUri to null - no automatic thumbnails
//         const thumbnailUri = null;
//         log(`Disabled automatic thumbnail generation for manual imported video`, "routes");
        
//         // Create video record in storage
//         const video = await storage.createVideo({
//           title,
//           description: videoData.description || `Imported from IPFS with CID: ${videoData.cid}`,
//           fileHash: videoData.cid,
//           fileUri: streamingUrl,
//           thumbnailUri,
//           duration: 0,
//           size: videoData.size || 0,
//           userId: 1,
//           category: videoData.category || "Imported",
//           metadata: {
//             source: "manual-import",
//             importDate: new Date().toISOString()
//           }
//         });
        
//         log(`Manually imported video: ${title} (${videoData.cid})`, "routes");
//         importResults.imported++;
//         importResults.videos.push(video);
//       } catch (error) {
//         log(`Error importing video ${videoData.cid}: ${error instanceof Error ? error.message : String(error)}`, "routes");
//       }
//     }
    
//     return res.json(importResults);
//   } catch (error) {
//     log(`Error manually importing videos: ${error instanceof Error ? error.message : String(error)}`, "routes");
//     return res.status(500).json({ 
//       message: "Failed to manually import videos", 
//       error: error instanceof Error ? error.message : String(error)
//     });
//   }
// });

// export default router; 