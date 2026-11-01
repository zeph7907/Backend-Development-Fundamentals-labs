const express = require('express')
const app = express()
const datefns = require('date-fns')

const port = process.env.PORT || 3000

// 1. Home Route: GET /
app.get('/', (request, response) => {
  response.send('Hello World, welcome to Ayush server')
})

// 2. About Route: GET /about
app.get('/about', (request, response) => {
  response.send({ name: 'Ayush Aditya', regNo: '252U1R3013', section: 'CSE-DS 1A / 205' })
})

// 3. Time Route: GET /time
app.get('/time', (request, response) => {
  const date = new Date()
  response.send(`${date}`)
})

// 4. Unknown Route: 404 Handler
app.use((request, response) => {
  response.status(404).send('404 - Page not found')
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`)
})
