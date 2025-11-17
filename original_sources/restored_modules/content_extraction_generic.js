function (e, t, r) {
  var a = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (a.defineInteropFlag(r),
    a.export(r, "match", () => s),
    a.export(r, "getContent", () => u));
  var o = e("defuddle"),
    n = a.interopDefault(o),
    i = e("@plasmohq/storage");
  let l = new i.Storage();
  async function s(e) {
    return !0;
  }
  let c = ["markdown", "text", "html"];
  async function u(e, t, r) {
    try {
      let a =
        r?.format || (await l.get("raycast-extraction-heuristic"));
      switch ((c.includes(a) || (a = "markdown"), a)) {
        case "html":
          return t.documentElement.outerHTML;
        case "text":
          return t.body.innerText;
        default: {
          let r = t.cloneNode(!0),
            a = new n.default(r, { url: e, markdown: !0 }),
            { title: o, content: i } = a.parse();
          return `# ${o}

${i}`;
        }
      }
    } catch (e) {
      return t.body.innerText;
    }
  }
})
