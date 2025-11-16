function (e, t, r) {
  var a = e("@parcel/transformer-js/src/esmodule-helpers.js")
  ;(a.defineInteropFlag(r), a.export(r, "match", () => d), a.export(r, "getContent", () => p))
  var o = e("he"),
    n = a.interopDefault(o),
    i = e("@plasmohq/storage"),
    l = e("./generic")
  let s = new i.Storage(),
    c = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    u = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g
  async function d(e) {
    return (await s.get("raycast-extract-youtube-captions")) !== !1 && c.test(e)
  }
  async function p(e, t, r) {
    try {
      return await h(e, t.body.outerHTML)
    } catch (a) {
      return (console.error(a), await (0, l.getContent)(e, t, r))
    }
  }
  function m(e) {
    let t = e.match(c)
    return t && 11 === t[1].length ? t[1] : void 0
  }
  async function h(e, t, r = !1) {
    let a = m(e)
    if (!a) throw Error("no video id")
    let o = t.split('"captions":')
    if (o.length <= 1) {
      if (t.includes('class="g-recaptcha"')) throw new y()
      if (!t.includes('"playabilityStatus":')) throw new v(a)
      throw new D(a)
    }
    let n = (() => {
        try {
          return JSON.parse(o[1].split(',"videoDetails')[0].replace("\n", ""))
        } catch (e) {
          return
        }
      })()?.playerCaptionsTracklistRenderer,
      i = await f(n, a, e, r)
    return i.length ? i : await g(e)
  }
  async function g(e) {
    let t = m(e),
      r = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://www.youtube.com",
          Referer: `https://www.youtube.com/watch?v=${t}`,
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "WEB",
              clientVersion: "2.20250312.04.00",
              userAgent:
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)",
            },
          },
          videoId: t,
        }),
      },
      a = await fetch("https://www.youtube.com/youtubei/v1/player", r),
      {
        captions: { playerCaptionsTracklistRenderer: o },
      } = await a.json(),
      n = await f(o, t, e, !0)
    if (!n.length) throw new E(t, "InnerTube API")
    return n
  }
  async function f(e, t, r, a) {
    if (!e) throw new D(t)
    if (!("captionTracks" in e)) throw new w(t)
    let o =
      e.captionTracks.find(({ vssId: e }) => ".en" === e) ||
      e.captionTracks.find(({ vssId: e }) => "a.en" === e) ||
      e.captionTracks.find(({ vssId: e }) => e?.match(".en")) ||
      e.captionTracks[0]
    if (!o || !o.baseUrl)
      throw new x(
        "en",
        e.captionTracks.map((e) => e.languageCode),
        t,
      )
    let i = new URL(o.baseUrl),
      l = new URLSearchParams(i.search)
    if (l.get("v") && l.get("v") !== t) {
      if (a) throw new w(t)
      let e = await (await fetch(r)).text()
      return await h(r, e, !0)
    }
    let s = await fetch(i)
    if (!s.ok) throw new w(t)
    let c = await s.text(),
      d = [...c.matchAll(u)],
      p = d.map((e) => (0, n.default).decode(e[3]))
    return p.join("\n")
  }
  class b extends Error {
    constructor(e) {
      super(`[YoutubeTranscript] \ud83d ${e}`)
    }
  }
  class y extends b {
    constructor() {
      super(
        "YouTube is receiving too many requests from this IP and now requires solving a captcha to continue",
      )
    }
  }
  class v extends b {
    constructor(e) {
      super(`The video is no longer available (${e})`)
    }
  }
  class D extends b {
    constructor(e) {
      super(`Transcript is disabled on this video (${e})`)
    }
  }
  class w extends b {
    constructor(e) {
      super(`No transcripts are available for this video (${e})`)
    }
  }
  class x extends b {
    constructor(e, t, r) {
      super(
        `No transcripts are available in ${e} this video (${r}). Available languages: ${t.join(", ")}`,
      )
    }
  }
  class E extends b {
    constructor(e, t) {
      super(`The transcript file URL returns an empty response using ${t} (${e})`)
    }
  }
}
