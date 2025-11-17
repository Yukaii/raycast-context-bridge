export enum RaycastFlavour {
  Release = "release"
}

type ConnectionOptions = {
  methods: Record<string, (...args: any[]) => Promise<any>>
  onOpen?: (...args: any[]) => void
  debug?: boolean
  keepConnectionAlive?: boolean
  retryConnection?: boolean
  flavour?: RaycastFlavour
}

export const connect = (options: ConnectionOptions) => {
  console.warn("[raycast-app stub] connect called with", options)
  options.onOpen?.({
    send: () => {}
  })
}

export const disconnect = () => {
  console.warn("[raycast-app stub] disconnect called")
}

export const sendNotification = (...args: any[]) => {
  console.warn("[raycast-app stub] sendNotification", args)
  return true
}

export const sendNotificationToAll = (...args: any[]) => {
  console.warn("[raycast-app stub] sendNotificationToAll", args)
  return true
}
