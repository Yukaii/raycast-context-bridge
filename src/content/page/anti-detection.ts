import { fillElementStandard, getElementName } from "./dom-utils"

type PlatformConfig = {
  selectors: {
    textarea: string
    submit: string
  }
  bypassMethod: "twitter_direct" | "linkedin_direct" | "facebook_direct" | "generic_direct"
}

const platforms: Record<string, PlatformConfig> = {
  "twitter.com": {
    selectors: {
      textarea: "[data-testid='tweetTextarea_0']",
      submit: "[data-testid='tweetButtonInline'], [data-testid='tweetButton']"
    },
    bypassMethod: "twitter_direct"
  },
  "x.com": {
    selectors: {
      textarea: "[data-testid='tweetTextarea_0']",
      submit: "[data-testid='tweetButtonInline'], [data-testid='tweetButton']"
    },
    bypassMethod: "twitter_direct"
  },
  "linkedin.com": {
    selectors: {
      textarea: "[contenteditable='true'][role='textbox']",
      submit: "[data-control-name='share.post']"
    },
    bypassMethod: "linkedin_direct"
  },
  "facebook.com": {
    selectors: {
      textarea: "[contenteditable='true'][data-text='true']",
      submit: "[data-testid='react-composer-post-button']"
    },
    bypassMethod: "facebook_direct"
  }
}

export const detectAntiDetectionPlatform = (hostname: string): PlatformConfig | null => {
  if (platforms[hostname]) return platforms[hostname]

  for (const [key, config] of Object.entries(platforms)) {
    if (hostname.includes(key) || hostname.endsWith(`.${key}`)) return config
  }

  return null
}

export const shouldUseBypass = (element: Element, config: PlatformConfig): boolean => {
  try {
    const selectorMatch = document.querySelector(config.selectors.textarea) === element
    if (selectorMatch) return true

    const selectors = config.selectors.textarea.split(", ").map((s) => s.trim())
    return selectors.some((selector) => {
      try {
        return element.matches(selector)
      } catch {
        return false
      }
    })
  } catch (error) {
    console.warn("Bypass detection failed:", error)
    return false
  }
}

export const executeDirectBypass = async (
  element: Element,
  value: string,
  config: PlatformConfig,
  elementId: string
) => {
  try {
    switch (config.bypassMethod) {
      case "twitter_direct":
        return await twitterBypass(element, value, elementId)
      case "linkedin_direct":
        return await linkedinBypass(element, value, elementId)
      case "facebook_direct":
        return await facebookBypass(element, value, elementId)
      default:
        return await genericBypass(element, value, elementId)
    }
  } catch (error) {
    console.error("Direct bypass failed, falling back to standard method:", error)
    return fillElementStandard({
      elementId,
      value,
      clearFirst: true,
      forceFocus: true
    })
  }
}

const focusAndClick = async (element: Element) => {
  element.scrollIntoView({ behavior: "smooth", block: "center" })
  await new Promise((resolve) => setTimeout(resolve, 200))
  ;(element as HTMLElement).focus()
  ;(element as HTMLElement).click()
}

const applyExecCommand = async (element: Element, value: string) => {
  const result = document.execCommand("insertText", false, value)
  await new Promise((resolve) => setTimeout(resolve, 500))
  const currentValue = element.textContent || (element as HTMLInputElement).value || ""
  return { result, currentValue }
}

const baseResponse = (
  success: boolean,
  element: Element,
  elementId: string,
  value: string,
  method: string,
  execCommandResult: boolean
) => ({
  success,
  error: success ? undefined : `Could not set the value. Current value: ${element.textContent || value}`,
  element_id: elementId,
  value,
  actual_value: element.textContent || (element as HTMLInputElement).value || "",
  method,
  execCommand_result: execCommandResult,
  element_name: getElementName(element)
})

const twitterBypass = async (element: Element, value: string, elementId: string) => {
  console.log("🐦 Twitter direct bypass - focus+click+execCommand")
  await focusAndClick(element)
  const { result, currentValue } = await applyExecCommand(element, value)
  const success = currentValue.includes(value)
  return baseResponse(success, element, elementId, value, "twitter_direct_bypass", result)
}

const linkedinBypass = async (element: Element, value: string, elementId: string) => {
  console.log("💼 LinkedIn direct bypass")
  await focusAndClick(element)
  if (element.textContent) {
    document.execCommand("selectAll")
    document.execCommand("delete")
  }
  const { result, currentValue } = await applyExecCommand(element, value)
  await new Promise((resolve) => setTimeout(resolve, 800))
  const success = currentValue.includes(value)
  return baseResponse(success, element, elementId, value, "linkedin_direct_bypass", result)
}

const facebookBypass = async (element: Element, value: string, elementId: string) => {
  console.log("📘 Facebook direct bypass")
  await focusAndClick(element)
  if (element.textContent) {
    document.execCommand("selectAll")
    document.execCommand("delete")
  }
  const { result, currentValue } = await applyExecCommand(element, value)
  element.dispatchEvent(new Event("input", { bubbles: true }))
  element.dispatchEvent(new Event("change", { bubbles: true }))
  await new Promise((resolve) => setTimeout(resolve, 600))
  const success = currentValue.includes(value)
  return baseResponse(success, element, elementId, value, "facebook_direct_bypass", result)
}

const genericBypass = async (element: Element, value: string, elementId: string) => {
  console.log("🔧 Generic direct bypass")
  await focusAndClick(element)
  const { result, currentValue } = await applyExecCommand(element, value)
  const success = currentValue.includes(value)
  return baseResponse(success, element, elementId, value, "generic_direct_bypass", result)
}
