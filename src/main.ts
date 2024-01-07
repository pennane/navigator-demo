import './style.css'
import { Graph, Node } from './graph'
import { routeMap } from './routes'

const CELL_SIZE = Math.min(document.body.clientWidth / 12, 60)

const app = document.getElementById('canvas-container')!

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')!

app.appendChild(canvas)

const mapSize = routeMap.getMapSize()

canvas.width = mapSize.width * CELL_SIZE
canvas.height = mapSize.height * CELL_SIZE

let mouseDown = false
let selectedCity: Node | null = null
let moveMode = true

canvas.addEventListener('mousedown', (e) => {
  mouseDown = true
  const left = e.offsetX - canvas.offsetLeft
  const top = e.offsetY - canvas.offsetTop
  const cities = routeMap.getNodes()
  selectedCity =
    cities.find((city) => {
      const pos = city.getPosition()
      return (
        Math.abs(pos.x * CELL_SIZE - left) < CELL_SIZE / 2 &&
        Math.abs(pos.y * CELL_SIZE - top) < CELL_SIZE / 2
      )
    }) || null

  if (selectedCity) {
    handleNodeSelection()
  }
})
canvas.addEventListener('mouseup', () => {
  mouseDown = false
})

canvas.addEventListener('mousemove', (e) => {
  if (!mouseDown) return
  const left = e.offsetX - canvas.offsetLeft
  const top = e.offsetY - canvas.offsetTop

  if (moveMode) {
    selectedCity?.setPosition({ x: left / CELL_SIZE, y: top / CELL_SIZE })
  }

  handleNodeSelection()

  draw()
})

const selectedNodeElement = document.querySelector('#selected-node')!

const handleNodeSelection = () => {
  if (!selectedCity) return
  const cityName = selectedCity.getName()
  while (selectedNodeElement.firstChild) {
    selectedNodeElement.removeChild(selectedNodeElement.firstChild)
  }
  const container = document.createElement('div')
  const heading = document.createElement('h4')
  heading.textContent = cityName
  container.appendChild(heading)
  const positionText = document.createElement('pre')
  positionText.textContent = JSON.stringify(selectedCity.getPosition())
  container.appendChild(positionText)

  const otherCities = routeMap
    .getNodes()
    .filter((n) => n.getName() !== cityName)
  for (const city of otherCities) {
    const div = document.createElement('div')
    div.classList.add('connection')
    const span = document.createElement('span')
    span.textContent = city.getName()
    const button = document.createElement('button')
    const connection = city
      .getEdges()
      .find((edge) => edge.getTo().getName() === cityName)
    button.textContent = connection ? 'disconnect' : 'connect'

    button.addEventListener('click', () => {
      connection
        ? selectedCity?.disconnectNode(city)
        : selectedCity?.connectNode(city, { speedLimit: 80 })
      handleNodeSelection()
      draw()
    })

    div.appendChild(span)
    div.appendChild(button)

    if (connection) {
      const speedLimitText = document.createElement('span')
      speedLimitText.textContent = 'speedlimit'
      const speedLimit = document.createElement('input')
      speedLimit.type = 'number'
      speedLimit.value = String(connection.getOptions().speedLimit || 80)

      speedLimit.addEventListener('change', (e) => {
        const value = parseInt((e.target as any).value)
        if (isNaN(value)) return
        connection?.setSpeedLimit(value)
        selectedCity
          ?.getEdges()
          .find((e) => e.getTo().getName() === connection.getFrom().getName())
          ?.setSpeedLimit(value)
        draw()
      })
      div.appendChild(speedLimitText)
      div.appendChild(speedLimit)
    }

    container.appendChild(div)
  }
  selectedNodeElement.appendChild(container)
}

