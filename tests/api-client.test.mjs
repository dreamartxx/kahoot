import { test } from "node:test";
import assert from "node:assert/strict";
const client = () => import("../src/api.js?test=" + crypto.randomUUID());
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
