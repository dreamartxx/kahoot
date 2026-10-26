import { test } from "node:test";
import assert from "node:assert/strict";
const client = () => import("../src/api.js?test=" + crypto.randomUUID());
test("DNS and transport failures give a retryable server message without claiming the device is offline", async (t) => {
  const c = await client();
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    if (++calls === 1) throw new TypeError("Failed to fetch");
    return new Response('{"configured":true}');
  });
  await assert.rejects(c.api("status"), (error) => {
    assert.equal(error.code, "CONNECTION_FAILED");
    assert.match(error.message, /sunucusuna ulaşılamadı/);
    assert.doesNotMatch(error.message, /internet yok/i);
    return true;
  });
  assert.equal((await c.api("status")).configured, true);
  assert.equal(calls, 2);
});
test("CDN HTML challenge pauses all API requests until normal page reload", async (t) => {
  const c = await client();
  let calls = 0,
    notices = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    return new Response("<html>Checking your browser before accessing</html>", {
      status: 403,
      headers: { "content-type": "text/html" },
    });
  });
  const unsubscribe = c.onBrowserVerification((e) => {
    if (e) notices++;
  });
  await assert.rejects(c.api("room", { pin: "123456" }), {
    code: "BROWSER_VERIFICATION",
  });
  await assert.rejects(c.api("status"), { code: "BROWSER_VERIFICATION" });
  await assert.rejects(c.api("answer", { pin: "123456", choice: 0 }), {
    code: "BROWSER_VERIFICATION",
  });
  assert.equal(calls, 1);
  assert.equal(notices, 1);
  assert.equal(c.getBrowserVerification().status, 403);
  unsubscribe();
  const fresh = await client();
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response('{"phase":"question"}', {
        headers: { "content-type": "application/json" },
      }),
  );
  assert.equal((await fresh.api("room", { pin: "123456" })).phase, "question");
});
test("ordinary authorization failures and transient HTML errors do not latch verification", async (t) => {
  const c = await client();
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    if (calls === 1)
      return new Response('{"error":"Yetkiniz yok"}', {
        status: 403,
        headers: { "content-type": "application/json" },
      });
    if (calls === 2)
      return new Response("<html>Unavailable</html>", {
        status: 503,
        headers: { "content-type": "text/html" },
      });
    return new Response('{"ok":true}', {
      headers: { "content-type": "application/json" },
    });
  });
  await assert.rejects(c.api("users"), /Yetkiniz yok/);
  await assert.rejects(c.api("status"), /Sunucuya ulaşılamadı/);
  assert.equal(c.getBrowserVerification(), null);
  assert.equal((await c.api("status")).ok, true);
  assert.equal(calls, 3);
});
for (const stalledAt of ["headers", "body"]) {
  test(`stalled room ${stalledAt} times out and a later poll can recover`, async (t) => {
    const c = await client();
    t.mock.timers.enable({ apis: ["setTimeout"] });
    let calls = 0;
    t.mock.method(globalThis, "fetch", (_url, { signal }) => {
      calls++;
      if (calls > 1)
        return Promise.resolve(new Response('{"phase":"question"}'));
      const pending = new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      });
      return stalledAt === "headers"
        ? pending
        : Promise.resolve({ text: () => pending });
    });
    const request = c.api("room", { pin: "123456" });
    const rejected = assert.rejects(request, { code: "ROOM_TIMEOUT" });
    await Promise.resolve();
    t.mock.timers.tick(8000);
    await rejected;
    assert.equal(c.getBrowserVerification(), null);
    assert.equal(calls, 1); // The API does not retry on its own or overlap requests.
    assert.equal((await c.api("room", { pin: "123456" })).phase, "question");
  });
}
test("leaving the room still aborts the in-flight request", async (t) => {
  const c = await client();
  const parent = new AbortController();
  t.mock.method(
    globalThis,
    "fetch",
    (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      }),
  );
  const request = c.api("room", { pin: "123456" }, null, {
    signal: parent.signal,
  });
  const rejected = assert.rejects(request, { name: "AbortError" });
  parent.abort();
  await rejected;
});
