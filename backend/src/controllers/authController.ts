import crypto from 'crypto';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  ensureVerifiedAccount,
  findAuthUserByEmail,
  findUserByEmail,
  findUserByValidResetToken,
  promoteAdminByEmail,
  takePendingRegistration,
  createVerifiedUser,
  updatePasswordAndClearToken,
  verifyUserEmail,
} from '../models/userModel';
import { hashToken } from '../utils/tokens';
import { frontendUrl } from '../utils/email';
import { supabaseAuth } from '../config/supabaseAuth';
import { verifyFirebaseIdToken } from '../utils/firebaseToken';
import { AuthRequest } from '../middleware/authMiddleware';

const generateToken = (id: number, email: string, role: string) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

const siteUrl = (req: Request) => {
  const origin = String(req.headers.origin || '').replace(/\/$/, '');
  if (process.env.NODE_ENV !== 'production' && /^https?:\/\/localhost:\d+$/.test(origin)) {
    return origin;
  }
  return frontendUrl();
};

const isEmailRateLimit = (error: { message?: string; status?: number }) => {
  const text = String(error.message || '').toLowerCase();
  return text.includes('rate limit') || error.status === 429;
};

const mailMessage = (error: { message?: string }) => {
  const text = String(error.message || '').toLowerCase();
  if (text.includes('not authorized')) {
    return 'Supabase can only email the project team until a custom SMTP server is saved under Authentication, then Emails.';
  }
  if (text.includes('rate limit')) {
    return 'Supabase only sends a few verification emails each hour on the free mailbox. Wait about an hour, or save a custom SMTP server under Authentication, then Emails.';
  }
  return 'The email could not be delivered. Try again in a little while.';
};

const mailStatus = (error: { message?: string; status?: number }) => {
  const text = String(error.message || '').toLowerCase();
  if (text.includes('rate limit') || error.status === 429) return 429;
  return 502;
};

const accountReady = (user: { id: number; name: string; email: string; role: string }) => ({
  token: generateToken(user.id, user.email, user.role),
  user: { id: user.id, name: user.name, email: user.email, role: user.role },
});

const withAdminRole = async (user: { id: number; name: string; email: string; role: string }) => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || user.email.toLowerCase() !== adminEmail || user.role === 'admin') return user;
  await promoteAdminByEmail(adminEmail);
  return findUserByEmail(adminEmail);
};

const requireSupabase = (res: Response) => {
  if (supabaseAuth) return supabaseAuth;
  res.status(503).json({ message: 'Account email is not configured.' });
  return null;
};

