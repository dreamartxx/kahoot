import { test } from "node:test";
import assert from "node:assert/strict";
import { startupRead } from "../src/startup.js";

test("first-launch transport failure recovers without a manual retry", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    if (++calls === 1) throw new TypeError("Failed to fetch");
    return Response.json({ configured: true, user: { id: 7 } });
  });
  assert.equal((await startupRead("status")).user.id, 7);
  assert.equal(calls, 2);
});

test("temporary gateway HTML is retried; exhausted attempts stop at three", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    return new Response("<html>Unavailable</html>", { status: 503 });
  });
  await assert.rejects(startupRead("categories"), { status: 503 });
  assert.equal(calls, 3);
});

test("authorization failures are not retried", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    return Response.json({ error: "Yetkiniz yok" }, { status: 403 });
  });
  await assert.rejects(startupRead("rooms"), { status: 403 });
  assert.equal(calls, 1);
});

test("aborting during backoff prevents another request", async (t) => {
  const controller = new AbortController();
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    throw new TypeError("Failed to fetch");
  });
  const request = startupRead("status", controller.signal);
  const rejected = assert.rejects(request, { name: "AbortError" });
  await new Promise(setImmediate);
  controller.abort();
  await rejected;
  assert.equal(calls, 1);
});

for (const stalledAt of ["headers", "body"]) {
  test(`startup recovers from stalled ${stalledAt} with no overlapping requests`, async (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    let calls = 0;
    t.mock.method(globalThis, "fetch", (_url, { signal }) => {
      if (++calls > 1)
        return Promise.resolve(Response.json({ configured: true }));
      const pending = new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      });
      return stalledAt === "headers"
        ? pending
        : Promise.resolve({ text: () => pending });
    });
    const request = startupRead("status");
    await new Promise(setImmediate);
    t.mock.timers.tick(8000);
    await new Promise(setImmediate);
    assert.equal(calls, 1);
    t.mock.timers.tick(600);
    assert.equal((await request).configured, true);
    assert.equal(calls, 2);
  });
}

test("mutations cannot use startup retries", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () =>
    Response.json({}),
  );
  for (const action of ["login", "create", "advance", "solo_start"])
    await assert.rejects(startupRead(action), /Unsupported startup read/);
  assert.equal(fetch.mock.callCount(), 0);
});

test("CDN verification stops startup immediately instead of retrying", async (t) => {
  const fetch = t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response("<html>Checking your browser before accessing</html>", {
        status: 403,
        headers: { "content-type": "text/html" },
      }),
  );
  await assert.rejects(startupRead("status"), { code: "BROWSER_VERIFICATION" });
  assert.equal(fetch.mock.callCount(), 1);
});
