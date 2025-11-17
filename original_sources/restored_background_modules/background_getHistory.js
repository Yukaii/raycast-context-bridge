function (e, t, r) {
  var s = e("@parcel/transformer-js/src/esmodule-helpers.js");
  (s.defineInteropFlag(r), s.export(r, "getHistory", () => o));
  let a = globalThis.browser?.history || globalThis.chrome?.history;
  async function o(e) {
    let {
        keywords: t = "",
        startDate: r,
        endDate: s,
        domains: o = [],
        minVisitCount: n = 1,
        maxResults: i = 50,
        sortBy: l = "visit_time",
        sortOrder: c = "desc",
      } = e,
      u = { text: t, maxResults: Math.min(3 * i, 1e3) };
    (r && (u.startTime = new Date(r).getTime()),
      s && (u.endTime = new Date(s).getTime()));
    let d = await a.search(u),
      p = d.filter((e) => {
        if (o.length > 0)
          try {
            let t = new URL(e.url).hostname;
            if (!o.some((e) => t.includes(e))) return !1;
          } catch (e) {
            return !1;
          }
        return !(e.visitCount < n);
      });
    p.sort((e, t) => {
      let r, s;
      switch (l) {
        case "visit_count":
          ((r = e.visitCount), (s = t.visitCount));
          break;
        case "title":
          ((r = (e.title || "").toLowerCase()),
            (s = (t.title || "").toLowerCase()));
          break;
        default:
          ((r = e.lastVisitTime), (s = t.lastVisitTime));
      }
      return "asc" === c ? (r > s ? 1 : -1) : r < s ? 1 : -1;
    });
    let h = p.slice(0, i);
    return {
      success: !0,
      historyItems: h.map((e) => {
        let t;
        try {
          t = new URL(e.url).hostname;
        } catch (e) {
          t = "invalid-url";
        }
        return {
          historyId: e.id,
          url: e.url,
          title: e.title || "Untitled",
          lastVisitTime: new Date(e.lastVisitTime).toISOString(),
          visitCount: e.visitCount,
          domain: t,
          typedCount: e.typedCount || 0,
        };
      }),
      metadata: {
        total_found: p.length,
        returned_count: h.length,
        search_params: {
          keywords: t || null,
          date_range:
            r && s
              ? `${r} to ${s}`
              : r
                ? `from ${r}`
                : s
                  ? `until ${s}`
                  : null,
          domains: o.length > 0 ? o : null,
          minVisitCount: n,
          sortBy: l,
          sortOrder: c,
        },
        execution_time: new Date().toISOString(),
        over_fetched: d.length,
        filters_applied: {
          domain_filter: o.length > 0,
          visit_count_filter: n > 1,
          date_filter: !!(r || s),
          keyword_filter: !!t,
        },
      },
    };
  }
})