const draw = () => {
  const cities = routeMap.getNodes()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'black'
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 3
  for (let x = 0; x < mapSize.width + 1; x++) {
    ctx.beginPath()
    ctx.moveTo(x * CELL_SIZE, 0)
    ctx.lineTo(x * CELL_SIZE, canvas.height)
    ctx.stroke()
  }

  for (let y = 0; y < mapSize.height + 1; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * CELL_SIZE)
    ctx.lineTo(canvas.width, y * CELL_SIZE)
    ctx.stroke()
  }

  for (const city of cities) {
    for (const edge of city.getEdges()) {
      const from = edge.getFrom().getPosition()
      const to = edge.getTo().getPosition()

      ctx.strokeStyle = 'red'
      ctx.beginPath()
      ctx.moveTo(from.x * CELL_SIZE, from.y * CELL_SIZE)
      ctx.lineTo(to.x * CELL_SIZE, to.y * CELL_SIZE)
      ctx.stroke()
    }
  }

  for (const city of cities) {
    const position = city.getPosition()
    const x = position.x * CELL_SIZE
    const y = position.y * CELL_SIZE

    ctx.fillStyle = 'blue'
    ctx.beginPath()
    ctx.rect(x - CELL_SIZE / 2, y - CELL_SIZE / 2, CELL_SIZE, CELL_SIZE)
    ctx.fill()
  }

  const start = cities[0]
  const end = cities[cities.length - 1]
  const path = Graph.findPath(start, end)

  let old: null | Node = null

  for (const node of path || []) {
    if (old) {
      ctx.strokeStyle = 'green'
      ctx.lineWidth = 10
      ctx.beginPath()
      const fromX = old.getPosition().x * CELL_SIZE
      const fromY = old.getPosition().y * CELL_SIZE
      const toX = node.getPosition().x * CELL_SIZE
      const toY = node.getPosition().y * CELL_SIZE
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.stroke()
    }
    old = node
  }

  for (const city of cities) {
    const position = city.getPosition()
    const x = position.x * CELL_SIZE
    const y = position.y * CELL_SIZE
    ctx.fillStyle = 'white'
    ctx.font = '15px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(city.getName(), x, y + CELL_SIZE / 2)
  }
}

draw()

const exportButton = document.querySelector<HTMLButtonElement>('#export')!
const outputTextarea = document.querySelector('#output')!

exportButton.addEventListener('click', () => {
  const cities = routeMap.getNodes()
  let out = ''
  const cityIds = new Map<Node, number>()
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i]
    const position = city.getPosition()
    out += `const city${i} = new Node({x:${position.x}, y:${
      position.y
    }}, ${JSON.stringify(city.getOptions())})\n`
    cityIds.set(city, i)
  }
  out += '\n'
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i]
    for (const edge of city.getEdges()) {
      out += `city${i}.addEdge(city${cityIds.get(
        edge.getTo()
      )}, ${JSON.stringify(edge.getOptions())})\n`
    }
  }
  out += '\n'
  out +=
    'const cities = [' +
    [...cityIds.values()].map((id) => `city${id}`).join(', ') +
    ']'
  outputTextarea.textContent = out
})

const modeToggle = document.querySelector<HTMLInputElement>('#mode-toggle')!

modeToggle.addEventListener('click', (e) => {
  moveMode = !!(e.target as any).checked
})

const newNodeXInput = document.querySelector<HTMLInputElement>('#new-node-x')!
const newNodeYInput = document.querySelector<HTMLInputElement>('#new-node-y')!
const newNodeNameInput =
  document.querySelector<HTMLInputElement>('#new-node-name')!
const newNodeTrafficInput =
  document.querySelector<HTMLInputElement>('#new-node-traffic')!
const newNodeAddButton =
  document.querySelector<HTMLButtonElement>('#new-node-add')!

newNodeAddButton.addEventListener('click', () => {
  const name = newNodeNameInput.value
  const x = parseFloat(newNodeXInput.value ?? 0)
  const y = parseFloat(newNodeYInput.value ?? 0)
  const trafficLights = newNodeTrafficInput.checked
  const success = routeMap.addNode(new Node({ x, y }, { name, trafficLights }))
  if (!success) {
    return
  }

  newNodeXInput.value = String(0)
  newNodeYInput.value = String(0)
  newNodeNameInput.value = ''
})
