const tabs = globalThis.browser?.tabs || globalThis.chrome?.tabs

export const getTabs = async ({ currentWindow }: { currentWindow?: boolean } = {}) => {
  const list = await tabs.query({
    url: "<all_urls>",
    currentWindow
  })

  const value = list
    .map((tab) => ({
      favicon: tab.favIconUrl,
      title: tab.title,
      url: tab.url,
      tabId: tab.id,
      active: tab.active,
      windowId: tab.windowId,
      pinned: tab.pinned,
      incognito: tab.incognito
    }))
    .filter(
      (tab) => typeof tab.tabId !== "undefined" && (typeof tabs.TAB_ID_NONE === "undefined" || tab.tabId !== tabs.TAB_ID_NONE)
    )

  return { value }
}
