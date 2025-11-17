import { relayToContentScript } from "../utils"

export const executeJS = async ({ script, tabId }: { script: string; tabId?: number }) => {
  return relayToContentScript({
    name: "executeJS",
    body: { script, target: "user-script" },
    tabId
  })
}
