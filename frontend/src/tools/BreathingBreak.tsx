import { useEffect, useState } from 'react'

function phaseAt(elapsed: number) {
  const second = elapsed % 14
  if (second < 4) return { label: 'Breathe in', phase: 'in', remaining: 4 - second }
  if (second < 8) return { label: 'Hold gently', phase: 'hold', remaining: 8 - second }
  return { label: 'Breathe out', phase: 'out', remaining: 14 - second }
}

export default function BreathingBreak() {
  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setElapsed((Date.now() - started) / 1000), 100)
    return () => window.clearInterval(id)
  }, [running, started])

  const phase = phaseAt(elapsed)
  const scale = phase.phase === 'out' ? 'scale-100' : running ? 'scale-110' : 'scale-100'

  return (
    <div className="rounded-[13px] border border-line bg-tile-pink p-6 text-center">
      <h2 className="font-display text-lg font-semibold text-ink">A moment for yourself.</h2>
      <p className="mt-2 text-sm text-muted">In for 4 · hold for 4 · out for 6</p>
      <div className={`mx-auto mt-6 flex h-36 w-36 flex-col items-center justify-center rounded-full border-[12px] border-white bg-tile-pink text-tile-pink-ink transition-transform duration-1000 ${scale}`}>
        <span className="text-sm">{running ? phase.label : 'Ready?'}</span>
        <strong className="font-display text-3xl">{running ? Math.ceil(phase.remaining) : '…'}</strong>
      </div>
      <button
        type="button"
        onClick={() => {
          if (running) {
            setElapsed((Date.now() - started) / 1000)
            setRunning(false)
            return
          }
          setStarted(Date.now() - elapsed * 1000)
          setRunning(true)
        }}
        className="mt-6 rounded-[9px] bg-blueprint px-4 py-2 text-sm font-medium text-white transition hover:bg-blueprint-light"
      >
        {running ? 'Pause' : elapsed > 0 ? 'Continue' : 'Start breathing'}
      </button>
    </div>
  )
}
