import { Router, Request, Response } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { storage } from "../storage";
import { requireAuth, getCurrentUserId } from "../middleware";
import { uploadToStratosSPFS, getStreamingUrl, generateThumbnailUri, getFileUri } from "../utils/stratos";
import { log } from "../vite";
// import { extractVideoFrames } from "../ipfsApi";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for video uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "../../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  // fileFilter: (req, file, cb) => {
  //   const filetypes = /mp4|mov|avi|wmv|flv|mkv|webm/;
  //   const mimetype = filetypes.test(file.mimetype);
  //   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  //   if (mimetype && extname) return cb(null, true);
  //   cb(new Error("Only video files are allowed"));
  // },
});

const router = Router();

/**
 * Get all videos
 * GET /api/videos
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string | undefined;
    let videos = await storage.getAllVideos();
    log(`type: ${type}`);
    log(`Total videos before filtering: ${videos.length}`);
    log(`Sample video types: ${videos.slice(0, 3).map(v => v.type).join(', ')}`);

    if (type) {
      videos = videos.filter(video => {
        if (!video.type) {
          log(`Video ${video.id} has no type`);
          return false;
        }
        if (type === "video") {
          const isMatch = video.type.startsWith("video/");
          log(`Video ${video.id} type: ${video.type}, isMatch: ${isMatch}`);
          return isMatch;
        }
        if (type === "image") {
          const isMatch = video.type.startsWith("image/");
          log(`Video ${video.id} type: ${video.type}, isMatch: ${isMatch}`);
          return isMatch;
        }
        if (type === "audio") {
          const isMatch = video.type.startsWith("audio/");
          log(`Video ${video.id} type: ${video.type}, isMatch: ${isMatch}`);
          return isMatch;
        }
        const isMatch = video.type === type;
        log(`Video ${video.id} type: ${video.type}, isMatch: ${isMatch}`);
        return isMatch;
      });
    }
   
    videos = videos.map(video => ({
      ...video,
      fileUri: video.fileUri || getFileUri(video.fileHash)||''
    }));
  
    log(`Total videos after filtering: ${videos.length}`);
    videos.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    
    return res.json(videos);
  } catch (error) {
    log(`Error fetching videos: ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ message: "Failed to fetch videos" });
  }
});

/**
 * Get videos by category
 * GET /api/videos/category/:category
 */
router.get("/category/:category", async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const videos = await storage.getVideosByCategory(category);
    return res.json(videos);
  } catch (error) {
    log(`Error fetching videos by category: ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ message: "Failed to fetch videos by category" });
  }
});

/**
 * Get single video by ID
 * GET /api/videos/:id
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const video = await storage.getVideo(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Increment view count
    await storage.incrementViews(id);

    return res.json(video);
  } catch (error) {
    log(`Error fetching video: ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ message: "Failed to fetch video" });
  }
});

/**
 * Upload video
 * POST /api/videos/upload
 */
