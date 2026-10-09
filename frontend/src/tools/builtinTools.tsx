import type { ReactNode } from 'react'
import BillSplitter from './BillSplitter'
import BreathingBreak from './BreathingBreak'
import FocusTimer from './FocusTimer'
import UnitConverter from './UnitConverter'

export type BuiltinTool = {
  slug: string
  name: string
  summary: string
  tone: string
  ink: string
  render: () => ReactNode
}

export const builtinTools: BuiltinTool[] = [
  {
    slug: 'focus-timer',
    name: 'Focus Timer',
    summary: 'One task. One timer. A little more focus.',
    tone: 'bg-tile-blue',
    ink: 'text-tile-blue-ink',
    render: () => <FocusTimer />,
  },
  {
    slug: 'bill-splitter',
    name: 'Bill Splitter',
    summary: 'Split a meal, a trip, or a shared bill fairly.',
    tone: 'bg-tile-orange',
    ink: 'text-tile-orange-ink',
    render: () => <BillSplitter />,
  },
  {
    slug: 'breathing-break',
    name: 'Breathing Break',
    summary: 'Take a moment. Follow a calmer rhythm.',
    tone: 'bg-tile-pink',
    ink: 'text-tile-pink-ink',
    render: () => <BreathingBreak />,
  },
  {
    slug: 'unit-converter',
    name: 'Unit Converter',
    summary: 'From metres to miles, without the mental maths.',
    tone: 'bg-tile-green',
    ink: 'text-tile-green-ink',
    render: () => <UnitConverter />,
  },
]

export const builtinBySlug = Object.fromEntries(builtinTools.map((tool) => [tool.slug, tool]))
