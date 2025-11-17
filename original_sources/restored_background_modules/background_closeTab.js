function (e, t, r) {
  var s = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (s.defineInteropFlag(r), s.export(r, "closeTab", () => o));
  let a = globalThis.browser?.tabs || globalThis.chrome?.tabs;
  async function o({ tabId: e, action: t }) {
    if (!e) {
      let [t] = await a.query({ active: !0, currentWindow: !0 });
      if (!t) throw Error("No active tab found");
      e = t.id;
    }
    let r = await a.get(e);
    if (!r) throw Error(`Tab with id ${e} not found`);
    let s = [];
    switch (t) {
      case void 0:
      case "self":
        s = [r];
        break;
      case "other":
        s = (await a.query({ windowId: r.windowId })).filter(
          (t) => t.id !== e && void 0 !== t.id,
        );
        break;
      case "duplicate":
        s = (await a.query({ windowId: r.windowId })).filter(
          (t) => t.id !== e && void 0 !== t.id && t.url == t.url,
        );
        break;
      case "left":
        s = (await a.query({ windowId: r.windowId })).filter(
          (t) => t.id !== e && void 0 !== t.id && t.index < t.index,
        );
        break;
      case "right":
        s = (await a.query({ windowId: r.windowId })).filter(
          (t) => t.id !== e && void 0 !== t.id && t.index > t.index,
        );
      default:
        throw Error(`Unknown ${t} action`);
    }
    return (
      await a.remove(s.map((e) => e.id)),
      {
        success: !0,
        closedTabs: s.map((e) => ({
          tabId: e.id,
          title: e.title,
          url: e.url,
        })),
        count: s.length,
      }
    );
  }
})
