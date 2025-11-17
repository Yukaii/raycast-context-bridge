function (e, t, r) {
  var s = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (s.defineInteropFlag(r),
    s.export(r, "sendToContentScript", () => o),
    s.export(r, "waitForElement", () => n));
  var a = e("@plasmohq/messaging");
  async function o({ name: e, body: t, tabId: r }) {
    try {
      let s = await (0, a.sendToContentScript)({
        name: e,
        body: t,
        tabId: r,
      });
      if (!s)
        throw Error(
          "Could not establish connection. Receiving end does not exist.",
        );
      let { success: o, error: n } = s;
      if (!o) throw Error(n);
      return s;
    } catch (e) {
      if ((console.log(e), e instanceof Error)) {
        if (
          "Could not establish connection. Receiving end does not exist." ===
          e.message
        )
          throw Error(
            "Access to this page is restricted. Try to reload the page",
          );
        throw e;
      }
      throw Error(e);
    }
  }
  async function n(e, t, r = 5e3) {
    let s = Date.now();
    for (; Date.now() - s < r; ) {
      try {
        let r = await o({
          name: "waitFor",
          body: {
            condition_type: "element_visible",
            selector: t,
            timeout: 1e3,
            target: "content-script",
          },
          tabId: e,
        });
        if (r.success) return !0;
      } catch (e) {}
      await new Promise((e) => setTimeout(e, 500));
    }
    throw Error(`Timeout waiting for element: ${t}`);
  }
})
