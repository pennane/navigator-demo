import { Graph, Node } from './graph'

const city0 = new Node({ x: 0.9, y: 0.6625 }, { name: 'Oulu' })
const city1 = new Node(
  { x: 3.9857142857142858, y: 7.557142857142857 },
  { name: 'Helsinki' }
)
const city2 = new Node(
  { x: 4.914285714285715, y: 4.271428571428571 },
  { name: 'Pornainen' }
)
const city3 = new Node(
  { x: 2.657142857142857, y: 6.142857142857143 },
  { name: 'Espoo' }
)
const city4 = new Node(
  { x: 3.3142857142857145, y: 2.9 },
  { name: 'Lahti', trafficLights: false }
)
const city5 = new Node(
  { x: 0.675, y: 6.5375 },
  { name: 'Turku', trafficLights: false }
)
const city6 = new Node(
  { x: 7.3428571428571425, y: 6.6 },
  { name: 'Kotka', trafficLights: false }
)
const city7 = new Node(
  { x: 2.585714285714286, y: 4.757142857142857 },
  { name: 'Vantaa', trafficLights: false }
)
const city8 = new Node(
  { x: 8.128571428571428, y: 3.057142857142857 },
  { name: 'Joensuu', trafficLights: false }
)

city0.addEdge(city4, { speedLimit: 120 })
city0.addEdge(city5, { speedLimit: 120 })
city1.addEdge(city3, { speedLimit: 100 })
city1.addEdge(city5, { speedLimit: 130 })
city1.addEdge(city4, { speedLimit: 100 })
city1.addEdge(city2, { speedLimit: 80 })
city1.addEdge(city8, { speedLimit: 120 })
city1.addEdge(city6, { speedLimit: 120 })
city2.addEdge(city4, { speedLimit: 80 })
city2.addEdge(city1, { speedLimit: 80 })
city2.addEdge(city7, { speedLimit: 80 })
city3.addEdge(city1, { speedLimit: 100 })
city3.addEdge(city7, { speedLimit: 80 })
city4.addEdge(city0, { speedLimit: 120 })
city4.addEdge(city2, { speedLimit: 80 })
city4.addEdge(city1, { speedLimit: 100 })
city5.addEdge(city0, { speedLimit: 120 })
city5.addEdge(city1, { speedLimit: 130 })
city6.addEdge(city8, { speedLimit: 120 })
city6.addEdge(city1, { speedLimit: 120 })
city7.addEdge(city3, { speedLimit: 80 })
city7.addEdge(city2, { speedLimit: 80 })
city8.addEdge(city1, { speedLimit: 120 })
city8.addEdge(city6, { speedLimit: 120 })

const cities = [city0, city1, city2, city3, city4, city5, city6, city7, city8]

export const routeMap = new Graph(cities)
