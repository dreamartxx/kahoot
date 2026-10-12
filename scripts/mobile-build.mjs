import { readFileSync, writeFileSync, rmSync } from "node:fs";
const file = "mobile-build/index.html";
let html = readFileSync(file, "utf8");
html = html
  .replace(/<title>.*?<\/title>/, "<title>Ailecek Eğlen</title>")
  .replace(/<link rel="manifest"[^>]*>/g, "")
  .replace(
    "</head>",
    "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://ailecekeglen.com.tr; object-src 'none'; base-uri 'self'; form-action 'self'\"/></head>",
  );
writeFileSync(file, html);
// Native releases ship their UI with the binary; a web service worker must not
// install a second, independently cached version over these packaged assets.
for (const name of ["sw.js", "manifest.webmanifest"])
  rmSync("mobile-build/" + name, { force: true });
