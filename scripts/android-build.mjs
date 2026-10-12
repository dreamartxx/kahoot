import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
const env = { ...process.env };
const bundledJava =
  "/Applications/Android Studio.app/Contents/jbr/Contents/Home";
if (!env.JAVA_HOME && existsSync(bundledJava)) env.JAVA_HOME = bundledJava;
env.ANDROID_HOME ||= resolve(process.env.HOME, "Library/Android/sdk");
if (existsSync(".android-signing.json")) {
  const signing = JSON.parse(readFileSync(".android-signing.json", "utf8"));
  env.ARENA_KEYSTORE = resolve(signing.storeFile);
  env.ARENA_STORE_PASSWORD = signing.storePassword;
  env.ARENA_KEY_ALIAS = signing.keyAlias;
  env.ARENA_KEY_PASSWORD = signing.keyPassword;
}
const tasks = process.argv.slice(2);
if (
  !tasks.length ||
  tasks.some(
    (x) =>
      ![
        "assembleDebug",
        "assembleRelease",
        "bundleRelease",
        "lint",
        "test",
      ].includes(x),
  )
)
  throw Error("Geçerli bir Android derleme görevi seçin.");
if (tasks.some((x) => x.includes("Release")) && !env.ARENA_KEYSTORE)
  throw Error(
    "İmzalama anahtarı gerekli. .android-signing.json veya ARENA_KEYSTORE ortamını hazırlayın.",
  );
const result = spawnSync("./gradlew", [...tasks, "--no-daemon"], {
  cwd: "android",
  env,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
