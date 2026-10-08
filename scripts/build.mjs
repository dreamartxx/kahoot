import { createHash } from "node:crypto";
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
copyFileSync("assets-build/index.html", "app.html");
writeFileSync(
  "app.html",
  readFileSync("app.html", "utf8").replaceAll(
    "/assets/",
    "/assets-build/assets/",
  ),
);

// A different worker version is produced for every application build.
const version = createHash("sha256")
  .update(readFileSync("app.html"))
  .update(readFileSync("public/sw.js"))
  .update(readFileSync("public/offline.html"))
  .update(readFileSync("public/manifest.webmanifest"))
  .update(readFileSync("public/icons/icon-192.png"))
  .update(readFileSync("public/icons/icon-512.png"))
  .update(readFileSync("public/icons/maskable-512.png"))
  .update(readFileSync("public/icons/apple-touch-icon.png"))
  .digest("hex")
  .slice(0, 16);
const worker = readFileSync("public/sw.js", "utf8").replace(
  "__BUILD_VERSION__",
  version,
);
writeFileSync("sw.js", worker);
writeFileSync("assets-build/sw.js", worker);
