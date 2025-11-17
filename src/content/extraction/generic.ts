import Defuddle from "defuddle"
import { Storage } from "@plasmohq/storage"

const storage = new Storage()
const supportedFormats = ["markdown", "text", "html"]

export const match = async () => true

export const getContent = async (
  url: string,
  documentClone: Document,
  options?: { format?: string }
): Promise<string> => {
  try {
    let format = options?.format || ((await storage.get("raycast-extraction-heuristic")) as string)
    if (!supportedFormats.includes(format)) {
      format = "markdown"
    }

    switch (format) {
      case "html":
        return documentClone.documentElement.outerHTML
      case "text":
        return documentClone.body.innerText
      default: {
        const clone = documentClone.cloneNode(true) as Document
        const parser = new (Defuddle as any)(clone, { url, markdown: true })
        const { title, content } = parser.parse()
        return `# ${title}\n\n${content}`
      }
    }
  } catch (error) {
    console.error("Content extraction failed, falling back to text:", error)
    return documentClone.body.innerText
  }
}
