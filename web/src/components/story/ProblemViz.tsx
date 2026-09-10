const N = 14
const CELL = 16

function grid(mark: 'tl' | 'tr' | 'bl' | 'br', x0: number, symbol: 'bar' | 'plus') {
  const cells = []
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      let on = false
      if (mark === 'tl' && r < 3 && c < 3) on = true
      if (mark === 'tr' && r < 3 && c >= N - 3) on = true
      if (mark === 'bl' && r >= N - 3 && c < 3) on = true
      if (mark === 'br' && r >= N - 3 && c >= N - 3) on = true
      const mid = N / 2
      if (symbol === 'bar' && Math.abs(c - mid) < 1 && r > 4 && r < N - 3) on = true
      if (symbol === 'plus') {
        if (Math.abs(c - mid) < 1 && r > 4 && r < N - 3) on = true
        if (Math.abs(r - mid) < 1 && c > 4 && c < N - 3) on = true
      }
      cells.push(
        <rect
          key={`${mark}-${r}-${c}`}
          className="mix-cell"
          x={x0 + c * CELL}
          y={28 + r * CELL}
          width={CELL - 1}
          height={CELL - 1}
          fill={on ? 'var(--accent)' : 'var(--bg-sunk)'}
          opacity={on ? 0.95 : 0.35}
          style={{ animationDelay: `${(r * N + c) * 0.006}s` }}
        />,
      )
    }
  }
  return cells
}

export function ProblemViz() {
  const panel = N * CELL
  const W = panel * 2 + 36
  const H = 28 + panel + 8
  return (
    <div className="chart-wrap">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Left: how the mark looks in training, corner mark in the top-left. Right: the same mark after a 90 degree turn, corner mark in the top-right."
      >
        <text x="0" y="14" fontSize="11" fill="var(--chart-label)" fontFamily="var(--font-mono)">
          train view, mark top-left
        </text>
        {grid('tl', 0, 'bar')}
        <text x={panel + 36} y="14" fontSize="11" fill="var(--chart-label)" fontFamily="var(--font-mono)">
          same class, turned 90°
        </text>
        {grid('tr', panel + 36, 'bar')}
      </svg>
    </div>
  )
}
