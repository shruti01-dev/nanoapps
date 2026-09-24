import { useState, type FormEvent } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Message from ${name}`)
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
    window.location.href = `mailto:support@nanoapps.in?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-lg">
          <h1 className="font-display text-3xl font-semibold text-ink">Get in touch</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            Questions, feedback, or a tool idea — send it over and we'll get back to you.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-ink/80">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80">Message</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-teal"
              />
            </div>

            {sent && (
              <p className="text-sm text-teal">
                Opening your email client to send this — if nothing opened, email us directly at{' '}
                <a href="mailto:support@nanoapps.in" className="font-medium hover:underline">
                  support@nanoapps.in
                </a>.
              </p>
            )}

            <button
              type="submit"
              className="mt-2 bg-ink px-4 py-3 text-sm font-medium text-paper transition hover:bg-blueprint"
            >
              Send message
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}