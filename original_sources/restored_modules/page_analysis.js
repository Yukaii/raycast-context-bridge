function (e, t, r) {
          var a = e("@parcel/transformer-js/src/esmodule-helpers.js");
          (a.defineInteropFlag(r),
            a.export(r, "quickDiscovery", () => s),
            a.export(r, "detailedAnalysis", () => u));
          var o = e("./anti-detection"),
            n = e("./dom-utils"),
            i = e("./registry");
          let l = {
            auth: {
              login: {
                input: [
                  "[type='email']",
                  "[name*='username' i]",
                  "[placeholder*='email' i]",
                  "[name*='login' i]",
                ],
                password: ["[type='password']", "[name*='password' i]"],
                submit: [
                  "[type='submit']",
                  "button[form]",
                  ".login-btn",
                  "[aria-label*='login' i]",
                ],
                confidence: 0.9,
              },
              signup: {
                input: [
                  "[name*='register' i]",
                  "[placeholder*='signup' i]",
                  "[name*='email' i]",
                ],
                submit: [
                  "[href*='signup']",
                  ".signup-btn",
                  "[aria-label*='register' i]",
                ],
                confidence: 0.85,
              },
            },
            content: {
              post_create: {
                textarea: [
                  "[data-testid='tweetTextarea_0']",
                  "[aria-label='Post text']",
                  "[contenteditable='true']",
                  "textarea[placeholder*='post' i]",
                  "[data-text='true']",
                ],
                submit: [
                  "[data-testid='tweetButtonInline']",
                  "[data-testid='tweetButton']",
                  ".post-btn",
                  ".publish-btn",
                  "[aria-label*='post' i]",
                ],
                confidence: 0.95,
              },
              comment: {
                textarea: [
                  "textarea[placeholder*='comment' i]",
                  "[role='textbox']",
                  "[placeholder*='reply' i]",
                ],
                submit: [
                  ".comment-btn",
                  "[aria-label*='comment' i]",
                  "[aria-label*='reply' i]",
                ],
                confidence: 0.8,
              },
            },
            search: {
              global: {
                input: [
                  "[data-testid='SearchBox_Search_Input']",
                  "[type='search']",
                  "[role='searchbox']",
                  "[placeholder*='search' i]",
                  "[name*='search' i]",
                ],
                submit: [
                  "[aria-label*='search' i]",
                  ".search-btn",
                  "button[type='submit']",
                ],
                confidence: 0.85,
              },
            },
            nav: {
              menu: {
                toggle: [
                  "[aria-label*='menu' i]",
                  ".menu-btn",
                  ".hamburger",
                  "[data-toggle='menu']",
                ],
                items: ["nav a", ".nav-item", "[role='menuitem']"],
                confidence: 0.8,
              },
            },
            form: {
              submit: {
                button: [
                  "[type='submit']",
                  "button[form]",
                  ".submit-btn",
                  "[aria-label*='submit' i]",
                ],
                confidence: 0.85,
              },
              reset: {
                button: [
                  "[type='reset']",
                  ".reset-btn",
                  "[aria-label*='reset' i]",
                ],
                confidence: 0.8,
              },
            },
          };
          async function s({ intent_hint: e, max_results: t = 5 }) {
            let r = (function () {
                let e = window.location.hostname,
                  t = document.title.toLowerCase(),
                  r = document.querySelector(
                    '[type="search"], [role="searchbox"]',
                  ),
                  a = document.querySelector(
                    '[type="password"], [name*="login" i]',
                  ),
                  o = document.querySelector(
                    '[contenteditable="true"], textarea[placeholder*="post" i]',
                  );
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
                              : "general_website";
              })(),
              a = (function () {
                let e = document.querySelectorAll(
                    "button, input, select, textarea, a[href]",
                  ),
                  t = Array.from(e).filter((e) => (0, n.isLikelyVisible)(e));
                return {
                  buttons: t.filter(
                    (e) =>
                      "BUTTON" === e.tagName ||
                      "button" === e.getAttribute("role"),
                  ).length,
                  inputs: t.filter((e) => "INPUT" === e.tagName).length,
                  links: t.filter((e) => "A" === e.tagName).length,
                  textareas: t.filter((e) => "TEXTAREA" === e.tagName).length,
                  selects: t.filter((e) => "SELECT" === e.tagName).length,
                };
              })();
            t = Math.min(t, 5);
            let i = [],
              l = "quick_discovery";
            try {
              let t = window.location.hostname,
                r = (0, o.detectAntiDetectionPlatform)(t);
              if (r && (e.includes("post") || e.includes("tweet"))) {
                let t = await c(e, r);
                t.confidence > 0.9 &&
                  ((i = t.elements.slice(0, 3).map((e) => f(e, !0))),
                  (l = "anti_detection_bypass"));
              }
              if (0 === i.length) {
                let t = await y(e);
                t.confidence > 0.7 &&
                  ((i = t.elements.slice(0, 3).map((e) => f(e, !0))),
                  (l = "enhanced_patterns"));
              }
            } catch (e) {
              console.warn("Enhanced patterns failed:", e);
            }
            0 === i.length && ((i = await d(e, 3)), (l = "viewport_scan"));
            let s = (function (e, t) {
                if (0 === t.length) return "none";
                let r = t.reduce((e, t) => e + t.conf, 0) / t.length;
                return r >= 80
                  ? "high"
                  : r >= 60
                    ? "medium"
                    : r >= 40
                      ? "low"
                      : "none";
              })(0, i),
              u = (function (e, t) {
                let r = [],
                  a = [...new Set(e.map((e) => e.type))];
                return (
                  a.includes("button") && r.push("buttons"),
                  (a.includes("input") || a.includes("textarea")) &&
                    r.push("forms"),
                  a.includes("link") && r.push("navigation"),
                  t.toLowerCase().includes("search") &&
                    !r.includes("forms") &&
                    r.push("search_elements"),
                  r.slice(0, 3)
                );
              })(i, e),
              p = {
                summary: {
                  page_type: r,
                  intent_match: s,
                  element_count: a,
                  viewport_elements: i.length,
                  suggested_phase2: u,
                  anti_detection_platform: (0, o.detectAntiDetectionPlatform)(
                    window.location.hostname,
                  )
                    ? window.location.hostname
                    : null,
                },
                quick_matches: i,
                token_estimate: 50 + 15 * i.length + 20,
                method: l,
              };
            return p;
          }
          async function c(e, t) {
            let r = [];
            try {
              let e = document.querySelector(t.selectors.textarea);
              if (e && (0, n.isLikelyVisible)(e)) {
                let a = (0, i.registerElement)(e);
                r.push({
                  id: a,
                  type: "textarea",
                  selector: t.selectors.textarea,
                  name: (0, n.getElementName)(e),
                  confidence: 0.95,
                  element: e,
                });
              }
              let a = document.querySelector(t.selectors.submit);
              if (a && (0, n.isLikelyVisible)(a)) {
                let e = (0, i.registerElement)(a);
                r.push({
                  id: e,
                  type: "button",
                  selector: t.selectors.submit,
                  name: (0, n.getElementName)(a),
                  confidence: 0.95,
                  element: a,
                });
              }
            } catch (e) {
              console.warn("Anti-detection pattern matching failed:", e);
            }
            return {
              elements: r,
              confidence: r.length > 0 ? 0.95 : 0,
              method: "anti_detection_patterns",
              platform: window.location.hostname,
            };
          }
          async function u({
            intent_hint: e,
            focus_areas: t,
            element_ids: r,
            max_results: a = 10,
          }) {
            a = Math.min(a, 7);
            let o = [],
              n = "detailed_analysis";
            if (
              (r?.length && ((o = await p(r)), (n = "expanded_matches")),
              t?.length)
            ) {
              let r = await m(t, e);
              n = (o = [...o, ...r]).length > 0 ? "focus_area_analysis" : n;
            }
            (0 === o.length &&
              ((o = await h(e, a)), (n = "full_enhanced_analysis")),
              (o = (function (e) {
                let t = new Set();
                return e.filter((e) => {
                  let r = e.name + e.type;
                  return !t.has(r) && (t.add(r), !0);
                });
              })(o)),
              (o = (o = await g(o)).slice(0, a).map((e) => f(e, !1))));
            let i = {
              elements: o,
              interactionReady: o.every((e) => e.conf > 50),
              method: n,
              intent_hint: e,
            };
            return i;
          }
          async function d(e, t = 3) {
            let r = document.querySelectorAll(
                'button, input, a[href], [role="button"], textarea',
              ),
              a = Array.from(r)
                .filter((e) => (0, n.isLikelyVisible)(e))
                .slice(0, 10),
              o = a.map((t) => {
                let r = b(t, e);
                return {
                  element: t,
                  type: (0, n.inferElementType)(t, e),
                  name: (0, n.getElementName)(t),
                  confidence: r,
                };
              });
            return o
              .filter((e) => e.confidence > 0.3)
              .sort((e, t) => t.confidence - e.confidence)
              .slice(0, t)
              .map((e) => f(e, !0));
          }
          async function p(e) {
            let t = [];
            for (let r of e) {
              let e = (0, i.getElementById)(r);
              if (e) {
                let r = (0, i.registerElement)(e);
                t.push({
                  id: r,
                  type: (0, n.inferElementType)(e, ""),
                  name: (0, n.getElementName)(e),
                  confidence: 0.8,
                  element: e,
                });
              }
            }
            return t;
          }
          async function m(e, t) {
            let r = [],
              a = {
                buttons: 'button, [role="button"], input[type="submit"]',
                forms: 'input, textarea, select, [contenteditable="true"]',
                navigation: 'nav a, .nav-item, [role="navigation"] a',
                search_elements:
                  '[type="search"], [role="searchbox"], [placeholder*="search" i]',
              };
            for (let o of e) {
              let e = a[o];
              if (e) {
                let a = document.querySelectorAll(e);
                for (let e of Array.from(a).slice(0, 5))
                  if ((0, n.isLikelyVisible)(e)) {
                    let a = (0, i.registerElement)(e);
                    r.push({
                      id: a,
                      type: (0, n.inferElementType)(e, t),
                      name: (0, n.getElementName)(e),
                      confidence: b(e, t),
                      element: e,
                    });
                  }
              }
            }
            return r;
          }
          async function h(e, t) {
            let r = document.querySelectorAll(`
    button, input, select, textarea, a[href],
    [role="button"], [role="textbox"], [role="searchbox"],
    [aria-label], [data-testid], [contenteditable="true"]
  `),
              a = Array.from(r)
                .filter((e) => (0, n.isLikelyVisible)(e))
                .slice(0, 30)
                .map((t) => {
                  let r = (0, i.registerElement)(t);
                  return {
                    id: r,
                    type: (0, n.inferElementType)(t, e),
                    selector: (0, n.generateSelector)(t),
                    name: (0, n.getElementName)(t),
                    confidence: b(t, e),
                    element: t,
                  };
                })
                .filter((e) => e.confidence > 0.2)
                .sort((e, t) => t.confidence - e.confidence);
            return a.slice(0, t);
          }
          async function g(e) {
            return e.map((e) => ({
              ...e,
              meta: (0, n.getElementMeta)(e.element),
            }));
          }
          function f(e, t = !1) {
            let r = e.element || e,
              a = (0, n.getElementState)(r);
            if (!t)
              return {
                id: e.id,
                fp: (0, n.generateFingerprint)(r),
                name: e.name?.substring(0, 30) || "unnamed",
                conf: Math.round(100 * (e.confidence || 0.5)),
                meta: { ...(0, n.getElementMeta)(r), state: a },
              };
            {
              let t = (0, i.registerQuickElement)(r);
              return {
                id: t,
                type: e.type || "element",
                name: e.name?.substring(0, 20) || "unnamed",
                conf: Math.round(100 * (e.confidence || 0.5)),
                selector: e.selector || "unknown",
                state: a.disabled ? "disabled" : "enabled",
                clickable: a.clickable,
                ready: a.interaction_ready,
              };
            }
          }
          function b(e, t) {
            let r = 0.5,
              a = (0, n.getElementName)(e).toLowerCase(),
              o = t.toLowerCase();
            return (
              a.includes(o) && (r += 0.3),
              e.getAttribute("data-testid") && (r += 0.2),
              e.getAttribute("aria-label") && (r += 0.1),
              Math.min(r, 1)
            );
          }
          async function y(e) {
            let [t, r] = (function (e) {
                let t = e.toLowerCase();
                return t.includes("login") ||
                  t.includes("sign in") ||
                  t.includes("log in")
                  ? ["auth", "login"]
                  : t.includes("signup") ||
                      t.includes("sign up") ||
                      t.includes("register") ||
                      t.includes("create account")
                    ? ["auth", "signup"]
                    : t.includes("tweet") ||
                        t.includes("post") ||
                        t.includes("compose") ||
                        t.includes("create") ||
                        t.includes("write") ||
                        t.includes("publish")
                      ? ["content", "post_create"]
                      : t.includes("comment") || t.includes("reply")
                        ? ["content", "comment"]
                        : t.includes("search") ||
                            t.includes("find") ||
                            t.includes("look for")
                          ? ["search", "global"]
                          : t.includes("menu") ||
                              t.includes("navigation") ||
                              t.includes("nav")
                            ? ["nav", "menu"]
                            : t.includes("submit") ||
                                t.includes("send") ||
                                t.includes("save")
                              ? ["form", "submit"]
                              : t.includes("reset") ||
                                  t.includes("clear") ||
                                  t.includes("cancel")
                                ? ["form", "reset"]
                                : t.includes("button") || t.includes("click")
                                  ? ["form", "submit"]
                                  : (t.includes("input") ||
                                      t.includes("field") ||
                                      t.includes("text"),
                                    ["content", "post_create"]);
              })(e),
              a = l[t]?.[r];
            if (!a)
              return (function (e) {
                let t = e.toLowerCase(),
                  r = [];
                r =
                  t.includes("tweet") ||
                  t.includes("post") ||
                  t.includes("compose") ||
                  t.includes("create") ||
                  t.includes("write")
                    ? [
                        "[data-testid='tweetTextarea_0']",
                        "[contenteditable='true']",
                        "textarea[placeholder*='tweet' i]",
                        "textarea[placeholder*='post' i]",
                        "textarea[placeholder*='what' i]",
                        "[data-text='true']",
                        "[role='textbox']",
                        "textarea:not([style*='display: none'])",
                      ]
                    : t.includes("login") || t.includes("sign in")
                      ? [
                          "[type='email']",
                          "[name*='username' i]",
                          "[placeholder*='email' i]",
                          "[placeholder*='username' i]",
                          "input[name*='login' i]",
                        ]
                      : t.includes("signup") || t.includes("register")
                        ? [
                            "[href*='signup']",
                            ".signup-btn",
                            "[aria-label*='register' i]",
                            "button[data-testid*='signup' i]",
                            "a[href*='register']",
                          ]
                        : t.includes("search") || t.includes("find")
                          ? [
                              "[data-testid='SearchBox_Search_Input']",
                              "[type='search']",
                              "[role='searchbox']",
                              "[placeholder*='search' i]",
                              "[data-testid*='search' i]",
                              "input[name*='search' i]",
                            ]
                          : [
                              "button:not([disabled])",
                              "[contenteditable='true']",
                              "textarea",
                              "[type='submit']",
                              "[role='button']",
                              "input[type='text']",
                            ];
                let a = [];
                for (let t of r) {
                  let r = document.querySelectorAll(t);
                  for (let o of r)
                    if ((0, n.isLikelyVisible)(o)) {
                      let r = (0, i.registerElement)(o);
                      if (
                        (a.push({
                          id: r,
                          type: (0, n.inferElementType)(o, e),
                          selector: t,
                          name: (0, n.getElementName)(o),
                          confidence: 0.5 + 0.3 * b(o, e),
                          element: o,
                        }),
                        a.length >= 3)
                      )
                        break;
                    }
                  if (a.length >= 3) break;
                }
                return {
                  elements: a,
                  confidence:
                    a.length > 0 ? Math.max(...a.map((e) => e.confidence)) : 0,
                  method: "universal_pattern",
                };
              })(e);
            let o = (function (e) {
              let t = [];
              for (let [r, a] of Object.entries(e))
                if ("confidence" !== r && Array.isArray(a))
                  for (let o of a) {
                    let a = document.querySelector(o);
                    if (a && (0, n.isLikelyVisible)(a)) {
                      let l = (0, i.registerElement)(a);
                      t.push({
                        id: l,
                        type: r,
                        selector: o,
                        name: (0, n.getElementName)(a),
                        confidence: e.confidence || 0.8,
                        element: a,
                      });
                      break;
                    }
                  }
              return t;
            })(a);
            return {
              elements: o.slice(0, 3),
              confidence: a.confidence,
              method: "enhanced_pattern_match",
              category: t,
              action: r,
            };
          }
        })
