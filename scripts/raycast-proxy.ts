import WebSocket, { WebSocketServer } from "ws"

type RawData = Parameters<WebSocket["send"]>[0]

type CliFlags = {
  listenPort?: number
  listenHost?: string
  targetHost?: string
  forwardOrigin?: string
}

const DEFAULT_LISTEN_PORT = 8787
const DEFAULT_LISTEN_HOST = "127.0.0.1"
const DEFAULT_TARGET_HOST = "127.0.0.1"
const DEFAULT_FORWARD_ORIGIN = "chrome-extension://raycast-proxy"

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

const server = new WebSocketServer({
  host: listenHost,
  port: listenPort,
  perMessageDeflate: false
})

const formatTargetUrl = (port: number) => `ws://${targetHost}:${port}`

const parsePathPort = (path?: string | null) => {
  if (!path) return null
  const normalized = path.startsWith("/") ? path.slice(1) : path
  const port = Number.parseInt(normalized, 10)
  return Number.isInteger(port) ? port : null
}

server.on("connection", (clientSocket, request) => {
  const targetPort = parsePathPort(request.url)
  if (!targetPort) {
    clientSocket.close(1008, "Missing Raycast target port")
    return
  }

  const targetUrl = formatTargetUrl(targetPort)
  console.log(
    `[proxy] ${request.socket.remoteAddress ?? "client"} -> ${targetUrl} (${request.url})`
  )

  const pendingClientMessages: RawData[] = []
  let upstreamOpen = false

  const upstream = new WebSocket(targetUrl, {
    headers: {
      Origin: forwardOrigin
    },
    perMessageDeflate: false
  })

  const toReasonString = (reason?: Buffer | ArrayBuffer | ArrayBufferView) => {
    if (!reason) return ""
    if (typeof (reason as unknown as string) === "string") {
      return reason as unknown as string
    }
    if (reason instanceof ArrayBuffer) {
      return Buffer.from(reason).toString()
    }
    if (ArrayBuffer.isView(reason)) {
      return Buffer.from(reason.buffer).toString()
    }
    return reason.toString()
  }

  const closeBoth = (code?: number, reason?: Buffer | ArrayBuffer | ArrayBufferView | string) => {
    const textReason = typeof reason === "string" ? reason : toReasonString(reason)
    if (clientSocket.readyState === WebSocket.OPEN || clientSocket.readyState === WebSocket.CONNECTING) {
      clientSocket.close(code ?? 1011, textReason)
    }
    if (upstream.readyState === WebSocket.OPEN || upstream.readyState === WebSocket.CONNECTING) {
      upstream.close(code, textReason)
    }
  }

  clientSocket.on("message", (data) => {
    if (upstream.readyState === WebSocket.OPEN && upstreamOpen) {
      upstream.send(data)
    } else {
      pendingClientMessages.push(data)
    }
  })

  upstream.on("message", (data) => {
    if (clientSocket.readyState === WebSocket.OPEN) {
      clientSocket.send(data)
    }
  })

  clientSocket.on("close", () => upstream.close())
  clientSocket.on("error", (error) => {
    console.error("[proxy] client error", error)
    upstream.close(1011, "Client error")
  })

  upstream.on("open", () => {
    upstreamOpen = true
    console.log(`[proxy] connected to Raycast on ${targetUrl}`)
    if (pendingClientMessages.length) {
      const backlog = pendingClientMessages.splice(0)
      for (const payload of backlog) {
        if (upstream.readyState !== WebSocket.OPEN) break
        upstream.send(payload)
      }
    }
  })

  upstream.on("close", (code, reason) => {
    if (clientSocket.readyState === WebSocket.OPEN) {
      clientSocket.close(code, toReasonString(reason))
    }
  })

  upstream.on("error", (error) => {
    console.error("[proxy] upstream error", error)
    closeBoth(1011, "Upstream error")
  })
})

server.on("listening", () => {
  console.log(`[proxy] listening on ws://${listenHost}:${listenPort}/<7261-7265>`)
  console.log(`[proxy] forwarding to ${targetHost} with Origin ${forwardOrigin}`)
})

server.on("error", (error) => {
  console.error("[proxy] server error", error)
})
