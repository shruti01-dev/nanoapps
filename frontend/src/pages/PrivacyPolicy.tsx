import LegalLayout from '../components/LegalLayout'

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy policy" lastUpdated="24 September 2026">
      <section>
        <h2 className="font-display text-lg font-semibold text-ink">What we collect</h2>
        <p className="mt-3">
          When you register on nanoapps.in, we collect your name, email address, and a
          securely hashed password. We never store your password in plain text.
        </p>
        <p className="mt-3">
          When you make a purchase, payment details (card, UPI, or net banking information)
          are handled entirely by Razorpay, our payment processor. We never see or store your
          full card or bank details on our servers.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">How we use your data</h2>
        <p className="mt-3">
          We use your information to create and manage your account, process purchases and
          subscriptions, send order confirmations and invoices, and provide access to the
          tools and software you've bought.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Third-party services</h2>
        <p className="mt-3">
          We rely on trusted third parties to run nanoapps.in: Razorpay for payment
          processing, Neon for database hosting, and Vercel/Render for hosting our website
          and servers. Each of these providers has its own privacy practices governing the
          data they process on our behalf.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Cookies</h2>
        <p className="mt-3">
          We use minimal cookies and browser storage to keep you logged in and remember your
          preferences. We don't use cookies for advertising or third-party tracking.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Your rights</h2>
        <p className="mt-3">
          You can access, update, or delete your account information at any time from your
          dashboard. To request full deletion of your data, contact us at the email below.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Contact us</h2>
        <p className="mt-3">
          Questions about this policy? Email us at{' '}
          <a href="mailto:support@nanoapps.in" className="font-medium text-teal hover:underline">
            support@nanoapps.in
          </a>.
        </p>
      </section>
    </LegalLayout>
  )
}