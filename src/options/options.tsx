import { useEffect, useState, useCallback } from "react"
import { useStorage } from "@plasmohq/storage/hook"

import FAQ from "./components/FAQ"
import Checkbox from "./components/Checkbox"
import { Field } from "./components/Field"
import { Select, SelectItem } from "./components/Select"

const FAQ_ENTRIES = [
  {
    q: "Which browser do you support?",
    a: "The Raycast Browser extension is only available on Chrome, Chromium browsers, and Safari for now."
  },
  {
    q: "How do I get the browser’s tab content in an AI Command?",
    a: "The browser extension introduces a new Dynamic Placeholder: {browser-tab}. This placeholder allows you to get the content of the active tab. You can write the prompt to do anything you like."
  },
  {
    q: "How do you handle my data?",
    a: "We value privacy and never collect any sensitive information. None of your inputs are recorded or used to train models. All Raycast AI features are powered by OpenAI's APIs. We only access the content of your currently active tab, when you use a related AI Command, and only for the purpose of executing the command and providing you with your answer."
  },
  {
    q: "I got an error, what can I do?",
    a: "Make sure that the extension is installed, and that the browser is active on the tab you want to interact with."
  }
]

const KONAMI = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]

const AdvancedOptions = () => {
  const [heuristic, setHeuristic] = useStorage("raycast-extraction-heuristic", "markdown")
  const [extractCaptions, setExtractCaptions] = useStorage("raycast-extract-youtube-captions", true)
  const [connectAllFlavours, setConnectAllFlavours] = useStorage("raycast-connect-to-all-flavour", false)

  return (
    <>
      <h1 className="options-title">Advanced Options</h1>
      <p className="options-subtitle">
        Do not change those options if you don’t know what you are doing
      </p>

      <Field label="Which default format to use to get the content of a tab" name="heuristic">
        <Select
          value={heuristic}
          onValueChange={(value) => setHeuristic(value as string)}
          placeholder="Select content extraction heuristic...">
          <SelectItem value="markdown">Markdown</SelectItem>
          <SelectItem value="text">Plain text</SelectItem>
          <SelectItem value="html">HTML</SelectItem>
        </Select>
      </Field>

      <br />

      <Checkbox
        label="Extract Youtube captions (when focusing a Youtube video page)"
        id="youtube"
        checked={extractCaptions}
        onChange={(event) => setExtractCaptions(event.target.checked)}
      />

      <br />

      <Checkbox
        label="Connect to all Raycast Flavour"
        id="flavour"
        checked={connectAllFlavours}
        onChange={(event) => setConnectAllFlavours(event.target.checked)}
      />
    </>
  )
}

const KonamiWatcher = ({ onUnlock }: { onUnlock: () => void }) => {
  const [buffer, setBuffer] = useState<number[]>([])

  const handler = useCallback(
    (event: KeyboardEvent) => {
      const updated = [...buffer, event.keyCode].slice(-KONAMI.length)
      setBuffer(updated)
      if (updated.join("") === KONAMI.join("")) {
        onUnlock()
      }
    },
    [buffer, onUnlock]
  )

  useEffect(() => {
    document.addEventListener("keyup", handler)
    return () => document.removeEventListener("keyup", handler)
  }, [handler])

  return null
}

const OptionsPage = () => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div className="options-container">
      <div className="options-bg" />
      <div className="options-layout">
        <FAQ faqs={FAQ_ENTRIES} />
        {showAdvanced ? <AdvancedOptions /> : null}
      </div>
      <KonamiWatcher onUnlock={() => setShowAdvanced(true)} />
    </div>
  )
}

export default OptionsPage
