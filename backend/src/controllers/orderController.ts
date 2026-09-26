import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getProductById } from '../models/productModel';
import {
  activateSubscription,
  attachRazorpayOrderId,
  createOrder,
  createSubscription,
  findOrderById,
  findOrderByRazorpayOrderId,
  findSubscriptionById,
  findSubscriptionByRazorpayId,
  getUserOrders,
  markOrderPaid,
  markSubscriptionCancelAtPeriodEnd,
  setSubscriptionFromProvider,
  userHasAccess,
} from '../models/orderModel';
import { addBillingPeriod, ensureLicense, recordPaidOrder } from '../services/fulfillment';
import { verifyPaymentSignature, verifySubscriptionSignature, verifyWebhookSignature } from '../utils/paymentCrypto';
import { getRazorpay, razorpayKeyId } from '../utils/razorpayClient';

const money = (rows: any[]) =>
  rows.map((row) => ({
    ...row,
    amount: Number(row.amount),
  }));

export const createCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const product = await getProductById(Number(req.body.productId));
    if (!product || !product.is_active) return res.status(404).json({ message: 'Product not found' });
    if (product.is_free) return res.json({ granted: true });
    if (await userHasAccess(req.user!.id, product.id)) {
      return res.status(409).json({ message: 'You already have access to this product' });
    }

    const razorpay = getRazorpay();
    if (!razorpay) return res.status(503).json({ message: 'Payments are not configured yet' });

    const amountPaise = Math.round(Number(product.price) * 100);
    if (amountPaise < 100) return res.status(400).json({ message: 'Paid products must cost at least 1 INR' });

    if (product.pricing_model === 'subscription') {
      if (!product.razorpay_plan_id) {
        return res.status(400).json({ message: 'This subscription is missing a Razorpay plan id' });
      }
      const subscription = await razorpay.subscriptions.create({
        plan_id: product.razorpay_plan_id,
        total_count: product.billing_period === 'yearly' ? 10 : 120,
        customer_notify: 1,
        notes: { user_id: String(req.user!.id), product_id: String(product.id) },
      });
      await createSubscription({
        user_id: req.user!.id,
        product_id: product.id,
        status: subscription.status || 'created',
        razorpay_subscription_id: subscription.id,
      });
      return res.json({
        subscriptionId: subscription.id,
        keyId: razorpayKeyId(),
        name: product.name,
        description: product.description || '',
      });
    }

    const local = await createOrder({
      user_id: req.user!.id,
      product_id: product.id,
      amount: Number(product.price),
      status: 'pending',
    });
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `rcpt_${local.id}`.slice(0, 40),
      notes: {
        user_id: String(req.user!.id),
        product_id: String(product.id),
        local_order_id: String(local.id),
      },
    });
    await attachRazorpayOrderId(local.id, order.id);
    res.json({
      orderId: order.id,
      amount: amountPaise,
      currency: 'INR',
      keyId: razorpayKeyId(),
      name: product.name,
      description: product.description || '',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const fulfillPaidOrder = async (order: any, paymentId: string) => {
  if (order.status !== 'paid') await markOrderPaid(order.id, paymentId);
  const product = await getProductById(order.product_id);
  if (product) await ensureLicense(order.user_id, product);
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return res.status(503).json({ message: 'Payments are not configured yet' });

    const paymentId = String(req.body.razorpay_payment_id || '');
    const signature = String(req.body.razorpay_signature || '');
    const orderId = req.body.razorpay_order_id ? String(req.body.razorpay_order_id) : '';
    const subscriptionId = req.body.razorpay_subscription_id ? String(req.body.razorpay_subscription_id) : '';
    if (!paymentId || !signature) return res.status(400).json({ message: 'Payment confirmation is incomplete' });

    if (subscriptionId) {
      if (!verifySubscriptionSignature(paymentId, subscriptionId, signature, secret)) {
        return res.status(400).json({ message: 'Payment could not be verified' });
      }
      const subscription = await findSubscriptionByRazorpayId(subscriptionId);
      if (!subscription || subscription.user_id !== req.user!.id) {
        return res.status(404).json({ message: 'Subscription not found' });
      }
      const product = await getProductById(subscription.product_id);
      const periodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end)
        : addBillingPeriod(product?.billing_period || 'monthly');
      await activateSubscription(subscription.id, periodEnd, 'active');
      if (product) {
        await recordPaidOrder({
          userId: req.user!.id,
          productId: product.id,
          amount: Number(product.price),
          paymentId,
        });
        await ensureLicense(req.user!.id, product);
      }
      return res.json({ message: 'Payment verified' });
    }

    if (!orderId || !verifyPaymentSignature(orderId, paymentId, signature, secret)) {
      return res.status(400).json({ message: 'Payment could not be verified' });
    }
    const order = await findOrderByRazorpayOrderId(orderId);
    if (!order || order.user_id !== req.user!.id) return res.status(404).json({ message: 'Order not found' });
    await fulfillPaidOrder(order, paymentId);
    res.json({ message: 'Payment verified' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    res.json(money(await getUserOrders(req.user!.id)));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const subscription = await findSubscriptionById(Number(req.params.id));
    if (!subscription || subscription.user_id !== req.user!.id) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    if (subscription.cancel_at_period_end) {
      return res.json({ message: 'Cancellation is already scheduled' });
    }

    const razorpay = getRazorpay();
    if (subscription.razorpay_subscription_id) {
      if (!razorpay) return res.status(503).json({ message: 'Payments are not configured yet' });
      await razorpay.subscriptions.cancel(subscription.razorpay_subscription_id, true);
    }

    const product = await getProductById(subscription.product_id);
    const existingEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
    const periodEnd =
      existingEnd && existingEnd.getTime() > Date.now()
        ? existingEnd
        : addBillingPeriod(product?.billing_period || 'monthly');
    await markSubscriptionCancelAtPeriodEnd(subscription.id, periodEnd);
    res.json({ message: 'Subscription will end after the current billing period', currentPeriodEnd: periodEnd });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const numberFrom = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const razorpayWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.header('x-razorpay-signature');
    if (!secret) return res.status(503).json({ message: 'Webhook secret is not configured' });
    if (!req.rawBody || !signature || !verifyWebhookSignature(req.rawBody, signature, secret)) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(req.rawBody.toString());
    const name = String(event.event || '');

    if (name === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      const notes = payment?.notes || {};
      const localId = numberFrom(notes.local_order_id);
      const order =
        (localId ? await findOrderById(localId) : null) ||
        (payment?.order_id ? await findOrderByRazorpayOrderId(payment.order_id) : null);
      if (order && payment?.id) await fulfillPaidOrder(order, payment.id);
    }

    if (name.startsWith('subscription.')) {
      const entity = event.payload?.subscription?.entity;
      const subscription = entity?.id ? await findSubscriptionByRazorpayId(entity.id) : null;
      if (subscription) {
        const periodEnd = entity.current_end ? new Date(entity.current_end * 1000) : null;
        const status = name === 'subscription.cancelled' ? 'cancelled' : entity.status || 'active';
        await setSubscriptionFromProvider(subscription.id, status, periodEnd);
        const payment = event.payload?.payment?.entity;
        if (payment?.id) {
          const product = await getProductById(subscription.product_id);
          await recordPaidOrder({
            userId: subscription.user_id,
            productId: subscription.product_id,
            amount: payment.amount ? Number(payment.amount) / 100 : Number(product?.price || 0),
            paymentId: payment.id,
          });
          if (product) await ensureLicense(subscription.user_id, product);
        }
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
