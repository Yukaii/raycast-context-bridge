const tabs = globalThis.browser?.tabs || globalThis.chrome?.tabs

type CloseAction = "self" | "other" | "duplicate" | "left" | "right"

export const closeTab = async ({ tabId, action }: { tabId?: number; action?: CloseAction }) => {
  let targetTabId = tabId
  if (!targetTabId) {
    const [activeTab] = await tabs.query({ active: true, currentWindow: true })
    if (!activeTab) throw Error("No active tab found")
    targetTabId = activeTab.id
  }

  const currentTab = await tabs.get(targetTabId!)
  if (!currentTab) throw Error(`Tab with id ${targetTabId} not found`)

  let candidates = []
  switch (action ?? "self") {
    case "self":
      candidates = [currentTab]
      break
    case "other":
      candidates = (await tabs.query({ windowId: currentTab.windowId })).filter(
        (tab) => tab.id !== currentTab.id
      )
      break
    case "duplicate":
      candidates = (await tabs.query({ windowId: currentTab.windowId })).filter(
        (tab) => tab.id !== currentTab.id && tab.url === currentTab.url
      )
      break
    case "left":
      candidates = (await tabs.query({ windowId: currentTab.windowId })).filter(
        (tab) => tab.id !== currentTab.id && tab.index < currentTab.index
      )
      break
    case "right":
      candidates = (await tabs.query({ windowId: currentTab.windowId })).filter(
        (tab) => tab.id !== currentTab.id && tab.index > currentTab.index
      )
      break
    default:
      throw Error(`Unknown ${action} action`)
  }

  await tabs.remove(candidates.map((tab) => tab.id))
  return {
    success: true,
    closedTabs: candidates.map((tab) => ({
      tabId: tab.id,
      title: tab.title,
      url: tab.url
    })),
    count: candidates.length
  }
}
