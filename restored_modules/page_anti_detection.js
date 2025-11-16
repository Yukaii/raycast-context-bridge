function (e, t, r) {
          var a = e("@parcel/transformer-js/src/esmodule-helpers.js");
          (a.defineInteropFlag(r),
            a.export(r, "detectAntiDetectionPlatform", () => i),
            a.export(r, "shouldUseBypass", () => l),
            a.export(r, "executeDirectBypass", () => s));
          var o = e("./dom-utils");
          let n = {
            "twitter.com": {
              selectors: {
                textarea: "[data-testid='tweetTextarea_0']",
                submit:
                  "[data-testid='tweetButtonInline'], [data-testid='tweetButton']",
              },
              bypassMethod: "twitter_direct",
            },
            "x.com": {
              selectors: {
                textarea: "[data-testid='tweetTextarea_0']",
                submit:
                  "[data-testid='tweetButtonInline'], [data-testid='tweetButton']",
              },
              bypassMethod: "twitter_direct",
            },
            "linkedin.com": {
              selectors: {
                textarea: "[contenteditable='true'][role='textbox']",
                submit: "[data-control-name='share.post']",
              },
              bypassMethod: "linkedin_direct",
            },
            "facebook.com": {
              selectors: {
                textarea: "[contenteditable='true'][data-text='true']",
                submit: "[data-testid='react-composer-post-button']",
              },
              bypassMethod: "facebook_direct",
            },
          };
          function i(e) {
            if (n[e]) return n[e];
            for (let [t, r] of Object.entries(n))
              if (e.includes(t) || e.endsWith(`.${t}`)) return r;
            return null;
          }
          function l(e, t) {
            try {
              let r = document.querySelector(t.selectors.textarea) === e;
              if (r) return !0;
              let a = t.selectors.textarea.split(", ");
              return a.some((t) => {
                try {
                  return e.matches(t);
                } catch {
                  return !1;
                }
              });
            } catch (e) {
              return (console.warn("Bypass detection failed:", e), !1);
            }
          }
          async function s(e, t, r, a) {
            try {
              switch (
                (console.log(`\ud83d Executing ${r.bypassMethod} bypass`),
                r.bypassMethod)
              ) {
                case "twitter_direct":
                  return await c(e, t, a);
                case "linkedin_direct":
                  return await u(e, t, a);
                case "facebook_direct":
                  return await d(e, t, a);
                default:
                  return await p(e, t, a);
              }
            } catch (e) {
              return (
                console.error(
                  "Direct bypass failed, falling back to standard method:",
                  e,
                ),
                await (0, o.fillElementStandard)({
                  elementId: a,
                  value: t,
                  clearFirst: !0,
                  forceFocus: !0,
                })
              );
            }
          }
          async function c(e, t, r) {
            (console.log(
              "\uD83D\uDC26 Twitter direct bypass - focus+click+execCommand",
            ),
              e.scrollIntoView({ behavior: "smooth", block: "center" }),
              await new Promise((e) => setTimeout(e, 200)),
              e.focus(),
              e.click());
            let a = document.execCommand("insertText", !1, t);
            await new Promise((e) => setTimeout(e, 500));
            let n = e.textContent || e.value || "",
              i = n.includes(t);
            return {
              success: i,
              error: "Could not set the value. Current value: " + n,
              element_id: r,
              value: t,
              actual_value: n,
              method: "twitter_direct_bypass",
              execCommand_result: a,
              element_name: (0, o.getElementName)(e),
            };
          }
          async function u(e, t, r) {
            (console.log("\uD83D\uDCBC LinkedIn direct bypass"),
              e.scrollIntoView({ behavior: "smooth", block: "center" }),
              await new Promise((e) => setTimeout(e, 200)),
              e.focus(),
              e.click(),
              e.textContent &&
                (document.execCommand("selectAll"),
                document.execCommand("delete")));
            let a = document.execCommand("insertText", !1, t);
            await new Promise((e) => setTimeout(e, 800));
            let n = e.textContent || e.value || "",
              i = n.includes(t);
            return {
              success: i,
              error: "Could not set the value. Current value: " + n,
              element_id: r,
              value: t,
              actual_value: n,
              method: "linkedin_direct_bypass",
              execCommand_result: a,
              element_name: (0, o.getElementName)(e),
            };
          }
          async function d(e, t, r) {
            (console.log("\uD83D\uDCD8 Facebook direct bypass"),
              e.scrollIntoView({ behavior: "smooth", block: "center" }),
              await new Promise((e) => setTimeout(e, 200)),
              e.focus(),
              e.click(),
              e.textContent &&
                (document.execCommand("selectAll"),
                document.execCommand("delete")));
            let a = document.execCommand("insertText", !1, t);
            (e.dispatchEvent(new Event("input", { bubbles: !0 })),
              e.dispatchEvent(new Event("change", { bubbles: !0 })),
              await new Promise((e) => setTimeout(e, 600)));
            let n = e.textContent || e.value || "",
              i = n.includes(t);
            return {
              success: i,
              error: "Could not set the value. Current value: " + n,
              element_id: r,
              value: t,
              actual_value: n,
              method: "facebook_direct_bypass",
              execCommand_result: a,
              element_name: (0, o.getElementName)(e),
            };
          }
          async function p(e, t, r) {
            (console.log("\uD83D\uDD27 Generic direct bypass"),
              e.scrollIntoView({ behavior: "smooth", block: "center" }),
              await new Promise((e) => setTimeout(e, 200)),
              e.focus(),
              e.click());
            let a = document.execCommand("insertText", !1, t);
            await new Promise((e) => setTimeout(e, 500));
            let n = e.textContent || e.value || "",
              i = n.includes(t);
            return {
              success: i,
              error: "Could not set the value. Current value: " + n,
              element_id: r,
              value: t,
              actual_value: n,
              method: "generic_direct_bypass",
              execCommand_result: a,
              element_name: (0, o.getElementName)(e),
            };
          }
        })
