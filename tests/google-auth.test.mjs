import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, sign, randomBytes } from "node:crypto";
import {
  mkdtempSync,
  mkdirSync,
  cpSync,
  symlinkSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { spawn, execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
const root = path.resolve(import.meta.dirname, ".."),
  dir = mkdtempSync(path.join(tmpdir(), "arena-google-")),
  site = path.join(dir, "site");
const clientId = "123-test.apps.googleusercontent.com",
  androidId = "123-android.apps.googleusercontent.com";
const base = "http://127.0.0.1:18193",
  db = path.join(dir, "test.sqlite");
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const jwk = {
  ...publicKey.export({ format: "jwk" }),
  kid: "test-key",
  alg: "RS256",
  use: "sig",
};
let server;
const encode = (x) => Buffer.from(JSON.stringify(x)).toString("base64url");
function token(nonce, extra = {}, key = privateKey) {
  const payload = {
    iss: "https://accounts.google.com",
    aud: clientId,
    azp: clientId,
    sub: "google-test-subject",
    email: "test@example.com",
    email_verified: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 300,
    nonce,
    ...extra,
  };
  const input =
    encode({ alg: "RS256", kid: "test-key" }) + "." + encode(payload);
  return (
    input +
    "." +
    sign("RSA-SHA256", Buffer.from(input), key).toString("base64url")
  );
}
async function call(action, data = {}, headers = {}) {
  const r = await fetch(base + "/api/index.php?action=" + action, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base, ...headers },
    body: JSON.stringify(data),
  });
  return {
    status: r.status,
    data: await r.json(),
    cookie: r.headers.get("set-cookie")?.split(";")[0],
    session: r.headers.get("x-arena-session"),
  };
}
async function challenge() {
  const binding = randomBytes(32).toString("hex");
  const r = await call("google_challenge", { binding });
  assert.equal(r.status, 200, JSON.stringify(r));
  return { ...r.data, binding };
}
const login = (c, extra = {}, headers = {}) =>
  call(
    "google_login",
    {
      challengeId: c.challengeId,
      binding: c.binding,
      idToken: token(c.nonce, extra),
    },
    headers,
  );
function sql(code) {
  return execFileSync(
    "php",
    ["-r", `$db=new PDO('sqlite:'.$argv[1]);${code}`, db],
    { encoding: "utf8" },
  );
}
before(async () => {
  mkdirSync(site);
  cpSync(path.join(root, "api"), path.join(site, "api"), { recursive: true });
  cpSync(path.join(root, "data"), path.join(site, "data"), { recursive: true });
  symlinkSync(path.join(root, "vendor"), path.join(site, "vendor"), "dir");
  writeFileSync(
    path.join(site, "api/google-config.php"),
    `<?php return ['client_id'=>'${clientId}','android_client_ids'=>['${androidId}']];`,
  );
  const priv = path.join(dir, "bilgi-arena-private");
  mkdirSync(priv);
  writeFileSync(
    path.join(priv, "google-jwks.json"),
    JSON.stringify({
      expires: Math.floor(Date.now() / 1000) + 3600,
      keys: { keys: [jwk] },
    }),
  );
  execFileSync("php", [
    "-r",
    "require $argv[1].'/api/core.php';migrate(new PDO('sqlite:'.$argv[2]));",
    root,
    db,
  ]);
  server = spawn("php", ["-S", "127.0.0.1:18193", "-t", site], {
    env: {
      ...process.env,
      ARENA_TEST_DSN: "sqlite:" + db,
      ARENA_TEST_ADMIN_HASH: "unused",
      ARENA_TEST_ORIGIN: base,
    },
    stdio: "ignore",
  });
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(base + "/api/index.php?action=status");
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 50));
    }
  }
  throw new Error("Google test server did not start");
});
after(() => {
  server?.kill();
  rmSync(dir, { recursive: true, force: true });
});
test("Google identity validates signature, issuer, audience, nonce, expiry and verified email", () => {
  const invalid = [
    { iss: "https://evil.example" },
    { aud: "another-client" },
    { azp: "untrusted-android" },
    { nonce: "another-nonce" },
    { exp: 1 },
    { iat: 1 },
    { email_verified: false },
    { sub: "" },
  ];
  const other = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey;
  const input = {
    jwks: { keys: [jwk] },
    clientId,
    androidId,
    nonce: "nonce",
    valid: token("nonce"),
    android: token("nonce", { azp: androidId }),
    invalid: [
      ...invalid.map((e) => token("nonce", e)),
      token("nonce", {}, other),
      "garbage",
    ],
  };
  const code = `require $argv[1].'/api/google.php';$i=json_decode(stream_get_contents(STDIN),true);$out=[];foreach(array_merge([$i['valid'],$i['android']],$i['invalid']) as $t){try{verifyGoogleIdentity($t,$i['nonce'],$i['clientId'],$i['jwks'],[$i['androidId']]);$out[]=true;}catch(Throwable $e){$out[]=false;}}echo json_encode($out);`;
  const result = JSON.parse(
    execFileSync("php", ["-r", code, root], {
      input: JSON.stringify(input),
      encoding: "utf8",
    }),
  );
  assert.deepEqual(result, [true, true, ...input.invalid.map(() => false)]);
});
test("Google creates a least-privilege account once, rejects replay and rotates sessions across web/native", async () => {
  const c = await challenge();
  assert.equal(
    (
      await call("google_login", {
        challengeId: c.challengeId,
        binding: "0".repeat(64),
        idToken: token(c.nonce),
      })
    ).status,
    401,
  );
  const first = await login(c);
  assert.equal(first.status, 200, JSON.stringify(first));
  assert.equal(first.data.user.role, "host");
  assert.equal(first.data.user.authProvider, "google");
  assert.ok(first.cookie);
  assert.equal((await login(c)).status, 401);
  const second = await login(
    await challenge(),
    { azp: androidId },
    { "X-Arena-Client": "android", Origin: "https://localhost" },
  );
  assert.equal(second.status, 200, JSON.stringify(second));
  assert.ok(second.session);
  assert.equal(second.data.user.id, first.data.user.id);
  const status = await fetch(base + "/api/index.php?action=status", {
    headers: { Cookie: first.cookie },
  });
  assert.equal((await status.json()).admin, false);
  const credits = await fetch(base + "/api/index.php?action=credits", {
    headers: {
      "X-Arena-Client": "android",
      Origin: "https://localhost",
      Authorization: "Bearer " + second.session,
    },
  });
  assert.equal(credits.status, 200);
  assert.equal((await credits.json()).available, 5);
  assert.equal(
    (
      await call(
        "password_change",
        { currentPassword: "x", newPassword: "y" },
        {
          "X-Arena-Client": "android",
          Origin: "https://localhost",
          Authorization: "Bearer " + second.session,
        },
      )
    ).status,
    409,
  );
  assert.equal(
    sql(
      'echo $db->query("SELECT COUNT(*) FROM arena_google_accounts")->fetchColumn();',
    ),
    "1",
  );
});
test("expired challenges and foreign origins cannot create an account", async () => {
  const c = await challenge();
  sql(`$db->exec("UPDATE arena_google_challenges SET expires_at=1");`);
  assert.equal((await login(c, { sub: "new-subject" })).status, 401);
  assert.equal(
    (
      await call(
        "google_challenge",
        { binding: "a".repeat(64) },
        { Origin: "https://evil.example" },
      )
    ).status,
    403,
  );
  assert.equal(
    sql(
      'echo $db->query("SELECT COUNT(*) FROM arena_google_accounts")->fetchColumn();',
    ),
    "1",
  );
});
