import { relayToContentScript } from "../utils"

export const elementFill = async (params) => {
  return relayToContentScript({
    name: "elementFill",
    body: { ...params, target: "content-script" },
    tabId: params.tabId
  })
}
