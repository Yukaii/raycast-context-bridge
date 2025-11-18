function (e, t, n) {
  var r = e("@parcel/transformer-js/src/esmodule-helpers.js");
  r.defineInteropFlag(n);
  var o = e("react/jsx-runtime"),
    l = e("@plasmohq/storage/hook"),
    a = e("react"),
    i = e("~components/Select"),
    c = e("~components/Checkbox"),
    s = r.interopDefault(c),
    u = e("~components/FAQ"),
    d = r.interopDefault(u),
    f = e("~components/Field"),
    m = e("./options.module.css"),
    p = r.interopDefault(m);
  e("./global.module.css");
  let h = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
    v = [
      {
        q: "Which browser do you support?",
        a: "The Raycast Browser extension is only available on Chrome, Chromium browsers, and Safari for now.",
      },
      {
        q: "How do I get the browser\u2019s tab content in an AI Command?",
        a: "The browser extension introduces a new Dynamic Placeholder: {browser-tab}. This placeholder allows you to get the content of the active tab. You can write the prompt to do anything you like.",
      },
      {
        q: "How do you handle my data?",
        a: "We value privacy and never collect any sensitive information. None of your inputs are recorded or used to train models. All Raycast AI features are powered by OpenAI's APIs. We only access the content of your currently active tab, when you use a related AI Command, and only for the purpose of executing the command and providing you with your answer.",
      },
      {
        q: "I got an error, what can I do?",
        a: "Make sure that the extension is installed, and that the browser is active on the tab you want to interact with.",
      },
    ];
  n.default = function () {
    let [e, t] = (0, l.useStorage)(
        "raycast-extraction-heuristic",
        "markdown",
      ),
      [n, r] = (0, l.useStorage)(
        "raycast-extract-youtube-captions",
        !0,
      ),
      [c, u] = (0, l.useStorage)("raycast-connect-to-all-flavour", !1),
      m = (function () {
        let [e, t] = (0, a.useState)([]),
          [n, r] = (0, a.useState)(!1),
          o = (0, a.useCallback)(
            (n) => {
              (e.push(n.keyCode),
                e.splice(-h.length - 1, e.length - h.length),
                t(e),
                e.join("").includes(h.join("")) && r(!0));
            },
            [e, t, r],
          );
        return (
          (0, a.useEffect)(
            () => (
              document.addEventListener("keyup", o),
              () => {
                document.removeEventListener("keyup", o);
              }
            ),
            [o],
          ),
          n
        );
      })();
    return (0, o.jsxs)("div", {
      className: p.default.container,
      children: [
        (0, o.jsx)("div", { className: p.default.bg }),
        (0, o.jsxs)("div", {
          className: p.default.layout,
          children: [
            (0, o.jsx)(d.default, { faqs: v }),
            m
              ? (0, o.jsxs)(o.Fragment, {
                  children: [
                    (0, o.jsx)("h1", {
                      className: p.default.title,
                      children: "Advanced Options",
                    }),
                    (0, o.jsx)("p", {
                      className: p.default.subtitle,
                      children:
                        "Do not change those options if you don't know what you are doing",
                    }),
                    (0, o.jsxs)(f.Field, {
                      label:
                        "Which default format to use to get the content of a tab",
                      Component: i.Select,
                      name: "heuristic",
                      onValueChange: (e) => t(e),
                      value: e,
                      placeholder:
                        "Select content extraction heuristic...",
                      children: [
                        (0, o.jsx)(i.SelectItem, {
                          value: "markdown",
                          children: "Markdown",
                        }),
                        (0, o.jsx)(i.SelectItem, {
                          value: "text",
                          children: "Plain text",
                        }),
                        (0, o.jsx)(i.SelectItem, {
                          value: "html",
                          children: "HTML",
                        }),
                      ],
                    }),
                    (0, o.jsx)("br", {}),
                    (0, o.jsx)(s.default, {
                      label:
                        "Extract Youtube captions (when focusing a Youtube video page)",
                      id: "youtube",
                      onChange: (e) => r(e.target.checked),
                      checked: n,
                    }),
                    (0, o.jsx)("br", {}),
                    (0, o.jsx)(s.default, {
                      label: "Connect to all Raycast Flavour",
                      id: "flavour",
                      onChange: (e) => u(e.target.checked),
                      checked: c,
                    }),
                  ],
                })
              : null,
          ],
        }),
      ],
    });
  };
})
