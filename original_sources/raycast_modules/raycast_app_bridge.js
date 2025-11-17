function (e, t, r) {
  var s,
    a,
    o = arguments[3],
    n =
      (this && this.__createBinding) ||
      (Object.create
        ? function (e, t, r, s) {
            void 0 === s && (s = r);
            var a = Object.getOwnPropertyDescriptor(t, r);
            ((!a ||
              ("get" in a
                ? !t.__esModule
                : a.writable || a.configurable)) &&
              (a = {
                enumerable: !0,
                get: function () {
                  return t[r];
                },
              }),
              Object.defineProperty(e, s, a));
          }
        : function (e, t, r, s) {
            (void 0 === s && (s = r), (e[s] = t[r]));
          }),
    i =
      (this && this.__setModuleDefault) ||
      (Object.create
        ? function (e, t) {
            Object.defineProperty(e, "default", {
              enumerable: !0,
              value: t,
            });
          }
        : function (e, t) {
            e.default = t;
          }),
    l =
      (this && this.__importStar) ||
      function (e) {
        if (e && e.__esModule) return e;
        var t = {};
        if (null != e)
          for (var r in e)
            "default" !== r &&
              Object.prototype.hasOwnProperty.call(e, r) &&
              n(t, e, r);
        return (i(t, e), t);
      };
  (Object.defineProperty(r, "__esModule", { value: !0 }),
    (r.sendRequestToAll =
      r.sendNotificationToAll =
      r.sendRequest =
      r.sendNotification =
      r.setup =
      r.disconnect =
      r.connect =
      r.RaycastFlavour =
        void 0));
  let c = l(e("c2616ebd463455f1"));
  (((s = a || (r.RaycastFlavour = a = {})).XDevelopment = "7261"),
    (s.XInternal = "7262"),
    (s.Debug = "7263"),
    (s.Internal = "7264"),
    (s.Release = "7265"));
  let u = {},
    d = {},
    p = {};
  async function h({
    methods: e,
    onOpen: t,
    keepConnectionAlive: r,
    retryConnection: s,
    flavour: n,
    WebSocket: i,
    debug: l,
  }) {
    function c(e) {
      return u[e]
        ? Promise.resolve()
        : (p[e] && clearTimeout(p[e]),
          new Promise((a, n) => {
            let h = !1;
            try {
              let f = new (i || o.WebSocket)(`ws://localhost:${e}`);
              ((f.onopen = (s) => {
                (l && console.debug(`websocket to ${e} open`, s),
                  t?.(e),
                  r &&
                    (d[e] ||
                      (d[e] = setInterval(() => {
                        u[e]?.readyState === WebSocket.OPEN
                          ? I(e, "ping")
                          : d[e] && (clearInterval(d[e]), delete d[e]);
                      }, 24e3))),
                  a(),
                  (h = !0));
              }),
                (f.onmessage = (t) => {
                  "string" == typeof t.data
                    ? v(e, t.data)
                    : t.data.text().then((t) => {
                        v(e, t);
                      });
                }),
                (f.onclose = (t) => {
                  (l &&
                    console.debug(
                      `websocket connection to ${e} closed`,
                      t,
                    ),
                    delete u[e],
                    s
                      ? (p[e] = setTimeout(() => {
                          c(e);
                        }, 5e3))
                      : h || n(Error(t.reason)));
                }),
                (u[e] = f));
            } catch (t) {
              (l && console.debug(`Failed to connect to ${e}`, t),
                h || n(t));
              return;
            }
          }));
    }
    return (e && f(e), n)
      ? c(n)
      : Promise.all(Object.values(a).map((e) => c(e).catch((e) => {})));
  }
  function f(e) {
    Object.assign(j, e);
  }
  ((r.connect = h),
    (r.disconnect = function () {
      (Object.values(u).forEach((e) => {
        ((e.onclose = null), e.close());
      }),
        Object.values(p).forEach((e) => {
          clearTimeout(e);
        }),
        (u = {}),
        (p = {}),
        console.debug("websocket connections closed"));
    }),
    (r.setup = f));
  let m = Math.floor(1e3 * Math.random()),
    g = {};
  function b(e, t) {
    console.debug(t);
    try {
      let r = !1,
        s = u[e];
      return (
        s?.readyState === WebSocket.OPEN &&
          (s.send(JSON.stringify(t)), (r = !0)),
        r
      );
    } catch (e) {
      return (console.error(e), !1);
    }
  }
  function w(e, t, r) {
    return b(e, { jsonrpc: "2.0", id: t, result: r });
  }
  function y(e, t, r) {
    let s;
    s =
      r instanceof c.default
        ? r
        : new c.InternalError(r.message, r.stack);
    let a = { code: s.code, message: s.message, data: s.data };
    return b(e, { jsonrpc: "2.0", id: t, error: a });
  }
  function v(e, t) {
    try {
      if (!t) return;
      (console.debug(t),
        (function (e, t) {
          if (void 0 !== t.id) {
            let r = "string" == typeof t.id ? parseInt(t.id) : t.id;
            if (void 0 !== t.result || t.error || void 0 === t.method) {
              let s = g[r];
              if (!s) {
                y(
                  e,
                  r,
                  new c.InvalidRequest("Missing callback for " + t.id),
                );
                return;
              }
              (s.timeout && clearTimeout(s.timeout),
                delete g[r],
                s(t.error, t.result));
            } else
              (function (e, t) {
                if (!t.method) {
                  y(e, t.id, new c.InvalidRequest("Missing method"));
                  return;
                }
                try {
                  let r = T(t.method, t.params || {});
                  r && "function" == typeof r.then
                    ? r
                        .then((r) => w(e, t.id, r))
                        .catch((r) => y(e, t.id, r))
                    : w(e, t.id, r);
                } catch (r) {
                  y(e, t.id, r);
                }
              })(e, t);
          } else t.method && T(t.method, t.params);
        })(e, JSON.parse(t)));
    } catch (e) {
      (console.error(e), console.error(t));
    }
  }
  let j = {};
  function T(e, t) {
    if (!j[e]) throw new c.MethodNotFound(`Method ${e} not found`);
    return j[e](t);
  }
  function x(e, t, r) {
    return b(e, { jsonrpc: "2.0", method: t, params: r });
  }
  function I(e, t, r, s = 3e3) {
    return new Promise((a, o) => {
      let n = m;
      m += 1;
      let i = (e, t) => {
        if (e) {
          let t = new c.default(e.message);
          ((t.code = e.code), (t.data = e.data), o(t));
          return;
        }
        a(t);
      };
      ((i.timeout = setTimeout(() => {
        (delete g[n], o(Error("Request " + t + " timed out.")));
      }, s)),
        (g[n] = i));
      let l = b(e, { jsonrpc: "2.0", method: t, params: r, id: n });
      if (!l) {
        (i.timeout && clearTimeout(i.timeout), delete g[n]);
        let e = new c.default("No valid connection to Raycast");
        ((e.data = "No valid connection to Raycast"), o(e));
      }
    });
  }
  ((r.sendNotification = x),
    (r.sendRequest = I),
    (r.sendNotificationToAll = function (e, t) {
      return Object.keys(u).some((r) => x(r, e, t));
    }),
    (r.sendRequestToAll = function (e, t, r = 3e3) {
      return Promise.all(
        [a.Release, a.Internal, a.Debug].map((s) =>
          u[s]?.readyState !== WebSocket.OPEN
            ? Promise.resolve(void 0)
            : I(s, e, t, r),
        ),
      );
    }));
})
