const tabs = globalThis.browser?.tabs || globalThis.chrome?.tabs

export const duplicateTab = async ({ tabId }: { tabId?: number }) => {
  let target = tabId
  if (!target) {
    const [activeTab] = await tabs.query({ active: true, currentWindow: true })
    if (!activeTab?.id) throw Error("No active tab found")
    target = activeTab.id
  }

  const duplicated = await tabs.duplicate(target!)
  return {
    success: true,
    tabId: duplicated.id,
    url: duplicated.url,
    active: duplicated.active,
    title: duplicated.title || "New Tab"
  }
}
