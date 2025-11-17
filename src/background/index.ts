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
const action = globalThis.browser?.action || globalThis.chrome?.action
const tabs = globalThis.browser?.tabs || globalThis.chrome?.tabs
const scripting = globalThis.browser?.scripting || globalThis.chrome?.scripting

if (action && runtime.getManifest().action?.default_icon) {
  action.setIcon({ path: runtime.getManifest().action.default_icon })
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

runtime.onInstalled.addListener(async () => {
  for (const script of runtime.getManifest().content_scripts || []) {
    const matches = await tabs.query({ url: script.matches })
    for (const tab of matches) {
      scripting
        .executeScript({
          target: { tabId: tab.id },
          files: script.js
        })
        .catch((error) => console.log(error))
    }
  }
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
