import "@plasmohq/messaging/background"
import { Storage } from "@plasmohq/storage"
import {
  connect,
  disconnect,
  RaycastFlavour,
  sendNotification,
  sendNotificationToAll
} from "../lib/raycast"
import * as methods from "./methods"

const storage = new Storage()
const runtime = globalThis.browser?.runtime || globalThis.chrome?.runtime
const windows = globalThis.browser?.windows || globalThis.chrome?.windows
const action =
  globalThis.browser?.action ||
  globalThis.chrome?.action ||
  globalThis.browser?.browserAction ||
  globalThis.chrome?.browserAction
const tabs = globalThis.browser?.tabs || globalThis.chrome?.tabs
const scripting = globalThis.browser?.scripting || globalThis.chrome?.scripting

const manifestAction = runtime.getManifest().action || runtime.getManifest().browser_action
if (action && manifestAction?.default_icon) {
  action.setIcon({ path: manifestAction.default_icon })
}

const ensureConnection = () => {
  const options = {
    methods: { ...methods, getFocusedTab: methods.getTab },
    onOpen(payload) {
      sendNotification(payload, "whoami", {
        name: "browserExtension",
        target: "chrome-mv3",
        userAgent: navigator.userAgent
      })
    },
    debug: true,
    keepConnectionAlive: true,
    retryConnection: true
  }

  storage.get("raycast-connect-to-all-flavour").then((flag) => {
    connect({
      ...options,
      flavour: flag ? undefined : RaycastFlavour.Release
    })
  })
}

const shouldOpenLanding = async (reason?: string) => reason === "install"

windows.onFocusChanged.addListener((windowId) => {
  if (windowId === windows.WINDOW_ID_NONE) return
  ensureConnection()
  sendNotificationToAll("browserDidFocus", {
    userAgent: navigator.userAgent,
    target: "chrome-mv3"
  })
})

tabs.onActivated.addListener((info) => {
  if (info.windowId === windows.WINDOW_ID_NONE) return
  ensureConnection()
  sendNotificationToAll("browserDidFocus", {
    userAgent: navigator.userAgent,
    target: "chrome-mv3"
  })
})

windows.getCurrent().then(() => ensureConnection())

if (storage.isWatchSupported()) {
  storage.watch({
    "raycast-connect-to-all-flavour": () => {
      disconnect()
      ensureConnection()
    }
  })
}

const injectContentScripts = async () => {
  const manifestScripts = runtime.getManifest().content_scripts || []
  for (const script of manifestScripts) {
    const matches = await tabs.query({ url: script.matches })
    for (const tab of matches) {
      if (!tab.id) continue
      if (scripting?.executeScript) {
        await scripting
          .executeScript({
            target: { tabId: tab.id },
            files: script.js
          })
          .catch((error) => console.log(error))
      } else if (typeof tabs.executeScript === "function") {
        for (const file of script.js) {
          const result = tabs.executeScript(tab.id, { file })
          if (result && typeof result.then === "function") {
            await result.catch((error) => console.log(error))
          } else {
            await new Promise((resolve) =>
              tabs.executeScript(tab.id, { file }, () => resolve(undefined))
            )
          }
        }
      }
    }
  }
}

runtime.onInstalled.addListener(async () => {
  await injectContentScripts()
})

if (action) {
  action.onClicked.addListener(() => {
    const result = sendNotificationToAll("browserActionClicked")
    if (!result) {
      tabs.create({
        url: "https://www.raycast.com/browser-extension?installed=true"
      })
    }
  })
}

runtime.onInstalled.addListener(async (details) => {
  if (await shouldOpenLanding(details.reason)) {
    tabs.create({
      url: "https://www.raycast.com/browser-extension?installed=true"
    })
    await storage.set("installed", true)
  }

  registerUserScript()
})

const registerUserScript = () => {
  try {
    const userScripts = globalThis.browser?.userScripts || globalThis.chrome?.userScripts
    if (!userScripts) return

    userScripts.configureWorld({
      messaging: true,
      csp: "script-src 'self' 'unsafe-eval'"
    })

    const scriptUrl = runtime.getURL("user-script.js")
    const filePath = new URL(scriptUrl)

    userScripts.register([
      {
        id: "raycast-user-script-proxy",
        matches: ["*://*/*"],
        js: [{ file: filePath.pathname }]
      }
    ])
  } catch (error) {
    console.warn("Failed to register user script", error)
  }
}
