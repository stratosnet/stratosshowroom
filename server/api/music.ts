import { Router } from "express";
import { Music } from "@shared/schema";

const router = Router();

// Sample music data
const SAMPLE_MUSIC: Music[] = [
  {
    id: 1,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    name: "Acoustic Breeze",
    description: "Relaxing acoustic guitar melody",
    artist: "John Smith"
  },
  {
    id: 2,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    name: "Electric Dreams",
    description: "Electronic beats with synth melody",
    artist: "Sarah Johnson"
  },
  // ... more sample data
];

// GET /api/music endpoint
router.get("/", (req, res) => {
  res.json(SAMPLE_MUSIC);
});

export default router; 