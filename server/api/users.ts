import { Router, Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAuth, getCurrentUserId } from "../middleware";
import { log } from "../vite";
import { createSessionUser } from "@shared/session";

const router = Router();

// Update user profile
router.put("/profile", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const updateSchema = z.object({
      displayName: z.string().min(2).optional(),
      bio: z.string().optional(),
      avatarUri: z.string().optional()
    });
    
    const userData = updateSchema.parse(req.body);
    
    // Update the user
    const updatedUser = await storage.updateUser(userId, userData);
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update the session
    if (req.session.user) {
      req.session.user = createSessionUser(updatedUser);
    }
    
    // Return the updated user (excluding password)
    const { password, ...userWithoutPassword } = updatedUser;
    return res.json({
      message: "Profile updated successfully",
      user: userWithoutPassword
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid profile data",
        errors: error.flatten().fieldErrors
      });
    }
    
    log(`Error updating profile: ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

// Get user videos
router.get("/videos", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const videos = await storage.getUserVideos(userId);
    
    return res.json({ videos });
  } catch (error) {
    log(`Error fetching user videos: ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ message: "Failed to fetch user videos" });
  }
});

export default router; 