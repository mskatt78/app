const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

let version;
try {
  version = execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
    .toString()
    .trim();
} catch (e) {
  version = String(Date.now());
}

const swPath = path.join(__dirname, "..", "public", "sw.js");
const src = fs.readFileSync(swPath, "utf8");
const updated = src.replace(
  /const CACHE_VERSION = '[^']*';/,
  `const CACHE_VERSION = 'v-${version}';`
);
fs.writeFileSync(swPath, updated);
console.log("[stamp-sw-version] CACHE_VERSION set to v-" + version);
