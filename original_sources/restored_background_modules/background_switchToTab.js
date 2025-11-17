function (e, t, r) {
  var s = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (s.defineInteropFlag(r), s.export(r, "switchToTab", () => n));
  let a = globalThis.browser?.tabs || globalThis.chrome?.tabs,
    o = globalThis.browser?.windows || globalThis.chrome?.windows;
  async function n({ tabId: e }) {
    let t = await a.get(e);
    if (!t) throw Error(`Tab with id ${e} not found`);
    return (
      await a.update(e, { active: !0 }),
      await o.update(t.windowId, { focused: !0 }),
      { success: !0, tabId: e, title: t.title, url: t.url }
    );
  }
})
