import LegalLayout from '../components/LegalLayout'

export default function TermsOfService() {
  return (
    <LegalLayout title="Terms of service" lastUpdated="24 September 2026">
      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Using nanoapps.in</h2>
        <p className="mt-3">
          By creating an account or making a purchase on nanoapps.in, you agree to these
          terms. You must be at least 18 years old, or have a parent or guardian's
          permission, to register.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Accounts</h2>
        <p className="mt-3">
          You're responsible for keeping your login credentials secure. Let us know right
          away if you suspect unauthorized access to your account.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Purchases and licenses</h2>
        <p className="mt-3">
          Desktop software is sold as a one-time purchase that grants you a personal,
          non-transferable license to install and use the software, along with future
          updates made available through your dashboard.
        </p>
        <p className="mt-3">
          Web tools are offered on a subscription basis, billed monthly or yearly. Access
          continues until the end of your current billing period if you cancel.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Acceptable use</h2>
        <p className="mt-3">
          You agree not to resell, redistribute, or reverse-engineer any software or tool
          purchased through nanoapps.in, and not to use our tools for any unlawful purpose.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Changes to the service</h2>
        <p className="mt-3">
          We may update, modify, or discontinue individual tools or features over time. We'll
          make reasonable efforts to notify you of significant changes affecting products
          you've purchased.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Limitation of liability</h2>
        <p className="mt-3">
          Tools and software are provided "as is." We aren't liable for indirect or
          consequential damages arising from their use, to the extent permitted by law.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Contact us</h2>
        <p className="mt-3">
          Questions about these terms? Email us at{' '}
          <a href="mailto:support@nanoapps.in" className="font-medium text-teal hover:underline">
            support@nanoapps.in
          </a>.
        </p>
      </section>
    </LegalLayout>
  )
}