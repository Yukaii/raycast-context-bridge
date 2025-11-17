const elementRegistry = new Map<string, WeakRef<Element>>()
const quickRegistry = new Map<string, WeakRef<Element>>()

let elementCounter = 0
let quickCounter = 0

export const registerQuickElement = (element: Element): string => {
  const id = `q${++quickCounter}`
  quickRegistry.set(id, new WeakRef(element))
  return id
}

export const registerElement = (element: Element): string => {
  const id = `element_${++elementCounter}`
  elementRegistry.set(id, new WeakRef(element))
  return id
}

export const getElementById = (id: string): Element | undefined => {
  if (id.startsWith("q")) {
    return quickRegistry.get(id)?.deref()
  }

  return elementRegistry.get(id)?.deref()
}
