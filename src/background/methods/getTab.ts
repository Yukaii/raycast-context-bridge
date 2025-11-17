const tabs = globalThis.browser?.tabs || globalThis.chrome?.tabs

export const getTab = async ({ tabId }: { tabId?: number }) => {
  let target = tabId
  if (!target) {
    const [active] = await tabs.query({ active: true, currentWindow: true })
    if (!active) throw Error("No active tab found")
    target = active.id
  }

  const tab = await tabs.get(target!)
  return { success: true, tab }
}
