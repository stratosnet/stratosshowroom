import { User } from "./schema";

declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      username: string;
      email: string;
      displayName: string | null;
      avatarUri: string | null;
      bio: string | null;
      isAdmin: boolean;
    };
    isAuthenticated: boolean;
  }
}

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  avatarUri: string | null;
  bio: string | null;
  isAdmin: boolean;
}

export function createSessionUser(user: User): CurrentUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatarUri: user.avatarUri,
    bio: user.bio,
    isAdmin: user.isAdmin ?? false
  };
}