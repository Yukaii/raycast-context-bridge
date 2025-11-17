function (e, t, r) {
  var s = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (s.defineInteropFlag(r), s.export(r, "pageNavigate", () => n));
  var a = e("../utils");
  let o = globalThis.browser?.tabs || globalThis.chrome?.tabs;
  async function n(e) {
    let { url: t, waitFor: r, timeout: s = 1e4 } = e;
    if ((await o.update({ url: t }), r))
      try {
        await (0, a.waitForElement)(void 0, r, s);
      } catch (e) {
        return {
          success: !0,
          url: t,
          warning: `Navigation completed but wait condition failed: ${e.message}`,
        };
      }
    return { success: !0, url: t };
  }
})
