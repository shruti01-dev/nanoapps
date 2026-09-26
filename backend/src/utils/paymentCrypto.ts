import crypto from 'crypto';

const safeEqual = (left: string, right: string) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

export const signPayload = (payload: string, secret: string) =>
  crypto.createHmac('sha256', secret).update(payload).digest('hex');

export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
) => safeEqual(signature, signPayload(`${orderId}|${paymentId}`, secret));

export const verifySubscriptionSignature = (
  paymentId: string,
  subscriptionId: string,
  signature: string,
  secret: string
) => safeEqual(signature, signPayload(`${paymentId}|${subscriptionId}`, secret));

export const verifyWebhookSignature = (rawBody: Buffer, signature: string, secret: string) =>
  safeEqual(signature, crypto.createHmac('sha256', secret).update(rawBody).digest('hex'));
