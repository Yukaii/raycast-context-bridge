function (e, t, r) {
  var s = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (s.defineInteropFlag(r), s.export(r, "addBookmark", () => o));
  let a = globalThis.browser?.bookmarks || globalThis.chrome?.bookmarks;
  async function o(e) {
    let { title: t, url: r, parentId: s } = e,
      o = await a.create({ title: t, url: r, parentId: s });
    return { success: !0, bookmark: o };
  }
})
