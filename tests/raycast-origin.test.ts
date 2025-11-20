import { afterEach, describe, it } from "node:test"
import assert from "node:assert/strict"
import { connect, disconnect, RaycastFlavour, sendRequest } from "../src/lib/raycast"

type MockConfig = {
  allowedOrigin: string
  reportedOrigin: string
}

const createMockWebSocket = ({ allowedOrigin, reportedOrigin }: MockConfig): typeof WebSocket => {
  type SocketMessageEvent = { data: string }
  type SocketCloseEvent = { reason?: string }

  return class MockWebSocket {
    static CONNECTING = 0
    static OPEN = 1
    static CLOSING = 2
    static CLOSED = 3

    readonly CONNECTING = 0
    readonly OPEN = 1
    readonly CLOSING = 2
    readonly CLOSED = 3

    readyState = MockWebSocket.CONNECTING
    onopen: ((event: Record<string, unknown>) => void) | null = null
    onmessage: ((event: SocketMessageEvent) => void) | null = null
    onclose: ((event: SocketCloseEvent) => void) | null = null
    onerror: ((event: Record<string, unknown>) => void) | null = null

    constructor(_url: string) {
      queueMicrotask(() => {
        if (reportedOrigin !== allowedOrigin) {
          this.readyState = MockWebSocket.CLOSED
          this.onclose?.({ reason: "Origin not allowed" })
        } else {
          this.readyState = MockWebSocket.OPEN
          this.onopen?.({ type: "open" })
        }
      })
    }

    send(data: string) {
      if (this.readyState !== MockWebSocket.OPEN) throw new Error("Socket not open")
      const message = JSON.parse(data)
      const response = {
        jsonrpc: "2.0",
        id: message.id,
        result: message.method === "ping" ? "pong" : "unknown"
      }
      queueMicrotask(() => this.onmessage?.({ data: JSON.stringify(response) }))
    }

    close() {
      if (this.readyState === MockWebSocket.CLOSED) return
      this.readyState = MockWebSocket.CLOSED
      this.onclose?.({ reason: "closed" })
    }
  } as unknown as typeof WebSocket
}

describe("Raycast WebSocket JSON-RPC with origin checks", () => {
  afterEach(() => {
    disconnect()
  })

  it("completes the JSON-RPC ping when the origin matches Chrome", async () => {
    const WebSocketImpl = createMockWebSocket({
      allowedOrigin: "chrome-extension://raycast",
      reportedOrigin: "chrome-extension://raycast"
    })
    await connect({
      flavour: RaycastFlavour.Release,
      WebSocket: WebSocketImpl
    })
    const result = await sendRequest(RaycastFlavour.Release, "ping")
    assert.equal(result, "pong")
  })

  it("rejects the connection when the reported origin is moz-extension", async () => {
    const WebSocketImpl = createMockWebSocket({
      allowedOrigin: "chrome-extension://raycast",
      reportedOrigin: "moz-extension://raycast"
    })
    await assert.rejects(
      connect({
        flavour: RaycastFlavour.Release,
        WebSocket: WebSocketImpl
      }),
      /Origin not allowed/
    )
  })
})
