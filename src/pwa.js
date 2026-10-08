let installPrompt = null;
export const getInstallPrompt = () => installPrompt;
export const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  navigator.standalone === true;
export function setupPwa() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    window.dispatchEvent(new Event("arena:pwa-installable"));
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    window.dispatchEvent(new Event("arena:pwa-installed"));
  });
  if (
    !import.meta.env.PROD ||
    !("serviceWorker" in navigator) ||
    !window.isSecureContext
  )
    return;
  navigator.serviceWorker
    .register("/sw.js", { scope: "/", updateViaCache: "none" })
    .then((registration) => {
      const announce = () =>
        window.dispatchEvent(new Event("arena:pwa-update"));
      if (registration.waiting && navigator.serviceWorker.controller)
        announce();
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (
            worker.state === "installed" &&
            navigator.serviceWorker.controller
          )
            announce();
        });
      });
      let lastCheck = Date.now();
      const check = () => {
        if (
          document.visibilityState === "visible" &&
          Date.now() - lastCheck > 60000
        ) {
          lastCheck = Date.now();
          registration.update().catch(() => {});
        }
      };
      document.addEventListener("visibilitychange", check);
      window.addEventListener("online", check);
    })
    .catch(() => {
      /* The website remains usable if installation is unavailable. */
    });
}
export async function promptInstall() {
  const event = installPrompt;
  if (!event) return false;
  installPrompt = null;
  await event.prompt();
  return (await event.userChoice).outcome === "accepted";
}
