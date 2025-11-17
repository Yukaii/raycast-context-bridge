import * as antiDetection from "./anti-detection"
import * as dom from "./dom-utils"
import * as registry from "./registry"

const PATTERNS = {
  auth: {
    login: {
      input: [
        "[type='email']",
        "[name*='username' i]",
        "[placeholder*='email' i]",
        "[name*='login' i]"
      ],
      password: ["[type='password']", "[name*='password' i]"],
      submit: [
        "[type='submit']",
        "button[form]",
        ".login-btn",
        "[aria-label*='login' i]"
      ],
      confidence: 0.9
    },
    signup: {
      input: ["[name*='register' i]", "[placeholder*='signup' i]", "[name*='email' i]"],
      submit: ["[href*='signup']", ".signup-btn", "[aria-label*='register' i]"],
      confidence: 0.85
    }
  },
  content: {
    post_create: {
      textarea: [
        "[data-testid='tweetTextarea_0']",
        "[aria-label='Post text']",
        "[contenteditable='true']",
        "textarea[placeholder*='post' i]",
        "[data-text='true']"
      ],
      submit: [
        "[data-testid='tweetButtonInline']",
        "[data-testid='tweetButton']",
        ".post-btn",
        ".publish-btn",
        "[aria-label*='post' i]"
      ],
      confidence: 0.95
    },
    comment: {
      textarea: ["textarea[placeholder*='comment' i]", "[role='textbox']", "[placeholder*='reply' i]"],
      submit: [".comment-btn", "[aria-label*='comment' i]", "[aria-label*='reply' i]"],
      confidence: 0.8
    }
  },
  search: {
    global: {
      input: [
        "[data-testid='SearchBox_Search_Input']",
        "[type='search']",
        "[role='searchbox']",
        "[placeholder*='search' i]",
        "[name*='search' i]"
      ],
      submit: ["[aria-label*='search' i]", ".search-btn", "button[type='submit']"],
      confidence: 0.85
    }
  },
  nav: {
    menu: {
      toggle: ["[aria-label*='menu' i]", ".menu-btn", ".hamburger", "[data-toggle='menu']"],
      items: ["nav a", ".nav-item", "[role='menuitem']"],
      confidence: 0.8
    }
  },
  form: {
    submit: {
      button: ["[type='submit']", "button[form]", ".submit-btn", "[aria-label*='submit' i]"],
      confidence: 0.85
    },
    reset: {
      button: ["[type='reset']", ".reset-btn", "[aria-label*='reset' i]"],
      confidence: 0.8
    }
  }
}

