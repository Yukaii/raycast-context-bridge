import { relayToContentScript } from "../utils"

type GetTabParams = {
  field: string
  format?: string
  selector?: string
  tabId?: number
}

export const getTab = async (params: GetTabParams) => {
  const response = await relayToContentScript({
    name: "getTab",
    body: { ...params, target: "content-script" },
    tabId: params.tabId
  })

  return { value: response.result }
}
