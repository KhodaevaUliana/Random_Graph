import {
  connectedComponents,
  type Graph,
  generateErdosRenyi,
  graphStats,
} from './graph'

function graphFromAdjacencyLists(n: number, neighbors: number[][]): Graph {
  return { n, neighbors }
}

describe('generateErdosRenyi', () => {
  it('rejects invalid n', () => {
    expect(() => generateErdosRenyi(-1, 0.5)).toThrow(RangeError)
    expect(() => generateErdosRenyi(1.5, 0.5)).toThrow(RangeError)
  })

  it('rejects invalid p', () => {
    expect(() => generateErdosRenyi(3, -0.1)).toThrow(RangeError)
    expect(() => generateErdosRenyi(3, 1.1)).toThrow(RangeError)
    expect(() => generateErdosRenyi(3, Number.NaN)).toThrow(RangeError)
  })

  it('produces an empty graph when p = 0', () => {
    const graph = generateErdosRenyi(4, 0)

    expect(graph.n).toBe(4)
    expect(graph.neighbors).toEqual([[], [], [], []])
    expect(graphStats(graph)).toMatchObject({
      edgeCount: 0,
      componentCount: 4,
      largestComponentSize: 1,
      largestComponentFraction: 0.25,
      averageDegree: 0,
    })
  })

  it('produces a complete graph when p = 1', () => {
    const graph = generateErdosRenyi(4, 1)

    expect(graph.neighbors).toEqual([
      [1, 2, 3],
      [0, 2, 3],
      [0, 1, 3],
      [0, 1, 2],
    ])
    expect(graphStats(graph)).toMatchObject({
      edgeCount: 6,
      componentCount: 1,
      largestComponentSize: 4,
      largestComponentFraction: 1,
      averageDegree: 3,
    })
  })

  it('handles n = 0', () => {
    const graph = generateErdosRenyi(0, 0.5)

    expect(graph).toEqual({ n: 0, neighbors: [] })
    expect(graphStats(graph)).toEqual({
      edgeCount: 0,
      componentCount: 0,
      largestComponentSize: 0,
      largestComponentFraction: 0,
      averageDegree: 0,
    })
  })

  it('handles n = 1', () => {
    const graph = generateErdosRenyi(1, 0.5)

    expect(graph).toEqual({ n: 1, neighbors: [[]] })
    expect(graphStats(graph)).toMatchObject({
      edgeCount: 0,
      componentCount: 1,
      largestComponentSize: 1,
      largestComponentFraction: 1,
      averageDegree: 0,
    })
  })

  it('uses injected rng to include edges independently for each unordered pair', () => {
    const rngValues = [0.1, 0.9, 0.2]
    let callCount = 0
    const rng = () => rngValues[callCount++]

    const graph = generateErdosRenyi(3, 0.5, rng)

    expect(callCount).toBe(3)
    expect(graph.neighbors).toEqual([
      [1],
      [0, 2],
      [1],
    ])
  })

  it('stores undirected edges without self-loops or duplicate neighbors', () => {
    const graph = generateErdosRenyi(5, 1)

    for (let u = 0; u < graph.n; u++) {
      expect(graph.neighbors[u]).not.toContain(u)

      const uniqueNeighbors = new Set(graph.neighbors[u])
      expect(uniqueNeighbors.size).toBe(graph.neighbors[u].length)

      for (const v of graph.neighbors[u]) {
        expect(graph.neighbors[v]).toContain(u)
      }
    }
  })
})

describe('connectedComponents', () => {
  it('returns one component per isolated vertex', () => {
    const graph = graphFromAdjacencyLists(3, [[], [], []])
    const components = connectedComponents(graph)

    expect(components).toHaveLength(3)
    expect(components.map((c) => [...c].sort())).toEqual([[0], [1], [2]])
  })

  it('finds multiple components', () => {
    const graph = graphFromAdjacencyLists(4, [[1], [0], [3], [2]])
    const components = connectedComponents(graph)

    expect(components.map((c) => [...c].sort())).toEqual([
      [0, 1],
      [2, 3],
    ])
  })

  it('finds a single connected component', () => {
    const graph = graphFromAdjacencyLists(3, [[1], [0, 2], [1]])
    const components = connectedComponents(graph)

    expect(components).toHaveLength(1)
    expect([...components[0]].sort()).toEqual([0, 1, 2])
  })

  it('returns an empty list for n = 0', () => {
    const graph = graphFromAdjacencyLists(0, [])
    expect(connectedComponents(graph)).toEqual([])
  })
})

describe('graphStats', () => {
  it('computes stats for a graph with a path and an isolate', () => {
    const graph = graphFromAdjacencyLists(4, [[1], [0, 2], [1], []])

    expect(graphStats(graph)).toEqual({
      edgeCount: 2,
      componentCount: 2,
      largestComponentSize: 3,
      largestComponentFraction: 0.75,
      averageDegree: 1,
    })
  })

  it('handles tied largest component sizes', () => {
    const graph = graphFromAdjacencyLists(4, [[1], [0], [3], [2]])

    expect(graphStats(graph)).toMatchObject({
      edgeCount: 2,
      componentCount: 2,
      largestComponentSize: 2,
      largestComponentFraction: 0.5,
      averageDegree: 1,
    })
  })
})
