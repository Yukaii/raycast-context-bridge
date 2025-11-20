import RaycastRpcError, {
  InternalError,
  InvalidRequest,
  MethodNotFound
} from "./raycast-errors"

export enum RaycastFlavour {
  XDevelopment = "7261",
  XInternal = "7262",
  Debug = "7263",
  Internal = "7264",
  Release = "7265"
}

type MethodMap = Record<string, (params?: Record<string, unknown>) => unknown | Promise<unknown>>

type ConnectOptions = {
  methods?: MethodMap
  onOpen?: (flavour: RaycastFlavour | string) => void
  keepConnectionAlive?: boolean
  retryConnection?: boolean
  flavour?: RaycastFlavour
  WebSocket?: typeof WebSocket
  debug?: boolean
  buildUrl?: (flavour: RaycastFlavour | string) => string
}

type PendingRequest = {
  resolve: (result: unknown) => void
  reject: (error: Error) => void
  timeout?: ReturnType<typeof setTimeout>
}

const sockets: Partial<Record<string, WebSocket>> = {}
const keepAliveTimers: Partial<Record<string, ReturnType<typeof setInterval>>> = {}
const retryTimers: Partial<Record<string, ReturnType<typeof setTimeout>>> = {}
const pendingRequests: Record<number, PendingRequest> = {}

let registeredMethods: MethodMap = {}
let nextRequestId = Math.floor(Math.random() * 1_000)

const getSocket = (flavour: string) => sockets[flavour]

const clearRetryTimer = (flavour: string) => {
  if (retryTimers[flavour]) {
    clearTimeout(retryTimers[flavour])
    delete retryTimers[flavour]
  }
}

const clearKeepAliveTimer = (flavour: string) => {
  if (keepAliveTimers[flavour]) {
    clearInterval(keepAliveTimers[flavour])
    delete keepAliveTimers[flavour]
  }
}

