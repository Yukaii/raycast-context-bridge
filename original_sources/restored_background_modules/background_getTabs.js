function (e, t, r) {
  var s = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (s.defineInteropFlag(r), s.export(r, "getTabs", () => o));
  let a = globalThis.browser?.tabs || globalThis.chrome?.tabs;
  async function o(e) {
    return {
      value: (
        await a.query({
          url: "<all_urls>",
          currentWindow: e.currentWindow,
        })
      )
        .map((e) => ({
          favicon: e.favIconUrl,
          title: e.title,
          url: e.url,
          tabId: e.id,
          active: e.active,
          windowId: e.windowId,
          pinned: e.pinned,
          incognito: e.incognito,
        }))
        .filter(
          (e) =>
            void 0 !== e.tabId &&
            (void 0 === a.TAB_ID_NONE || e.tabId !== a.TAB_ID_NONE),
        ),
    };
  }
})
