import { sendToContentScript } from "@plasmohq/messaging"

type MessageBody = {
  name: string
  body: Record<string, any>
  tabId?: number
}

export const relayToContentScript = async ({ name, body, tabId }: MessageBody) => {
  try {
    const response = await sendToContentScript({ name, body, tabId })
    if (!response) {
      throw Error("Could not establish connection. Receiving end does not exist.")
    }
    const { success, error } = response
    if (!success) throw Error(error)
    return response
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Could not establish connection. Receiving end does not exist."
      ) {
        throw Error("Access to this page is restricted. Try to reload the page")
      }
      throw error
    }
    throw Error(String(error))
  }
}

export const waitForElement = async (tabId: number | undefined, selector: string, timeout = 5_000) => {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const response = await relayToContentScript({
        name: "waitFor",
        body: {
          condition_type: "element_visible",
          selector,
          timeout: 1_000,
          target: "content-script"
        },
        tabId
      })
      if (response.success) return true
    } catch {
      // ignore transient failures
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw Error(`Timeout waiting for element: ${selector}`)
}
