import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
const dir = mkdtempSync(path.join(tmpdir(), "arena-test-")),
  root = path.resolve(import.meta.dirname, "..");
const port = 18191,
  base = `http://127.0.0.1:${port}/api/index.php`,
  db = path.join(dir, "test.sqlite");
let server, cookie;
async function call(action, data = {}, options = {}) {
  let read = ["status", "categories", "questions", "rooms", "room"].includes(
    action,
  );
  let url =
    base + "?action=" + action + (read ? "&" + new URLSearchParams(data) : "");
  const r = await fetch(url, {
    method: read ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.admin ? { Cookie: cookie } : {}),
      ...(options.token ? { "X-Player-Token": options.token } : {}),
      ...(options.origin ? { Origin: options.origin } : {}),
    },
    ...(read ? {} : { body: JSON.stringify(data) }),
  });
  return {
    status: r.status,
    data: await r.json(),
    cookie: r.headers.get("set-cookie"),
  };
}
const create = async (mode, extra = {}) => {
  const r = await call(
    "create",
    {
      mode,
      title: "Test etkinliği",
      category: "cografya",
      seconds: 10,
      prompt: "Neler hissediyorsun?",
      ...extra,
    },
    { admin: true },
  );
  assert.equal(r.status, 200, JSON.stringify(r));
  return r.data;
};
const join = async (pin, name) => {
  const r = await call("join", { pin, name });
  assert.equal(r.status, 200, JSON.stringify(r));
  return r.data;
};
const mutateDB = (pin, code) =>
  execFileSync("php", [
    "-r",
    `$db=new PDO('sqlite:'.$argv[1]);$q=$db->prepare('SELECT state FROM arena_rooms WHERE pin=?');$q->execute([$argv[2]]);$s=json_decode($q->fetchColumn(),true);${code};$db->prepare('UPDATE arena_rooms SET state=? WHERE pin=?')->execute([json_encode($s),$argv[2]]);`,
    db,
    pin,
  ]);
