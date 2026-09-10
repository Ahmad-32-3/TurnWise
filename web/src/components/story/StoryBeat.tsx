import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'

type Props = {
  id: string
  title: string
  kicker?: string
  children: ReactNode
  visual?: ReactNode
  caption: string
}

export function StoryBeat({ id, title, kicker, children, visual, caption }: Props) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const canAnim = typeof window !== 'undefined' && 'IntersectionObserver' in window && !reduce
  const [phase, setPhase] = useState<'' | 'hidden' | 'in'>(canAnim ? 'hidden' : '')
  const [replayKey, setReplayKey] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!canAnim || !el) {
      setPhase('')
      return
    }
    const reveal = () => setPhase('in')
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) reveal()
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    const fallback = setTimeout(reveal, 2000)
    return () => {
      io.disconnect()
      clearTimeout(fallback)
    }
  }, [canAnim])

  const shown = Children.map(visual, (child, i) =>
    isValidElement(child) ? cloneElement(child, { key: `${replayKey}-${i}` }) : child,
  )
  const cls = phase === 'hidden' ? 'story-beat beat-hidden' : phase === 'in' ? 'story-beat beat-in' : 'story-beat'

  return (
    <section className={cls} id={id} ref={ref}>
      <div className="story-beat__grid">
        <div className="story-beat__copy">
          {kicker ? <p className="story-kicker">{kicker}</p> : null}
          <h2>{title}</h2>
          <div className="story-prose">{children}</div>
        </div>
        <div className="story-beat__panel">
          <div className="story-window">
            {shown ? (
              <div className="story-viz" key={replayKey}>
                {shown}
              </div>
            ) : null}
            <div className="story-window__bar">
              <p className="meta story-caption">{caption}</p>
              {visual ? (
                <button type="button" onClick={() => setReplayKey((k) => k + 1)}>
                  Replay
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
