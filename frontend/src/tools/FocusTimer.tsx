import { useEffect, useState } from 'react'

const choices = [15, 25, 45]

export default function FocusTimer() {
  const [minutes, setMinutes] = useState(25)
  const [remaining, setRemaining] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [deadline, setDeadline] = useState(0)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setRemaining(left)
      if (left === 0) setRunning(false)
    }, 250)
    return () => window.clearInterval(id)
  }, [running, deadline])

  const label = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`
  const caption = remaining === 0 ? 'Session complete. Time for a little break.' : running ? 'One task. A little more focus.' : 'Ready when you are.'

  const pick = (value: number) => {
    setRunning(false)
    setMinutes(value)
    setRemaining(value * 60)
  }

  const toggle = () => {
    if (running) {
      setRunning(false)
      return
    }
    const next = remaining === 0 ? minutes * 60 : remaining
    setRemaining(next)
    setDeadline(Date.now() + next * 1000)
    setRunning(true)
  }

  return (
    <div className="rounded-[13px] border border-line bg-canvas p-6">
      <h2 className="font-display text-lg font-semibold text-ink">Make a little space to focus.</h2>
      <div className="mt-4 flex justify-center gap-2">
        {choices.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => pick(value)}
            className={
              minutes === value
                ? 'rounded-md border border-blue-pale bg-tile-blue px-3 py-2 text-xs font-semibold text-blueprint'
                : 'rounded-md border border-blue-line bg-paper px-3 py-2 text-xs font-semibold text-muted'
            }
          >
            {value} min
          </button>
        ))}
      </div>
      <p className="mt-4 text-center font-display text-6xl font-semibold tracking-tight text-blueprint">{label}</p>
      <p className="mt-2 text-center text-sm text-muted">{caption}</p>
      <div className="mt-5 flex justify-center gap-3">
        <button type="button" onClick={toggle} className="rounded-[9px] bg-blueprint px-4 py-2 text-sm font-medium text-white transition hover:bg-blueprint-light">
          {running ? 'Pause' : remaining === 0 ? 'Start again' : 'Start focus'}
        </button>
        <button
          type="button"
          onClick={() => pick(minutes)}
          className="rounded-[9px] border border-blue-line bg-blue-soft px-4 py-2 text-sm font-medium text-blue-text transition hover:bg-tile-blue"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
