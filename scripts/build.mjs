import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
copyFileSync("assets-build/index.html", "app.html");
writeFileSync(
  "app.html",
  readFileSync("app.html", "utf8").replaceAll(
    "/assets/",
    "/assets-build/assets/",
  ),
);
