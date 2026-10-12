import { Capacitor, SystemBars } from "@capacitor/core";
const key = "arena:theme";
export function themePreference() {
  try {
    const value = localStorage.getItem(key);
    return ["light", "dark"].includes(value) ? value : "system";
  } catch {
    return "system";
  }
}
function applyTheme() {
  const preference = themePreference();
  const dark =
    preference === "dark" ||
    (preference === "system" &&
      matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#141221" : "#f8f7fb");
  if (Capacitor.isNativePlatform())
    SystemBars.setStyle({ style: dark ? "DARK" : "LIGHT" }).catch(() => {});
}
export function setThemePreference(value) {
  if (!["light", "dark", "system"].includes(value)) return;
  localStorage.setItem(key, value);
  applyTheme();
  window.dispatchEvent(new Event("arena:themechange"));
}
export function setupAppearance() {
  applyTheme();
  matchMedia("(prefers-color-scheme: dark)").addEventListener(
    "change",
    applyTheme,
  );
  window.addEventListener("storage", (event) => {
    if (event.key === key || event.key === null) {
      applyTheme();
      window.dispatchEvent(new Event("arena:themechange"));
    }
  });
}
