import { Router, Request, Response } from "express";
import { z } from "zod";
import { loginSchema, registerSchema } from "@shared/schema";
import { storage } from "../storage";
import { createSessionUser } from "@shared/session";
import { log } from "../vite";

const router = Router();

// Register a new user
router.post("/register", async (req: Request, res: Response) => {
  try {
    const userData = registerSchema.parse(req.body);
    
    // Check if username or email already exists
    const { usernameTaken, emailTaken } = await storage.isUsernameOrEmailTaken(
      userData.username, 
      userData.email
    );
    
    if (usernameTaken || emailTaken) {
      return res.status(400).json({
        message: "Registration failed",
        errors: {
          username: usernameTaken ? "Username already taken" : undefined,
          email: emailTaken ? "Email already taken" : undefined
        }
      });
    }
    
    // Create the user
    const user = await storage.createUser({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName || userData.username,
      bio: null,
      avatarUri: null
    });
    
    // Set up the session
    req.session.isAuthenticated = true;
    req.session.user = createSessionUser(user);
    
    // Return the user data (excluding password)
    const { password, ...userWithoutPassword } = user;
    return res.status(201).json({ 
      message: "Registration successful",
      user: userWithoutPassword
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid registration data", 
        errors: error.flatten().fieldErrors 
      });
    }
    
    log(`Error registering user: ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ message: "Registration failed" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const loginData = loginSchema.parse(req.body);
    
    // Validate credentials
    const user = await storage.validateCredentials(
      loginData.username, 
      loginData.password
    );
    
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Update last login time
    await storage.updateLoginTime(user.id);
    
    // Set up the session
    req.session.isAuthenticated = true;
    req.session.user = createSessionUser(user);
    
    // Return the user data (excluding password)
    const { password, ...userWithoutPassword } = user;
    return res.json({ 
      message: "Login successful",
      user: userWithoutPassword
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid login data", 
        errors: error.flatten().fieldErrors 
      });
    }
    
    log(`Error logging in: ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ message: "Login failed" });
  }
});

// Logout
router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      log(`Error destroying session: ${err.message}`);
      return res.status(500).json({ message: "Logout failed" });
    }
    
    res.clearCookie('connect.sid');
    return res.json({ message: "Logout successful" });
  });
});

// Get current user
router.get("/me", (req: Request, res: Response) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  return res.json({ user: req.session.user });
});

export default router; 