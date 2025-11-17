const tabs = globalThis.browser?.tabs || globalThis.chrome?.tabs

export const getTabs = async ({ windowId }: { windowId?: number }) => {
  const query: Record<string, any> = { windowType: "normal" }
  if (windowId) query.windowId = windowId
  const list = await tabs.query(query)
  return { success: true, tabs: list }
}
