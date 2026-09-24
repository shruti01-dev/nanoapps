import LegalLayout from '../components/LegalLayout'

export default function RefundPolicy() {
  return (
    <LegalLayout title="Refund & cancellation" lastUpdated="24 September 2026">
      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Desktop software purchases</h2>
        <p className="mt-3">
          Since desktop software is delivered instantly as a digital download, purchases are
          generally non-refundable once the download link has been accessed. If a tool is
          defective or doesn't work as described, contact us within 7 days of purchase and
          we'll work with you on a fix or refund.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Subscriptions</h2>
        <p className="mt-3">
          You can cancel a monthly or yearly subscription anytime from your dashboard. Your
          access continues until the end of the billing period you've already paid for — we
          don't offer partial refunds for unused time within a period.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Failed or duplicate payments</h2>
        <p className="mt-3">
          If you're charged twice for the same order, or a payment fails but funds are
          deducted, contact us with your transaction ID and we'll verify and refund the
          incorrect charge within 5-7 business days.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">How refunds are processed</h2>
        <p className="mt-3">
          Approved refunds are issued to your original payment method via Razorpay, and
          typically reflect in your account within 5-7 business days, depending on your bank
          or payment provider.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Contact us</h2>
        <p className="mt-3">
          To request a refund or cancellation, email us at{' '}
          <a href="mailto:support@nanoapps.in" className="font-medium text-teal hover:underline">
            support@nanoapps.in
          </a>{' '}
          with your order details.
        </p>
      </section>
    </LegalLayout>
  )
}