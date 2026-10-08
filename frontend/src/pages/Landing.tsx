import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { BillSplitter, BreathingBreak, FocusTimer, UnitConverter } from '../components/MiniDemos'
import { getProducts } from '../api/products'
import { productPath } from '../lib/format'
import type { CatalogProduct } from '../api/types'

type MiniTool = {
  id: string
  name: string
  category: 'productivity' | 'everyday' | 'health' | 'utility'
  summary: string
  features: string[]
  use: string
  demo: ReactNode
}

const categories = [
  { id: 'all', name: 'All apps' },
  { id: 'productivity', name: 'Productivity' },
  { id: 'everyday', name: 'Everyday tools' },
  { id: 'health', name: 'Health & lifestyle' },
  { id: 'utility', name: 'Utility tools' },
] as const

const miniTools: MiniTool[] = [
  {
    id: 'focus',
    name: 'Focus Timer',
    category: 'productivity',
    summary: 'One task. One timer. A little more focus.',
    features: ['Choose a 15, 25 or 45 minute session.', 'Pause whenever you need a moment.', 'Reset and start a fresh session.'],
    use: 'When your next task needs your full attention.',
    demo: <FocusTimer />,
  },
  {
    id: 'split',
    name: 'Bill Splitter',
    category: 'everyday',
    summary: 'Split a meal, a trip or a shared bill fairly.',
    features: ['Enter the bill and an optional tip.', 'Choose how many people are sharing.', 'See the total and amount per person.'],
    use: 'For meals with friends and expenses shared equally.',
    demo: <BillSplitter />,
  },
  {
    id: 'breathe',
    name: 'Breathing Break',
    category: 'health',
    summary: 'Take a moment. Follow a calmer rhythm.',
    features: ['Follow a simple breathing rhythm.', 'Start or pause at your own pace.', 'Take a short break between tasks.'],
    use: 'For a comfortable, unhurried pause in your day.',
    demo: <BreathingBreak />,
  },
  {
    id: 'convert',
    name: 'Unit Converter',
    category: 'utility',
    summary: 'From metres to miles, without the mental maths.',
    features: ['Convert length, weight or temperature.', 'Switch between familiar units.', 'See a result as you type.'],
    use: 'For recipes, measurements, travel and everyday conversions.',
    demo: <UnitConverter />,
  },
]

const tones: Record<MiniTool['category'], string> = {
  productivity: 'bg-[#eaf1ff] text-[#4f80d9]',
  everyday: 'bg-[#fff2df] text-[#dc9a38]',
  health: 'bg-[#fcecf3] text-[#d66896]',
  utility: 'bg-[#e7f5ee] text-[#3a9b7e]',
}

