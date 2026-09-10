import { ArchChart } from './components/story/ArchChart'
import { ProblemViz } from './components/story/ProblemViz'
import { ResultBento } from './components/story/ResultBento'
import { ResultsChart } from './components/story/ResultsChart'
import { StackGrid } from './components/story/StackGrid'
import { StoryBeat } from './components/story/StoryBeat'
import { DECISIONS, FAMILIES, FAMILY_LABEL, ILLUSTRATIVE, METRICS, NEXT, PROTOCOL, SECTORS } from './data'

const TOC = [
  { href: '#problem', label: 'The problem' },
  { href: '#answer', label: 'The approach' },
  { href: '#result', label: 'The result' },
  { href: '#stack', label: 'How it works' },
  { href: '#decisions', label: 'Design choices' },
  { href: '#use', label: 'Running it' },
  { href: '#next', label: 'What is next' },
]

const NOTE = ILLUSTRATIVE ? ' These are placeholder numbers until a training run lands.' : ''
const cnn = FAMILIES.find((f) => f.family === 'cnn')
const aug = FAMILIES.find((f) => f.family === 'cnn_aug')

export function App() {
  return (
    <>
      <a className="skip-link" href="#problem">
        Skip to the walkthrough
      </a>

      <div className="masthead">
        <div className="masthead__inner">
          <div className="masthead__mark">
            <b>TurnWise</b> · train upright, test turned
          </div>
          <ul className="masthead__nav">
            <li><a href="#problem">problem</a></li>
            <li><a href="#answer">approach</a></li>
            <li><a href="#result">result</a></li>
            <li><a href="#stack">how</a></li>
          </ul>
        </div>
      </div>

      <main className="page">
        <header className="page-hero">
          <p className="meta">A walkthrough · does a turn-aware net keep the name right?</p>
          <h1>TurnWise</h1>
          <p className="lead">
            Photos of the same mark can sit upright or turned. I only train on upright pictures. Then
            I rotate the test pictures and ask the model to name the mark anyway. A normal image
            network often fails because it latched onto &quot;which way is up&quot; instead of
            &quot;what is this.&quot; I also train a network built so those turns count as the same
            thing. The score I care about is simple: how often is the name still right after the turn?
          </p>
          <p className="intro-detail">
            {PROTOCOL.nClasses} classes, {PROTOCOL.nTrain} train images, {PROTOCOL.nTest} held-out.
            Same width, depth, steps, and seed for every column. This is one capped set of drawn marks
            and one small image network, not a claim about biological vision.
            {ILLUSTRATIVE ? ' The numbers here are placeholders until the training run replaces them.' : ''}
          </p>
          <nav aria-label="On this page">
            <ul className="toc">
              {TOC.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <StoryBeat
          id="problem"
          kicker="The problem"
          title="Upright training is not enough"
          caption={`Left: how the mark looks when I train. Right: the same mark after a 90-degree turn. A normal net has never been asked to read that turned picture.${NOTE}`}
          visual={<ProblemViz />}
        >
          <p>
            Photos of the same mark can sit upright or turned. I only train on upright pictures. Then I
            rotate the test pictures and ask the model to name the mark anyway. A normal image network
            often fails because it latched onto &quot;which way is up.&quot; I also train a network
            built so those turns count as the same thing. The score I care about is: how often is the
            name still right after the turn?
          </p>
          <p>
            Guessing at random over {PROTOCOL.nClasses} classes is about {METRICS.chancePct}%. Getting
            the upright pictures right is only a debug check. The headline is the score after the turn.
          </p>
        </StoryBeat>

        <StoryBeat
          id="answer"
          kicker="The approach"
          title="Same size network, with turns built in"
          caption="Left: a normal image network. Right: the same network with a turn-aware wrap. A third column spins the training pictures instead."
          visual={<ArchChart />}
        >
          <p>
            Every version uses the same small image network ({cnn?.paramsTotal} weights). The
            turn-aware version does not grow that count. At test it tries the picture at several
            angles, lines the mark back up with how it sat in training, and runs the shared network once.
          </p>
          <p>
            I train all three on upright pictures only, except the &quot;spin the data&quot; column,
            which randomly turns training pictures. That is the usual alternative: put the turns in
            the data instead of in the network, on the same budget.
          </p>
          <p>
            Training pictures and test pictures do not overlap. Mixing turned test labels into training
            is a failed leak check.
          </p>
        </StoryBeat>

        <StoryBeat
          id="result"
          kicker="The result"
          title="The turn-aware net keeps the name. The ordinary net does not."
          caption={`Pale bars are upright. Solid bars are after the turn. Chance is the dotted line at ${METRICS.chancePct}%.${NOTE}`}
          visual={<ResultsChart />}
        >
          <p>
            After the turn, the turn-aware net still names the mark {METRICS.successPct}% of the time.
            The ordinary image network falls to {METRICS.cnnRotatedPct}%. Guessing at random is{' '}
            {METRICS.chancePct}%. Upright, both sit at {METRICS.uprightPct}%. That is the point: both
            already knew the classes. Only the turn-aware version treated the turn as the same mark.
          </p>
          <ResultBento />
          <p style={{ marginTop: 'var(--space-5)' }}>
            Spinning the training pictures is the other half of the comparison. Same steps, random
            45-degree turns while training, no turn-aware wrap at test: {aug?.rotatedPct}% after the
            turn. At this budget, putting the turns in the data did not catch the wrap that treats
            eight turn steps as the same thing. Architecture is the other chart, below.
          </p>
          <ArchChart />
        </StoryBeat>

        <section className="story-beat" id="stack">
          <p className="story-kicker">How it works</p>
          <h2>The tools, in plain terms</h2>
          <p className="stack-intro">
            Standard tools, so anyone can clone the repo and rerun the numbers. Each card is one piece:
            what it does, then how it does it.
          </p>
          <StackGrid />
        </section>

        <StoryBeat
          id="decisions"
          kicker="Design choices"
          title="The calls I made"
          caption="What I first reached for, and what I built instead."
          visual={
            <div className="teach-card">
              <h3 className="teach-card__title">First idea, and what I built</h3>
              <table className="choice-table">
                <caption className="sr-only">Design choices</caption>
                <thead>
                  <tr>
                    <th scope="col">First idea</th>
                    <th scope="col">What I built</th>
                  </tr>
                </thead>
                <tbody>
                  {DECISIONS.map((d) => (
                    <tr key={d.first}>
                      <td>{d.first}</td>
                      <td>{d.built}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        >
          <p>
            <strong>I kept one skeleton.</strong> Three unrelated nets would hide whether the turn wrap
            was doing the work. Parameter count is the same; the attach point is the variable.
          </p>
          <p>
            <strong>I report the score after the turn.</strong> A model that memorizes which way is up
            can still print a pretty upright score. Scoring the turned pictures is what separates{' '}
            {FAMILY_LABEL.equivariant} from {FAMILY_LABEL.cnn}.
          </p>
          <p>
            <strong>I kept the losing columns.</strong> Spinning the training pictures at this step
            count did not match the turn-aware wrap. Leaving it on the chart is the comparison, not a
            footnote.
          </p>
        </StoryBeat>

        <section className="story-beat" id="use">
          <p className="story-kicker">Running it</p>
          <h2>Clone it and rerun the bake-off</h2>
          <ol className="stack-list" style={{ maxWidth: 'var(--measure)' }}>
            <li>Python 3.12+ with PyTorch. <code>pip install -e .</code> then <code>python -m pytest tests/test_eval.py -q</code>.</li>
            <li>Train every family: <code>python scripts/run.py</code>. It writes <code>metrics.json</code> and refreshes <code>web/src/metrics.gen.ts</code>.</li>
            <li><code>npm --prefix web install</code> then <code>npm --prefix web run dev</code>. The charts read that file, so the percentages on the page match the CLI.</li>
          </ol>
        </section>

        <section className="story-beat" id="next">
          <p className="story-kicker">What is next</p>
          <h2>Where I would take it, and who it is for</h2>
          <ul className="stack-list" style={{ maxWidth: 'var(--measure)' }}>
            {NEXT.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <ul className="stack-list" style={{ maxWidth: 'var(--measure)' }}>
            {SECTORS.map((s) => (
              <li key={s.name}>
                <strong>{s.name}.</strong> {s.line}
              </li>
            ))}
          </ul>
        </section>

        <footer
          id="close"
          style={{
            borderTop: '1px solid var(--line-rule)',
            paddingTop: 'var(--space-6)',
            marginTop: 'var(--space-6)',
            color: 'var(--fg-low)',
            fontSize: 'var(--fs-sm)',
          }}
        >
          <p style={{ maxWidth: 'var(--measure)' }}>
            This is a portfolio bake-off on a capped set of drawn marks and a small image network. It is
            not a result on ImageNet, and it is not a model of biological vision.
            {ILLUSTRATIVE ? ' The numbers here are placeholders until the training run replaces them.' : ''}
          </p>
        </footer>
      </main>
    </>
  )
}
