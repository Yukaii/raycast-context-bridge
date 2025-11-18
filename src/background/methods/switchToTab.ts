const tabs = globalThis.browser?.tabs || globalThis.chrome?.tabs
const windows = globalThis.browser?.windows || globalThis.chrome?.windows

export const switchToTab = async ({ tabId }: { tabId: number }) => {
  const tab = await tabs.get(tabId)
  if (!tab) throw Error(`Tab ${tabId} not found`)
  await tabs.update(tabId, { active: true })
  if (typeof tab.windowId !== "undefined") {
    await windows.update(tab.windowId, { focused: true })
  }
  return { success: true, tabId, title: tab.title, url: tab.url }
}
