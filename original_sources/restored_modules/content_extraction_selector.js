function (e, t, r) {
          var a = e("@parcel/transformer-js/src/esmodule-helpers.js");
          (a.defineInteropFlag(r),
            a.export(r, "match", () => l),
            a.export(r, "getContent", () => s));
          var o = e("@plasmohq/storage");
          let n = new o.Storage(),
            i = ["text", "html"];
          async function l(e) {
            return !0;
          }
          async function s(e, t, r) {
            let a = t.querySelector(r.selector);
            if (!a) return "";
            let o = r?.format || (await n.get("raycast-extraction-heuristic"));
            return (i.includes(o) || (o = "text"), "html" === o)
              ? a.outerHTML
              : "innerText" in a && "string" == typeof a.innerText
                ? a.innerText
                : a.textContent;
          }
        })