export default function Landing() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [category, setCategory] = useState<(typeof categories)[number]['id']>('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [showDemo, setShowDemo] = useState(false)

  useEffect(() => {
    getProducts()
      .then(({ data }) => setProducts(data))
      .catch(() => setProducts([]))
  }, [])

  const visibleTools = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    return miniTools.filter((tool) => {
      if (category !== 'all' && tool.category !== category) return false
      const haystack = `${tool.name} ${tool.summary}`.toLowerCase()
      return words.every((word) => haystack.includes(word))
    })
  }, [category, query])

  const openTool = miniTools.find((tool) => tool.id === openId) || null

  return (
    <div className="bg-white text-[#18283b]">
      <Navbar />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-[#65788f]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
              SMALL APPS. EVERYDAY POSSIBILITIES.
            </p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Less effort.
              <br />
              <span className="text-[#2563eb]">More everyday.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-[#607085]">
              Simple, useful little apps for the things you do every day. Try a mini tool, or install desktop software for Windows.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#explore" className="inline-flex items-center rounded-lg bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1c50cf]">
                Find your next app
              </a>
              <button type="button" className="px-2 text-sm font-semibold text-[#566c89] hover:text-[#2563eb]" onClick={() => { setCategory('all'); setQuery(''); document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' }) }}>
                Try a mini demo
              </button>
            </div>
            <p className="mt-6 flex flex-wrap gap-3 text-xs text-[#8190a1]">
              <span><b className="text-[#50647e]">4</b> ready tools</span>
              <span><b className="text-[#50647e]">{products.filter((product) => product.type === 'desktop').length}</b> desktop apps</span>
              <span>Made to keep life simple</span>
            </p>
          </div>
          <div className="relative mx-auto hidden w-full max-w-sm py-6 md:block">
            <div className="-rotate-6 grid grid-cols-2 gap-3">
              <div className="grid aspect-square place-items-center rounded-[28px] bg-[#fff0d9] text-4xl">☀</div>
              <div className="grid aspect-square place-items-center rounded-[28px] bg-[#dcf4e9] text-4xl text-[#36a27b]">✓</div>
              <div className="grid aspect-square place-items-center rounded-[28px] bg-[#fbe4ee] text-4xl">♡</div>
              <div className="grid aspect-square place-items-center rounded-[28px] bg-[#e1ecff] text-4xl text-[#3e78da]">⇄</div>
            </div>
            <div className="absolute bottom-2 right-0 flex items-center gap-3 rounded-xl border border-[#ecf0f6] bg-white px-4 py-3 text-xs text-[#8090a5] shadow-lg">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#edf8f2] text-[#41a884]">✓</span>
              <span>Little tools.<br /><strong className="text-sm text-[#18283b]">Big difference.</strong></span>
            </div>
          </div>
        </section>

        <section id="explore" className="border-y border-[#eef1f5] bg-[#f6f8fb] py-12">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[210px_1fr]">
            <aside>
              <p className="mb-4 px-2 text-[10px] font-bold tracking-[0.14em] text-[#98a4b3]">YOUR LITTLE TOOLBOX</p>
              <nav className="flex gap-2 overflow-auto lg:block">
                {categories.map((item) => {
                  const count = item.id === 'all' ? miniTools.length : miniTools.filter((tool) => tool.category === item.id).length
                  const selected = category === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id)}
                      className={selected ? 'mb-2 flex w-full items-center justify-between rounded-lg bg-[#e8efff] px-3 py-2.5 text-left text-sm font-semibold text-[#2563eb]' : 'mb-2 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#6e7e93] hover:bg-[#edf1f8]'}
                    >
                      {item.name}
                      <span className="text-[11px] text-[#9cabbc]">{count}</span>
                    </button>
                  )
                })}
              </nav>
            </aside>

            <div>
              <p className="text-[10px] font-bold tracking-[0.14em] text-[#65788f]">DISCOVER SOMETHING USEFUL</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">A little help goes a long way.</h2>
              <p className="mt-2 text-sm text-[#8390a3]">Four working tools you can try here, plus desktop software you can install.</p>

              <label className="mt-6 flex items-center gap-3 rounded-xl border border-[#dce3ed] bg-white px-4 py-3 shadow-sm">
                <span className="text-[#98a5b7]">Search</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="What could make your day easier?"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleTools.map((tool) => (
                  <article key={tool.id} className="flex min-h-[230px] flex-col rounded-xl border border-[#e3e8f0] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#bdcdee] hover:shadow-md">
                    <div className={`grid h-11 w-11 place-items-center rounded-xl text-lg ${tones[tool.category]}`}>✦</div>
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[#98a5b6]">{categories.find((item) => item.id === tool.category)?.name}</p>
                    <h3 className="mt-1 text-lg font-semibold">{tool.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#8a97a9]">{tool.summary}</p>
                    <div className="mt-auto flex items-center justify-between border-t border-[#f0f3f7] pt-3">
                      <span className="text-[11px] text-[#5a9d85]">Mini demo</span>
                      <button type="button" className="text-xs font-semibold text-[#597aaa] hover:text-[#2563eb]" onClick={() => { setOpenId(tool.id); setShowDemo(false) }}>
                        Explore
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {visibleTools.length === 0 && (
                <div className="mt-4 rounded-xl border border-dashed border-[#cdd8e6] bg-white px-6 py-12 text-center">
                  <h3 className="text-lg font-semibold">No little helpers found.</h3>
                  <button type="button" className="mt-4 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white" onClick={() => { setQuery(''); setCategory('all') }}>
                    Explore all ideas
                  </button>
                </div>
              )}

              {products.some((product) => product.type === 'desktop') && (
                <div className="mt-10">
                  <h3 className="font-display text-xl font-semibold">Install on your computer</h3>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {products.filter((product) => product.type === 'desktop').map((product) => (
                      <Link key={product.id} to={productPath(product)} className="rounded-xl border border-[#e3e8f0] bg-white p-5 hover:border-[#bdcdee]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#98a5b6]">Desktop software</p>
                        <h3 className="mt-1 text-lg font-semibold">{product.name}</h3>
                        <p className="mt-2 text-sm text-[#8a97a9]">{product.tagline || product.description}</p>
                        <span className="mt-4 inline-block text-xs font-semibold text-[#2563eb]">Get installer</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-6 py-12 md:flex-row md:items-center">
          <h2 className="max-w-sm font-display text-2xl font-semibold">A useful tool shouldn’t need a manual.</h2>
          <p className="max-w-md text-sm leading-7 text-[#90a0b3]">One clear purpose. A few simple steps. A little less friction in your day. That’s the thinking behind every nanoapp.</p>
        </section>
      </main>
      <Footer />

      {openTool && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#16253f]/60 p-4" onClick={() => setOpenId(null)}>
          <div className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-2xl border border-[#e3e8ef] bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="tool-title">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#98a5b6]">{categories.find((item) => item.id === openTool.category)?.name}</p>
              <button type="button" className="rounded-lg bg-[#f4f6fa] px-3 py-1 text-sm text-[#8c9caf]" onClick={() => setOpenId(null)}>Close</button>
            </div>
            <h2 id="tool-title" className="mt-3 font-display text-3xl font-semibold">{openTool.name}</h2>
            <p className="mt-3 text-sm leading-6 text-[#607085]">{openTool.summary}</p>
            {!showDemo ? (
              <>
                <ul className="mt-5 space-y-2 text-sm text-[#607085]">
                  {openTool.features.map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-[#607085]">{openTool.use}</p>
                <button type="button" className="mt-6 rounded-lg bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white" onClick={() => setShowDemo(true)}>
                  Try the mini demo
                </button>
              </>
            ) : (
              <div className="mt-5">
                {openTool.demo}
                <button type="button" className="mt-4 text-xs font-semibold text-[#7086a5]" onClick={() => setShowDemo(false)}>
                  Back to the app idea
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