export async function quickDiscovery({ intent_hint, max_results = 5 }) {
  let pageType = (function () {
      let e = window.location.hostname,
        t = document.title.toLowerCase(),
        r = document.querySelector('[type="search"], [role="searchbox"]'),
        a = document.querySelector('[type="password"], [name*="login" i]'),
        o = document.querySelector('[contenteditable="true"], textarea[placeholder*="post" i]')
      return e.includes("twitter") || e.includes("x.com")
        ? "social_media"
        : e.includes("github")
          ? "code_repository"
          : e.includes("google")
            ? "search_engine"
            : o
              ? "content_creation"
              : a
                ? "authentication"
                : r
                  ? "search_interface"
                  : t.includes("shop") || t.includes("store")
                    ? "ecommerce"
                    : "general_website"
    })(),
    stats = (function () {
      let e = document.querySelectorAll("button, input, select, textarea, a"),
        t = Array.from(e).filter((e) => dom.isLikelyVisible(e))
      return {
        total_elements: e.length,
        visible_elements: t.length,
        buttons: t.filter(
          (e) => "BUTTON" === e.tagName || "button" === e.getAttribute("role")
        ).length,
        inputs: t.filter((e) => "INPUT" === e.tagName).length,
        links: t.filter((e) => "A" === e.tagName).length,
        textareas: t.filter((e) => "TEXTAREA" === e.tagName).length,
        selects: t.filter((e) => "SELECT" === e.tagName).length
      }
    })()
  max_results = Math.min(max_results, 5)
  let quickMatches = [],
    method = "quick_discovery"
  try {
    let hostname = window.location.hostname,
      platform = antiDetection.detectAntiDetectionPlatform(hostname)
    if (platform && (intent_hint.includes("post") || intent_hint.includes("tweet"))) {
      let e = await matchAntiDetection(intent_hint, platform)
      e.confidence > 0.9 &&
        ((quickMatches = e.elements.slice(0, 3).map((e) => formatElement(e, !0))),
        (method = "anti_detection_bypass"))
    }
    if (0 === quickMatches.length) {
      let e = await enhancedPatternMatch(intent_hint)
      e.confidence > 0.7 &&
        ((quickMatches = e.elements.slice(0, 3).map((e) => formatElement(e, !0))),
        (method = "enhanced_patterns"))
    }
  } catch (e) {
    console.warn("Enhanced patterns failed:", e)
  }
  0 === quickMatches.length && ((quickMatches = await scanViewport(intent_hint, 3)), (method = "viewport_scan"))
  let intentMatch = (function (intent: string, elements) {
      if (0 === elements.length) return "none"
      let avg = elements.reduce((sum, entry) => sum + entry.conf, 0) / elements.length
      return avg >= 80 ? "high" : avg >= 60 ? "medium" : avg >= 40 ? "low" : "none"
    })(intent_hint, quickMatches),
    suggestedPhase2 = (function (elements, intent) {
      let suggestions = [],
        types = [...new Set(elements.map((e) => e.type))]
      return (
        types.includes("button") && suggestions.push("buttons"),
        (types.includes("input") || types.includes("textarea")) && suggestions.push("forms"),
        types.includes("link") && suggestions.push("navigation"),
        intent.toLowerCase().includes("search") &&
          !suggestions.includes("forms") &&
          suggestions.push("search_elements"),
        suggestions.slice(0, 3)
      )
    })(quickMatches, intent_hint),
    summary = {
      page_type: pageType,
      intent_match: intentMatch,
      element_count: stats,
      viewport_elements: quickMatches.length,
      suggested_phase2: suggestedPhase2,
      anti_detection_platform: antiDetection.detectAntiDetectionPlatform(window.location.hostname)
        ? window.location.hostname
        : null
    }
  return {
    summary,
    quick_matches: quickMatches,
    token_estimate: 50 + 15 * quickMatches.length + 20,
    method
  }
}

async function matchAntiDetection(intentHint, platform) {
  let matches = []
  try {
    let textarea = document.querySelector(platform.selectors.textarea)
    if (textarea && dom.isLikelyVisible(textarea)) {
      let id = registry.registerElement(textarea)
      matches.push({
        id,
        type: "textarea",
        selector: platform.selectors.textarea,
        name: dom.getElementName(textarea),
        confidence: 0.95,
        element: textarea
      })
    }
    let submit = document.querySelector(platform.selectors.submit)
    if (submit && dom.isLikelyVisible(submit)) {
      let id = registry.registerElement(submit)
      matches.push({
        id,
        type: "button",
        selector: platform.selectors.submit,
        name: dom.getElementName(submit),
        confidence: 0.95,
        element: submit
      })
    }
  } catch (e) {
    console.warn("Anti-detection pattern matching failed:", e)
  }
  return {
    elements: matches,
    confidence: matches.length > 0 ? 0.95 : 0,
    method: "anti_detection_patterns",
    platform: window.location.hostname
  }
}

export async function detailedAnalysis({ intent_hint, focus_areas, element_ids, max_results = 10 }) {
  max_results = Math.min(max_results, 7)
  let elements = [],
    method = "detailed_analysis"
  if (element_ids?.length) {
    elements = await hydrateSavedElements(element_ids)
    method = "expanded_matches"
  }
  if (focus_areas?.length) {
    let focusMatches = await scanFocusAreas(focus_areas, intent_hint)
    elements = [...elements, ...focusMatches]
    method = elements.length > 0 ? "focus_area_analysis" : method
  }
  0 === elements.length && ((elements = await fullScan(intent_hint, max_results)), (method = "full_enhanced_analysis"))
  elements = dedupeElements(elements)
  elements = (elements = await enrichElements(elements)).slice(0, max_results).map((e) => formatElement(e, !1))
  return {
    elements,
    interactionReady: elements.every((e) => e.conf > 50),
    method,
    intent_hint
  }
}

