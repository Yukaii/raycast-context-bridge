import { relayToContentScript } from "../utils"

export const elementClick = async (params) => {
  return relayToContentScript({
    name: "elementClick",
    body: { ...params, target: "content-script" },
    tabId: params.tabId
  })
}
