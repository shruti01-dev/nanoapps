import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  findUserByEmail,
  createUser,
  verifyUserEmail,
  setResetToken,
  findUserByValidResetToken,
  updatePasswordAndClearToken,
  setVerificationToken,
} from '../models/userModel';
import { createRawToken, hashToken } from '../utils/tokens';
import { frontendUrl, mailIsConfigured, MailError, sendEmail } from '../utils/email';
import { AuthRequest } from '../middleware/authMiddleware';

const generateToken = (id: number, email: string, role: string) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

const sendVerificationEmail = async (email: string, rawToken: string) => {
  const link = `${frontendUrl()}/verify-email/${rawToken}`;
  await sendEmail(
    email,
    'Verify your nanoapps account',
    `Open this link to verify your email:\n${link}\n\nIf you did not create an account, you can ignore this message.`
  );
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: 'Enter a valid email' });
    }

    const address = email.trim().toLowerCase();
    const existingUser = await findUserByEmail(address);
    if (existingUser?.is_verified) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const rawToken = createRawToken();
    if (existingUser) {
      await setVerificationToken(existingUser.id, hashToken(rawToken));
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await createUser(name.trim(), address, hashedPassword, hashToken(rawToken));
    }

    try {
      await sendVerificationEmail(address, rawToken);
    } catch (error) {
      if (!(error instanceof MailError)) throw error;
      return res.status(503).json({
        message: 'The account was saved, but the verification email could not be sent.',
      });
    }

    res.status(existingUser ? 200 : 201).json({
      message: 'Check your email for a verification link, then log in.',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await findUserByEmail(String(email).trim().toLowerCase());
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

    const token = generateToken(user.id, user.email, user.role);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    if (!token) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }
    const user = await verifyUserEmail(hashToken(token));

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    res.json({ message: 'Email verified successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const generic = { message: 'If that email is unverified, a new link has been sent.' };
    if (!email) return res.json(generic);

    const user = await findUserByEmail(email);
    if (!user || user.is_verified) return res.json(generic);

    const rawToken = createRawToken();
    await setVerificationToken(user.id, hashToken(rawToken));
    await sendVerificationEmail(email, rawToken);
    res.json(generic);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    if (!mailIsConfigured()) {
      return res.status(503).json({
        message: 'The reset email could not be sent because the server mailbox is not configured.',
      });
    }

    const email = String(req.body.email || '').trim().toLowerCase();
    const generic = { message: 'If that email is registered, a reset link has been sent.' };
    if (!email) return res.json(generic);

    const user = await findUserByEmail(email);
    if (!user) return res.json(generic);

    const rawToken = createRawToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    await setResetToken(email, hashToken(rawToken), expiry);

    const resetLink = `${frontendUrl()}/reset-password/${rawToken}`;
    await sendEmail(
      email,
      'Reset your nanoapps password',
      `Open this link to choose a new password. It expires in 1 hour.\n${resetLink}\n\nIf you did not ask for this, you can ignore this message.`
    );

    res.json(generic);
  } catch (error: any) {
    const status = error instanceof MailError ? error.status : 500;
    res.status(status).json({ message: error.message || 'Could not send the reset email.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    const { password } = req.body;

    if (!token || !password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await findUserByValidResetToken(hashToken(token));
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await updatePasswordAndClearToken(user.id, hashedPassword);

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