async function scanViewport(intentHint, limit = 3) {
  let candidates = document.querySelectorAll('button, input, a[href], [role="button"], textarea'),
    visible = Array.from(candidates)
      .filter((e) => dom.isLikelyVisible(e))
      .slice(0, 10),
    scored = visible.map((element) => {
      let confidence = scoreElement(element, intentHint)
      return {
        element,
        type: dom.inferElementType(element, intentHint),
        name: dom.getElementName(element),
        confidence
      }
    })
  return scored
    .filter((entry) => entry.confidence > 0.3)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit)
    .map((entry) => formatElement(entry, !0))
}

async function hydrateSavedElements(ids: string[]) {
  let hydrated = []
  for (let savedId of ids) {
    let element = registry.getElementById(savedId)
    if (element) {
      let id = registry.registerElement(element)
      hydrated.push({
        id,
        type: dom.inferElementType(element, ""),
        name: dom.getElementName(element),
        confidence: 0.8,
        element
      })
    }
  }
  return hydrated
}

async function scanFocusAreas(areas, intentHint) {
  let results = [],
    selectors = {
      buttons: 'button, [role="button"], input[type="submit"]',
      forms: 'input, textarea, select, [contenteditable="true"]',
      navigation: 'nav a, .nav-item, [role="navigation"] a',
      search_elements: '[type="search"], [role="searchbox"], [placeholder*="search" i]'
    }
  for (let area of areas) {
    let selector = selectors[area]
    if (selector) {
      let matches = document.querySelectorAll(selector)
      for (let element of Array.from(matches).slice(0, 5))
        if (dom.isLikelyVisible(element)) {
          let id = registry.registerElement(element)
          results.push({
            id,
            type: dom.inferElementType(element, intentHint),
            name: dom.getElementName(element),
            confidence: scoreElement(element, intentHint),
            element
          })
        }
    }
  }
  return results
}

async function fullScan(intentHint, limit) {
  let nodes = document.querySelectorAll(`
    button, input, select, textarea, a[href],
    [role="button"], [role="textbox"], [role="searchbox"],
    [aria-label], [data-testid], [contenteditable="true"]
  `)
  let results = Array.from(nodes)
    .filter((element) => dom.isLikelyVisible(element))
    .slice(0, 30)
    .map((element) => {
      let id = registry.registerElement(element)
      return {
        id,
        type: dom.inferElementType(element, intentHint),
        selector: dom.generateSelector(element),
        name: dom.getElementName(element),
        confidence: scoreElement(element, intentHint),
        element
      }
    })
    .filter((entry) => entry.confidence > 0.2)
    .sort((a, b) => b.confidence - a.confidence)
  return results.slice(0, limit)
}

async function enrichElements(elements) {
  return elements.map((entry) => ({
    ...entry,
    meta: dom.getElementMeta(entry.element)
  }))
}

function formatElement(entry, quick = !1) {
  let element = entry.element || entry,
    state = dom.getElementState(element)
  if (!quick)
    return {
      id: entry.id,
      fp: dom.generateFingerprint(element),
      name: entry.name?.substring(0, 30) || "unnamed",
      conf: Math.round(100 * (entry.confidence || 0.5)),
      meta: { ...dom.getElementMeta(element), state }
    }
  {
    let id = registry.registerQuickElement(element)
    return {
      id,
      type: entry.type || "element",
      name: entry.name?.substring(0, 20) || "unnamed",
      conf: Math.round(100 * (entry.confidence || 0.5)),
      selector: entry.selector || "unknown",
      state: state.disabled ? "disabled" : "enabled",
      clickable: state.clickable,
      ready: state.interaction_ready
    }
  }
}

function scoreElement(element, intentHint) {
  let confidence = 0.5,
    name = dom.getElementName(element).toLowerCase(),
    normalizedIntent = intentHint.toLowerCase()
  return (
    name.includes(normalizedIntent) && (confidence += 0.3),
    element.getAttribute("data-testid") && (confidence += 0.2),
    element.getAttribute("aria-label") && (confidence += 0.1),
    Math.min(confidence, 1)
  )
}

function dedupeElements(entries) {
  let seen = new Set()
  return entries.filter((entry) => {
    let key = entry.name + entry.type
    return !seen.has(key) && (seen.add(key), !0)
  })
}

