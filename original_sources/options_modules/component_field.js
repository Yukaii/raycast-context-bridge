function (e, t, n) {
  var r = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (r.defineInteropFlag(n), r.export(n, "Field", () => s));
  var o = e("react/jsx-runtime"),
    l = e("classnames"),
    a = r.interopDefault(l),
    i = e("./Field.module.css"),
    c = r.interopDefault(i);
  function s({ label: e, Component: t, ...n }) {
    return (0, o.jsxs)(o.Fragment, {
      children: [
        e &&
          (0, o.jsx)("label", {
            className: c.default.label,
            htmlFor: n.name,
            children: e,
          }),
        (0, o.jsx)("div", {
          className: c.default.outerWrapper,
          children: (0, o.jsxs)("div", {
            className: c.default.innerWrapper,
            children: [
              (0, o.jsx)(t, {
                ...n,
                className: (0, a.default)(c.default.input, n.className),
              }),
              (0, o.jsx)("div", { className: c.default.glow }),
            ],
          }),
        }),
      ],
    });
  }
})
