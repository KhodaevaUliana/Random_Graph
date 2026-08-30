import { useState } from 'react'
import './App.css'
import { generateErdosRenyi, graphStats, type GraphStats } from './graph/graph'

function parseGraphParams(
  nInput: string,
  pInput: string,
): { n: number; p: number } | { error: string } {
  const nTrimmed = nInput.trim()
  const pTrimmed = pInput.trim()

  if (nTrimmed === '') {
    return { error: 'n is required' }
  }
  if (pTrimmed === '') {
    return { error: 'p is required' }
  }

  const n = Number(nTrimmed)
  const p = Number(pTrimmed)

  if (!Number.isFinite(n)) {
    return { error: 'n must be a number' }
  }
  if (!Number.isFinite(p)) {
    return { error: 'p must be a number' }
  }
  if (!Number.isInteger(n) || n < 0) {
    return { error: 'n must be a non-negative integer' }
  }
  if (p < 0 || p > 1) {
    return { error: 'p must be between 0 and 1' }
  }

  return { n, p }
}

function App() {
  const [nInput, setNInput] = useState('10')
  const [pInput, setPInput] = useState('0.1')
  const [stats, setStats] = useState<GraphStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = () => {
    const parsed = parseGraphParams(nInput, pInput)
    if ('error' in parsed) {
      setError(parsed.error)
      return
    }

    setError(null)

    try {
      const graph = generateErdosRenyi(parsed.n, parsed.p)
      setStats(graphStats(graph))
    } catch (e) {
      setError(e instanceof RangeError ? e.message : 'Failed to generate graph')
    }
  }

  return (
    <main>
      <h1>Random Graph Lab</h1>

      <section className="form-section" aria-labelledby="graph-params-heading">
        <h2 id="graph-params-heading">G(n, p)</h2>
        <form
          className="form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            handleGenerate()
          }}
        >
          <label htmlFor="graph-n">
            n
            <input
              id="graph-n"
              type="number"
              min={0}
              step={1}
              value={nInput}
              onChange={(event) => setNInput(event.target.value)}
            />
          </label>
          <label htmlFor="graph-p">
            p
            <input
              id="graph-p"
              type="number"
              min={0}
              max={1}
              step="any"
              value={pInput}
              onChange={(event) => setPInput(event.target.value)}
            />
          </label>
          <button type="submit">Generate</button>
        </form>
        {error !== null && (
          <p className="error" role="alert">{error}</p>
        )}
      </section>

      <section className="stats-section" aria-labelledby="results-heading">
        <h2 id="results-heading">Results</h2>
        <dl className="stats">
          <dt>Edges</dt>
          <dd>{stats !== null ? stats.edgeCount : '—'}</dd>
          <dt>Connected components</dt>
          <dd>{stats !== null ? stats.componentCount : '—'}</dd>
          <dt>Largest component size</dt>
          <dd>{stats !== null ? stats.largestComponentSize : '—'}</dd>
          <dt>Largest component fraction</dt>
          <dd>
            {stats !== null ? stats.largestComponentFraction.toFixed(3) : '—'}
          </dd>
          <dt>Average degree</dt>
          <dd>{stats !== null ? stats.averageDegree.toFixed(3) : '—'}</dd>
        </dl>
      </section>
    </main>
  )
}

export default App
