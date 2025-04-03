import { videos, type Video, type InsertVideo, users, type User, type InsertUser } from "@shared/schema";
import { log } from "./vite";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  updateLoginTime(id: number): Promise<void>;
  getUserVideos(userId: number): Promise<Video[]>;
  validateCredentials(username: string, password: string): Promise<User | undefined>;
  isUsernameOrEmailTaken(username: string, email: string): Promise<{usernameTaken: boolean, emailTaken: boolean}>;
  
  // Video operations
  createVideo(video: InsertVideo): Promise<Video>;
  getVideo(id: number): Promise<Video | undefined>;
  getVideoByHash(fileHash: string): Promise<Video | undefined>;
  getAllVideos(): Promise<Video[]>;
  getVideosByCategory(category: string): Promise<Video[]>;
  incrementViews(id: number): Promise<void>;
  updateVideo(id: number, video: Partial<InsertVideo>): Promise<Video | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videos: Map<number, Video>;
  private userIdCounter: number;
  private videoIdCounter: number;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.userIdCounter = 1;
    this.videoIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    // Create a new user object with proper typing
    const user: User = {
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      displayName: insertUser.displayName ?? null,
      bio: insertUser.bio ?? null,
      avatarUri: insertUser.avatarUri ?? null,
      isAdmin: false,
      createdAt: now,
      lastLogin: now
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateLoginTime(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date();
      this.users.set(id, user);
    }
  }
  
  async getUserVideos(userId: number): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.userId === userId
    );
  }
  
  async validateCredentials(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return undefined;
  }
  
  async isUsernameOrEmailTaken(username: string, email: string): Promise<{usernameTaken: boolean, emailTaken: boolean}> {
    const userWithSameUsername = await this.getUserByUsername(username);
    const userWithSameEmail = await this.getUserByEmail(email);
    
    return {
      usernameTaken: !!userWithSameUsername,
      emailTaken: !!userWithSameEmail
    };
  }

  // Video operations
  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.videoIdCounter++;
    const now = new Date();
    log(`Creating video with cid: ${insertVideo.cid}`, "storage");
    // Ensure all fields are correctly typed based on Video type
    const video: Video = {
      id,
      cid: insertVideo.cid,
      cidUri: insertVideo.cidUri,
      type: insertVideo.type,
      title: insertVideo.title,
      description: insertVideo.description ?? null,
      fileHash: insertVideo.fileHash,
      fileUri: insertVideo.fileUri,
      thumbnailUri: insertVideo.thumbnailUri ?? null,
      duration: insertVideo.duration ?? null,
      size: insertVideo.size ?? null,
      views: 0,
      userId: insertVideo.userId ?? null,
      category: insertVideo.category ?? null,
      createdAt: now,
      metadata: insertVideo.metadata ?? null
    };

    this.videos.set(id, video);
    log(`Video created with id: ${id}`, "storage");
    return video;
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getVideoByHash(fileHash: string): Promise<Video | undefined> {
    return Array.from(this.videos.values()).find(
      (video) => video.fileHash === fileHash
    );
  }

  async getAllVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.category === category
    );
  }

  async incrementViews(id: number): Promise<void> {
    const video = this.videos.get(id);
    if (video) {
      // Ensure views is a number
      const currentViews = video.views ?? 0;
      video.views = currentViews + 1;
      this.videos.set(id, video);
    }
  }

  async updateVideo(id: number, data: Partial<InsertVideo>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;

    const updatedVideo = { ...video, ...data };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }
}

export const storage = new MemStorage();
