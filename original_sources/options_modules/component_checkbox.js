function (e, t, n) {
  var r = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (r.defineInteropFlag(n), r.export(n, "default", () => s));
  var o = e("react/jsx-runtime"),
    l = e("classnames"),
    a = r.interopDefault(l),
    i = e("./Checkbox.module.css"),
    c = r.interopDefault(i);
  function s(e) {
    return (0, o.jsxs)("label", {
      className: c.default.label,
      children: [
        (0, o.jsx)("input", {
          type: "checkbox",
          className: c.default.input,
          ...e,
        }),
        (0, o.jsx)("div", {
          className: (0, a.default)(
            c.default.checkbox,
            e.checked ? c.default.checked : void 0,
          ),
          children: (0, o.jsx)("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            width: "12",
            height: "12",
            viewBox: "0 0 12 12",
            fill: "none",
            children: (0, o.jsx)("path", {
              d: "M2.94446 5.76604L4.8928 8.04165L8.3889 3.95831",
              stroke: "white",
              strokeWidth: "1.5",
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }),
          }),
        }),
        e.label,
      ],
    });
  }
})
