function (e, t, r) {
  var s = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (s.defineInteropFlag(r), s.export(r, "executeJS", () => o));
  var a = e("../utils");
  async function o({ script: e, tabId: t }) {
    return await (0, a.sendToContentScript)({
      name: "executeJS",
      body: { script: e, target: "user-script" },
      tabId: t,
    });
  }
  globalThis.browser?.tabs || globalThis.chrome?.tabs;
})
