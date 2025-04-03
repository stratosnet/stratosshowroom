import { Router } from "express";
import { Picture } from "@shared/schema";

const router = Router();

// Sample picture data with real image URLs
const SAMPLE_PICTURES: Picture[] = [
  {
    id: 1,
    url: "https://picsum.photos/800/600?random=1",
    name: "Nature Scene 1",
    description: "Beautiful landscape view",
    photographer: "John Doe",
    tags: ["nature", "landscape"]
  },
  {
    id: 2,
    url: "https://picsum.photos/800/600?random=2",
    name: "Urban Life",
    description: "City streets at night",
    photographer: "Jane Smith",
    tags: ["city", "night"]
  },
  {
    id: 3,
    url: "https://picsum.photos/800/600?random=3",
    name: "Mountain View",
    description: "Majestic mountain peaks",
    photographer: "Mike Johnson",
    tags: ["mountains", "nature"]
  },
  {
    id: 4,
    url: "https://picsum.photos/800/600?random=4",
    name: "Ocean Waves",
    description: "Peaceful ocean scene",
    photographer: "Sarah Wilson",
    tags: ["ocean", "water"]
  },
  // Add more sample pictures as needed
];

// GET endpoint for pictures
router.get("/", (_req, res) => {
  try {
    res.json(SAMPLE_PICTURES);
  } catch (error) {
    console.error("Error in pictures route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router; 