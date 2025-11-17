function (e, t, r) {
  var s = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (s.defineInteropFlag(r), s.export(r, "createTab", () => n));
  var a = e("../utils");
  let o = globalThis.browser?.tabs || globalThis.chrome?.tabs;
  async function n(e) {
    let { url: t, active: r = !0, waitFor: s, timeout: n = 1e4 } = e,
      i = await o.create({ active: r, url: t });
    if (t && s)
      try {
        await (0, a.waitForElement)(i.id, s, n);
      } catch (e) {
        return {
          success: !0,
          tabId: i.id,
          url: i.url,
          warning: `Tab created but wait condition failed: ${e.message}`,
        };
      }
    return {
      success: !0,
      tabId: i.id,
      url: i.url,
      active: i.active,
      title: i.title || "New Tab",
    };
  }
})
