/* eslint-disable @typescript-eslint/no-unused-vars */
export type Position = {
  x: number
  y: number
}

type EdgeOptions = {
  speedLimit: number
}

export class Node {
  private edges: Edge[]
  constructor(
    private position: Position,
    private options: { trafficLights?: boolean; name: string }
  ) {
    this.edges = []
  }

  addEdge(to: Node, options: { speedLimit: number }): void {
    const newEdge = new Edge(this, to, options)
    this.edges.push(newEdge)
  }

  removeEdge(to: Node) {
    this.edges = this.edges.filter(
      (edge) => edge.getTo().getName() !== to.getName()
    )
  }

  connectNode(node: Node, options: EdgeOptions & { unidirectional?: boolean }) {
    this.addEdge(node, options)
    if (!options.unidirectional) {
      node.addEdge(this, options)
    }
  }

  disconnectNode(node: Node) {
    this.removeEdge(node)
    node.removeEdge(this)
  }

  getEdges(): Edge[] {
    return this.edges
  }

  getPosition(): Position {
    return this.position
  }

  getName() {
    return this.options.name
  }

  setPosition(position: Position) {
    this.position = position
  }

  getEuclideanDistance(node: Node): number {
    const thisPosition = this.getPosition()
    const otherPosition = node.getPosition()
    const dist = Math.hypot(
      thisPosition.x - otherPosition.x,
      thisPosition.y - otherPosition.y
    )

    return dist
  }

  getOptions() {
    return this.options || {}
  }
}

export class Edge {
  constructor(
    private from: Node,
    private to: Node,
    private options: { speedLimit: number }
  ) {}

  getFrom(): Node {
    return this.from
  }
  getTo(): Node {
    return this.to
  }

  getOptions() {
    return this.options
  }

  calculateWeight(): number {
    const euclideanDistance = this.getFrom().getEuclideanDistance(this.getTo())

    const weight =
      euclideanDistance / this.options.speedLimit +
      (this.getTo().getOptions().trafficLights ? 20 : 0)

    return weight
  }

  setSpeedLimit(n: number) {
    this.options.speedLimit = n
  }
}

export class Graph {
  constructor(private nodes: Node[]) {}

  addNode(node: Node) {
    if (!node.getName()) return false
    if (this.nodes.some((n) => n.getName() === node.getName())) return false
    this.nodes.push(node)
    return true
  }

  getMapCorners() {
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const city of this.nodes.values()) {
      const { x, y } = city.getPosition()
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }
    return {
      start: { x: minX, y: minY },
      end: { x: maxX, y: maxY }
    }
  }

  getMapSize() {
    const { end } = this.getMapCorners()
    return {
      width: Math.ceil(end.x + 1),
      height: Math.ceil(end.y + 1)
    }
  }

  getNodes(): Node[] {
    return this.nodes
  }

  private static reconstructPath(
    cameFrom: Map<Node, Node>,
    current: Node
  ): Node[] {
    let totalPath: Node[] = [current]
    while (cameFrom.has(current)) {
      current = cameFrom.get(current)!
      totalPath.unshift(current)
    }
    return totalPath
  }

  static findPath(start: Node, end: Node): Node[] | null {
    let closedSet: Set<Node> = new Set()
    let openSet: Set<Node> = new Set([start])
    let cameFrom: Map<Node, Node> = new Map()
    let gScore: Map<Node, number> = new Map()

    gScore.set(start, 0)

    let fScore: Map<Node, number> = new Map()
    fScore.set(start, start.getEuclideanDistance(end))

    while (openSet.size > 0) {
      let current: Node = [...openSet].reduce((a, b) =>
        fScore.get(a)! < fScore.get(b)! ? a : b
      )

      if (current === end) {
        return Graph.reconstructPath(cameFrom, current)
      }

      openSet.delete(current)
      closedSet.add(current)

      for (let edge of current.getEdges()) {
        let neighbor: Node = edge.getTo()
        if (closedSet.has(neighbor)) {
          continue
        }

        let tentativeGScore = gScore.get(current)! + edge.calculateWeight()

        if (!openSet.has(neighbor)) {
          openSet.add(neighbor)
        } else if (tentativeGScore >= gScore.get(neighbor)!) {
          continue
        }

        cameFrom.set(neighbor, current)
        gScore.set(neighbor, tentativeGScore)
        fScore.set(
          neighbor,
          tentativeGScore + neighbor.getEuclideanDistance(end)
        )
      }
    }

    return null
  }
}