export async function enhancedPatternMatch(intent_hint) {
  let [category, action] = (function (intent) {
      let normalized = intent.toLowerCase()
      return normalized.includes("login") ||
        normalized.includes("sign in") ||
        normalized.includes("log in")
        ? ["auth", "login"]
        : normalized.includes("signup") ||
            normalized.includes("sign up") ||
            normalized.includes("register") ||
            normalized.includes("create account")
          ? ["auth", "signup"]
          : normalized.includes("tweet") ||
              normalized.includes("post") ||
              normalized.includes("compose") ||
              normalized.includes("create") ||
              normalized.includes("write") ||
              normalized.includes("publish")
            ? ["content", "post_create"]
            : normalized.includes("comment") || normalized.includes("reply")
              ? ["content", "comment"]
              : normalized.includes("search") ||
                  normalized.includes("find") ||
                  normalized.includes("look for")
                ? ["search", "global"]
                : normalized.includes("menu") ||
                    normalized.includes("navigation") ||
                    normalized.includes("nav")
                  ? ["nav", "menu"]
                  : normalized.includes("submit") ||
                      normalized.includes("send") ||
                      normalized.includes("save")
                    ? ["form", "submit"]
                    : normalized.includes("reset") ||
                        normalized.includes("clear") ||
                        normalized.includes("cancel")
                      ? ["form", "reset"]
                      : normalized.includes("button") || normalized.includes("click")
                        ? ["form", "submit"]
                        : (normalized.includes("input") ||
                            normalized.includes("field") ||
                            normalized.includes("text"),
                          ["content", "post_create"])
    })(intent_hint),
    pattern = PATTERNS[category]?.[action]
  if (!pattern)
    return (function (intentHint) {
      let normalized = intentHint.toLowerCase(),
        selectors =
          normalized.includes("tweet") ||
          normalized.includes("post") ||
          normalized.includes("compose") ||
          normalized.includes("create") ||
          normalized.includes("write")
            ? [
                "[data-testid='tweetTextarea_0']",
                "[contenteditable='true']",
                "textarea[placeholder*='tweet' i]",
                "textarea[placeholder*='post' i]",
                "textarea[placeholder*='what' i]",
                "[data-text='true']",
                "[role='textbox']",
                "textarea:not([style*='display: none'])"
              ]
            : normalized.includes("login") || normalized.includes("sign in")
              ? [
                  "[type='email']",
                  "[name*='username' i]",
                  "[placeholder*='email' i]",
                  "[placeholder*='username' i]",
                  "input[name*='login' i]"
                ]
              : normalized.includes("signup") || normalized.includes("register")
                ? [
                    "[href*='signup']",
                    ".signup-btn",
                    "[aria-label*='register' i]",
                    "button[data-testid*='signup' i]",
                    "a[href*='register']"
                  ]
                : normalized.includes("search") || normalized.includes("find")
                  ? [
                      "[data-testid='SearchBox_Search_Input']",
                      "[type='search']",
                      "[role='searchbox']",
                      "[placeholder*='search' i]",
                      "[data-testid*='search' i]",
                      "input[name*='search' i]"
                    ]
                  : [
                      "button:not([disabled])",
                      "[contenteditable='true']",
                      "textarea",
                      "[type='submit']",
                      "[role='button']",
                      "input[type='text']"
                    ],
        matches = []
      for (let selector of selectors) {
        let found = document.querySelectorAll(selector)
        for (let element of found)
          if (dom.isLikelyVisible(element)) {
            let id = registry.registerElement(element)
            if (
              (matches.push({
                id,
                type: dom.inferElementType(element, intentHint),
                selector,
                name: dom.getElementName(element),
                confidence: 0.5 + 0.3 * scoreElement(element, intentHint),
                element
              }),
              matches.length >= 3)
            )
              break
          }
        if (matches.length >= 3) break
      }
      return {
        elements: matches,
        confidence: matches.length > 0 ? Math.max(...matches.map((entry) => entry.confidence)) : 0,
        method: "universal_pattern"
      }
    })(intent_hint)
  let elements = (function (entry) {
    let matches = []
    for (let [type, selectors] of Object.entries(entry))
      if ("confidence" !== type && Array.isArray(selectors))
        for (let selector of selectors) {
          let element = document.querySelector(selector)
          if (element && dom.isLikelyVisible(element)) {
            let id = registry.registerElement(element)
            matches.push({
              id,
              type,
              selector,
              name: dom.getElementName(element),
              confidence: entry.confidence || 0.8,
              element
            })
            break
          }
        }
    return matches
  })(pattern)
  return {
    elements: elements.slice(0, 3),
    confidence: pattern.confidence,
    method: "enhanced_pattern_match",
    category,
    action
  }
}
