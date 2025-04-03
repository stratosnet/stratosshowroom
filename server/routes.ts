import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertVideoSchema, loginSchema, registerSchema } from "@shared/schema";
import { log } from "./vite";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { seedSampleVideo } from "./seedData";
import { requireAuth, requireAdmin, getCurrentUserId } from "./middleware";
import { createSessionUser } from "@shared/session";
import videosRouter from "./api/videos";
// import ipfsRouter from "./api/ipfs";
import musicRouter from "./api/music";
import picturesRouter from "./api/pictures";
import authRouter from "./api/auth";
import usersRouter from "./api/users";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Seed the sample F1 video
  try {
    await seedSampleVideo();
    log("Sample video seeded successfully", "routes");
  } catch (error) {
    log(`Error seeding sample video: ${error instanceof Error ? error.message : String(error)}`, "routes");
  }

  // Register API routes
  app.use("/api/videos", videosRouter);
  // app.use("/api/ipfs", ipfsRouter);
  app.use("/api/music", musicRouter);
  app.use("/api/pictures", picturesRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  
  return httpServer;
}


