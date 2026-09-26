import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { describe, it } from 'node:test';
import { hashToken } from './tokens';
import {
  verifyPaymentSignature,
  verifySubscriptionSignature,
  verifyWebhookSignature,
} from './paymentCrypto';

describe('payment signatures', () => {
  it('accepts a matching order signature and rejects a mismatched one', () => {
    const secret = 'secret';
    const orderId = 'order_1';
    const paymentId = 'pay_1';
    const signature = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');

    assert.equal(verifyPaymentSignature(orderId, paymentId, signature, secret), true);
    assert.equal(verifyPaymentSignature(orderId, paymentId, 'nope', secret), false);
    assert.equal(verifyPaymentSignature(orderId, paymentId, signature.slice(0, 10), secret), false);
  });

  it('accepts a matching subscription signature', () => {
    const secret = 'secret';
    const paymentId = 'pay_1';
    const subscriptionId = 'sub_1';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${paymentId}|${subscriptionId}`)
      .digest('hex');

    assert.equal(verifySubscriptionSignature(paymentId, subscriptionId, signature, secret), true);
  });

  it('accepts a matching webhook signature', () => {
    const secret = 'whsec';
    const body = Buffer.from('{"ok":true}');
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    assert.equal(verifyWebhookSignature(body, signature, secret), true);
    assert.equal(verifyWebhookSignature(body, signature, 'other'), false);
  });
});

describe('tokens', () => {
  it('hashes a token without storing the raw value', () => {
    assert.equal(hashToken('abc'), hashToken('abc'));
    assert.notEqual(hashToken('abc'), 'abc');
  });
});