// router.post("/upload", requireAuth, upload.fields([
router.post("/upload", upload.fields([
  { name: "file", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 }
]), async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  
  try {
    if (!files || !files.file || files.file.length === 0) {
      return res.status(400).json({ message: "No video file provided" });
    }
    
    const videoFile = files.file[0];
    const thumbnailFile = files.thumbnail ? files.thumbnail[0] : null;

    // const userId = getCurrentUserId(req);
    // if (!userId) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }

    const metadata = JSON.parse(req.body.metadata || "{}");
    const validatedMetadata = z.object({
      title: z.string().min(3),
      description: z.string().optional(),
      category: z.string().optional(),
    }).parse(metadata);

    // Check if video upload was successful
    const uploadResult = await uploadToStratosSPFS(
      videoFile.path,
      videoFile.originalname,
      videoFile.mimetype
    );

    if (!uploadResult || !uploadResult.fileHash) {
      log("Failed to upload video to SPFS", "routes");
      return res.status(500).json({ error: "Failed to upload video" });
    }

    // const { fileHash, fileUri, size } = uploadResult;
    const {
      cid,
      cidUri,
      fileHash,
      fileUri,
      type,
      size,
      title,
      description,
      category,
      duration
    }= uploadResult;
    // Check if thumbnail generation was successful
    const thumbnailUri = await generateThumbnailUri(fileHash, thumbnailFile || undefined);
    if (!thumbnailUri) {
      log("Failed to generate thumbnail", "routes");
      return res.status(500).json({ error: "Failed to generate thumbnail" });
    }
    
    // Proceed with video creation if both operations were successful
    // const video = await storage.createVideo({
    //   cid,
    //   cidUri,
    //   type, 
    //   title: validatedMetadata.title,
    //   description: validatedMetadata.description || "",
    //   fileHash,
    //   fileUri,
    //   thumbnailUri,
    //   duration: 0,
    //   size,
    //   userId: null,
    //   category: validatedMetadata.category || "Uncategorized",
    //   metadata: metadata
    // });

    const video = {
      cid,
      cidUri,
      type, 
      title: validatedMetadata.title,
      description: validatedMetadata.description || "",
      fileHash,
      fileUri,
      thumbnailUri,
      duration: 0,
      size,
      // userId: null,
      category: validatedMetadata.category || "Uncategorized",
      // metadata: metadata
    };
  
    // Clean up temporary files after successful upload
    try {
      fs.unlinkSync(videoFile.path);
      if (thumbnailFile) {
        fs.unlinkSync(thumbnailFile.path);
      }
      log("Cleaned up temporary files", "routes");
    } catch (cleanupError) {
      log(`Error cleaning up temporary files: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`, "routes");
      // Don't fail the request if cleanup fails
    }

    return res.status(201).json(video);
  } catch (error) {
    // Clean up temporary files in case of error
    try {
      if (files?.file?.[0]) {
        fs.unlinkSync(files.file[0].path);
      }
      if (files?.thumbnail?.[0]) {
        fs.unlinkSync(files.thumbnail[0].path);
      }
    } catch (cleanupError) {
      log(`Error cleaning up temporary files after error: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`, "routes");
    }

    log(`Error uploading video: ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ 
      message: "Failed to upload video", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// /**
//  * Stream video
//  * GET /api/videos/stream/:fileHash
//  */
// router.get("/stream/:fileHash", async (req: Request, res: Response) => {
//   try {
//     let { fileHash } = req.params;
    
//     let frameParam = '';
//     if (fileHash.includes('?')) {
//       const [cid, queryParams] = fileHash.split('?');
//       fileHash = cid;
//       frameParam = queryParams;
//     }
    
//     let streamingUrl = getStreamingUrl(fileHash);
    
//     if (frameParam) {
//       streamingUrl = `${streamingUrl}?${frameParam}`;
//     }
    
//     log(`Streaming URL: ${streamingUrl}`, 'routes');
    
//     return res.json({ url: streamingUrl });
//   } catch (error) {
//     log(`Error streaming video: ${error instanceof Error ? error.message : String(error)}`);
//     return res.status(500).json({ message: "Failed to stream video" });
//   }
// });

// /**
//  * Upload thumbnail
//  * POST /api/videos/:id/thumbnail
//  */
// router.post("/:id/thumbnail", upload.single("thumbnail"), async (req: Request, res: Response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No thumbnail file provided" });
//     }

//     const id = parseInt(req.params.id);
//     if (isNaN(id)) {
//       return res.status(400).json({ message: "Invalid video ID" });
//     }

//     const video = await storage.getVideo(id);
//     if (!video) {
//       return res.status(404).json({ message: "Video not found" });
//     }

//     const { fileHash, fileUri } = await uploadToStratosSPFS(
//       req.file.path,
//       req.file.originalname,
//       req.file.mimetype
//     );

//     const updatedVideo = await storage.updateVideo(id, {
//       thumbnailUri: fileUri
//     });

//     // Clean up temporary file after successful upload
//     try {
//       fs.unlinkSync(req.file.path);
//       log("Cleaned up temporary thumbnail file", "routes");
//     } catch (cleanupError) {
//       log(`Error cleaning up temporary thumbnail file: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`, "routes");
//       // Don't fail the request if cleanup fails
//     }

//     return res.json(updatedVideo);
//   } catch (error) {
//     // Clean up temporary file in case of error
//     try {
//       if (req.file) {
//         fs.unlinkSync(req.file.path);
//       }
//     } catch (cleanupError) {
//       log(`Error cleaning up temporary thumbnail file after error: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`, "routes");
//     }

//     log(`Error uploading thumbnail: ${error instanceof Error ? error.message : String(error)}`);
//     return res.status(500).json({ message: "Failed to upload thumbnail" });
//   }
// });

// /**
//  * Select frame as thumbnail
//  * POST /api/videos/:id/thumbnail/frame
//  */
// router.post("/:id/thumbnail/frame", async (req: Request, res: Response) => {
//   try {
//     const id = parseInt(req.params.id);
//     if (isNaN(id)) {
//       return res.status(400).json({ message: "Invalid video ID" });
//     }
    
//     const { frameUrl } = req.body;
//     if (!frameUrl) {
//       return res.status(400).json({ message: "No frame URL provided" });
//     }

//     const video = await storage.getVideo(id);
//     if (!video) {
//       return res.status(404).json({ message: "Video not found" });
//     }
    
//     log(`Selecting frame as thumbnail for video ${id}: ${frameUrl}`, "routes");
    
//     const [cid, queryParams] = frameUrl.split('?');
//     let position = null;
//     if (queryParams) {
//       const params = new URLSearchParams(queryParams);
//       position = params.get('frame');
//     }
    
//     const fileUri = `https://spfs-gateway.thestratos.net/ipfs/${cid}`;
//     const thumbnailUri = position ? `${fileUri}?frame=${position}` : fileUri;
    
//     log(`Setting thumbnail URI to: ${thumbnailUri}`, "routes");

//     const updatedVideo = await storage.updateVideo(id, {
//       thumbnailUri
//     });

//     return res.json(updatedVideo);
//   } catch (error) {
//     log(`Error setting frame as thumbnail: ${error instanceof Error ? error.message : String(error)}`);
//     return res.status(500).json({ message: "Failed to set frame as thumbnail" });
//   }
// });

// /**
//  * Extract video frames
//  * GET /api/videos/:id/frames
//  */
// router.get("/:id/frames", async (req: Request, res: Response) => {
//   try {
//     const id = parseInt(req.params.id);
//     if (isNaN(id)) {
//       return res.status(400).json({ message: "Invalid video ID" });
//     }

//     const numFrames = req.query.count ? parseInt(req.query.count as string) : 3;
    
//     const video = await storage.getVideo(id);
//     if (!video) {
//       return res.status(404).json({ message: "Video not found" });
//     }

//     const frames = await extractVideoFrames(video.fileHash, numFrames);
    
//     return res.json({ 
//       videoId: id,
//       fileHash: video.fileHash,
//       frames 
//     });
//   } catch (error) {
//     log(`Error extracting video frames: ${error instanceof Error ? error.message : String(error)}`, "routes");
//     return res.status(500).json({ 
//       message: "Failed to extract video frames", 
//       error: error instanceof Error ? error.message : String(error)
//     });
//   }
// });

export default router;