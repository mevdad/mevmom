import http from "http"
import { WebSocketServer } from 'ws'
import httpProxy from "http-proxy"
import express from "express"
import { handler } from "./build/handler.js"
import compression from "compression"

const HOST = "194.61.52.176", PORT = 3000, WSPORT = 8084, DOMAIN = "localhost"

const proxy = httpProxy.createProxyServer({ localAddress: HOST, ws: true })

let opt
try {
  opt = {
      // @ts-ignore
      hostname: DOMAIN,
      origins: [DOMAIN],
      // key: fs.readFileSync(SSL_KEY_PATH),
      // cert: fs.readFileSync(SSL_CERT_PATH)
  }
} catch (error) {
  console.error('Error reading SSL certificates:', error)
  process.exit(1)
}

const app = express()
app.use(compression())
app.use(handler)
app.get('/ws', function(req, res) {
    console.log("proxying GET request", req.url)
    proxy.web(req, res, { target: `http://${HOST}:${WSPORT}`, ws: true })
})
app.post('/ws', function(req, res) {
    console.log("proxying POST request", req.url)
    proxy.web(req, res, { target: `http://${HOST}:${WSPORT}`, ws: true })
})

const server = http.createServer(opt, app)

server.on('upgrade', function (req, socket, head) {
    console.log("proxying upgrade request", req.url)
    proxy.ws(req, socket, head, { target: `http://${HOST}:${WSPORT}` })
})

server.listen(PORT, () => {
    console.log(`HTTPS server started on ${DOMAIN}:${PORT}`)
})

// Add error handling for the proxy
proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err)
    // @ts-ignore
    if (res && res.writeHead) {
      // @ts-ignore
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Proxy error occurred.')
    } else if (req && req.socket) {
      req.socket.end('HTTP/1.1 500 Internal Server Error\r\n\r\n')
    }
})

// @ts-ignore
const wserver = http.createServer({ hostname: HOST, port: WSPORT }, (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Hello, world!\n')
})

const wss = new WebSocketServer({ server: wserver })

const clients = {}

wss.on('connection', (ws) => {
    console.log('Client connected')
    ws.send(JSON.stringify({"message": "Welcome to the WebSocket server!"}))
    
    ws.on('message', (message) => {
      const data = JSON.parse(message.toString())
      console.log('Received message:', data)
      // @ts-ignore
      if(data.userId && !clients[data.userId]) clients[data.userId] = ws
      if(data.type){
          if(data.type === 'new_task'){
              ws.send(JSON.stringify({error: 'New task', message: data}))
          }
      }
    })
    
    ws.on('close', () => {
        console.log('Client disconnected')
        //find key by value
        // @ts-ignore
        const index = Object.keys(clients).find(key => clients[key] === ws)
        // @ts-ignore
        if(index) clients[index] = null
    })
})

wserver.listen(WSPORT, () => {
    console.log(`WebSockets server started on ${HOST}:${WSPORT}`)
})