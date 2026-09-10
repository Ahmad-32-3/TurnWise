import { ATTACH_LABEL, FAMILIES, FAMILY_COLOR, FAMILY_LABEL, PROTOCOL } from '../../data'

export function ArchChart() {
  const maxP = Math.max(...FAMILIES.map((f) => f.paramsTotal), 1)
  const W = 660
  const rowH = 36
  const H = 72 + FAMILIES.length * rowH
  const barX = 280
  const barW = 240

  return (
    <div className="chart-wrap" id="arch-chart">
      <p className="chart-kicker">Same conv stack, two attach points</p>
      <ul className="attach-slots" aria-label="Where each family plugs into the block">
        {(['plain_conv', 'orientation_pool'] as const).map((slot) => (
          <li key={slot}>
            <span className="attach-slots__name">{ATTACH_LABEL[slot]}</span>
            <span className="attach-slots__fams">
              {FAMILIES.filter((f) => f.attach === slot)
                .map((f) => FAMILY_LABEL[f.family])
                .join(', ') || 'none'}
            </span>
          </li>
        ))}
      </ul>
      <svg
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Parameter count by family. Ordinary net, turn-aware net, and ordinary net with spun training share the same 31,930 weights. Only the turn-aware net adds a wrap around those weights."
      >
        <text x="0" y="14" fontSize="11" fill="var(--chart-label)" fontFamily="var(--font-mono)">
          Total weights (shared backbone vs group wrap)
        </text>
        {FAMILIES.map((f, i) => {
          const y = 40 + i * rowH
          const w = (f.paramsTotal / maxP) * barW
          return (
            <g key={f.family}>
              <circle cx="8" cy={y} r="4" fill={FAMILY_COLOR[f.family]} />
              <text x="18" y={y + 4} fontSize="12" fill="var(--fg-hi)" fontFamily="var(--font-mono)">
                {FAMILY_LABEL[f.family]}
              </text>
              <text x="168" y={y + 4} fontSize="11" fill="var(--chart-label)" fontFamily="var(--font-mono)">
                {f.group === 'C8' ? 'turn wrap' : 'no wrap'}
              </text>
              <rect x={barX} y={y - 8} width={barW} height="16" fill="var(--bg-sunk)" />
              <rect
                className="bar-grow"
                x={barX}
                y={y - 8}
                width={Math.max(w, 4)}
                height="16"
                fill={FAMILY_COLOR[f.family]}
                style={{ animationDelay: `${i * 0.06}s` }}
              />
              <text
                x={barX + barW + 8}
                y={y + 4}
                fontSize="11"
                fill="var(--chart-label)"
                fontFamily="var(--font-mono)"
              >
                {f.paramsTotal}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="meta" style={{ textTransform: 'none', letterSpacing: 0, margin: '8px 0 0' }}>
        One stack: {PROTOCOL.img}×{PROTOCOL.img}, width {PROTOCOL.width}, {PROTOCOL.steps} steps. The
        turn-aware net does not add weights. It reuses the same filters at eight in-plane angles.
      </p>
    </div>
  )
}
