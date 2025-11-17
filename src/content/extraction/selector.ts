import { Storage } from "@plasmohq/storage"

const storage = new Storage()
const allowedFormats = ["text", "html"]

export const match = async () => true

export const getContent = async (
  _url: string,
  documentClone: Document,
  options: { selector: string; format?: string }
) => {
  const target = documentClone.querySelector(options.selector)
  if (!target) return ""

  let format = options?.format || ((await storage.get("raycast-extraction-heuristic")) as string)
  if (!allowedFormats.includes(format)) {
    format = "text"
  }

  if (format === "html") {
    return target.outerHTML
  }

  if ("innerText" in target && typeof (target as HTMLElement).innerText === "string") {
    return (target as HTMLElement).innerText
  }

  return target.textContent || ""
}
