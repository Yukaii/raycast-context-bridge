import { waitForElement } from "../utils"

const tabsApi = globalThis.browser?.tabs || globalThis.chrome?.tabs

export const pageNavigate = async ({
  url,
  waitFor,
  timeout = 10_000,
  tabId
}: {
  url: string
  waitFor?: string
  timeout?: number
  tabId?: number
}) => {
  const targetTabId = tabId
    ? tabId
    : (await tabsApi.query({ active: true, currentWindow: true }))[0]?.id

  await tabsApi.update(targetTabId!, { url })

  if (waitFor) {
    try {
      await waitForElement(targetTabId, waitFor, timeout)
    } catch (error) {
      return {
        success: true,
        url,
        warning: `Navigation completed but wait condition failed: ${(error as Error).message}`
      }
    }
  }

  return { success: true, url }
}
