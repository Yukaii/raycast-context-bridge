const path = require("node:path")

const rootDir = __dirname

module.exports = {
  sourceDir: path.join(rootDir, "dist", "firefox"),
  artifactsDir: path.join(rootDir, "dist", "firefox-artifacts"),
  build: {
    overwriteDest: true
  }
}
