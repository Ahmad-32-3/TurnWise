// Page copy and chart styling. Measured numbers live in metrics.gen.ts.

import {
  FAMILIES as FAMILY_ROWS,
  ILLUSTRATIVE,
  METRICS,
  PROTOCOL,
  type FamilyRow,
} from './metrics.gen'

export { FAMILY_ROWS as FAMILIES, ILLUSTRATIVE, METRICS, PROTOCOL, type FamilyRow }

export const COUNTERS = [
  {
    key: 'success',
    label: 'After the turn, turn-aware net',
    value: METRICS.successPct,
    unit: '%',
    note: 'how often the name is still right after a random 45-degree turn',
  },
  {
    key: 'cnn',
    label: 'After the turn, ordinary net',
    value: METRICS.cnnRotatedPct,
    unit: '%',
    note: 'same width, depth, and step count, trained upright',
  },
  {
    key: 'chance',
    label: 'Chance',
    value: METRICS.chancePct,
    unit: '%',
    note: `uniform guess over ${PROTOCOL.nClasses} classes`,
  },
  {
    key: 'upright',
    label: 'Upright test (debug)',
    value: METRICS.uprightPct,
    unit: '%',
    note: 'same turn-aware net, pictures left upright',
  },
] as const

export const FAMILY_LABEL: Record<string, string> = {
  cnn: 'ordinary image net',
  equivariant: 'turn-aware net',
  cnn_aug: 'ordinary net, spun training',
}

export const FAMILY_COLOR: Record<string, string> = {
  cnn: 'var(--bad)',
  equivariant: 'var(--good)',
  cnn_aug: 'var(--amber)',
}

export const ATTACH_LABEL: Record<string, string> = {
  plain_conv: 'plain conv stack',
  orientation_pool: 'turn wrap, then shared conv',
}

export const DECISIONS = [
  {
    first: 'Train a bigger ordinary net and hope it generalizes to spins',
    built: 'Keep width matched; put the turn wrap into the forward pass',
  },
  {
    first: 'Report upright accuracy as the headline',
    built: 'Train upright, report how often the name is still right after the turn',
  },
  {
    first: 'Hide the CNN that got rotation aug',
    built: 'Keep it as a column: same steps, random 45-degree turns at train',
  },
  {
    first: 'Download full MNIST',
    built: `Capped drawn marks, ${PROTOCOL.nTrain} train / ${PROTOCOL.nTest} test`,
  },
] as const

export type Tool = { name: string; tag: string; plain: string; tech: string }

export const STACK: Tool[] = [
  {
    name: 'PyTorch',
    tag: 'train',
    plain: 'Trains three small conv nets on CPU with the same step count.',
    tech: `Adam, ${PROTOCOL.steps} steps, batch 64, first conv ${PROTOCOL.width} channels. Every family sees the same budget and seed.`,
  },
  {
    name: 'Turn wrap',
    tag: 'group',
    plain: 'At test, the turn-aware net rotates the crop in 45-degree steps and keeps the angle that matches training.',
    tech: 'Eight discrete rotations (C8). Shared conv weights. A small mark in the top-left of the training frame is how the crop is aligned.',
  },
  {
    name: 'drawn marks',
    tag: 'data',
    plain: 'Each image is a corner alignment mark plus a center symbol. Train stays upright.',
    tech: `${PROTOCOL.img}×${PROTOCOL.img}, ${PROTOCOL.nClasses} classes. Rotated test draws an angle from {${PROTOCOL.angles.join(', ')}}. Train ids and test ids stay disjoint.`,
  },
  {
    name: 'Vite, React, motion',
    tag: 'page',
    plain: 'Builds this page and draws the charts from the numbers above.',
    tech: 'React and Tailwind on Vite. The charts are SVG that read data.ts / metrics.gen.ts, so the page makes no network calls.',
  },
]

export const NEXT = [
  'Swap the drawn marks for a capped MNIST slice once I want digits instead of alignment-marked symbols.',
  'A continuous turn wrap in place of eight discrete steps, with the same budget.',
  'A second seed so the after-the-turn gap has a spread instead of a point.',
]

export const SECTORS = [
  {
    name: 'Vision systems',
    line: 'A detector that only saw upright parts still has to score a part that arrived on its side.',
  },
  {
    name: 'Robotics pose',
    line: 'The same object at a new in-plane angle should not need a new training set if the group is in the net.',
  },
  {
    name: 'Medical imaging orientation',
    line: 'Slices are not always filed the way the train set sat on the scanner bed.',
  },
]
