function (e, t, r) {
  var s = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (s.defineInteropFlag(r), s.export(r, "getBookmarks", () => o));
  let a = globalThis.browser?.bookmarks || globalThis.chrome?.bookmarks;
  async function o(e) {
    let t;
    return {
      success: !0,
      bookmarks: (t = e.query
        ? await a.search(e.query)
        : await a.getTree()),
      count: t.length,
    };
  }
})
