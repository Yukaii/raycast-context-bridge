function (e, t, r) {
  var s = e("@parcel/transformer-js/src/esmodule-helpers.js");
  e("@plasmohq/messaging/background");
  var a = e("@raycast/app"),
    o = e("raw:~/assets/logo.png"),
    n = s.interopDefault(o),
    i = e("url:~/userScripts/index.ts"),
    l = s.interopDefault(i),
    c = e("@plasmohq/storage"),
    u = e("./methods");
  let d = new c.Storage(),
    p = globalThis.browser?.runtime || globalThis.chrome?.runtime,
    h = globalThis.browser?.windows || globalThis.chrome?.windows,
    f = globalThis.browser?.action || globalThis.chrome?.action,
    m = globalThis.browser?.tabs || globalThis.chrome?.tabs,
    g = globalThis.browser?.scripting || globalThis.chrome?.scripting;
  function b() {
    let e = {
      methods: { ...u, getFocusedTab: u.getTab },
      onOpen(e) {
        (0, a.sendNotification)(e, "whoami", {
          name: "browserExtension",
          target: "chrome-mv3",
          userAgent: navigator.userAgent,
        });
      },
      debug: !0,
      keepConnectionAlive: !0,
      retryConnection: !0,
    };
    d.get("raycast-connect-to-all-flavour").then((t) => {
      (0, a.connect)({
        ...e,
        flavour: t ? void 0 : a.RaycastFlavour.Release,
      });
    });
  }
  async function w(e) {
    return "install" === e;
  }
  (h.onFocusChanged.addListener((e) => {
    e !== h.WINDOW_ID_NONE &&
      (b(),
      (0, a.sendNotificationToAll)("browserDidFocus", {
        userAgent: navigator.userAgent,
        target: "chrome-mv3",
      }));
  }),
    m.onActivated.addListener((e) => {
      e.windowId !== h.WINDOW_ID_NONE &&
        (b(),
        (0, a.sendNotificationToAll)("browserDidFocus", {
          userAgent: navigator.userAgent,
          target: "chrome-mv3",
        }));
    }),
    h.getCurrent().then((e) => {
      b();
    }),
    d.isWatchSupported() &&
      d.watch({
        "raycast-connect-to-all-flavour": () => {
          ((0, a.disconnect)(), b());
        },
      }),
    p.onInstalled.addListener(async () => {
      for (let e of p.getManifest().content_scripts)
        for (let t of await m.query({ url: e.matches }))
          g.executeScript({
            target: { tabId: t.id },
            files: e.js,
          }).catch((e) => {
            console.log(e);
          });
    }),
    void 0 !== f &&
      (f.setIcon({ path: n.default }),
      f.onClicked.addListener(() => {
        let e = (0, a.sendNotificationToAll)("browserActionClicked");
        e ||
          m.create({
            url: "https://www.raycast.com/browser-extension?installed=true",
          });
      })),
    p.onInstalled.addListener(async function (e) {
      ((await w(e.reason)) &&
        (m.create({
          url: "https://www.raycast.com/browser-extension?installed=true",
        }),
        await d.set("installed", !0)),
        (function () {
          if (
            !(function () {
              try {
                return (
                  globalThis.browser?.userScripts ||
                    globalThis.chrome?.userScripts,
                  !0
                );
              } catch {
                return !1;
              }
            })()
          )
            return;
          let e =
            globalThis.browser?.userScripts ||
            globalThis.chrome?.userScripts;
          e.configureWorld({
            messaging: !0,
            csp: "script-src 'self' 'unsafe-eval'",
          });
          let t = new URL(l.default);
          e.register([
            {
              id: "raycast-user-script-proxy",
              matches: ["*://*/*"],
              js: [{ file: t.pathname }],
            },
          ]);
        })());
    }));
})
