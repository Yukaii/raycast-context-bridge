import { relayToContentScript } from "../utils"

export const pageWaitFor = async (params) => {
  return relayToContentScript({
    name: "waitFor",
    body: { ...params, target: "content-script" },
    tabId: params.tabId
  })
}
