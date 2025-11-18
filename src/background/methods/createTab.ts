import { waitForElement } from "../utils"

const tabs = globalThis.browser?.tabs || globalThis.chrome?.tabs

type CreateTabParams = {
  url: string
  active?: boolean
  waitFor?: string
  timeout?: number
}

export const createTab = async ({
  url,
  active = true,
  waitFor,
  timeout = 10_000
}: CreateTabParams) => {
  const tab = await tabs.create({ url, active })

  if (url && waitFor) {
    try {
      await waitForElement(tab.id, waitFor, timeout)
    } catch (error) {
      return {
        success: true,
        tabId: tab.id,
        url: tab.url,
        warning: `Tab created but wait condition failed: ${(error as Error).message}`
      }
    }
  }

  return {
    success: true,
    tabId: tab.id,
    url: tab.url,
    active: tab.active,
    title: tab.title || "New Tab"
  }
}
