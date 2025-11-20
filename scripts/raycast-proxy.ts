/// <reference types="bun-types" />

type ClientMessage = string | ArrayBuffer | Uint8Array

type CliFlags = {
  listenPort?: number
  listenHost?: string
  targetHost?: string
  forwardOrigin?: string
}

type ProxySocketData = {
  targetPort: number
  targetUrl: string
  backlog: ClientMessage[]
  upstream?: WebSocket
  upstreamOpen: boolean
  clientAddress?: string
}

const DEFAULT_LISTEN_PORT = 8787
const DEFAULT_LISTEN_HOST = "127.0.0.1"
const DEFAULT_TARGET_HOST = "127.0.0.1"
const DEFAULT_FORWARD_ORIGIN = "chrome-extension://raycast-proxy"
const BACKLOG_LIMIT = Number(process.env.RAYCAST_PROXY_BACKLOG || 256)

const parseArgs = (argv: string[]): CliFlags => {
  const flags: CliFlags = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith("--")) continue
    const key = arg.slice(2)
    const value = argv[i + 1]
    if (!value || value.startsWith("--")) continue
    i++
    switch (key) {
      case "listen-port":
        flags.listenPort = Number.parseInt(value, 10)
        break
      case "listen-host":
        flags.listenHost = value
        break
      case "target-host":
        flags.targetHost = value
        break
      case "forward-origin":
        flags.forwardOrigin = value
        break
      default:
        break
    }
  }
  return flags
}

const cliFlags = parseArgs(process.argv.slice(2))

const listenPort = Number(
  process.env.RAYCAST_PROXY_PORT ?? cliFlags.listenPort ?? DEFAULT_LISTEN_PORT
)
const listenHost =
  process.env.RAYCAST_PROXY_HOST ?? cliFlags.listenHost ?? DEFAULT_LISTEN_HOST
const targetHost =
  process.env.RAYCAST_PROXY_TARGET_HOST ?? cliFlags.targetHost ?? DEFAULT_TARGET_HOST
const forwardOrigin =
  process.env.RAYCAST_PROXY_FORWARD_ORIGIN ?? cliFlags.forwardOrigin ?? DEFAULT_FORWARD_ORIGIN

if (!Number.isFinite(listenPort)) {
  throw new Error("Invalid listen port")
}

const formatTargetUrl = (port: number) => `ws://${targetHost}:${port}`

const parsePathPort = (path: string) => {
  const normalized = path.startsWith("/") ? path.slice(1) : path
  if (!normalized) return null
  const port = Number.parseInt(normalized, 10)
  return Number.isInteger(port) ? port : null
}

const copyMessage = (data: ClientMessage): ClientMessage => {
  if (typeof data === "string") return data
  if (data instanceof ArrayBuffer) return data.slice(0)
  return data.slice(0)
}

const server = Bun.serve<ProxySocketData>({
  hostname: listenHost,
  port: listenPort,
  fetch(req, server) {
    const url = new URL(req.url)
    const targetPort = parsePathPort(url.pathname)
    if (!targetPort) {
      return new Response("Missing Raycast target port", { status: 400 })
    }
    const data: ProxySocketData = {
      targetPort,
      targetUrl: formatTargetUrl(targetPort),
      backlog: [],
      upstreamOpen: false,
      clientAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? undefined
    }
    const upgraded = server.upgrade(req, { data })
    if (!upgraded) {
      return new Response("WebSocket upgrade failed", { status: 500 })
    }
    return undefined
  },
  websocket: {
    open(ws) {
      const { targetUrl } = ws.data
      const client = ws.remoteAddress || ws.data.clientAddress || "client"
      console.log(`[proxy] ${client} -> ${targetUrl}`)
      const upstream = new WebSocket(targetUrl, {
        headers: {
          Origin: forwardOrigin
        }
      })
      ws.data.upstream = upstream

      upstream.addEventListener("open", () => {
        ws.data.upstreamOpen = true
        if (ws.data.backlog.length > 0) {
          const backlog = ws.data.backlog.splice(0)
          backlog.forEach((payload) => upstream.send(payload))
        }
        console.log(`[proxy] connected to Raycast on ${targetUrl}`)
      })

      upstream.addEventListener("message", (event) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(event.data as ClientMessage)
        }
      })

      upstream.addEventListener("close", (event) => {
        if (ws.readyState === ws.OPEN) {
          ws.close(event.code, event.reason ?? "Upstream closed")
        }
      })

      upstream.addEventListener("error", (event) => {
        console.error("[proxy] upstream error", event.message ?? event.error ?? event)
        if (ws.readyState === ws.OPEN) {
          ws.close(1011, "Upstream error")
        }
      })
    },
    message(ws, message) {
      const { upstream, upstreamOpen, backlog } = ws.data
      if (upstream && upstream.readyState === WebSocket.OPEN && upstreamOpen) {
        upstream.send(message)
      } else if (backlog.length < BACKLOG_LIMIT) {
        backlog.push(copyMessage(message))
      } else {
        console.warn("[proxy] backlog full, closing connection")
        ws.close(1013, "Proxy backlog full")
      }
    },
    close(ws, code, reason) {
      const upstream = ws.data.upstream
      if (upstream && (upstream.readyState === WebSocket.OPEN || upstream.readyState === WebSocket.CONNECTING)) {
        upstream.close(code, reason)
      }
      ws.data.backlog.length = 0
    },
    error(ws, error) {
      console.error("[proxy] client error", error)
      const upstream = ws.data.upstream
      if (upstream && upstream.readyState === WebSocket.OPEN) {
        upstream.close(1011, "Client error")
      }
    }
  }
})

console.log(`[proxy] listening on ws://${listenHost}:${listenPort}/<7261-7265>`)
console.log(`[proxy] forwarding to ${targetHost} with Origin ${forwardOrigin}`)
