import express from 'express';
import { adminOnly } from '../middleware/adminMiddleware';
import { protect } from '../middleware/authMiddleware';
import { listOrders, listUsers } from '../controllers/adminController';

const router = express.Router();

router.get('/users', protect, adminOnly, listUsers);
router.get('/orders', protect, adminOnly, listOrders);

export default router;
