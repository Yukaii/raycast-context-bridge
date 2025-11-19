import { build } from "esbuild"
import { cp, mkdir, rm } from "node:fs/promises"
import path from "node:path"

const projectRoot = process.cwd()
const outRoot = path.join(projectRoot, "dist")
const iconsDir = path.join(projectRoot, "assets")

const platforms = [
  {
    name: "chrome",
    target: ["chrome110"],
    manifest: "manifest.json",
    backgroundFormat: "esm",
    userScriptFormat: "esm"
  },
  {
    name: "firefox",
    target: ["firefox115"],
    manifest: "manifest.firefox.json",
    backgroundFormat: "iife",
    userScriptFormat: "iife"
  }
]

await rm(outRoot, { recursive: true, force: true })
await mkdir(outRoot, { recursive: true })

const sharedOptions = {
  bundle: true,
  sourcemap: true,
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")
  }
}

for (const platform of platforms) {
  const platformOutDir = path.join(outRoot, platform.name)
  await mkdir(platformOutDir, { recursive: true })
  const platformOptions = { ...sharedOptions, target: platform.target }

  await Promise.all([
    build({
      ...platformOptions,
      format: "iife",
      entryPoints: [path.join(projectRoot, "src/content/index.ts")],
      outfile: path.join(platformOutDir, "content.js")
    }),
    build({
      ...platformOptions,
      format: platform.backgroundFormat,
      entryPoints: [path.join(projectRoot, "src/background/index.ts")],
      outfile: path.join(platformOutDir, "background.js")
    }),
    build({
      ...platformOptions,
      format: platform.userScriptFormat,
      entryPoints: [path.join(projectRoot, "src/user-scripts/index.ts")],
      outfile: path.join(platformOutDir, "user-script.js")
    }),
    build({
      ...platformOptions,
      format: "iife",
      entryPoints: [path.join(projectRoot, "src/options/main.tsx")],
      outfile: path.join(platformOutDir, "options.js"),
      loader: {
        ".css": "css",
        ".jpg": "file"
      },
      assetNames: "assets/[name]"
    })
  ])

  await Promise.all([
    cp(path.join(projectRoot, platform.manifest), path.join(platformOutDir, "manifest.json")),
    cp(path.join(projectRoot, "options.html"), path.join(platformOutDir, "options.html"))
  ])

  const iconOutDir = path.join(platformOutDir, "icons")
  await mkdir(iconOutDir, { recursive: true })
  await Promise.all(
    ["icon16.png", "icon32.png", "icon48.png", "icon64.png", "icon128.png"].map((file) =>
      cp(path.join(iconsDir, file), path.join(iconOutDir, file))
    )
  )
}

console.log("Build complete. Output directories:", platforms
  .map((platform) => path.join(outRoot, platform.name))
  .join(", "))
