import { build } from "esbuild"
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"

const projectRoot = process.cwd()
const outDir = path.join(projectRoot, "dist")
const iconsDir = path.join(projectRoot, "assets")

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

const buildTarget = ["chrome110", "firefox115"]

const sharedOptions = {
  bundle: true,
  sourcemap: true,
  target: buildTarget,
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")
  }
}

await Promise.all([
  build({
    ...sharedOptions,
    format: "iife",
    entryPoints: [path.join(projectRoot, "src/content/index.ts")],
    outfile: path.join(outDir, "content.js")
  }),
  build({
    ...sharedOptions,
    format: "esm",
    entryPoints: [path.join(projectRoot, "src/background/index.ts")],
    outfile: path.join(outDir, "background.js")
  }),
  build({
    ...sharedOptions,
    format: "esm",
    entryPoints: [path.join(projectRoot, "src/user-scripts/index.ts")],
    outfile: path.join(outDir, "user-script.js")
  }),
  build({
    ...sharedOptions,
    format: "iife",
    entryPoints: [path.join(projectRoot, "src/options/main.tsx")],
    outfile: path.join(outDir, "options.js"),
    loader: {
      ".css": "css",
      ".jpg": "file"
    },
    assetNames: "assets/[name]"
  })
])

await Promise.all([
  cp(path.join(projectRoot, "manifest.json"), path.join(outDir, "manifest.json")),
  cp(path.join(projectRoot, "options.html"), path.join(outDir, "options.html"))
])

await mkdir(path.join(outDir, "icons"), { recursive: true })
await Promise.all(
  ["icon16.png", "icon32.png", "icon48.png", "icon64.png", "icon128.png"].map((file) =>
    cp(path.join(iconsDir, file), path.join(outDir, "icons", file))
  )
)

console.log("Build complete. Output:", outDir)
