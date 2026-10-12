import { Capacitor, CapacitorHttp, registerPlugin } from "@capacitor/core";
import { refreshReminders } from "./reminders.js";
export const nativeApp = Capacitor.isNativePlatform();
export const publicOrigin = nativeApp
  ? "https://ailecekeglen.com.tr"
  : globalThis.location?.origin || "";
const SecureSession = registerPlugin("SecureSession");
let session, loading;
async function sessionToken() {
  if (session !== undefined) return session;
  loading ||= SecureSession.get()
    .then(({ token }) => (session = token || ""))
    .finally(() => {
      loading = null;
    });
  return loading;
}
export async function nativeResponse(path, options) {
  if (options.signal?.aborted) throw options.signal.reason;
  const token = await sessionToken();
  const response = await CapacitorHttp.request({
    url: publicOrigin + path,
    method: options.method,
    headers: {
      ...options.headers,
      "X-Arena-Client": "android",
      Origin: "https://localhost",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(options.body ? { data: JSON.parse(options.body) } : {}),
    responseType: "text",
    connectTimeout: 8000,
    readTimeout: 8000,
    disableRedirects: true,
  });
  if (options.signal?.aborted) throw options.signal.reason;
  const headers = new Headers(response.headers);
  const next = headers.get("X-Arena-Session");
  // Only authentication mutations can rotate local credentials. A concurrent
  // background poll must not restore a session after logout or a new login.
  if (
    next !== null &&
    /[?&]action=(login|logout|password_change)(?:&|$)/.test(path) &&
    response.status === 200
  ) {
    if (next === "cleared") {
      await SecureSession.clear();
      session = "";
    } else if (/^[a-f0-9]{64}$/.test(next)) {
      await SecureSession.set({ token: next });
      session = next;
    }
  }
  return {
    res: {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      headers,
    },
    raw:
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data),
  };
}
export function joinUrl(pin) {
  return publicOrigin + "/#join/" + encodeURIComponent(pin);
}
export function joinPinFromUrl(value) {
  try {
    const url = new URL(value);
    if (
      ![
        "https://ailecekeglen.com.tr",
        "https://www.ailecekeglen.com.tr",
      ].includes(url.origin)
    )
      return null;
    return (
      /^#join\/(\d{6})$/.exec(url.hash)?.[1] ||
      /^\/join\/(\d{6})\/?$/.exec(url.pathname)?.[1] ||
      null
    );
  } catch {
    return null;
  }
}
export async function setupNative() {
  if (!nativeApp) return;
  document.documentElement.classList.add("native-app");
  const { App } = await import("@capacitor/app");
  const open = ({ url }) => {
    const pin = joinPinFromUrl(url);
    if (pin) location.hash = "join/" + pin;
  };
  await App.addListener("appUrlOpen", open);
  const launch = await App.getLaunchUrl();
  if (launch) open(launch);
  await App.addListener("appStateChange", ({ isActive }) => {
    if (isActive) {
      dispatchEvent(new Event("focus"));
      refreshReminders().catch(() =>
        console.warn("Hatırlatmalar yenilenemedi."),
      );
    }
  });
  refreshReminders().catch(() => console.warn("Hatırlatmalar başlatılamadı."));
  await App.addListener("backButton", () => {
    const dialog = [...document.querySelectorAll("dialog[open]")].at(-1);
    if (dialog) {
      dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
      return;
    }
    if (location.hash && location.hash !== "#") {
      if (
        /^#(?:host|join|screen)\//.test(location.hash) &&
        !confirm("Oyundan ayrılmak istiyor musun?")
      )
        return;
      location.hash = "";
    } else App.minimizeApp();
  });
}
