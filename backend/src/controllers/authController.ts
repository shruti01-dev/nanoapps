import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { findUserByEmail, createUser, verifyUserEmail } from '../models/userModel';
import { pool } from '../config/db';

const generateToken = (id: number, email: string) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await createUser(name, email, hashedPassword, verificationToken);

// TEMP (dev only): auto-verify until email sending is wired up
    await pool.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [user.id]);

    // TODO: send verification email here using nodemailer (utils/sendEmail.ts)

    res.status(201).json({
      message: 'Registered successfully. Please verify your email.',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    const token = generateToken(user.id, user.email);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const user = await verifyUserEmail(token);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    res.json({ message: 'Email verified successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};