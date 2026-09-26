import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimit';
import {
  forgotPassword,
  getMe,
  loginUser,
  registerUser,
  resendVerification,
  resetPassword,
  verifyEmail,
} from '../controllers/authController';

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.get('/me', protect, getMe);
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

export default router;
