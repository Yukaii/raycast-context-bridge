function (e, t, r) {
  var s = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (s.defineInteropFlag(r), s.export(r, "duplicateTab", () => o));
  let a = globalThis.browser?.tabs || globalThis.chrome?.tabs;
  async function o({ tabId: e }) {
    let t = await a.get(e);
    if (!t) throw Error(`Tab with id ${e} not found`);
    let r = await a.duplicate(t.id);
    return {
      success: !0,
      tabId: r.id,
      url: r.url,
      active: r.active,
      title: r.title || "New Tab",
    };
  }
})
