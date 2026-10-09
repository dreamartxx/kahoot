/* Only the offline notice and app icons are cached. Games, auth, HTML, and
   application bundles always use the network, so deploys cannot serve stale rounds. */
const CACHE_PREFIX = "bilgi-arena-offline-";
const CACHE_NAME = CACHE_PREFIX + "5f80360e91be72c1";
const OFFLINE_URL = "/offline.html";
const OFFLINE_FILES = [
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(
        OFFLINE_FILES.map((url) => new Request(url, { cache: "reload" })),
      );
      await self.skipWaiting();
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME,
          )
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/")
  )
    return;
  if (OFFLINE_FILES.includes(url.pathname)) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) return response;
        } catch {}
        return (await caches.match(url.pathname)) || Response.error();
      })(),
    );
    return;
  }
  if (request.mode !== "navigate") return;
  event.respondWith(
    (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(request, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (response.status < 500) return response;
      } catch {
      } finally {
        clearTimeout(timer);
      }
      return (
        (await caches.match(OFFLINE_URL)) ||
        new Response("İnternet bağlantını kontrol edip sayfayı yenile.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        })
      );
    })(),
  );
});
