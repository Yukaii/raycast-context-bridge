import { relayToContentScript } from "../utils"

export const elementGetState = async (params) => {
  return relayToContentScript({
    name: "elementGetState",
    body: { ...params, target: "content-script" },
    tabId: params.tabId
  })
}
