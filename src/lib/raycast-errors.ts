export class RaycastRpcError extends Error {
  data?: unknown
  code: number

  constructor(message?: string, data?: unknown, code = -1) {
    super(message)
    this.data = data
    this.code = code
  }
}

export class ParseError extends RaycastRpcError {
  constructor(data?: unknown) {
    super("Parse error", data, -32700)
  }
}

export class InvalidRequest extends RaycastRpcError {
  constructor(data?: unknown) {
    super("Invalid Request", data, -32600)
  }
}

export class MethodNotFound extends RaycastRpcError {
  constructor(data?: unknown) {
    super("Method not found", data, -32601)
  }
}

export class InvalidParams extends RaycastRpcError {
  constructor(data?: unknown) {
    super("Invalid params", data, -32602)
  }
}

export class InternalError extends RaycastRpcError {
  constructor(message?: string, data?: unknown) {
    super(message ?? "Internal error", data, -32603)
  }
}

export default RaycastRpcError
