function (e, t, r) {
  var s = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (s.defineInteropFlag(r), s.export(r, "elementGetState", () => o));
  var a = e("../utils");
  async function o(e) {
    return await (0, a.sendToContentScript)({
      name: "elementGetState",
      body: { ...e, target: "content-script" },
    });
  }
})
