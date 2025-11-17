import { relayToContentScript } from "../utils"

export const pageAnalysis = async (params) => {
  return relayToContentScript({
    name: "pageAnalysis",
    body: { ...params, target: "content-script" },
    tabId: params.tabId
  })
}
