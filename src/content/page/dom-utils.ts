import { getElementById } from "./registry"

const disabledClassNames = ["disabled", "btn-disabled", "button-disabled", "inactive"]
const clickableClassNames = ["btn", "button", "clickable", "link"]
const classPriority = [
  "btn",
  "button",
  "link",
  "input",
  "search",
  "submit",
  "primary",
  "secondary"
]

const sectionSelectors =
  "nav, main, header, footer, form, section, article"

export const getElementName = (element: Element): string => {
  return (
    element.getAttribute("aria-label") ||
    element.getAttribute("title") ||
    element.textContent?.trim()?.substring(0, 50) ||
    (element as HTMLElement).placeholder ||
    element.tagName.toLowerCase()
  )
}

export const isVisible = (element: Element): boolean => {
  const style = getComputedStyle(element)
  return (
    element !== null &&
    element.getBoundingClientRect().width > 0 &&
    element.getBoundingClientRect().height > 0 &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    style.display !== "none"
  )
}

export const generateSelector = (element: Element): string => {
  if (element.id) return `#${element.id}`

  const dataTestId = element.getAttribute("data-testid")
  if (dataTestId) return `[data-testid="${dataTestId}"]`

  let selector = element.tagName.toLowerCase()
  if (element.className) {
    selector += `.${element.className.split(" ").join(".")}`
  }
  return selector
}

export const inferElementType = (element: Element): string => {
  const tagName = element.tagName.toLowerCase()
  const role = element.getAttribute("role")
  const type = (element as HTMLInputElement).type

  if (tagName === "input" && type === "search") return "search_input"
  if (tagName === "input") return "input"
  if (tagName === "textarea") return "textarea"
  if (tagName === "button" || role === "button") return "button"
  if (tagName === "a") return "link"
  return "element"
}

export const getElementValue = (element: Element): string => {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value || ""
  }

  if ("contentEditable" in element && element.contentEditable === "true") {
    return element.textContent || element.innerHTML || ""
  }

  return ""
}

export const isElementDisabled = (element: Element): boolean => {
  if (
    (element as HTMLInputElement).disabled === true ||
    element.getAttribute("disabled") !== null ||
    element.getAttribute("aria-disabled") === "true"
  ) {
    return true
  }

  const classes = Array.from(element.classList)
  if (disabledClassNames.some((className) => classes.includes(className))) {
    return true
  }

  if (element.closest("fieldset[disabled]")) {
    return true
  }

  const style = getComputedStyle(element)
  return style.pointerEvents === "none"
}

export const hasText = (element: Element): boolean => {
  const content =
    element.textContent ||
    (element as HTMLInputElement | HTMLTextAreaElement).value ||
    element.getAttribute("aria-label") ||
    ""
  return content.trim().length > 0
}

export const isEmpty = (element: Element): boolean => {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return !element.value || element.value.trim().length === 0
  }

  if ("contentEditable" in element && element.contentEditable === "true") {
    return !element.textContent || element.textContent.trim().length === 0
  }

  return false
}

export const isElementClickable = (element: Element): boolean => {
  if (["BUTTON", "A", "INPUT"].includes(element.tagName)) {
    return true
  }

  if (
    "type" in element &&
    typeof (element as HTMLInputElement).type === "string" &&
    ["button", "submit", "reset"].includes((element as HTMLInputElement).type)
  ) {
    return true
  }

  const role = element.getAttribute("role")
  if (role && ["button", "link", "menuitem", "tab"].includes(role)) {
    return true
  }

  if ("onclick" in element && typeof (element as HTMLElement).onclick === "function") {
    return true
  }

  if (element.getAttribute("onclick")) return true

  const classes = Array.from(element.classList)
  return clickableClassNames.some((className) => classes.includes(className))
}

export const isElementFocusable = (element: Element): boolean => {
  if (["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(element.tagName)) {
    return true
  }

  const tabIndex = element.getAttribute("tabindex")
  if (tabIndex && tabIndex !== "-1") return true

  if ("contentEditable" in element && element.contentEditable === "true") {
    return true
  }

  const role = element.getAttribute("role")
  return Boolean(role && ["textbox", "searchbox", "button", "link"].includes(role))
}

export const isLikelyVisible = (element: Element): boolean => {
  const rect = element.getBoundingClientRect()
  const style = getComputedStyle(element)

  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0 &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    style.display !== "none"
  )
}

