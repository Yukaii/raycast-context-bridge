const fs = require("fs")
const path = require("path")
const recast = require("recast")
const babelParser = require("recast/parsers/babel")

const DEFAULT_BUNDLE = path.join(__dirname, "content.903826e2.js")
const DEFAULT_OUT_DIR = path.join(__dirname, "restored_modules")
const defaultModules = {
  "68oK5": "entry_content",
  dv5Vs: "content_extraction_index",
  g8Pzn: "content_extraction_generic",
  "3yE0A": "content_extraction_youtube",
  cTjRr: "content_extraction_selector",
  we5gJ: "page_registry",
  e2Uaz: "page_dom_utils",
  c09q9: "page_anti_detection",
  "7wM7F": "page_analysis"
}

const args = process.argv.slice(2)
const bundlePath = path.resolve(args[0] ?? DEFAULT_BUNDLE)
const modulesMapPath = args[1] ? path.resolve(args[1]) : null
const modules = modulesMapPath
  ? JSON.parse(fs.readFileSync(modulesMapPath, "utf8"))
  : defaultModules
const outDir = path.resolve(args[2] ?? DEFAULT_OUT_DIR)
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

const bundle = fs.readFileSync(bundlePath, "utf8")

function extractBlock(id) {
  const markers = [`"${id}": [`, `'${id}': [`, `${id}: [`]
  let startIdx = -1
  let markerLength = 0
  for (const marker of markers) {
    const found = bundle.indexOf(marker)
    if (found !== -1) {
      startIdx = found
      markerLength = marker.length
      break
    }
  }
  if (startIdx === -1) throw new Error(`Module ${id} not found`)
  let idx = startIdx + markerLength
  let depth = 1
  let inString = null
  let inSingleLineComment = false
  let inBlockComment = false
  let prevChar = ""
  while (idx < bundle.length && depth > 0) {
    const char = bundle[idx]
    const nextChar = bundle[idx + 1]
    if (inSingleLineComment) {
      if (char === "\n") inSingleLineComment = false
      idx++
      prevChar = char
      continue
    }
    if (inBlockComment) {
      if (char === "*" && nextChar === "/") {
        inBlockComment = false
        idx += 2
        prevChar = ""
        continue
      }
      idx++
      prevChar = char
      continue
    }
    if (inString) {
      if (char === "\\" && prevChar !== "\\") {
        idx += 2
        prevChar = ""
        continue
      }
      if (char === inString && prevChar !== "\\") inString = null
      idx++
      prevChar = char
      continue
    }
    if (char === "/" && nextChar === "/") {
      inSingleLineComment = true
      idx += 2
      prevChar = ""
      continue
    }
    if (char === "/" && nextChar === "*") {
      inBlockComment = true
      idx += 2
      prevChar = ""
      continue
    }
    if (char === "\"" || char === "'" || char === "`") {
      inString = char
      idx++
      prevChar = char
      continue
    }
    if (char === "[") depth++
    else if (char === "]") depth--
    idx++
    prevChar = char
  }
  return bundle.slice(startIdx, idx)
}

function extractFunctionBody(block) {
  const wrapped = `({${block}})`
  const ast = recast.parse(wrapped, { parser: babelParser })
  const expression = ast.program.body[0].expression
  if (!expression.properties.length) throw new Error("Invalid module block")
  const property = expression.properties[0]
  const elements = property.value.elements
  if (!elements || !elements.length) throw new Error("Module has no factory function")
  return recast.print(elements[0]).code
}

function formatFunction(fnSource) {
  const ast = recast.parse(`(${fnSource})`, { parser: babelParser })
  const printed = recast.print(ast).code.trim()
  return printed.replace(/^\(/, "").replace(/\);$/, "")
}

for (const [id, name] of Object.entries(modules)) {
  const block = extractBlock(id)
  const fnSource = extractFunctionBody(block)
  let formatted
  try {
    formatted = formatFunction(fnSource)
  } catch (err) {
    console.error(`Failed to format module ${id}:`, err.message)
    formatted = fnSource
  }
  const target = path.join(outDir, `${name}.js`)
  fs.writeFileSync(target, `${formatted}\n`)
  console.log(`Extracted ${id} -> ${target}`)
}