const localVerificationLink = async (
  auth: NonNullable<typeof supabaseAuth>,
  email: string,
  password: string,
  name: string,
  redirect: string
) => {
  if (process.env.NODE_ENV === 'production') return null;
  const existing = await findAuthUserByEmail(email);
  if (existing?.email_confirmed_at) return null;

  const generated = existing
    ? await auth.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: redirect },
      })
    : await auth.auth.admin.generateLink({
        type: 'signup',
        email,
        password,
        options: { data: { name }, redirectTo: redirect },
      });

  return generated.data?.properties?.action_link || null;
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const auth = requireSupabase(res);
    if (!auth) return;

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

    const redirect = `${siteUrl(req)}/auth/confirm`;
    const { data, error } = await auth.auth.signUp({
      email: address,
      password,
      options: { data: { name: String(name).trim() }, emailRedirectTo: redirect },
    });
    if (error) {
      if (isEmailRateLimit(error)) {
        const verificationLink = await localVerificationLink(
          auth,
          address,
          password,
          String(name).trim(),
          redirect
        );
        if (verificationLink) {
          return res.status(200).json({
            message:
              'Supabase paused outgoing email for about an hour. Open the verification link below, then log in.',
            verificationLink,
          });
        }
      }
      return res.status(mailStatus(error)).json({ message: mailMessage(error) });
    }

    const alreadyRegistered =
      !data.user || (Array.isArray(data.user.identities) && data.user.identities.length === 0);
    if (alreadyRegistered) {
      const authUser = await findAuthUserByEmail(address);
      if (authUser?.email_confirmed_at) {
        return res.status(400).json({ message: 'User already exists' });
      }
      const resent = await auth.auth.resend({
        type: 'signup',
        email: address,
        options: { emailRedirectTo: redirect },
      });
      if (resent.error) {
        return res.status(mailStatus(resent.error)).json({ message: mailMessage(resent.error) });
      }
    }

    res.status(200).json({
      message: 'Check your email for a verification link, then log in. The account is created when you open that link.',
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

    const address = String(email).trim().toLowerCase();
    const existing = await findUserByEmail(address);
    if (existing?.is_verified && (await bcrypt.compare(password, existing.password))) {
      return res.json(accountReady(existing));
    }

    const auth = requireSupabase(res);
    if (!auth) return;

    const { data, error } = await auth.auth.signInWithPassword({ email: address, password });
    const failure = String(error?.message || '').toLowerCase();
    if (error || !data.user?.email) {
      if (failure.includes('not confirmed') || failure.includes('not verified')) {
        return res.status(403).json({ message: 'Please verify your email first' });
      }
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const name = String(data.user.user_metadata?.name || existing?.name || address.split('@')[0]);
    const saved = await ensureVerifiedAccount(name, data.user.email, await bcrypt.hash(password, 10));
    const user = await withAdminRole(saved);
    res.json(accountReady(user));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const supabaseSession = async (req: Request, res: Response) => {
  try {
    const auth = requireSupabase(res);
    if (!auth) return;

    const accessToken = String(req.body.accessToken || '');
    if (!accessToken) {
      return res.status(400).json({ message: 'This verification link is invalid or expired.' });
    }

    const { data, error } = await auth.auth.getUser(accessToken);
    const confirmed = data.user?.email_confirmed_at || data.user?.confirmed_at;
    if (error || !data.user?.email || !confirmed) {
      return res.status(400).json({ message: 'This verification link is invalid or expired.' });
    }

    const address = data.user.email.toLowerCase();
    const existing = await findUserByEmail(address);
    const name = String(data.user.user_metadata?.name || existing?.name || '');
    const hashedPassword = existing ? null : await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
    const saved = await ensureVerifiedAccount(name, address, hashedPassword);
    const user = await withAdminRole(saved);
    res.json({
      message: 'Email verified successfully. You can log in now.',
      ...accountReady(user),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const firebaseLogin = async (req: Request, res: Response) => {
  try {
    const idToken = String(req.body.idToken || '');
    if (!idToken) return res.status(400).json({ message: 'Sign-in could not be checked.' });

    const firebaseUser = await verifyFirebaseIdToken(idToken);
    if (!firebaseUser.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    const existing = await findUserByEmail(firebaseUser.email);
    const name = String(req.body.name || firebaseUser.name || existing?.name || '');
    const hashedPassword = existing ? null : await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
    const saved = await ensureVerifiedAccount(name, firebaseUser.email, hashedPassword);
    const user = await withAdminRole(saved);
    if (!user) return res.status(500).json({ message: 'Could not save the account.' });
    res.json(accountReady(user));
  } catch (error: any) {
    if (error.message === 'Firebase is not configured') {
      return res.status(503).json({ message: 'Email verification is not configured.' });
    }
    res.status(401).json({ message: 'Sign-in could not be checked. Try again.' });
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

    const pending = await takePendingRegistration(hashToken(token));
    if (pending) {
      await createVerifiedUser(pending.name, pending.email, pending.password);
      return res.json({ message: 'Email verified successfully. You can log in now.' });
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
    const auth = requireSupabase(res);
    if (!auth) return;

    const email = String(req.body.email || '').trim().toLowerCase();
    const generic = { message: 'If that email is unverified, a new link has been sent.' };
    if (!email) return res.json(generic);

    const { error } = await auth.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${siteUrl(req)}/auth/confirm` },
    });
    if (error && !/not found|already/i.test(error.message)) {
      return res.status(mailStatus(error)).json({ message: mailMessage(error) });
    }
    res.json(generic);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not send the verification email.' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const auth = requireSupabase(res);
    if (!auth) return;

    const email = String(req.body.email || '').trim().toLowerCase();
    const generic = { message: 'If that email is registered, a reset link has been sent.' };
    if (!email) return res.json(generic);

    const local = await findUserByEmail(email);
    if (local) {
      const authUser = await findAuthUserByEmail(email);
      if (!authUser) {
        const created = await auth.auth.admin.createUser({
          email,
          password: `${crypto.randomBytes(24).toString('hex')}Aa1`,
          email_confirm: true,
          user_metadata: { name: local.name },
        });
        if (created.error && !/already|exists/i.test(created.error.message)) {
          return res.status(mailStatus(created.error)).json({ message: mailMessage(created.error) });
        }
      }
    }

    const { error } = await auth.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl(req)}/reset-password`,
    });
    if (error && !/not found|not registered/i.test(error.message)) {
      return res.status(mailStatus(error)).json({ message: mailMessage(error) });
    }
    res.json(generic);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not send the reset email.' });
  }
};

export const supabasePassword = async (req: Request, res: Response) => {
  try {
    const auth = requireSupabase(res);
    if (!auth) return;

    const accessToken = String(req.body.accessToken || '');
    const password = req.body.password;
    if (!accessToken || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const { data, error } = await auth.auth.getUser(accessToken);
    if (error || !data.user?.id || !data.user.email) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    const updated = await auth.auth.admin.updateUserById(data.user.id, { password });
    if (updated.error) {
      return res.status(400).json({ message: mailMessage(updated.error) });
    }

    const local = await findUserByEmail(data.user.email);
    if (local) {
      await updatePasswordAndClearToken(local.id, await bcrypt.hash(password, 10));
    }

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
