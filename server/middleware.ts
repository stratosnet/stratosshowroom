import { Request, Response, NextFunction } from 'express';
import { log } from './vite';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.isAuthenticated) {
    log('Unauthorized access attempt');
    return res.status(401).json({ message: 'Unauthorized - Login required' });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.isAuthenticated) {
    log('Unauthorized access attempt');
    return res.status(401).json({ message: 'Unauthorized - Login required' });
  }
  
  if (!req.session.user || !req.session.user.isAdmin) {
    log('Forbidden access attempt - Admin required');
    return res.status(403).json({ message: 'Forbidden - Admin access required' });
  }
  
  next();
}

export function getCurrentUserId(req: Request): number | null {
  if (req.session && req.session.isAuthenticated && req.session.user) {
    return req.session.user.id;
  }
  return null;
}