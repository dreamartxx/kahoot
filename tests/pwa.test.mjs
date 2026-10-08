import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const source = readFileSync(
  new URL("../public/sw.js", import.meta.url),
  "utf8",
);
function worker(network = async () => new Response("fresh")) {
  const events = {},
    cached = [],
    deleted = [],
    calls = [];
  let skipped = false,
    claimed = false;
  const context = {
    self: {
      location: { origin: "https://arena.test" },
      addEventListener: (name, fn) => (events[name] = fn),
      skipWaiting: async () => {
        skipped = true;
      },
      clients: {
        claim: async () => {
          claimed = true;
        },
      },
    },
    caches: {
      open: async () => ({
        addAll: async (items) => cached.push(...items.map((i) => i.url)),
      }),
      keys: async () => [
        "unrelated",
        "bilgi-arena-offline-old",
        "bilgi-arena-offline-test",
      ],
      delete: async (name) => deleted.push(name),
      match: async (path) =>
        path === "/offline.html" ? new Response("offline notice") : undefined,
    },
    fetch: async (...args) => {
      calls.push(args);
      return network(...args);
    },
    URL,
    Response,
    AbortController,
    setTimeout,
    clearTimeout,
    Request: class extends Request {
      constructor(url, options) {
        super(new URL(url, "https://arena.test"), options);
      }
    },
  };
  vm.runInNewContext(source.replace("__BUILD_VERSION__", "test"), context);
  return {
    cached,
    deleted,
    calls,
    get skipped() {
      return skipped;
    },
    get claimed() {
      return claimed;
    },
    lifecycle: async (name) => {
      let pending;
      events[name]({ waitUntil: (p) => (pending = p) });
      await pending;
    },
    request: async (path, method = "GET", mode = "navigate") => {
      let response;
      events.fetch({
        request: {
          url: new URL(path, "https://arena.test").href,
          method,
          mode,
        },
        respondWith: (p) => (response = p),
      });
      return response ? await response : null;
    },
  };
}
test("PWA manifest and PNG dimensions support home-screen installation", () => {
  const manifest = JSON.parse(
    readFileSync(new URL("../public/manifest.webmanifest", import.meta.url)),
  );
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  for (const icon of manifest.icons) {
    const png = readFileSync(
      new URL("../public" + icon.src.split("?")[0], import.meta.url),
    );
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes);
  }
  assert.ok(manifest.icons.some((i) => i.purpose === "maskable"));
  const built = readFileSync(new URL("../sw.js", import.meta.url), "utf8");
  assert.ok(!built.includes("__BUILD_VERSION__"));
});
test("offline installation stores only notice and icons, and activation retains unrelated caches", async () => {
  const w = worker();
  await w.lifecycle("install");
  assert.equal(w.cached.length, 5);
  assert.ok(
    w.cached.every((p) => /\/offline\.html$|\/icons\/[^/]+\.png$/.test(p)),
  );
  assert.equal(w.skipped, true);
  await w.lifecycle("activate");
  assert.deepEqual(w.deleted, ["bilgi-arena-offline-old"]);
  assert.equal(w.claimed, true);
});
test("game API, submissions, external requests and JS bypass service worker caching", async () => {
  const w = worker();
  for (const [path, method, mode] of [
    ["/api/index.php?action=room", "GET", "navigate"],
    ["/", "POST", "navigate"],
    ["https://other.test/", "GET", "navigate"],
    ["/assets-build/assets/main.js", "GET", "cors"],
  ])
    assert.equal(await w.request(path, method, mode), null);
  assert.equal(w.calls.length, 0);
});
test("navigation uses fresh network and preserves real 404 responses", async () => {
  const w = worker();
  assert.equal(await (await w.request("/")).text(), "fresh");
  assert.equal(w.calls[0][1].cache, "no-store");
  const missing = worker(async () => new Response("missing", { status: 404 }));
  assert.equal((await missing.request("/unknown")).status, 404);
});
test("connection loss or server failure shows offline notice rather than stale game", async () => {
  for (const fetcher of [
    async () => {
      throw new Error("offline");
    },
    async () => new Response("server failed", { status: 503 }),
  ]) {
    const w = worker(fetcher);
    assert.equal(await (await w.request("/")).text(), "offline notice");
  }
});
