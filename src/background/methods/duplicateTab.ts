const tabs = globalThis.browser?.tabs || globalThis.chrome?.tabs

export const duplicateTab = async ({ tabId }: { tabId?: number }) => {
  let targetTabId = tabId
  if (!targetTabId) {
    const [activeTab] = await tabs.query({ active: true, currentWindow: true })
    if (!activeTab) throw Error("No active tab found")
    targetTabId = activeTab.id
  }

  const original = await tabs.get(targetTabId!)
  if (!original) throw Error(`Tab ${targetTabId} not found`)

  const duplicate = await tabs.create({ url: original.url, active: false, index: original.index + 1 })
  return { success: true, tab: duplicate }
}
