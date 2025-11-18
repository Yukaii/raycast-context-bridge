function (e, t, n) {
  var r = e("@parcel/transformer-js/src/esmodule-helpers.js");
  r.defineInteropFlag(n);
  var o = e("react/jsx-runtime"),
    l = e("@raycast/icons"),
    a = e("classnames"),
    i = r.interopDefault(a),
    c = e("react"),
    s = e("./FAQ.module.css"),
    u = r.interopDefault(s);
  function d({ title: e, content: t, expanded: n, onToggle: r }) {
    let a = (0, c.useId)();
    return (0, o.jsxs)("div", {
      className: u.default.accordionPanel,
      children: [
        (0, o.jsx)("h4", {
          id: `${a}-title`,
          className: u.default.question,
          children: (0, o.jsx)("button", {
            className: u.default.accordionTrigger,
            "aria-expanded": n,
            "aria-controls": `${a}-content`,
            onClick: r,
            children: e,
          }),
        }),
        (0, o.jsx)("div", {
          className: u.default.answer,
          role: "region",
          "aria-labelledby": `${a}-title`,
          "aria-hidden": !n,
          id: `${a}-content`,
          children: (0, o.jsx)("div", { children: t }),
        }),
        (0, o.jsx)("div", {
          className: (0, i.default)(
            u.default.arrowContainer,
            n && u.default.expanded,
          ),
          onClick: r,
          children: (0, o.jsx)(l.ChevronDownIcon, {
            className: "icon",
          }),
        }),
      ],
    });
  }
  n.default = ({ faqs: e, showTitle: t = !0 }) => {
    let [n, r] = (0, c.useState)(-1),
      l = (e) => {
        r((t) => (t === e ? -1 : e));
      };
    return (0, o.jsxs)("div", {
      className: u.default.wrapper,
      children: [
        t
          ? (0, o.jsxs)(o.Fragment, {
              children: [
                (0, o.jsx)("h3", { children: "FAQs" }),
                (0, o.jsx)("p", {
                  className: u.default.subtitle,
                  children:
                    "Answers to the most frequently asked questions.",
                }),
              ],
            })
          : null,
        (0, o.jsx)("div", {
          className: u.default.accordion,
          children: e.map((e, t) =>
            (0, o.jsx)(
              d,
              {
                title: e.q,
                content: e.a,
                expanded: n === t,
                onToggle: () => l(t),
              },
              t,
            ),
          ),
        }),
      ],
    });
  };
})
