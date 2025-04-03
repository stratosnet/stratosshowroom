import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUri: text("avatar_uri"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login")
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  displayName: true,
  bio: true,
  avatarUri: true,
});

// For login validation
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// For registration validation
export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().optional(),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Video schema
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  cid: text("cid").notNull(),
  cidUri: text("cid_uri").notNull(),
  type: text("type").notNull(),
  fileHash: text("file_hash").notNull(),  // SPFS file hash
  fileUri: text("file_uri").notNull(),    // SPFS URI
  thumbnailUri: text("thumbnail_uri"),    // SPFS URI for thumbnail
  duration: integer("duration"),          // Duration in seconds
  size: integer("size"),                  // Size in bytes
  views: integer("views").default(0),
  userId: integer("user_id").references(() => users.id),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata"),            // Additional metadata
  uuid: text("uuid").default(sql`gen_random_uuid()`),
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  views: true,
  createdAt: true
});

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

// Additional schemas for frontend validation
export const uploadVideoSchema = z.object({
  title: z.string().min(3, "Title is required (min 3 characters)"),
  description: z.string().optional(),
  category: z.string().optional(),
  file: z.any(), // Will be validated on the server
  thumbnail: z.any().optional() // Optional thumbnail file
});

export type UploadVideo = z.infer<typeof uploadVideoSchema>;

// Audio schema
export const audios = pgTable("audios", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  cid: text("cid").notNull(),
  cidUri: text("cid_uri").notNull(),
  type: text("type").notNull(),
  fileHash: text("file_hash").notNull(),  // SPFS file hash
  fileUri: text("file_uri").notNull(),    // SPFS URI
  thumbnailUri: text("thumbnail_uri"),    // SPFS URI for thumbnail
  duration: integer("duration"),          // Duration in seconds
  size: integer("size"),                  // Size in bytes
  views: integer("views").default(0),
  userId: integer("user_id").references(() => users.id),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata"),            // Additional metadata
  uuid: text("uuid").default(sql`gen_random_uuid()`),
});
export type Audio = typeof audios.$inferSelect;


// Picture schema
export const pictures = pgTable("pictures", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  cid: text("cid").notNull(),
  cidUri: text("cid_uri").notNull(),
  type: text("type").notNull(),
  fileHash: text("file_hash").notNull(),  // SPFS file hash
  fileUri: text("file_uri").notNull(),    // SPFS URI
  thumbnailUri: text("thumbnail_uri"),    // SPFS URI for thumbnail
  duration: integer("duration"),          // Duration in seconds
  size: integer("size"),                  // Size in bytes
  views: integer("views").default(0),
  userId: integer("user_id").references(() => users.id),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata"),            // Additional metadata
  uuid: text("uuid").default(sql`gen_random_uuid()`),
});
export type Picture = typeof pictures.$inferSelect;

// FileData schema
export const fileDatas = pgTable("fileDatas", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  cid: text("cid").notNull(),
  cidUri: text("cid_uri").notNull(),
  type: text("type").notNull(),
  fileHash: text("file_hash").notNull(),  // SPFS file hash
  fileUri: text("file_uri").notNull(),    // SPFS URI
  thumbnailUri: text("thumbnail_uri"),    // SPFS URI for thumbnail
  duration: integer("duration"),          // Duration in seconds
  size: integer("size"),                  // Size in bytes
  views: integer("views").default(0),
  userId: integer("user_id").references(() => users.id),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata"),            // Additional metadata
  uuid: text("uuid").default(sql`gen_random_uuid()`),
});
export type FileData = typeof fileDatas.$inferSelect;





// Media interface definitions
// export interface Music {
//   id: number;
//   url: string;
//   blobUrl?: string;  // Optional blob URL for cached media
//   name: string;
//   description?: string;
//   artist?: string;
// }

// export interface Picture {
//   id: number;
//   url: string;
//   name: string;
//   description: string;
//   photographer?: string;
//   tags?: string[];
// }
