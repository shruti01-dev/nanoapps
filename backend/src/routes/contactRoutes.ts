import express from 'express';
import { authLimiter } from '../middleware/rateLimit';
import { sendContactMessage } from '../controllers/contactController';

const router = express.Router();

router.post('/', authLimiter, sendContactMessage);

export default router;
