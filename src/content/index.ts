import { sendToBackground } from "@plasmohq/messaging"
import { listen } from "@plasmohq/messaging/message"
import * as extraction from "./extraction"
import * as registry from "./page/registry"
import * as dom from "./page/dom-utils"
import * as antiDetection from "./page/anti-detection"
import * as pageAnalysis from "./page/analysis"

export const config = { matches: ["<all_urls>"] }

sendToBackground({ name: "ping" })

listen(async (req, res) => {
  if (req.body?.target !== "content-script") return
  try {
    switch (req.name) {
      case "getTab":
        return await handleGetTab(req, res)
      case "elementClick":
        return await handleElementClick(req, res)
      case "elementFill":
        return await handleElementFill(req, res)
      case "elementGetState":
        return await handleElementGetState(req, res)
      case "pageAnalysis":
        return await handlePageAnalysis(req, res)
      case "waitFor":
        return await handleWaitFor(req, res)
      default:
        throw Error(`Unknown request name "${req.name}"`)
    }
  } catch (error) {
    console.error(error)
    if (error instanceof Error) {
      res.send({ success: false, error: error.message })
    } else {
      res.send({ success: false, error: String(error) })
    }
  }
})

const handleGetTab = async (req, res) => {
  switch (req.body?.field) {
    case "title":
      res.send({ result: document.title, success: true })
      return
    case "url":
      res.send({ result: location.href, success: true })
      return
    case "content":
      if (req.body?.selector) {
        res.send({
          result: await extraction.selector.getContent(location.href, document, {
            selector: req.body.selector,
            format: req.body.format
          }),
          success: true
        })
        return
      }
      if (await extraction.youtube.match(location.href)) {
        res.send({
          result: await extraction.youtube.getContent(location.href, document, {
            format: req.body.format
          }),
          success: true
        })
        return
      }
      res.send({
        result: await extraction.generic.getContent(location.href, document, {
          format: req.body.format
        }),
        success: true
      })
      return
    default:
      throw Error(`Unknown field "${req.body?.field}"`)
  }
}

const handleElementClick = async (req, res) => {
  let {
      elementId,
      clickType = "left",
      waitAfter = 500
    } = req.body,
    element = registry.getElementById(elementId)
  if (!element) throw Error(`Element not found: ${elementId}`)
  element.scrollIntoView({ behavior: "smooth", block: "center" })
  await new Promise((resolve) => setTimeout(resolve, 200))
  if ("right" === clickType) {
    element.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }))
  } else if ("click" in element && typeof (element as HTMLElement).click === "function") {
    ;(element as HTMLElement).click()
  }
  await new Promise((resolve) => setTimeout(resolve, waitAfter))
  res.send({
    success: true,
    elementId,
    clickType,
    element_name: dom.getElementName(element)
  })
}

const handleWaitFor = async (req, res) => {
  let {
      conditionType,
      condition_type,
      selector,
      text,
      timeout = 5e3
    } = req.body,
    condition = conditionType ?? condition_type,
    start = Date.now(),
    conditions = {
      element_visible: () => {
        let element = document.querySelector(selector)
        return element && null !== element.offsetParent
      },
      text_present: () => document.body.textContent.includes(text)
    },
    predicate = conditions[condition]
  if (!predicate) throw Error(`Unknown condition type: ${condition}`)
  for (; Date.now() - start < timeout; ) {
    if (predicate()) {
      res.send({
        success: true,
        condition_met: true,
        wait_time: Date.now() - start
      })
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw Error(`Timeout waiting for condition: ${conditionType}`)
}

const handleElementGetState = async (req, res) => {
  let { elementId } = req.body,
    element = registry.getElementById(elementId)
  if (!element) throw Error(`Element not found: ${elementId}`)
  res.send({
    success: true,
    element_id: elementId,
    element_name: dom.getElementName(element),
    state: dom.getElementState(element),
    current_value: dom.getElementValue(element)
  })
}

const handleElementFill = async (req, res) => {
  let {
      elementId,
      value,
      clearFirst = true,
      forceFocus = true
    } = req.body,
    element = registry.getElementById(elementId)
  if (!element) throw Error(`Element not found: ${elementId}`)
  let hostname = window.location.hostname,
    platform = antiDetection.detectAntiDetectionPlatform(hostname)
  if (platform && antiDetection.shouldUseBypass(element, platform)) {
    console.log(`🧠 Using ${platform.bypassMethod} bypass for ${hostname}`)
    res.send({
      success: true,
      ...(await antiDetection.executeDirectBypass(element, value, platform, elementId))
    })
  } else {
    console.log("🔧 Using standard fill method")
    res.send({
      success: true,
      ...(await dom.fillElementStandard({
        elementId,
        value,
        clearFirst,
        forceFocus
      }))
    })
  }
}

const handlePageAnalysis = async (req, res) => {
  let {
      intentHint,
      phase = "discover",
      focusAreas,
      elementIds,
      maxResults = 5
    } = req.body,
    result =
      "discover" === phase
        ? await pageAnalysis.quickDiscovery({
            intent_hint: intentHint,
            max_results: maxResults
          })
        : await pageAnalysis.detailedAnalysis({
            intent_hint: intentHint,
            focus_areas: focusAreas,
            element_ids: elementIds,
            max_results: maxResults
          })
  res.send({
    success: true,
    ...result,
    stringifiedResult: JSON.stringify(result, null, 2)
  })
}
