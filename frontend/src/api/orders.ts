import api from './axios'

export const createCheckout = (productId: number) => api.post('/orders/checkout', { productId })

export const verifyPayment = (data: {
  razorpay_order_id?: string
  razorpay_payment_id: string
  razorpay_signature: string
  razorpay_subscription_id?: string
}) => api.post('/orders/verify', data)

export const getMyOrders = () => api.get('/orders/me')

export const cancelSubscription = (subscriptionId: number) =>
  api.post(`/orders/subscriptions/${subscriptionId}/cancel`)
