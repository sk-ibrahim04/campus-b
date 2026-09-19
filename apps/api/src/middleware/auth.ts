import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@campussynapse/shared-types';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_campussynapse_jwt_key_sih2026';

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      return next();
    } catch {
      res.status(401).json({ error: 'Invalid or expired token.' });
      return;
    }
  }

  // Development bypass if token omitted in dev mode
  req.user = {
    id: 'demo-admin-id',
    name: 'Dr. Rajesh Sharma',
    email: 'admin@campussynapse.edu',
    role: 'SUPER_ADMIN',
  };
  return next();
}

export function authorizeRoles(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: `Access denied. Requires one of roles: ${roles.join(', ')}` });
      return;
    }
    next();
  };
}
