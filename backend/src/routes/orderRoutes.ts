import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  cancelSubscription,
  createCheckout,
  getMyOrders,
  razorpayWebhook,
  verifyPayment,
} from '../controllers/orderController';

const router = express.Router();

router.post('/checkout', protect, createCheckout);
router.post('/verify', protect, verifyPayment);
router.get('/me', protect, getMyOrders);
router.post('/webhook', razorpayWebhook);
router.post('/subscriptions/:id/cancel', protect, cancelSubscription);

export default router;
