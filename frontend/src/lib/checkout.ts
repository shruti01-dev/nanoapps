import { createCheckout, verifyPayment } from '../api/orders'

type CheckoutResult = {
  razorpay_payment_id: string
  razorpay_order_id?: string
  razorpay_subscription_id?: string
  razorpay_signature: string
}

type CheckoutOptions = {
  key: string
  name: string
  description: string
  order_id?: string
  subscription_id?: string
  amount?: number
  currency?: string
  handler: (response: CheckoutResult) => void
  modal: { ondismiss: () => void }
}

declare global {
  interface Window {
    Razorpay?: new (options: CheckoutOptions) => { open: () => void }
  }
}

const loadRazorpay = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

export async function payForProduct(productId: number) {
  const { data } = await createCheckout(productId)
  if (data.granted) return

  const ready = await loadRazorpay()
  if (!ready || !window.Razorpay) {
    throw new Error('Could not load the payment window.')
  }

  await new Promise<void>((resolve, reject) => {
    const RazorpayCheckout = window.Razorpay
    if (!RazorpayCheckout) {
      reject(new Error('Could not load the payment window.'))
      return
    }
    const checkout = new RazorpayCheckout({
      key: data.keyId,
      name: 'nanoapps',
      description: data.name,
      ...(data.orderId ? { order_id: data.orderId } : {}),
      ...(data.subscriptionId ? { subscription_id: data.subscriptionId } : {}),
      ...(data.amount ? { amount: data.amount, currency: data.currency || 'INR' } : {}),
      handler: async (response) => {
        try {
          await verifyPayment(response)
          resolve()
        } catch (error) {
          reject(error)
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    })
    checkout.open()
  })
}
