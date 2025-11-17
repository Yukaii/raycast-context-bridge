function (e, t, r) {
  var s = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (s.defineInteropFlag(r), s.export(r, "getTab", () => o));
  var a = e("../utils");
  async function o({ field: e, format: t, selector: r, tabId: s }) {
    return {
      value: (
        await (0, a.sendToContentScript)({
          name: "getTab",
          body: {
            field: e,
            selector: r,
            format: t,
            target: "content-script",
          },
          tabId: s,
        })
      ).result,
    };
  }
})
