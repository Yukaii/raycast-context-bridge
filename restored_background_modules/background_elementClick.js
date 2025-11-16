function (e, t, r) {
  var s = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (s.defineInteropFlag(r), s.export(r, "elementClick", () => o));
  var a = e("../utils");
  async function o(e) {
    return await (0, a.sendToContentScript)({
      name: "elementClick",
      body: { ...e, target: "content-script" },
    });
  }
})
