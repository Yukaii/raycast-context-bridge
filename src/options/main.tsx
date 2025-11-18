import { createRoot } from "react-dom/client"
import OptionsPage from "./options"
import "./styles/options.css"

document.addEventListener("DOMContentLoaded", () => {
  const mountNode = document.getElementById("__plasmo") || document.getElementById("root")
  if (!mountNode) return
  const root = createRoot(mountNode)
  root.render(<OptionsPage />)
})
