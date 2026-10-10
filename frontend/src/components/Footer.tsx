import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <Logo className="text-paper" />
            <p className="mt-2 text-sm text-paper/60">
              Small tools for serious work.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-paper/90">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-paper/60">
              <li><a href="/tools" className="hover:text-paper">Tools</a></li>
              <li><a href="/software" className="hover:text-paper">Software</a></li>
              <li><a href="/pricing" className="hover:text-paper">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-paper/90">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-paper/60">
              <li><a href="/about" className="hover:text-paper">About</a></li>
              <li><a href="/contact" className="hover:text-paper">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-paper/90">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-paper/60">
              <li><a href="/privacy-policy" className="hover:text-paper">Privacy policy</a></li>
              <li><a href="/terms-of-service" className="hover:text-paper">Terms of service</a></li>
              <li><a href="/refund-policy" className="hover:text-paper">Refund &amp; cancellation</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-paper/10 pt-6 text-xs text-paper/40">
          © 2026 nanoapps.in — All rights reserved.
        </div>
      </div>
    </footer>
  )
}