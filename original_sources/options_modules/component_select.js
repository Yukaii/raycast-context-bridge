function (e, t, n) {
  var r = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (r.defineInteropFlag(n),
    r.export(n, "Select", () => m),
    r.export(n, "SelectItem", () => p));
  var o = e("react/jsx-runtime"),
    l = e("@radix-ui/react-select"),
    a = e("@raycast/icons"),
    i = e("classnames"),
    c = r.interopDefault(i),
    s = e("react"),
    u = r.interopDefault(s),
    d = e("./Select.module.css"),
    f = r.interopDefault(d);
  let m = (0, u.default).forwardRef(
    ({ children: e, placeholder: t, ...n }, r) =>
      (0, o.jsxs)(l.Root, {
        ...n,
        children: [
          (0, o.jsxs)(l.Trigger, {
            ref: r,
            className: f.default.Trigger,
            children: [
              (0, o.jsx)(l.Value, {
                className: f.default.Value,
                placeholder: t,
              }),
              (0, o.jsx)(l.Icon, {
                className: f.default.Icon,
                children: (0, o.jsx)(a.ChevronDownIcon, {
                  className: "icon",
                }),
              }),
            ],
          }),
          (0, o.jsx)(l.Portal, {
            children: (0, o.jsxs)(l.Content, {
              className: f.default.SelectContent,
              children: [
                (0, o.jsx)(l.ScrollUpButton, {
                  className: f.default.SelectScrollButton,
                  children: (0, o.jsx)(a.ChevronUpIcon, {
                    className: "icon",
                  }),
                }),
                (0, o.jsx)(l.Viewport, {
                  className: f.default.SelectViewport,
                  children: e,
                }),
                (0, o.jsx)(l.ScrollDownButton, {
                  className: f.default.SelectScrollButton,
                  children: (0, o.jsx)(a.ChevronDownIcon, {
                    className: "icon",
                  }),
                }),
              ],
            }),
          }),
        ],
      }),
  );
  m.displayName = "Select";
  let p = (0, u.default).forwardRef(({ children: e, ...t }, n) =>
    (0, o.jsxs)(l.Item, {
      ref: n,
      className: (0, c.default)(f.default.SelectItem, t.className),
      ...t,
      children: [
        (0, o.jsx)(l.ItemIndicator, {
          className: f.default.SelectItemIndicator,
          children: (0, o.jsx)(a.CheckIcon, { className: "icon" }),
        }),
        (0, o.jsx)(l.ItemText, { children: e }),
      ],
    }),
  );
  p.displayName = "SelectItem";
})