before(async () => {
  execFileSync("php", ["scripts/dev-init.php", db], { cwd: root });
  const hash = execFileSync("php", [
    "-r",
    'echo password_hash("local-test-password",PASSWORD_DEFAULT);',
  ]).toString();
  server = spawn("php", ["-S", `127.0.0.1:${port}`, "scripts/router.php"], {
    cwd: root,
    env: {
      ...process.env,
      ARENA_TEST_DSN: "sqlite:" + db,
      ARENA_TEST_ADMIN_HASH: hash,
    },
    stdio: "ignore",
  });
  let ready = false;
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(base);
      ready = true;
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 50));
    }
  }
  assert(ready, "PHP server starts");
  const login = await call("login", { password: "local-test-password" });
  assert.equal(login.status, 200);
  cookie = login.cookie.split(";")[0];
});
after(() => {
  server?.kill();
  rmSync(dir, { recursive: true, force: true });
});
test("password change requires current credentials, accepts short and long passwords and revokes other sessions", async () => {
  const change = {
    currentPassword: "local-test-password",
    newPassword: "1234",
  };
  assert.equal((await call("password_change", change)).status, 401);
  assert.equal((await fetch(base + "?action=password_change")).status, 405);
  assert.equal(
    (
      await call(
        "password_change",
        { ...change, currentPassword: "wrong" },
        { admin: true },
      )
    ).status,
    401,
  );
  assert.equal(
    (
      await call(
        "password_change",
        { ...change, newPassword: "" },
        { admin: true },
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call("password_change", change, {
        admin: true,
        origin: "https://attacker.invalid",
      })
    ).status,
    403,
  );
  const otherLogin = await call("login", { password: "local-test-password" });
  const staleCookie = otherLogin.cookie.split(";")[0];
  const changed = await call("password_change", change, { admin: true });
  assert.equal(changed.status, 200);
  cookie = changed.cookie.split(";")[0];
  assert.equal((await call("status", {}, { admin: true })).data.admin, true);
  const stale = await fetch(base + "?action=rooms", {
    headers: { Cookie: staleCookie },
  });
  assert.equal(stale.status, 401);
  assert.equal(
    (await call("login", { password: "local-test-password" })).status,
    401,
  );
  assert.equal((await call("login", { password: "1234" })).status, 200);
  const longPassword = "ş".repeat(150);
  const longChange = await call(
    "password_change",
    { currentPassword: "1234", newPassword: longPassword },
    { admin: true },
  );
  assert.equal(longChange.status, 200);
  cookie = longChange.cookie.split(";")[0];
  assert.equal(
    (await call("login", { password: longPassword.slice(0, 36) + "other" }))
      .status,
    401,
  );
  assert.equal((await call("login", { password: longPassword })).status, 200);
  const restored = await call(
    "password_change",
    { currentPassword: longPassword, newPassword: "local-test-password" },
    { admin: true },
  );
  assert.equal(restored.status, 200);
  cookie = restored.cookie.split(";")[0];
});
test("admin authorization, cross-origin protection and private files", async () => {
  assert.equal(
    (await call("create", { mode: "quiz", title: "No access" })).status,
    401,
  );
  assert.equal((await call("questions")).status, 401);
  assert.equal((await call("login", { password: "incorrect" })).status, 401);
  assert.equal(
    (
      await call(
        "create",
        { mode: "quiz", title: "Forbidden" },
        { admin: true, origin: "https://attacker.invalid" },
      )
    ).status,
    403,
  );
  assert.equal(
    (await fetch(`http://127.0.0.1:${port}/api/core.php`)).status,
    404,
  );
  assert.equal(
    (await fetch(`http://127.0.0.1:${port}/data/questions.json`)).status,
    404,
  );
});
test("domain migration accepts exact site origins and rejects lookalikes", async () => {
  const login = await call(
    "login",
    { password: "local-test-password" },
    {
      origin: "https://khaki-panther-692104.hostingersite.com",
    },
  );
  assert.equal(login.status, 200);
  assert.equal(login.data.admin, true);
  for (const origin of [
    "http://127.0.0.1:8091",
    "https://ailecekeglen.com.tr",
  ]) {
    assert.equal((await call("create", {}, { origin })).status, 401);
  }
  for (const origin of [
    "https://khaki-panther-692104.hostingersite.com.attacker.invalid",
    "https://another-site.hostingersite.com",
    "https://ailecekeglen.com.tr.attacker.invalid",
    "http://khaki-panther-692104.hostingersite.com",
  ]) {
    assert.equal((await call("create", {}, { origin })).status, 403);
  }
});
test("quiz: ten questions, no repeats until pool exhausted, no early answer/score leaks, idempotency and deadlines", async () => {
  const seen = new Set();
  for (let i = 0; i < 10; i++) {
    const r = await create("quiz");
    const raw = execFileSync("php", [
      "-r",
      "$d=new PDO('sqlite:'.$argv[1]);$q=$d->prepare('SELECT state FROM arena_rooms WHERE pin=?');$q->execute([$argv[2]]);echo $q->fetchColumn();",
      db,
      r.pin,
    ]).toString();
    const state = JSON.parse(raw);
    for (const q of state.questions) {
      assert(!seen.has(q.id), "Unused questions are prioritized");
      seen.add(q.id);
    }
  }
  assert.equal(seen.size, 100);
  let r = await create("quiz");
  const p = await join(r.pin, "Deniz");
  assert(!p.room.questions);
  assert.equal((await call("join", { pin: r.pin, name: "DENİZ" })).status, 409);
  assert.equal(
    (
      await call(
        "advance",
        { pin: r.pin, expectedIndex: -1, expectedPhase: "lobby" },
        { admin: true },
      )
    ).status,
    200,
  );
  r = (await call("room", { pin: r.pin }, { token: p.token })).data;
  assert.equal(r.question.options.length, 4);
  assert.equal(r.question.correct, undefined);
  const qs = (
    await call("questions", { category: "cografya" }, { admin: true })
  ).data;
  const original = qs.find((q) => q.id === r.question.id);
  const choice = r.question.options.indexOf(original.options[original.correct]);
  const answer = await call(
    "answer",
    { pin: r.pin, questionId: r.question.id, choice },
    { token: p.token },
  );
  assert.equal(answer.status, 200);
  assert.equal(answer.data.myAnswer.points, undefined);
  assert.equal(answer.data.players[0].score, 0);
  const dup = await call(
    "answer",
    { pin: r.pin, questionId: r.question.id, choice },
    { token: p.token },
  );
  assert.equal(dup.status, 409);
  let reveal = await call(
    "advance",
    { pin: r.pin, expectedIndex: 0, expectedPhase: "question" },
    { admin: true },
  );
  assert.equal(reveal.data.question.correct, choice);
  assert(
    reveal.data.players[0].score >= 500 && reveal.data.players[0].score <= 1000,
  );
  await call(
    "advance",
    { pin: r.pin, expectedIndex: 0, expectedPhase: "reveal" },
    { admin: true },
  );
  mutateDB(r.pin, "$s['deadline']=microtime(true)-1");
  r = (await call("room", { pin: r.pin }, { token: p.token })).data;
  assert.equal(r.phase, "reveal");
  assert(Number.isInteger(r.question.correct));
  assert.equal(
    (
      await call(
        "answer",
        { pin: r.pin, questionId: r.question.id, choice: 0 },
        { token: p.token },
      )
    ).status,
    409,
  );
  for (let i = 1; i < 10; i++) {
    const a = await call(
      "advance",
      { pin: r.pin, expectedIndex: i, expectedPhase: "reveal" },
      { admin: true },
    );
    assert.equal(a.status, 200);
    if (i < 9)
      await call(
        "advance",
        { pin: r.pin, expectedIndex: i + 1, expectedPhase: "question" },
        { admin: true },
      );
    else assert.equal(a.data.phase, "finished");
  }
});
test("manual questions persist, validate four options, can be selected explicitly and deleted", async () => {
  const invalid = await call(
    "question_save",
    {
      category: "cografya",
      text: "Özel bir soru?",
      options: ["A", "A", "B", "C"],
      correct: 0,
    },
    { admin: true },
  );
  assert.equal(invalid.status, 400);
  const good = await call(
    "question_save",
    {
      category: "cografya",
      text: "Bu özel sorunun cevabı hangisidir?",
      options: ["Doğru", "Yanlış A", "Yanlış B", "Yanlış C"],
      correct: 0,
    },
    { admin: true },
  );
  assert.equal(good.status, 200);
  const qs = (
    await call("questions", { category: "cografya" }, { admin: true })
  ).data;
  assert.equal(qs.length, 101);
  const selected = [
    good.data.id,
    ...qs
      .filter((q) => q.id !== good.data.id)
      .slice(0, 9)
      .map((q) => q.id),
  ];
  const r = await create("quiz", { questionIds: selected });
  assert.equal(r.total, 10);
  assert.equal(
    (await call("question_delete", { id: good.data.id }, { admin: true }))
      .status,
    200,
  );
  assert.equal(
    (await call("questions", { category: "cografya" }, { admin: true })).data
      .length,
    100,
  );
});
test("cloud: Turkish case normalization, one vote per person per word, editing and prompt reset", async () => {
  const r = await create("cloud");
  const a = await join(r.pin, "Ada"),
    b = await join(r.pin, "Ece");
  assert.equal(
    (
      await call(
        "words",
        { pin: r.pin, words: ["İLHAM", "ilham", " Merak! "], promptVersion: 1 },
        { token: a.token },
      )
    ).status,
    200,
  );
  let w = await call(
    "words",
    { pin: r.pin, words: ["ilham"], promptVersion: 1 },
    { token: b.token },
  );
  assert.equal(w.data.words.find((w) => w.text === "ilham").count, 2);
  assert.equal(w.data.words.find((w) => w.text === "merak").count, 1);
  w = await call(
    "words",
    { pin: r.pin, words: ["merak"], promptVersion: 1 },
    { token: b.token },
  );
  assert.equal(w.data.words.find((w) => w.text === "ilham").count, 1);
  assert.equal(w.data.words.find((w) => w.text === "merak").count, 2);
  assert.equal(
    (
      await call(
        "words",
        { pin: r.pin, words: ["a", "b", "c", "d"], promptVersion: 1 },
        { token: b.token },
      )
    ).status,
    400,
  );
  const reset = await call(
    "prompt",
    { pin: r.pin, prompt: "Yarın ne olsun?" },
    { admin: true },
  );
  assert.equal(reset.data.words.length, 0);
  assert.equal(reset.data.promptVersion, 2);
  assert.equal(
    (
      await call(
        "words",
        { pin: r.pin, words: ["merak"], promptVersion: 1 },
        { token: b.token },
      )
    ).status,
    409,
  );
});
test("raffle: import deduplication, no early winner, draw lock and no winner repetition", async () => {
  const r = await create("raffle");
  let e = await call(
    "entries",
    { pin: r.pin, names: ["Ada", "Ece", "ADA", "Deniz"] },
    { admin: true },
  );
  assert.equal(e.data.entryCount, 3);
  await join(r.pin, "Ada");
  e = await call("room", { pin: r.pin }, { admin: true });
  assert.equal(
    e.data.entryCount,
    3,
    "Joining an imported name does not grant a second ticket",
  );
  const won = new Set();
  for (let i = 0; i < 3; i++) {
    const draw = await call("draw", { pin: r.pin }, { admin: true });
    assert.equal(draw.status, 200);
    assert.equal(draw.data.draw.winner, null);
    assert.equal(draw.data.winners.length, i);
    assert.equal(draw.data.wheelEntries.length, 3 - i);
    assert(draw.data.wheelEntries.every((entry) => !won.has(entry.id)));
    assert.equal(
      (await call("draw", { pin: r.pin }, { admin: true })).status,
      409,
    );
    mutateDB(r.pin, "$s['draw']['revealAt']=microtime(true)-1");
    const slowing = (await call("room", { pin: r.pin })).data;
    assert(
      slowing.draw.winner,
      "Winner becomes available for the final landing",
    );
    assert.equal(
      slowing.winners.length,
      i,
      "Result history waits until the wheel settles",
    );
    assert.equal(
      (await call("draw", { pin: r.pin }, { admin: true })).status,
      409,
    );
    assert.equal(
      (
        await call(
          "entries",
          { pin: r.pin, names: ["Late import"] },
          { admin: true },
        )
      ).status,
      409,
    );
    mutateDB(
      r.pin,
      "$s['draw']['revealAt']=microtime(true)-1;$s['draw']['settleAt']=microtime(true)-1;$last=count($s['winners'])-1;$s['winners'][$last]['revealAt']=microtime(true)-1;$s['winners'][$last]['settleAt']=microtime(true)-1",
    );
    const revealed = (await call("room", { pin: r.pin })).data;
    assert(revealed.draw.winner);
    assert(!won.has(revealed.draw.winner.id));
    won.add(revealed.draw.winner.id);
  }
  assert.equal(won.size, 3);
  assert.equal(
    (await call("draw", { pin: r.pin }, { admin: true })).status,
    409,
  );
});
