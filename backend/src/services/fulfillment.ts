import { createLicense, createOrder, findOrderByPaymentId, getLicense, markOrderPaid } from '../models/orderModel';
import { generateLicenseKey } from '../utils/tokens';

export const addBillingPeriod = (period: string, from = new Date()) => {
  const end = new Date(from.getTime());
  if (period === 'yearly') end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);
  return end;
};

export const ensureLicense = async (userId: number, product: { id: number; type: string }) => {
  if (product.type !== 'desktop') return null;
  const existing = await getLicense(userId, product.id);
  if (existing) return existing;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await createLicense(userId, product.id, generateLicenseKey());
    } catch (error: any) {
      if (error.code !== '23505') throw error;
    }
  }
  throw new Error('Could not create a license key');
};

export const recordPaidOrder = async (data: {
  userId: number;
  productId: number;
  amount: number;
  paymentId?: string | null;
  razorpayOrderId?: string | null;
}) => {
  if (data.paymentId) {
    const existing = await findOrderByPaymentId(data.paymentId);
    if (existing) {
      if (existing.status !== 'paid') return markOrderPaid(existing.id, data.paymentId);
      return existing;
    }
  }

  return createOrder({
    user_id: data.userId,
    product_id: data.productId,
    amount: data.amount,
    status: 'paid',
    razorpay_payment_id: data.paymentId || null,
    razorpay_order_id: data.razorpayOrderId || null,
  });
};
