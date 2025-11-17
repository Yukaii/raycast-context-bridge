import he from "he"
import { Storage } from "@plasmohq/storage"
import * as generic from "./generic"

const storage = new Storage()
const videoIdRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\\s]{11})/i
const captionRegex = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g

export const match = async (url: string) => {
  const userPreference = await storage.get("raycast-extract-youtube-captions")
  return userPreference !== false && videoIdRegex.test(url)
}

export const getContent = async (url: string, doc: Document, options?: { format?: string }) => {
  try {
    return await fetchCaptions(url, doc.body.outerHTML)
  } catch (error) {
    console.error(error)
    return generic.getContent(url, doc, options)
  }
}

const extractVideoId = (url: string) => {
  const matchResult = url.match(videoIdRegex)
  return matchResult && matchResult[1].length === 11 ? matchResult[1] : undefined
}

const fetchCaptions = async (url: string, html: string, viaInnerTube = false): Promise<string> => {
  const videoId = extractVideoId(url)
  if (!videoId) throw Error("no video id")

  const split = html.split('"captions":')
  if (split.length <= 1) {
    if (html.includes('class="g-recaptcha"')) throw new CaptchaError()
    if (!html.includes('"playabilityStatus":')) throw new VideoUnavailableError(videoId)
    throw new TranscriptDisabledError(videoId)
  }

  const renderer = (() => {
    try {
      return JSON.parse(split[1].split(',"videoDetails')[0].replace("\n", ""))
    } catch {
      return undefined
    }
  })()?.playerCaptionsTracklistRenderer
  const transcript = await loadTranscript(renderer, videoId, url, viaInnerTube)
  return transcript.length ? transcript : await fetchViaInnerTube(url)
}

const fetchViaInnerTube = async (url: string) => {
  const videoId = extractVideoId(url)
  const request = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://www.youtube.com",
      Referer: `https://www.youtube.com/watch?v=${videoId}`
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.20250312.04.00",
          userAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)"
        }
      },
      videoId
    })
  }
  const response = await fetch("https://www.youtube.com/youtubei/v1/player", request as RequestInit)
  const {
    captions: { playerCaptionsTracklistRenderer }
  } = await response.json()
  const transcript = await loadTranscript(playerCaptionsTracklistRenderer, videoId, url, true)
  if (!transcript.length) throw new EmptyTranscriptError(videoId, "InnerTube API")
  return transcript
}

const loadTranscript = async (renderer, videoId: string, pageUrl: string, viaInnerTube: boolean) => {
  if (!renderer) throw new TranscriptDisabledError(videoId)
  if (!("captionTracks" in renderer)) throw new NoTranscriptError(videoId)

  const track =
    renderer.captionTracks.find(({ vssId }) => ".en" === vssId) ||
    renderer.captionTracks.find(({ vssId }) => "a.en" === vssId) ||
    renderer.captionTracks.find(({ vssId }) => vssId?.match(".en")) ||
    renderer.captionTracks[0]

  if (!track || !track.baseUrl) {
    throw new LanguageUnavailableError(
      "en",
      renderer.captionTracks.map((entry) => entry.languageCode),
      videoId
    )
  }

  const url = new URL(track.baseUrl)
  const params = new URLSearchParams(url.search)

  if (params.get("v") && params.get("v") !== videoId) {
    if (viaInnerTube) throw new NoTranscriptError(videoId)
    const freshHtml = await (await fetch(pageUrl)).text()
    return fetchCaptions(pageUrl, freshHtml, true)
  }

  const response = await fetch(url)
  if (!response.ok) throw new NoTranscriptError(videoId)
  const body = await response.text()
  const entries = [...body.matchAll(captionRegex)]
  const transcript = entries.map(([, , , text]) => he.decode(text as string))
  return transcript.join("\n")
}

class TranscriptError extends Error {
  constructor(message: string) {
    super(`[YoutubeTranscript] 🧠 ${message}`)
  }
}

class CaptchaError extends TranscriptError {
  constructor() {
    super("YouTube is receiving too many requests from this IP and now requires solving a captcha to continue")
  }
}

class VideoUnavailableError extends TranscriptError {
  constructor(videoId: string) {
    super(`The video is no longer available (${videoId})`)
  }
}

class TranscriptDisabledError extends TranscriptError {
  constructor(videoId: string) {
    super(`Transcript is disabled on this video (${videoId})`)
  }
}

class NoTranscriptError extends TranscriptError {
  constructor(videoId: string) {
    super(`No transcripts are available for this video (${videoId})`)
  }
}

class LanguageUnavailableError extends TranscriptError {
  constructor(language: string, available: string[], videoId: string) {
    super(
      `No transcripts are available in ${language} this video (${videoId}). Available languages: ${available.join(", ")}`
    )
  }
}

class EmptyTranscriptError extends TranscriptError {
  constructor(videoId: string, source: string) {
    super(`The transcript file URL returns an empty response using ${source} (${videoId})`)
  }
}