export const getElementState = (element: Element) => {
  const state = {
    disabled: isElementDisabled(element),
    visible: isLikelyVisible(element),
    clickable: isElementClickable(element),
    focusable: isElementFocusable(element),
    hasText: hasText(element),
    isEmpty: isEmpty(element),
    interaction_ready: false
  }

  state.interaction_ready =
    state.visible && !state.disabled && (state.clickable || state.focusable)

  return state
}

const focusElement = async (element: Element) => {
  element.scrollIntoView({ behavior: "smooth", block: "center" })
  await new Promise((resolve) => setTimeout(resolve, 200))

  const rect = element.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  element.dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, clientX: centerX, clientY: centerY })
  )
  element.dispatchEvent(
    new MouseEvent("mouseup", { bubbles: true, clientX: centerX, clientY: centerY })
  )
  element.dispatchEvent(
    new MouseEvent("click", { bubbles: true, clientX: centerX, clientY: centerY })
  )

  if ("focus" in element && typeof (element as HTMLElement).focus === "function") {
    ;(element as HTMLElement).focus()
  }

  element.dispatchEvent(new FocusEvent("focusin", { bubbles: true }))
  element.dispatchEvent(new FocusEvent("focus", { bubbles: true }))

  await new Promise((resolve) => setTimeout(resolve, 100))
}

const clearElement = async (element: Element) => {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    element.value = ""
    element.dispatchEvent(new Event("input", { bubbles: true }))
  } else if ("contentEditable" in element && element.contentEditable === "true") {
    if ("focus" in element && typeof (element as HTMLElement).focus === "function") {
      ;(element as HTMLElement).focus()
    }

    document.execCommand("selectAll")
    document.execCommand("delete")
    element.dispatchEvent(new Event("input", { bubbles: true }))
  }

  await new Promise((resolve) => setTimeout(resolve, 50))
}

const typeValue = async (element: Element, value: string) => {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    element.value = value
    element.dispatchEvent(new Event("beforeinput", { bubbles: true }))
    element.dispatchEvent(new Event("input", { bubbles: true }))
    element.dispatchEvent(new Event("change", { bubbles: true }))
    element.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "End" }))
    element.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: "End" }))
  } else if ("contentEditable" in element && element.contentEditable === "true") {
    element.textContent = value
    element.dispatchEvent(new Event("beforeinput", { bubbles: true }))
    element.dispatchEvent(new Event("input", { bubbles: true }))
    element.dispatchEvent(
      new CompositionEvent("compositionend", { bubbles: true, data: value })
    )
    document.dispatchEvent(new Event("selectionchange"))
  }

  await new Promise((resolve) => setTimeout(resolve, 100))
}

export const fillElementStandard = async ({
  elementId,
  value,
  clearFirst = true,
  forceFocus = true
}: {
  elementId: string
  value: string
  clearFirst?: boolean
  forceFocus?: boolean
}) => {
  const element = getElementById(elementId)
  if (!element) throw Error(`Element not found: ${elementId}`)

  if (forceFocus) {
    await focusElement(element)
  } else if ("focus" in element && typeof (element as HTMLElement).focus === "function") {
    ;(element as HTMLElement).focus()
  }

  if (clearFirst) {
    await clearElement(element)
  }

  await typeValue(element, value)

  const currentValue = getElementValue(element)
  const success = currentValue.includes(value)

  return {
    success,
    element_id: elementId,
    value,
    actual_value: currentValue,
    element_name: getElementName(element),
    method: "standard_fill",
    focus_applied: forceFocus
  }
}

export const getElementMeta = (element: Element) => {
  const rect = element.getBoundingClientRect()
  return {
    rect: [
      Math.round(rect.x),
      Math.round(rect.y),
      Math.round(rect.width),
      Math.round(rect.height)
    ],
    visible: isLikelyVisible(element),
    form_context: element.closest("form") ? "form" : null
  }
}

const pickPriorityClass = (element: Element) => {
  const classes = Array.from(element.classList)
  return classes.find((className) => classPriority.includes(className)) || classes[0]
}

const pickContext = (element: Element) => {
  const context = element.closest(sectionSelectors) || element.parentElement
  return context ? context.tagName.toLowerCase() : "body"
}

const siblingIndex = (element: Element) => {
  const siblings = Array.from(element.parentElement?.children || []).filter(
    (sibling) => sibling.tagName === element.tagName
  )
  return siblings.indexOf(element) + 1
}

export const generateFingerprint = (element: Element): string => {
  const tag = element.tagName.toLowerCase()
  const className = pickPriorityClass(element)
  const context = pickContext(element)
  const index = siblingIndex(element)

  return `${tag}${className ? `.${className}` : ""}@${context}.${index}`
}
