import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findUserById } from '../models/userModel';

export interface AuthRequest extends Request {
  user?: { id: number; name: string; email: string; role: string };
  rawBody?: Buffer;
}

type AuthedRequest = AuthRequest & { headers: { authorization?: string } };

const readUser = async (req: AuthedRequest, res: Response, required: boolean, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (!required) return next();
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
    const user = await findUserById(decoded.id);
    if (!user || !user.is_verified) {
      if (!required) return next();
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch {
    if (!required) return next();
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

export const protect = (req: AuthRequest, res: Response, next: NextFunction) =>
  readUser(req, res, true, next);

export const optionalProtect = (req: AuthRequest, res: Response, next: NextFunction) =>
  readUser(req, res, false, next);
