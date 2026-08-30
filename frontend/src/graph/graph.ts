export type Graph = {
  n: number
  neighbors: ReadonlyArray<ReadonlyArray<number>>
}

export type GraphStats = {
  edgeCount: number
  componentCount: number
  largestComponentSize: number
  largestComponentFraction: number
  averageDegree: number
}

type Rng = () => number

function validateN(n: number): void {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`n must be a non-negative integer, got ${n}`)
  }
}

function validateP(p: number): void {
  if (!Number.isFinite(p) || p < 0 || p > 1) {
    throw new RangeError(`p must be a finite number in [0, 1], got ${p}`)
  }
}

function graphFromEdges(n: number, edges: ReadonlyArray<readonly [number, number]>): Graph {
  validateN(n)

  const neighbors: number[][] = Array.from({ length: n }, () => [])

  for (const [u, v] of edges) {
    if (!Number.isInteger(u) || u < 0 || u >= n) {
      throw new RangeError(`edge endpoint u must be an integer in [0, ${n - 1}], got ${u}`)
    }
    if (!Number.isInteger(v) || v < 0 || v >= n) {
      throw new RangeError(`edge endpoint v must be an integer in [0, ${n - 1}], got ${v}`)
    }
    if (u === v) {
      throw new RangeError(`self-loops are not allowed: (${u}, ${v})`)
    }

    neighbors[u].push(v)
    neighbors[v].push(u)
  }

  return { n, neighbors }
}

export function generateErdosRenyi(n: number, p: number, rng: Rng = Math.random): Graph {
  validateN(n)
  validateP(p)

  const edges: Array<[number, number]> = []

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (rng() < p) {
        edges.push([i, j])
      }
    }
  }

  return graphFromEdges(n, edges)
}

export function connectedComponents(graph: Graph): number[][] {
  const visited = new Array<boolean>(graph.n).fill(false)
  const components: number[][] = []

  for (let start = 0; start < graph.n; start++) {
    if (visited[start]) {
      continue
    }

    const component: number[] = []
    const queue = [start]
    visited[start] = true

    while (queue.length > 0) {
      const vertex = queue.shift()!
      component.push(vertex)

      for (const neighbor of graph.neighbors[vertex]) {
        if (!visited[neighbor]) {
          visited[neighbor] = true
          queue.push(neighbor)
        }
      }
    }

    components.push(component)
  }

  return components
}

export function graphStats(graph: Graph): GraphStats {
  const edgeCount = graph.neighbors.reduce((sum, adj) => sum + adj.length, 0) / 2
  const components = connectedComponents(graph)
  const largestComponentSize =
    components.length === 0 ? 0 : Math.max(...components.map((c) => c.length))

  if (graph.n === 0) {
    return {
      edgeCount,
      componentCount: components.length,
      largestComponentSize,
      largestComponentFraction: 0,
      averageDegree: 0,
    }
  }

  return {
    edgeCount,
    componentCount: components.length,
    largestComponentSize,
    largestComponentFraction: largestComponentSize / graph.n,
    averageDegree: (2 * edgeCount) / graph.n,
  }
}
