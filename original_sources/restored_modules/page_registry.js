function (e, t, r) {
          var a = e("@parcel/transformer-js/src/esmodule-helpers.js");
          (a.defineInteropFlag(r),
            a.export(r, "registerQuickElement", () => s),
            a.export(r, "registerElement", () => c),
            a.export(r, "getElementById", () => u));
          let o = new Map(),
            n = new Map(),
            i = 0,
            l = 0;
          function s(e) {
            let t = `q${++l}`;
            return (n.set(t, new WeakRef(e)), t);
          }
          function c(e) {
            let t = `element_${++i}`;
            return (o.set(t, new WeakRef(e)), t);
          }
          function u(e) {
            return e.startsWith("q") ? n.get(e)?.deref() : o.get(e)?.deref();
          }
        })
