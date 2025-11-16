function (e, t, r) {
  var a = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (a.defineInteropFlag(r), a.export(r, "config", () => d));
  var o = e("@plasmohq/messaging"),
    n = e("@plasmohq/messaging/message"),
    i = e("./content-extraction"),
    l = e("./pageAnalysis/registry"),
    s = e("./pageAnalysis/dom-utils"),
    c = e("./pageAnalysis/anti-detection"),
    u = e("./pageAnalysis/analysis");
  let d = { matches: ["<all_urls>"] };
  ((0, o.sendToBackground)({ name: "ping" }),
    (0, n.listen)(async (e, t) => {
      if (e.body.target && "content-script" === e.body.target)
        try {
          switch (e.name) {
            case "getTab":
              return await p(e, t);
            case "elementClick":
              return await m(e, t);
            case "elementFill":
              return await f(e, t);
            case "elementGetState":
              return await g(e, t);
            case "pageAnalysis":
              return await b(e, t);
            case "waitFor":
              return await h(e, t);
            default:
              throw Error('Unknown request name "' + e.name + '"');
          }
        } catch (e) {
          (console.error(e), t.send({ success: !1, error: e.message }));
        }
    }));
  let p = async (e, t) => {
      switch (e.body?.field) {
        case "title":
          t.send({ result: document.title, success: !0 });
          return;
        case "url":
          t.send({ result: location.href, success: !0 });
          return;
        case "content":
          if (e.body?.selector) {
            t.send({
              result: await (0, i.selector).getContent(
                location.href,
                document,
                { selector: e.body.selector, format: e.body.format },
              ),
              success: !0,
            });
            return;
          }
          if (await (0, i.youtube).match(location.href)) {
            t.send({
              result: await (0, i.youtube).getContent(
                location.href,
                document,
                { format: e.body.format },
              ),
              success: !0,
            });
            return;
          }
          t.send({
            result: await (0, i.generic).getContent(
              location.href,
              document,
              { format: e.body.format },
            ),
            success: !0,
          });
          return;
        default:
          throw Error('Unknown field "' + e.body?.field + '"');
      }
    },
    m = async (e, t) => {
      let {
          elementId: r,
          clickType: a = "left",
          waitAfter: o = 500,
        } = e.body,
        n = (0, l.getElementById)(r);
      if (!n) throw Error(`Element not found: ${r}`);
      (n.scrollIntoView({ behavior: "smooth", block: "center" }),
        await new Promise((e) => setTimeout(e, 200)),
        "right" === a
          ? n.dispatchEvent(
              new MouseEvent("contextmenu", { bubbles: !0 }),
            )
          : "click" in n && "function" == typeof n.click && n.click(),
        await new Promise((e) => setTimeout(e, o)),
        t.send({
          success: !0,
          elementId: r,
          clickType: a,
          element_name: (0, s.getElementName)(n),
        }));
    },
    h = async (e, t) => {
      let {
          conditionType: r,
          selector: a,
          text: o,
          timeout: n = 5e3,
        } = e.body,
        i = Date.now(),
        l = {
          element_visible: () => {
            let e = document.querySelector(a);
            return e && null !== e.offsetParent;
          },
          text_present: () => document.body.textContent.includes(o),
        }[r];
      if (!l) throw Error(`Unknown condition type: ${r}`);
      for (; Date.now() - i < n; ) {
        if (l()) {
          t.send({
            success: !0,
            condition_met: !0,
            wait_time: Date.now() - i,
          });
          return;
        }
        await new Promise((e) => setTimeout(e, 100));
      }
      throw Error(`Timeout waiting for condition: ${r}`);
    },
    g = async (e, t) => {
      let { elementId: r } = e.body,
        a = (0, l.getElementById)(r);
      if (!a) throw Error(`Element not found: ${r}`);
      t.send({
        success: !0,
        element_id: r,
        element_name: (0, s.getElementName)(a),
        state: (0, s.getElementState)(a),
        current_value: (0, s.getElementValue)(a),
      });
    },
    f = async (e, t) => {
      let {
          elementId: r,
          value: a,
          clearFirst: o = !0,
          forceFocus: n = !0,
        } = e.body,
        i = (0, l.getElementById)(r);
      if (!i) throw Error(`Element not found: ${r}`);
      let u = window.location.hostname,
        d = (0, c.detectAntiDetectionPlatform)(u);
      d && (0, c.shouldUseBypass)(i, d)
        ? (console.log(
            `\ud83c Using ${d.bypassMethod} bypass for ${u}`,
          ),
          t.send({
            success: !0,
            ...(await (0, c.executeDirectBypass)(i, a, d, r)),
          }))
        : (console.log("\uD83D\uDD27 Using standard fill method"),
          t.send({
            success: !0,
            ...(await (0, s.fillElementStandard)({
              elementId: r,
              value: a,
              clearFirst: o,
              forceFocus: n,
            })),
          }));
    },
    b = async (e, t) => {
      let {
          intentHint: r,
          phase: a = "discover",
          focusAreas: o,
          elementIds: n,
          maxResults: i = 5,
        } = e.body,
        l =
          "discover" === a
            ? await (0, u.quickDiscovery)({
                intent_hint: r,
                max_results: i,
              })
            : await (0, u.detailedAnalysis)({
                intent_hint: r,
                focus_areas: o,
                element_ids: n,
                max_results: i,
              });
      t.send({
        success: !0,
        ...l,
        stringifiedResult: JSON.stringify(l, null, 2),
      });
    };
})