const sendRaw = (flavour: string, payload: unknown) => {
  console.debug(payload)
  const socket = getSocket(flavour)
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false
  }
  try {
    socket.send(JSON.stringify(payload))
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

const sendResponse = (flavour: string, id: number, result: unknown) => {
  return sendRaw(flavour, { jsonrpc: "2.0", id, result })
}

const sendErrorResponse = (flavour: string, id: number, error: Error) => {
  const rpcError =
    error instanceof RaycastRpcError
      ? error
      : new InternalError(error.message, (error as Error).stack)
  const payload = {
    code: rpcError.code,
    message: rpcError.message,
    data: rpcError.data
  }
  return sendRaw(flavour, { jsonrpc: "2.0", id, error: payload })
}

const invokeHandler = (method: string, params: Record<string, unknown> = {}) => {
  const handler = registeredMethods[method]
  if (!handler) throw new MethodNotFound(`Method ${method} not found`)
  return handler(params)
}

const handleMessage = (flavour: string, raw: string) => {
  try {
    if (!raw) return
    console.debug(raw)
    const message = JSON.parse(raw)
    if (typeof message.id !== "undefined") {
      const id = typeof message.id === "string" ? parseInt(message.id, 10) : message.id
      if (
        typeof message.result !== "undefined" ||
        message.error ||
        typeof message.method === "undefined"
      ) {
        const pending = pendingRequests[id]
        if (!pending) {
          sendErrorResponse(flavour, id, new InvalidRequest(`Missing callback for ${message.id}`))
          return
        }
        if (pending.timeout) clearTimeout(pending.timeout)
        delete pendingRequests[id]
        if (message.error) {
          const errPayload = message.error
          const rpcError = new RaycastRpcError(errPayload.message)
          rpcError.code = errPayload.code
          rpcError.data = errPayload.data
          pending.reject(rpcError)
        } else {
          pending.resolve(message.result)
        }
      } else {
        processRequest(flavour, message)
      }
    } else if (message.method) {
      processNotification(flavour, message)
    }
  } catch (error) {
    console.error(error)
    console.error(raw)
  }
}

const processRequest = async (flavour: string, message: any) => {
  if (!message.method) {
    sendErrorResponse(flavour, message.id, new InvalidRequest("Missing method"))
    return
  }
  try {
    const result = await invokeHandler(message.method, message.params || {})
    sendResponse(flavour, message.id, result)
  } catch (error) {
    sendErrorResponse(flavour, message.id, error as Error)
  }
}

const processNotification = (_flavour: string, message: any) => {
  try {
    invokeHandler(message.method, message.params || {})
  } catch (error) {
    console.error(error)
  }
}

const keepAlive = (flavour: string, options: ConnectOptions) => {
  if (!options.keepConnectionAlive || keepAliveTimers[flavour]) return
  keepAliveTimers[flavour] = setInterval(() => {
    const socket = getSocket(flavour)
    if (socket?.readyState === WebSocket.OPEN) {
      sendRequest(flavour as RaycastFlavour, "ping").catch(() => {})
    } else {
      clearKeepAliveTimer(flavour)
    }
  }, 24_000)
}

const openConnection = (
  flavour: RaycastFlavour | string,
  options: ConnectOptions
): Promise<void> => {
  if (sockets[flavour]) return Promise.resolve()
  clearRetryTimer(flavour)
  const SocketImpl = options.WebSocket || WebSocket
  const targetUrl =
    options.buildUrl?.(flavour) ?? `ws://localhost:${String(flavour)}`

  return new Promise((resolve, reject) => {
    let opened = false
    try {
      const socket = new SocketImpl(targetUrl)
      socket.onopen = (event) => {
        if (options.debug) console.debug(`websocket to ${targetUrl} open`, event)
        options.onOpen?.(flavour)
        keepAlive(flavour, options)
        sockets[flavour] = socket
        opened = true
        resolve()
      }
      socket.onmessage = (event) => {
        if (typeof event.data === "string") {
          handleMessage(flavour, event.data)
        } else {
          event.data.text().then((text) => handleMessage(flavour, text))
        }
      }
      socket.onclose = (event) => {
        if (options.debug) {
          console.debug(`websocket connection to ${targetUrl} closed`, event)
        }
        delete sockets[flavour]
        clearKeepAliveTimer(flavour)
        if (options.retryConnection) {
          retryTimers[flavour] = setTimeout(() => {
            openConnection(flavour, options).catch(() => {})
          }, 5_000)
        } else if (!opened) {
          reject(new Error(event.reason))
        }
      }
      sockets[flavour] = socket
    } catch (error) {
      if (options.debug) console.debug(`Failed to connect to ${targetUrl}`, error)
      if (!opened) reject(error as Error)
    }
  })
}

export const connect = async (options: ConnectOptions) => {
  if (options.methods) {
    setup(options.methods)
  }
  if (options.flavour) {
    return openConnection(options.flavour, options)
  }
  await Promise.all(
    Object.values(RaycastFlavour).map((flavour) =>
      openConnection(flavour, options).catch(() => {})
    )
  )
}

export const disconnect = () => {
  Object.values(sockets).forEach((socket) => {
    if (!socket) return
    socket.onclose = null
    socket.close()
  })
  Object.values(keepAliveTimers).forEach((timer) => clearInterval(timer))
  Object.values(retryTimers).forEach((timer) => clearTimeout(timer))
  Object.values(pendingRequests).forEach((pending) => {
    pending.timeout && clearTimeout(pending.timeout)
    pending.reject(new Error("Connection closed"))
  })
  Object.keys(pendingRequests).forEach((key) => delete pendingRequests[Number(key)])
  Object.keys(sockets).forEach((key) => delete sockets[key])
  console.debug("websocket connections closed")
}

export const setup = (methods: MethodMap) => {
  registeredMethods = { ...registeredMethods, ...methods }
}

export const sendNotification = (
  flavour: RaycastFlavour | string,
  method: string,
  params?: Record<string, unknown>
) => {
  return sendRaw(flavour, { jsonrpc: "2.0", method, params })
}

export const sendRequest = (
  flavour: RaycastFlavour | string,
  method: string,
  params?: Record<string, unknown>,
  timeout = 3_000
) => {
  return new Promise((resolve, reject) => {
    const id = nextRequestId++
    const callback: PendingRequest = {
      resolve,
      reject,
      timeout: setTimeout(() => {
        delete pendingRequests[id]
        reject(new Error(`Request ${method} timed out.`))
      }, timeout)
    }
    pendingRequests[id] = callback
    const dispatched = sendRaw(flavour, { jsonrpc: "2.0", method, params, id })
    if (!dispatched) {
      if (callback.timeout) clearTimeout(callback.timeout)
      delete pendingRequests[id]
      const error = new RaycastRpcError("No valid connection to Raycast")
      error.data = "No valid connection to Raycast"
      reject(error)
    }
  })
}

export const sendNotificationToAll = (method: string, params?: Record<string, unknown>) => {
  return Object.keys(sockets).some((flavour) => sendNotification(flavour, method, params))
}

export const sendRequestToAll = (
  method: string,
  params?: Record<string, unknown>,
  timeout = 3_000
) => {
  return Promise.all(
    [RaycastFlavour.Release, RaycastFlavour.Internal, RaycastFlavour.Debug].map((flavour) => {
      const socket = getSocket(flavour)
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return Promise.resolve(undefined)
      }
      return sendRequest(flavour, method, params, timeout)
    })
  )
}
