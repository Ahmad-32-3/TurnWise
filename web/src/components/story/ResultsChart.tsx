import { FAMILIES, FAMILY_COLOR, FAMILY_LABEL, METRICS } from '../../data'

const W = 660
const H = 280
const PAD = { l: 44, r: 16, t: 20, b: 40 }

export function ResultsChart() {
  const plotW = W - PAD.l - PAD.r
  const plotH = H - PAD.t - PAD.b
  const groupW = plotW / FAMILIES.length
  const barW = 22
  const y = (pct: number) => PAD.t + plotH - (pct / 100) * plotH
  const ticks = [0, 25, 50, 75, 100]

  return (
    <div className="chart-wrap" id="results-chart">
      <p className="chart-kicker">Upright vs after the turn, same train budget</p>
      <svg
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Upright and after-the-turn scores for each family. Turn-aware after the turn is ${METRICS.successPct}%. Ordinary net after the turn is ${METRICS.cnnRotatedPct}%. Chance is ${METRICS.chancePct}%.`}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth="1" />
            <text x={PAD.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--chart-label)" fontFamily="var(--font-mono)">
              {t}
            </text>
          </g>
        ))}
        <line
          x1={PAD.l}
          x2={W - PAD.r}
          y1={y(METRICS.chancePct)}
          y2={y(METRICS.chancePct)}
          stroke="var(--chart-label)"
          strokeDasharray="3 3"
          strokeWidth="1"
        />
        {FAMILIES.map((f, i) => {
          const cx = PAD.l + groupW * i + groupW / 2
          const hUp = (f.uprightPct / 100) * plotH
          const hRot = (f.rotatedPct / 100) * plotH
          return (
            <g key={f.family}>
              <rect
                className="bar-grow"
                x={cx - barW - 4}
                y={y(f.uprightPct)}
                width={barW}
                height={hUp}
                fill={FAMILY_COLOR[f.family]}
                opacity={0.45}
                style={{ animationDelay: `${i * 0.08}s` }}
              />
              <rect
                className="bar-grow"
                x={cx + 4}
                y={y(f.rotatedPct)}
                width={barW}
                height={hRot}
                fill={FAMILY_COLOR[f.family]}
                style={{ animationDelay: `${i * 0.08 + 0.05}s` }}
              />
              <text x={cx} y={H - 12} textAnchor="middle" fontSize="11" fill="var(--chart-label)" fontFamily="var(--font-mono)">
                {FAMILY_LABEL[f.family]}
              </text>
            </g>
          )
        })}
      </svg>
      <ul className="legend">
        <li>
          <span className="swatch" style={{ background: 'var(--fg-hi)', opacity: 0.45 }} />
          upright
        </li>
        <li>
          <span className="swatch" style={{ background: 'var(--good)' }} />
          after the turn
        </li>
        <li>
          <svg width="26" height="10" aria-hidden="true" style={{ flex: '0 0 auto' }}>
            <line x1="1" y1="5" x2="25" y2="5" stroke="var(--chart-label)" strokeWidth="1" strokeDasharray="3 3" />
          </svg>
          chance
        </li>
      </ul>
    </div>
  )
}
