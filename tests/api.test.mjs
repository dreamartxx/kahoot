import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
const dir = mkdtempSync(path.join(tmpdir(), "arena-test-")),
  root = path.resolve(import.meta.dirname, "..");
const port = 18191,
  base = `http://127.0.0.1:${port}/api/index.php`,
  db = path.join(dir, "test.sqlite");
let server, cookie;
async function call(action, data = {}, options = {}) {
  if (
    [
      "advance",
      "family_start",
      "cloud_start",
      "prompt",
      "draw",
      "solo_start",
      "credit_update",
      "credit_bonus",
      "credit_refund",
    ].includes(action) &&
    !("requestId" in data)
  )
    data = { ...data, requestId: randomUUID() };
  let read = [
    "credits",
    "status",
    "solo_summary",
    "solo_state",
    "categories",
    "questions",
    "family_questions",
    "rooms",
    "room",
    "users",
  ].includes(action);
  let url =
    base + "?action=" + action + (read ? "&" + new URLSearchParams(data) : "");
  const r = await fetch(url, {
    method: read ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.admin ? { Cookie: cookie } : {}),
      ...(options.cookie ? { Cookie: options.cookie } : {}),
      ...(options.token ? { "X-Player-Token": options.token } : {}),
      ...(options.origin ? { Origin: options.origin } : {}),
      ...(options.native ? {"X-Arena-Client":"android",Origin:options.origin||"https://localhost"} : {}),
      ...(options.bearer ? {Authorization:"Bearer "+options.bearer} : {}),
    },
    ...(read ? {} : { body: JSON.stringify(data) }),
  });
  const body = await r.text();
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error(`${action}: ${body}`);
  }
  return {
    status: r.status,
    data: parsed,
    cookie: r.headers.get("set-cookie"),
    session: r.headers.get("x-arena-session"),
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
  if (mode === "cloud") {
    const started = await call(
      "cloud_start",
      { pin: r.data.pin },
      { admin: true },
    );
    assert.equal(started.status, 200);
    return started.data;
  }
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
  server = spawn(
    "php",
    [
      "-d",
      `session.save_path=${dir}`,
      "-S",
      `127.0.0.1:${port}`,
      "scripts/router.php",
    ],
    {
      cwd: root,
      env: {
        ...process.env,
        ARENA_TEST_DSN: "sqlite:" + db,
        ARENA_TEST_ADMIN_HASH: hash,
      },
      stdio: "ignore",
    },
  );
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
// Each scenario gets its own rate-limit window; requests within a scenario
// still exercise the production limiter, including failed attempts.
beforeEach(() => clearLoginLimits());
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
  clearLoginLimits(); // Other sign-in scenarios must not exhaust this test's IP quota.
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
    "https://www.ailecekeglen.com.tr",
  ]) {
    assert.equal((await call("create", {}, { origin })).status, 401);
    const validLogin = await call(
      "login",
      { username: "admin", password: "local-test-password" },
      { origin },
    );
    assert.equal(validLogin.status, 200);
    assert.equal(validLogin.data.admin, true);
  }
  for (const origin of [
    "https://khaki-panther-692104.hostingersite.com.attacker.invalid",
    "https://another-site.hostingersite.com",
    "https://ailecekeglen.com.tr.attacker.invalid",
    "https://www.ailecekeglen.com.tr.attacker.invalid",
    "https://ailecekeglen.com",
    "http://ailecekeglen.com.tr",
    "http://www.ailecekeglen.com.tr",
    "http://khaki-panther-692104.hostingersite.com",
  ]) {
    assert.equal((await call("create", {}, { origin })).status, 403);
  }
});
test("all categories expose 250 questions, support manual additions and rotate ten-question games", async () => {
  const counts = (await call("categories")).data;
  for (const category of Object.keys(counts)) {
    assert.equal(counts[category], 250);
    const pool = (await call("questions", { category }, { admin: true })).data;
    assert.equal(pool.length, 250);
    const poolIds = new Set(pool.map((q) => q.id));
    const seen = new Set();
    for (let game = 0; game < 2; game++) {
      const room = await create("quiz", { category });
      const state = JSON.parse(
        execFileSync("php", [
          "-r",
          "$d=new PDO('sqlite:'.$argv[1]);$q=$d->prepare('SELECT state FROM arena_rooms WHERE pin=?');$q->execute([$argv[2]]);echo $q->fetchColumn();",
          db,
          room.pin,
        ]).toString(),
      );
      assert.equal(state.questions.length, 10);
      assert.equal(
        state.questions.filter((q) => q.difficulty === "general").length,
        9,
      );
      assert.equal(
        state.questions.filter((q) => q.difficulty === "expert").length,
        1,
      );
      for (const q of state.questions) {
        assert.equal(q.category, category);
        assert(poolIds.has(q.id));
        assert(!seen.has(q.id), "The next game uses unused category questions");
        seen.add(q.id);
        const original = pool.find((item) => item.id === q.id);
        assert.equal(q.options.length, 4);
        assert.equal(q.options[q.correct], original.options[original.correct]);
      }
      const player = await join(room.pin, "Tarih oyuncusu");
      await join(room.pin, "İkinci tarih oyuncusu");
      assert.equal(player.room.questions, undefined);
      await call(
        "advance",
        { pin: room.pin, expectedIndex: -1, expectedPhase: "lobby" },
        { admin: true },
      );
      const current = (
        await call("room", { pin: room.pin }, { token: player.token })
      ).data;
      assert.equal(current.question.options.length, 4);
      assert.equal(current.question.correct, undefined);
      assert.equal(current.question.explanation, undefined);
      await call("close", { pin: room.pin }, { admin: true });
    }
    const saved = await call(
      "question_save",
      {
        category,
        text: "Yerel test için tarih sorusu",
        options: ["A", "B", "C", "D"],
        correct: 1,
      },
      { admin: true },
    );
    assert.equal(saved.status, 200);
    assert.equal(saved.data.category, category);
    assert.equal((await call("categories")).data[category], 251);
    await call("question_delete", { id: saved.data.id }, { admin: true });
    assert.equal((await call("categories")).data[category], 250);
  }
});
test("quiz: levels rotate independently without early answer/score leaks; idempotency and deadlines", async () => {
  // Isolate a complete cycle from games created by the category smoke test.
  execFileSync("php", [
    "-r",
    "$d=new PDO('sqlite:'.$argv[1]);$d->exec(\"DELETE FROM arena_history WHERE id LIKE 'cografya-%'\");",
    db,
  ]);
  const seen = new Set();
  const pool = (
    await call("questions", { category: "cografya" }, { admin: true })
  ).data;
  for (let i = 0; i < 25; i++) {
    const r = await create("quiz");
    const raw = execFileSync("php", [
      "-r",
      "$d=new PDO('sqlite:'.$argv[1]);$q=$d->prepare('SELECT state FROM arena_rooms WHERE pin=?');$q->execute([$argv[2]]);echo $q->fetchColumn();",
      db,
      r.pin,
    ]).toString();
    const state = JSON.parse(raw);
    for (const level of ["general", "expert"]) {
      const fresh = pool.filter(
        (q) => q.difficulty === level && !seen.has(q.id),
      );
      const chosen = state.questions.filter((q) => q.difficulty === level);
      assert.equal(chosen.length, level === "general" ? 9 : 1);
      assert.equal(
        chosen.filter((q) => !seen.has(q.id)).length,
        Math.min(fresh.length, chosen.length),
      );
    }
    for (const q of state.questions) {
      seen.add(q.id);
    }
  }
  assert.equal(
    seen.size,
    pool.filter((q) => q.difficulty === "general").length + 25,
  );
  let r = await create("quiz");
  const p = await join(r.pin, "Deniz");
  await join(r.pin, "Ece");
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
  assert.equal(qs.length, 251);
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
    250,
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
    { pin: r.pin, prompt: "Yarın ne olsun?", promptVersion: 1 },
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
test("new categories create ten-question rounds and reveal details only after answering ends", async () => {
  for (const category of [
    "turkiye",
    "meshur",
    "plakalar",
    "bayraklar",
    "enler",
  ]) {
    const room = await create("quiz", { category });
    assert.equal(room.total, 10);
    await join(room.pin, "Birinci yarışmacı");
    await join(room.pin, "İkinci yarışmacı");
    const started = await call(
      "advance",
      { pin: room.pin, expectedIndex: -1, expectedPhase: "lobby" },
      { admin: true },
    );
    assert.equal(started.status, 200);
    const q = started.data.question;
    assert.equal(q.options.length, 4);
    assert.equal(q.explanation, undefined);
    assert.equal(q.correct, undefined);
    if (category === "bayraklar")
      assert(q.options.every((option) => /^flag:[a-z]{2}$/.test(option)));
    const revealed = await call(
      "advance",
      { pin: room.pin, expectedIndex: 0, expectedPhase: "question" },
      { admin: true },
    );
    assert.equal(revealed.status, 200);
    assert.equal(revealed.data.phase, "reveal");
    assert(revealed.data.question.explanation);
    assert(Number.isInteger(revealed.data.question.correct));
    if (category === "enler")
      assert(revealed.data.question.explanation.length > 65);
  }
});

test("family game keeps profiles private, generates four choices and ranks knowledge fairly", async () => {
  const room = await create("family", { seconds: 90 });
  const pin = room.pin;
  assert.equal(room.prompts.length, 10);
  assert.equal(
    (await call("family_start", { pin }, { admin: true })).status,
    409,
  );
  assert.equal((await call("join", { pin, name: "Ada" })).status, 400);
  const participants = [];
  const values = [
    "Mantı",
    "Mavi",
    "Baklava",
    "Çilek",
    "Çay",
    "Kedi",
    "Kitap okumak",
    "Yaz",
    "Paris",
    "Hababam Sınıfı",
  ];
  for (const [name, role] of [
    ["Ada", "Anne"],
    ["Ege", "Baba"],
    ["Deniz", "Çocuk"],
  ]) {
    const joined = await call("join", { pin, name, role });
    assert.equal(joined.status, 200);
    assert.deepEqual(joined.data.room.prompts, room.prompts);
    participants.push({ ...joined.data, id: joined.data.room.me.id });
  }
  assert.equal(
    (await call("family_start", { pin }, { admin: true })).status,
    409,
  );
  const answers = Object.fromEntries(
    room.prompts.map((p, i) => [p.id, values[i]]),
  );
  assert.equal((await call("family_profile", { pin, answers })).status, 401);
  assert.equal(
    (
      await call(
        "family_profile",
        { pin, answers: {} },
        { token: participants[0].token },
      )
    ).status,
    400,
  );
  for (const p of participants) {
    const r = await call(
      "family_profile",
      { pin, answers },
      { token: p.token },
    );
    assert.equal(r.status, 200);
    assert.deepEqual(r.data.myProfile, answers);
    assert.equal(r.data.profiles, undefined);
  }
  const publicRoom = (await call("room", { pin }, { admin: true })).data;
  assert.equal(publicRoom.myProfile, undefined);
  assert(!JSON.stringify(publicRoom).includes("Mantı"));
  assert.equal((await call("family_start", { pin })).status, 401);
  let current = (await call("family_start", { pin }, { admin: true })).data;
  assert.equal(current.total, 30);
  assert.equal(
    (await call("family_start", { pin }, { admin: true })).status,
    409,
  );
  assert.equal(
    (await call("join", { pin, name: "Geç kalan", role: "Teyze" })).status,
    409,
  );
  assert.equal(
    (
      await call(
        "family_profile",
        { pin, answers },
        { token: participants[0].token },
      )
    ).status,
    409,
  );
  const subjects = {};
  const correctCounts = {};
  const perSubject = {};
  for (let i = 0; i < 30; i++) {
    const q = current.question;
    assert.equal(current.phase, "question");
    assert.equal(q.correct, undefined);
    assert.equal(q.subjectKey, undefined);
    assert.equal(current.questions, undefined);
    assert.equal(q.options.length, 4);
    assert.equal(
      new Set(q.options.map((x) => x.toLocaleLowerCase("tr"))).size,
      4,
    );
    subjects[q.subject.id] = (subjects[q.subject.id] || 0) + 1;
    // Only inspect the local fixture's persisted answer key; the public API must never expose it early.
    const secret = JSON.parse(
      mutateDB(
        pin,
        'echo json_encode($s["questions"][$s["index"]])',
      ).toString(),
    );
    for (const [j, p] of participants.entries()) {
      if (p.id === q.subject.id) {
        assert.equal(
          (
            await call(
              "family_answer",
              { pin, questionId: q.id, choice: 0 },
              { token: p.token },
            )
          ).status,
          409,
        );
        continue;
      }
      const correct = j === 0 || (j === 1 && subjects[q.subject.id] <= 5);
      const choice = correct ? secret.correct : (secret.correct + 1) % 4;
      const r = await call(
        "family_answer",
        { pin, questionId: q.id, choice },
        { token: p.token },
      );
      assert.equal(r.status, 200, JSON.stringify(r.data));
      assert.deepEqual(r.data.myAnswer, { choice });
      assert.equal(r.data.me.score, (correctCounts[p.id] || 0) * 100);
      assert.equal(r.data.question.correct, undefined);
      if (correct) {
        correctCounts[p.id] = (correctCounts[p.id] || 0) + 1;
        perSubject[q.subject.id] ??= {};
        perSubject[q.subject.id][p.id] =
          (perSubject[q.subject.id][p.id] || 0) + 1;
      }
      assert.equal(
        (
          await call(
            "family_answer",
            { pin, questionId: q.id, choice },
            { token: p.token },
          )
        ).status,
        409,
      );
    }
    let revealed = await call(
      "family_advance",
      { pin, expectedIndex: i, expectedPhase: "question" },
      { admin: true },
    );
    assert.equal(revealed.status, 200);
    assert.equal(revealed.data.question.correct, secret.correct);
    assert.equal(
      (
        await call(
          "family_advance",
          { pin, expectedIndex: i, expectedPhase: "question" },
          { admin: true },
        )
      ).status,
      409,
    );
    const next = await call(
      "family_advance",
      { pin, expectedIndex: i, expectedPhase: "reveal" },
      { admin: true },
    );
    assert.equal(next.status, 200);
    current = next.data;
  }
  assert.equal(current.phase, "finished");
  assert.deepEqual(Object.values(subjects), [10, 10, 10]);
  assert.deepEqual(
    current.results.ranking.map((p) => p.score),
    [2000, 1000, 0],
  );
  assert.deepEqual(
    current.results.ranking.map((p) => p.percent),
    [100, 50, 0],
  );
  assert.deepEqual(
    current.results.ranking.map((p) => p.rank),
    [1, 2, 3],
  );
  for (const person of current.results.byPerson) {
    assert.equal(person.knowers.length, 2);
    assert(!person.knowers.some((p) => p.id === person.id));
    for (const knower of person.knowers)
      assert.equal(knower.correct, perSubject[person.id]?.[knower.id] || 0);
  }
  assert.equal(
    (
      await call(
        "family_answer",
        { pin, choice: 0 },
        { token: participants[0].token },
      )
    ).status,
    409,
  );
});

test("family deadlines, invalid choices, stale questions and tied ranks", async () => {
  const room = await create("family");
  const pin = room.pin;
  const players = [];
  for (const name of ["Birinci", "İkinci"]) {
    const j = await call("join", { pin, name, role: "Kuzen" });
    players.push(j.data);
    const answers = Object.fromEntries(
      room.prompts.map((p) => [p.id, "Aynı cevap"]),
    );
    assert.equal(
      (await call("family_profile", { pin, answers }, { token: j.data.token }))
        .status,
      200,
    );
  }
  const start = await call("family_start", { pin }, { admin: true });
  const subject = start.data.question.subject.id;
  const p = players.find((p) => p.room.me.id !== subject);
  const qid = start.data.question.id;
  assert.equal(
    (
      await call(
        "family_answer",
        { pin, questionId: qid, choice: 4 },
        { token: p.token },
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        "family_answer",
        { pin, questionId: "stale", choice: 0 },
        { token: p.token },
      )
    ).status,
    409,
  );
  mutateDB(pin, '$s["deadline"]=microtime(true)-1');
  assert.equal((await call("room", { pin })).data.phase, "reveal");
  assert.equal(
    (
      await call(
        "family_answer",
        { pin, questionId: qid, choice: 0 },
        { token: p.token },
      )
    ).status,
    409,
  );
  mutateDB(pin, '$s["phase"]="finished"');
  const finished = (await call("room", { pin })).data;
  assert.deepEqual(
    finished.results.ranking.map((p) => p.rank),
    [1, 1],
  );
  assert(
    finished.results.ranking.every((p) => p.total === 10 && p.score === 0),
  );
  const quiz = await create("quiz");
  assert.equal(
    (await call("family_start", { pin: quiz.pin }, { admin: true })).status,
    400,
  );
});

test("quiz and family auto-advance through reveal, synchronized 3–2–1 and final results without host requests", async () => {
  for (const mode of ["quiz", "family"]) {
    const r = await create(mode, { seconds: 20 });
    const pin = r.pin;
    const players = [];
    for (const name of ["Otomatik Bir", "Otomatik İki"]) {
      const joined = await call("join", { pin, name, role: "Kuzen" });
      assert.equal(joined.status, 200);
      players.push(joined.data);
      if (mode === "family") {
        const answers = Object.fromEntries(
          r.prompts.map((p) => [p.id, "Cevabım"]),
        );
        assert.equal(
          (
            await call(
              "family_profile",
              { pin, answers },
              { token: joined.data.token },
            )
          ).status,
          200,
        );
      }
    }
    const action = mode === "family" ? "family_start" : "advance";
    const start = await call(
      action,
      { pin, expectedIndex: -1, expectedPhase: "lobby" },
      { admin: true },
    );
    assert.equal(start.status, 200);
    const oldId = start.data.question.id;
    mutateDB(pin, "$s['deadline']=microtime(true)-1");
    const reveal = (await call("room", { pin }, { token: players[0].token }))
      .data;
    assert.equal(reveal.phase, "reveal");
    assert(Number.isInteger(reveal.question.correct));
    assert(reveal.revealUntil > reveal.serverTime);
    for (const [elapsed, digit] of [
      [5.1, 3],
      [6.1, 2],
      [7.1, 1],
    ]) {
      mutateDB(pin, `$s['deadline']=microtime(true)-${elapsed}`);
      const a = (await call("room", { pin }, { token: players[0].token })).data;
      const b = (await call("room", { pin }, { token: players[1].token })).data;
      assert.equal(a.phase, "countdown");
      assert.equal(b.phase, "countdown");
      assert.equal(
        a.question,
        undefined,
        "The next question cannot leak during the countdown",
      );
      assert.equal(a.countdownUntil, b.countdownUntil);
      assert.equal(Math.ceil(a.countdownUntil - a.serverTime), digit);
      const rejected = await call(
        mode === "family" ? "family_answer" : "answer",
        { pin, questionId: oldId, choice: 0 },
        { token: players[0].token },
      );
      assert.equal(rejected.status, 409);
    }
    mutateDB(pin, "$s['deadline']=microtime(true)-8.1");
    const next = (await call("room", { pin }, { token: players[0].token }))
      .data;
    assert.equal(next.phase, "question");
    assert.equal(next.index, 1);
    assert.notEqual(next.question.id, oldId);
    assert.equal(next.question.correct, undefined);
    assert(
      next.deadline - next.serverTime > 19 &&
        next.deadline - next.serverTime <= 20,
    );
    const responder =
      mode === "quiz"
        ? players[0]
        : players.find((p) => p.room.me.id !== next.question.subject.id);
    const stale = await call(
      mode === "family" ? "family_answer" : "answer",
      { pin, questionId: oldId, choice: 0 },
      { token: responder.token },
    );
    assert.equal(stale.status, 409);
    const answer = await call(
      mode === "family" ? "family_answer" : "answer",
      { pin, questionId: next.question.id, choice: 0 },
      { token: responder.token },
    );
    assert.equal(answer.status, 200);
    assert.equal(answer.data.myAnswer.points, undefined);
    mutateDB(
      pin,
      "$s['phase']='question';$s['index']=count($s['questions'])-1;$s['deadline']=microtime(true)-5.1",
    );
    const finished = (await call("room", { pin })).data;
    assert.equal(finished.phase, "finished");
    if (mode === "family") assert.equal(finished.results.ranking.length, 2);
    assert.equal(
      (
        await call(
          mode === "family" ? "family_answer" : "answer",
          { pin, questionId: next.question.id, choice: 0 },
          { token: responder.token },
        )
      ).status,
      409,
    );
  }
});

test("automatic clock preserves deadlines across exact boundaries and sleeping clients", () => {
  const output = execFileSync(
    "php",
    [
      "-r",
      `
    require 'api/core.php';
    $base=['mode'=>'quiz','phase'=>'question','deadline'=>100.0,'index'=>0,'seconds'=>20,'questions'=>array_fill(0,10,[])];
    $out=[];
    foreach([99.9,100,104.9,105,106,107,108,128,192,357] as $time){$s=$base;syncQuizClock($s,$time);$out[]=['phase'=>$s['phase'],'index'=>$s['index'],'deadline'=>$s['deadline']];}
    echo json_encode($out);
  `,
    ],
    { cwd: root },
  ).toString();
  const snapshots = JSON.parse(output);
  assert.deepEqual(
    snapshots.map((s) => s.phase),
    [
      "question",
      "reveal",
      "reveal",
      "countdown",
      "countdown",
      "countdown",
      "question",
      "reveal",
      "question",
      "finished",
    ],
  );
  assert.equal(snapshots[6].deadline, 128);
  assert.equal(snapshots[8].index, 4);
  assert.equal(snapshots[8].deadline, 212);
  assert.equal(snapshots[9].index, 9);
});

test("family distractors never reuse another family member's answers, including curated matches", async () => {
  const r = await create("family");
  const pin = r.pin;
  const allAnswers = [];
  for (const [index, name] of [
    "Gizli Bir",
    "Gizli İki",
    "Gizli Üç",
  ].entries()) {
    const joined = await call("join", { pin, name, role: "Kuzen" });
    const values =
      index === 0
        ? [
            "Mantı",
            "MAVİ",
            "Baklava",
            "Çilek",
            "Çay",
            "Kedi",
            "Kitap okumak",
            "Yaz",
            "Paris",
            "Hababam Sınıfı",
          ]
        : index === 1
          ? [
              "Pizza",
              "Yeşil",
              "Sütlaç",
              "Elma",
              "Ayran",
              "Köpek",
              "Yüzmek",
              "Kış",
              "Roma",
              "Harry Potter",
            ]
          : [
              "Köfte",
              "Mor",
              "Dondurma",
              "Muz",
              "Su",
              "Yunus",
              "Resim çizmek",
              "İlkbahar",
              "Londra",
              "Aslan Kral",
            ];
    allAnswers.push(...values.map((x) => x.toLocaleLowerCase("tr")));
    const answers = Object.fromEntries(
      r.prompts.map((p, i) => [p.id, values[i]]),
    );
    assert.equal(
      (
        await call(
          "family_profile",
          { pin, answers },
          { token: joined.data.token },
        )
      ).status,
      200,
    );
  }
  assert.equal(
    (await call("family_start", { pin }, { admin: true })).status,
    200,
  );
  const deck = JSON.parse(
    mutateDB(pin, 'echo json_encode($s["questions"])').toString(),
  );
  assert.equal(deck.length, 30);
  for (const q of deck) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert(allAnswers.includes(q.options[q.correct].toLocaleLowerCase("tr")));
    for (const [i, option] of q.options.entries())
      if (i !== q.correct)
        assert(
          !allAnswers.includes(option.toLocaleLowerCase("tr")),
          `Private answer leaked as distractor: ${option}`,
        );
  }
});

test("family pool rotates fifty balanced prompts without repeats, including games created in the same second", async () => {
  execFileSync("php", [
    "-r",
    "$db=new PDO('sqlite:'.$argv[1]);$db->exec(\"DELETE FROM arena_history WHERE id LIKE 'family-%'\");",
    db,
  ]);
  const pool = JSON.parse(
    execFileSync(
      "php",
      ["-r", "require 'api/core.php'; echo json_encode(familyPrompts());"],
      { cwd: root },
    ).toString(),
  );
  assert.equal(pool.length, 50);
  assert.equal(new Set(pool.map((p) => p.id)).size, 50);
  assert.equal(new Set(pool.map((p) => p.self)).size, 50);
  const groups = Object.groupBy(pool, (p) => p.group);
  assert.equal(Object.keys(groups).length, 5);
  assert(Object.values(groups).every((group) => group.length === 10));
  for (const p of pool) {
    assert(p.self.endsWith("?"));
    assert(p.ask.endsWith("?"));
    assert(p.examples.length >= 6);
    assert.equal(new Set(p.examples).size, p.examples.length);
  }
  const seen = new Set(),
    games = [];
  for (let n = 0; n < 5; n++) {
    const game = await create("family");
    games.push(game);
    assert.equal(game.prompts.length, 10);
    const selectedGroups = {};
    for (const prompt of game.prompts) {
      assert(!seen.has(prompt.id), `Repeated early: ${prompt.id}`);
      seen.add(prompt.id);
      const group = pool.find((p) => p.id === prompt.id).group;
      selectedGroups[group] = (selectedGroups[group] || 0) + 1;
    }
    assert.deepEqual(Object.values(selectedGroups), [2, 2, 2, 2, 2]);
  }
  assert.equal(seen.size, 50);
  const sixth = await create("family");
  assert.deepEqual(
    sixth.prompts.map((p) => p.id).sort(),
    games[0].prompts.map((p) => p.id).sort(),
  );
  const first = games[0],
    pin = first.pin;
  assert.deepEqual(
    (await call("room", { pin })).data.prompts,
    first.prompts,
    "A room keeps its own selected prompts",
  );
  const player = (
    await call("join", { pin, name: "Havuz Katılımcı", role: "Anne" })
  ).data;
  assert.deepEqual(player.room.prompts, first.prompts);
  const answers = Object.fromEntries(
    first.prompts.map((p) => [
      p.id,
      pool.find((x) => x.id === p.id).examples[0],
    ]),
  );
  const invalid = { ...answers };
  delete invalid[first.prompts[0].id];
  invalid[pool.find((p) => !(p.id in answers)).id] = "Başka oyunun cevabı";
  assert.equal(
    (
      await call(
        "family_profile",
        { pin, answers: invalid },
        { token: player.token },
      )
    ).status,
    400,
  );
  assert.equal(
    (await call("family_profile", { pin, answers }, { token: player.token }))
      .status,
    200,
  );
  assert.deepEqual(
    (await call("room", { pin }, { token: player.token })).data.myProfile,
    answers,
  );
});

test("family rooms from before the fifty-question pool keep their original ten prompts and saved answers", async () => {
  const r = await create("family");
  const pin = r.pin;
  mutateDB(pin, "unset($s['familyPrompts'])");
  const legacy = [
    "food",
    "color",
    "dessert",
    "fruit",
    "drink",
    "animal",
    "hobby",
    "season",
    "city",
    "screen",
  ];
  const room = (await call("room", { pin })).data;
  assert.deepEqual(
    room.prompts.map((p) => p.id),
    legacy,
  );
  for (const name of ["Eski Oyun Bir", "Eski Oyun İki"]) {
    const p = (await call("join", { pin, name, role: "Kuzen" })).data;
    const answers = Object.fromEntries(
      legacy.map((id) => [id, "Eski cevabım"]),
    );
    assert.equal(
      (await call("family_profile", { pin, answers }, { token: p.token }))
        .status,
      200,
    );
  }
  assert.equal(
    (await call("family_start", { pin }, { admin: true })).status,
    200,
  );
  const deck = JSON.parse(
    mutateDB(pin, 'echo json_encode($s["questions"])').toString(),
  );
  assert.equal(deck.length, 20);
  assert(deck.every((q) => legacy.includes(q.promptId)));
});

test("custom family questions mix with the pool and keep participant answers private in four-choice rounds", async () => {
  const familyQuestions = [
    {
      text: "En sevdiğim kahvaltılık hangisi?",
      examples: ["Menemen", "Simit", "Tost"],
    },
    {
      text: "En çok sevdiğim yemek hangisi?",
      examples: ["Mantı", "Pizza", "Köfte"],
    },
  ];
  const room = await create("family", { familyQuestions, seconds: 90 });
  assert.equal(room.prompts.length, 10);
  assert.equal(
    room.prompts.filter((p) => p.id.startsWith("custom-family-")).length,
    2,
  );
  assert.equal(new Set(room.prompts.map((p) => p.text)).size, 10);
  for (const custom of familyQuestions)
    assert(room.prompts.some((p) => p.text === custom.text));
  assert.deepEqual(
    (await call("room", { pin: room.pin })).data.prompts,
    room.prompts,
  );
  const privateAnswers = [];
  for (const [index, name] of ["Elif", "Can"].entries()) {
    const player = await call("join", { pin: room.pin, name, role: "Kuzen" });
    const answers = Object.fromEntries(
      room.prompts.map((p, i) => [
        p.id,
        p.text === familyQuestions[0].text
          ? ["Menemen", "Simit"][index]
          : `${name} özel cevabı ${i}`,
      ]),
    );
    privateAnswers.push(...Object.values(answers));
    const saved = await call(
      "family_profile",
      { pin: room.pin, answers },
      { token: player.data.token },
    );
    assert.equal(saved.status, 200);
    assert.deepEqual(saved.data.myProfile, answers);
  }
  const lobby = JSON.stringify(
    (await call("room", { pin: room.pin }, { admin: true })).data,
  );
  for (const answer of privateAnswers) assert(!lobby.includes(answer));
  const started = await call(
    "family_start",
    { pin: room.pin },
    { admin: true },
  );
  assert.equal(started.status, 200);
  assert.equal(started.data.total, 20);
  assert.equal(started.data.question.correct, undefined);
  const deck = JSON.parse(
    mutateDB(room.pin, 'echo json_encode($s["questions"])').toString(),
  );
  for (const q of deck) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert(privateAnswers.includes(q.options[q.correct]));
    q.options.forEach((option, i) => {
      if (i !== q.correct) assert(!privateAnswers.includes(option));
    });
  }
  assert.equal(
    deck.filter((q) => q.text.includes("«En sevdiğim kahvaltılık hangisi?»"))
      .length,
    2,
  );
});

test("family hosts choose exact prompts, mix custom questions, and invalid selections are rejected", async () => {
  assert.equal((await call("family_questions")).status, 401);
  const catalog = (await call("family_questions", {}, { admin: true })).data;
  assert.equal(catalog.length, 50);
  assert(catalog.every((p) => Object.keys(p).sort().join() === "id,text"));
  const ids = catalog.slice(0, 10).map((p) => p.id);
  const room = await create("family", { familyQuestionIds: ids });
  assert.deepEqual(room.prompts.map((p) => p.id).sort(), [...ids].sort());
  const participant = await call("join", {
    pin: room.pin,
    name: "Elif",
    role: "Anne",
  });
  assert.equal(participant.status, 200);
  const joined = await call(
    "room",
    { pin: room.pin },
    { token: participant.data.token },
  );
  assert.deepEqual(
    joined.data.prompts.map((p) => p.id).sort(),
    [...ids].sort(),
  );
  const answers = Object.fromEntries(ids.map((id) => [id, "Benim tercihim"]));
  assert.equal(
    (
      await call(
        "family_profile",
        { pin: room.pin, answers },
        { token: participant.data.token },
      )
    ).status,
    200,
  );
  const custom = {
    text: "En sevdiğim aile buluşması hangisi?",
    examples: ["Piknik", "Kahvaltı", "Bayram"],
  };
  const mixed = await create("family", {
    familyQuestionIds: ids.slice(0, 9),
    familyQuestions: [custom],
  });
  assert.equal(mixed.prompts.length, 10);
  assert.deepEqual(
    mixed.prompts
      .filter((p) => !p.id.startsWith("custom-family-"))
      .map((p) => p.id)
      .sort(),
    ids.slice(0, 9).sort(),
  );
  assert(mixed.prompts.some((p) => p.text === custom.text));
  for (const invalid of [
    "food",
    { 1: "food" },
    [null],
    ids.slice(0, 9),
    [...ids, "color"],
    [...ids.slice(0, 9), ids[0]],
    [...ids.slice(0, 9), "unknown"],
  ]) {
    assert.equal(
      (
        await call(
          "create",
          { mode: "family", title: "Soru seçimi", familyQuestionIds: invalid },
          { admin: true },
        )
      ).status,
      400,
    );
  }
  assert.equal(
    (
      await call(
        "create",
        {
          mode: "family",
          title: "Fazla soru",
          familyQuestionIds: ids,
          familyQuestions: [custom],
        },
        { admin: true },
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        "create",
        {
          mode: "family",
          title: "Aynı soru",
          familyQuestionIds: ids.slice(0, 9),
          familyQuestions: [{ ...custom, text: catalog[0].text }],
        },
        { admin: true },
      )
    ).status,
    400,
  );
  const recorded = JSON.parse(
    execFileSync("php", [
      "-r",
      "$db=new PDO('sqlite:'.$argv[1]);echo json_encode($db->query(\"SELECT id FROM arena_history WHERE id LIKE 'family-prompt:%'\")->fetchAll(PDO::FETCH_COLUMN));",
      db,
    ]).toString(),
  );
  assert(ids.every((id) => recorded.includes("family-prompt:" + id)));
});

test("all ten family questions may be custom; invalid and unauthorized submissions are rejected", async () => {
  const familyQuestions = Array.from({ length: 10 }, (_, i) => ({
    text: `En sevdiğim aile etkinliği ${i + 1} hangisi?`,
    examples: ["Piknik", "Yürüyüş", "Sinema"],
  }));
  const room = await create("family", { familyQuestions });
  assert.equal(room.prompts.length, 10);
  assert(room.prompts.every((p) => p.id.startsWith("custom-family-")));
  for (const invalid of [
    "invalid",
    [null],
    [{ ...familyQuestions[0], text: "" }],
    [{ ...familyQuestions[0], examples: ["Tek"] }],
    [{ ...familyQuestions[0], examples: ["PİKNİK", "piknik", "Tost"] }],
    [familyQuestions[0], familyQuestions[0]],
    [...familyQuestions, familyQuestions[0]],
  ]) {
    assert.equal(
      (
        await call(
          "create",
          { mode: "family", title: "Özel aile", familyQuestions: invalid },
          { admin: true },
        )
      ).status,
      400,
    );
  }
  assert.equal(
    (
      await call("create", {
        mode: "family",
        title: "Özel aile",
        familyQuestions,
      })
    ).status,
    401,
  );
  const defaultRoom = await create("family", { familyQuestions: [] });
  assert(defaultRoom.prompts.every((p) => !p.id.startsWith("custom-family-")));
});

test("durable accounts, owner-only management, room isolation and session revocation", async () => {
  const sql = (code) =>
    execFileSync("php", [
      "-r",
      `$db=new PDO('sqlite:'.$argv[1]);${code}`,
      db,
    ]).toString();
  sql("$db->exec('DELETE FROM arena_limits');");
  const ownerStatus = await call("status", {}, { admin: true });
  assert.equal(ownerStatus.data.user.username, "admin");
  assert.equal(ownerStatus.data.user.role, "owner");
  assert.equal((await call("users")).status, 401);
  assert.equal(
    (await call("user_create", { username: "host", password: "1234" })).status,
    401,
  );
  assert.equal((await fetch(base + "?action=user_create")).status, 405);
  assert.equal(
    (
      await call(
        "user_create",
        { username: "host", password: "" },
        { admin: true },
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        "user_create",
        { username: "host", password: "1234", role: "owner" },
        { admin: true },
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await call(
        "user_create",
        { username: "HOST", password: "1" },
        { admin: true },
      )
    ).status,
    409,
  );
  const users = (await call("users", {}, { admin: true })).data;
  const host = users.find((u) => u.username === "host");
  assert.equal(host.role, "host");
  assert(!JSON.stringify(users).includes("password"));
  assert.equal(
    (await call("login", { username: "missing", password: "1234" })).status,
    401,
  );
  const login = await call("login", { username: "HOST", password: "1234" });
  assert.equal(login.status, 200);
  assert.match(login.cookie, /HttpOnly/i);
  assert.match(login.cookie, /SameSite=Strict/i);
  assert.match(login.cookie, /Max-Age=2592000/);
  const session = login.cookie.split(";")[0];
  const familyCatalog = await call("family_questions", {}, { cookie: session });
  assert.equal(familyCatalog.status, 200);
  const hostChoice = familyCatalog.data.slice(0, 10).map((p) => p.id);
  const chosenRoom = await call(
    "create",
    {
      mode: "family",
      title: "Sunucunun seçtikleri",
      familyQuestionIds: hostChoice,
    },
    { cookie: session },
  );
  assert.equal(chosenRoom.status, 200);
  assert.deepEqual(
    chosenRoom.data.prompts.map((p) => p.id).sort(),
    hostChoice.sort(),
  );
  assert.equal((await call("questions", {}, { cookie: session })).status, 403);
  assert.match(session, /^arena_session=[a-f0-9]{64}$/);
  const token = session.split("=")[1];
  const stored = JSON.parse(
    sql(
      "echo json_encode($db->query('SELECT token_hash,expires_at FROM arena_sessions')->fetchAll(PDO::FETCH_ASSOC));",
    ),
  );
  assert(stored.every((s) => s.token_hash !== token));
  const opt = { cookie: session };
  assert.equal(
    (await call("close", { pin: chosenRoom.data.pin }, opt)).status,
    200,
  );
  assert.equal((await call("status", {}, opt)).data.user.username, "host");
  assert.equal((await call("users", {}, opt)).status, 403);
  // Profile data always belongs to the authenticated account, even with a forged ID.
  const self = await call("status", { id: 1 }, opt);
  assert.equal(self.data.user.id, host.id);
  assert.deepEqual(Object.keys(self.data.user).sort(), [
    "active",
    "authProvider",
    "id",
    "role",
    "username",
  ]);
  assert.equal(
    (await call("profile_update", { username: "nobody" })).status,
    401,
  );
  assert.equal((await fetch(base + "?action=profile_update")).status, 405);
  for (const extra of [
    { id: 1 },
    { role: "owner" },
    { active: false },
    { password: "replacement" },
  ]) {
    assert.equal(
      (await call("profile_update", { username: "forged", ...extra }, opt))
        .status,
      400,
    );
  }
  assert.equal(
    (await call("profile_update", { username: "admin" }, opt)).status,
    409,
  );
  assert.equal(
    (await call("profile_update", { username: "bad name" }, opt)).status,
    400,
  );
  assert.equal(
    (await call("profile_update", { username: "" }, opt)).status,
    400,
  );
  assert.equal(
    (
      await call(
        "profile_update",
        { username: "changed" },
        { ...opt, origin: "https://untrusted.example" },
      )
    ).status,
    403,
  );
  const renamed = await call(
    "profile_update",
    { username: "host.updated" },
    opt,
  );
  assert.equal(renamed.status, 200);
  assert.equal(renamed.data.user.id, host.id);
  assert.equal(renamed.data.user.role, "host");
  assert.equal(
    (await call("status", {}, opt)).data.user.username,
    "host.updated",
  );
  assert.equal(
    (await call("status", {}, { admin: true })).data.user.username,
    "admin",
  );
  assert.equal((await call("users", {}, opt)).status, 403);
  assert.equal(
    (await call("profile_update", { username: "host" }, opt)).status,
    200,
  );

  assert.equal(
    (await call("user_create", { username: "intruder", password: "x" }, opt))
      .status,
    403,
  );
  assert.equal(
    (await call("user_update", { id: 1, username: "intruder" }, opt)).status,
    403,
  );
  const own = await create("raffle");
  for (const mode of ["quiz", "family", "cloud", "raffle", "tournament"]) {
    const room = await call(
      "create",
      { mode, title: "Sunucu testi", category: "cografya", prize: "Kupa" },
      opt,
    );
    assert.equal(room.status, 200, JSON.stringify(room));
    assert.equal(room.data.canManage, true);
    assert.equal(
      (await call("room", { pin: room.data.pin }, { admin: true })).data
        .canManage,
      true,
    );
    assert.equal(
      (await call("room", { pin: room.data.pin })).data.canManage,
      false,
    );
    assert.equal((await call("status", {}, opt)).data.admin, true);
    assert.equal(
      (await call("close", { pin: room.data.pin }, opt)).status,
      200,
    );
  }
  assert((await call("rooms", {}, opt)).data.every((r) => r.pin !== own.pin));
  const foreign = await call("room", { pin: own.pin }, opt);
  assert.equal(foreign.data.canManage, false);
  assert.equal(foreign.data.entries, undefined);
  for (const action of [
    "advance",
    "prompt",
    "entries",
    "draw",
    "close",
    "family_start",
    "family_advance",
    "tournament_prize",
    "tournament_start",
    "tournament_vote_close",
  ]) {
    assert.equal(
      (await call(action, { pin: own.pin }, opt)).status,
      403,
      action,
    );
  }
  const q = {
    category: "cografya",
    text: "Sunucuya özel örnek soru hangisidir?",
    options: ["Bir", "İki", "Üç", "Dört"],
    correct: 0,
  };
  assert.equal((await call("question_save", q, opt)).status, 403);
  assert.equal((await call("questions", {}, opt)).status, 403);
  assert.equal(
    (await call("questions", { category: "cografya" }, opt)).status,
    403,
  );
  const ownerPool = (
    await call("questions", { category: "cografya" }, { admin: true })
  ).data;
  assert.equal(
    (
      await call(
        "create",
        {
          mode: "quiz",
          title: "Yetkisiz seçim",
          category: "cografya",
          questionIds: ownerPool.slice(0, 10).map((q) => q.id),
        },
        opt,
      )
    ).status,
    403,
  );
  const custom = await call("question_save", q, { admin: true });
  assert.equal(custom.status, 200);
  assert.equal(
    (await call("question_delete", { id: custom.data.id }, opt)).status,
    403,
  );
  assert.equal(
    (
      await call(
        "user_create",
        { username: "host2", password: "x" },
        { admin: true },
      )
    ).status,
    200,
  );
  const other = await call("login", { username: "host2", password: "x" });
  const otherOpt = { cookie: other.cookie.split(";")[0] };
  assert.equal(
    (await call("question_delete", { id: custom.data.id }, otherOpt)).status,
    403,
  );
  assert.equal(
    (await call("questions", { category: "cografya" }, otherOpt)).status,
    403,
  );
  assert.equal(
    (await call("question_delete", { id: custom.data.id }, { admin: true }))
      .status,
    200,
  );
  assert.equal(
    (await call("user_update", { id: 1, active: false }, { admin: true }))
      .status,
    400,
  );
  assert.equal(
    (await call("user_update", { id: host.id, password: "z" }, { admin: true }))
      .status,
    200,
  );
  assert.equal((await call("rooms", {}, opt)).status, 401);
  assert.equal(
    (await call("login", { username: "host", password: "1234" })).status,
    401,
  );
  let resetLogin = await call("login", { username: "host", password: "z" });
  assert.equal(resetLogin.status, 200);
  const resetOpt = { cookie: resetLogin.cookie.split(";")[0] };
  assert.equal(
    (await call("user_update", { id: host.id, active: false }, { admin: true }))
      .status,
    200,
  );
  assert.equal(
    (await call("login", { username: "host", password: "z" })).status,
    401,
  );
  assert.equal((await call("status", {}, resetOpt)).data.admin, false);
  assert.equal(
    (
      await call(
        "user_update",
        { id: host.id, active: true, username: "Sunucu" },
        { admin: true },
      )
    ).status,
    200,
  );
  assert.equal((await call("status", {}, resetOpt)).data.admin, false);
  const renewed = await call("login", { username: "Sunucu", password: "z" });
  assert.equal(renewed.status, 200);
  const renewedOpt = { cookie: renewed.cookie.split(";")[0] };
  assert.equal((await call("logout", {}, renewedOpt)).status, 200);
  assert.equal((await call("rooms", {}, renewedOpt)).status, 401);
  sql(
    `$db->exec('UPDATE arena_sessions SET expires_at=1 WHERE user_id=${users.length + 1}');`,
  );
  assert.equal((await call("status", {}, otherOpt)).data.admin, false);
  assert.equal((await call("status", {}, { admin: true })).data.admin, true);
});

test("existing PHP owner login upgrades once, and active durable sessions extend expiry", async () => {
  const legacyId = execFileSync("php", [
    "-r",
    `session_save_path($argv[2]);session_id(bin2hex(random_bytes(16)));session_start();$db=new PDO('sqlite:'.$argv[1]);$_SESSION['admin_until']=time()+3600;$_SESSION['admin_version']=hash('sha256',$db->query('SELECT password_hash FROM arena_auth WHERE id=1')->fetchColumn());$id=session_id();session_write_close();echo $id;`,
    db,
    dir,
  ]).toString();
  const legacyOpt = { cookie: "PHPSESSID=" + legacyId };
  const upgraded = await call("status", {}, legacyOpt);
  assert.equal(upgraded.data.admin, true);
  assert.equal(upgraded.data.user.id, 1);
  const durable = upgraded.cookie.match(/arena_session=[a-f0-9]{64}/)[0];
  assert.equal((await call("status", {}, legacyOpt)).data.admin, false);
  execFileSync("php", [
    "-r",
    "$db=new PDO('sqlite:'.$argv[1]);$q=$db->prepare('UPDATE arena_sessions SET expires_at=? WHERE token_hash=?');$q->execute([time()+3600,hash('sha256',$argv[2])]);",
    db,
    durable.split("=")[1],
  ]);
  const extended = await call("status", {}, { cookie: durable });
  assert.equal(extended.data.admin, true);
  assert.match(extended.cookie, /Max-Age=2592000/);
  await call("logout", {}, { cookie: durable });
  assert.equal(
    (await call("status", {}, { cookie: durable })).data.admin,
    false,
  );
});

test("characters persist in quiz and family snapshots, results and legacy rooms", async () => {
  const quiz = await create("quiz");
  for (const avatar of ["../config.local.php", "invalid", ["fox"]]) {
    assert.equal(
      (await call("join", { pin: quiz.pin, name: "Hatalı", avatar })).status,
      400,
    );
  }
  const joined = await call("join", {
    pin: quiz.pin,
    name: "Tilki",
    avatar: "fox",
  });
  assert.equal(joined.status, 200);
  assert.equal(joined.data.room.me.avatar, "fox");
  assert.equal(joined.data.room.players[0].avatar, "fox");
  const reloaded = await call(
    "room",
    { pin: quiz.pin },
    { token: joined.data.token },
  );
  assert.equal(reloaded.data.me.avatar, "fox");
  mutateDB(
    quiz.pin,
    "foreach($s['players'] as &$p)unset($p['avatar']);unset($p)",
  );
  assert.equal(
    (await call("room", { pin: quiz.pin })).data.players[0].avatar,
    "astronaut",
  );
  const family = await create("family");
  const one = await call("join", {
    pin: family.pin,
    name: "Ada",
    role: "Anne",
    avatar: "wizard",
  });
  const two = await call("join", {
    pin: family.pin,
    name: "Efe",
    role: "Baba",
    avatar: "dragon",
  });
  assert.equal(one.data.room.me.avatar, "wizard");
  assert.deepEqual(
    two.data.room.players.map((p) => p.avatar),
    ["wizard", "dragon"],
  );
  mutateDB(family.pin, "$s['phase']='finished'");
  const result = await call("room", { pin: family.pin });
  assert.deepEqual(
    result.data.results.ranking.map((p) => p.avatar),
    ["wizard", "dragon"],
  );
  assert.deepEqual(
    result.data.results.byPerson.map((p) => p.avatar),
    ["wizard", "dragon"],
  );
  const legacy = await create("cloud");
  assert.equal(
    (await join(legacy.pin, "Eski İstemci")).room.me.avatar,
    "astronaut",
  );
});

test("quiz answer cards reveal both selections only after the round, with viewer-relative identity", async () => {
  const r = await create("quiz", { seconds: 20 });
  const a = await call("join", { pin: r.pin, name: "Yeşil", avatar: "fox" });
  const b = await call("join", {
    pin: r.pin,
    name: "Kırmızı",
    avatar: "dragon",
  });
  await join(r.pin, "Sessiz");
  assert.equal(a.data.room.answerCards, undefined);
  const start = await call(
    "advance",
    { pin: r.pin, expectedIndex: -1, expectedPhase: "lobby" },
    { admin: true },
  );
  const q = JSON.parse(
    mutateDB(r.pin, 'echo json_encode($s["questions"][0])').toString(),
  );
  for (const [p, choice] of [
    [a, q.correct],
    [b, (q.correct + 1) % 4],
  ]) {
    const answered = await call(
      "answer",
      { pin: r.pin, questionId: q.id, choice },
      { token: p.data.token },
    );
    assert.equal(answered.status, 200);
    assert.equal(answered.data.answerCards, undefined);
    assert.equal(answered.data.question.correct, undefined);
  }
  assert.equal(
    (await call("room", { pin: r.pin }, { admin: true })).data.answerCards,
    undefined,
  );
  assert.equal(start.data.answerCards, undefined);
  const reveal = await call(
    "advance",
    { pin: r.pin, expectedIndex: 0, expectedPhase: "question" },
    { admin: true },
  );
  assert.equal(reveal.data.answerCards.length, 3);
  assert(reveal.data.answerCards.every((p) => !p.isMe));
  for (const [viewer, name] of [
    [a, "Yeşil"],
    [b, "Kırmızı"],
  ]) {
    const result = (
      await call("room", { pin: r.pin }, { token: viewer.data.token })
    ).data;
    assert.equal(result.answerCards.find((p) => p.isMe).name, name);
    assert.equal(result.answerCards.filter((p) => p.isMe).length, 1);
    assert.equal(result.answerCards[0].choice, q.correct);
    assert.equal(result.answerCards[0].correct, true);
    assert.equal(result.answerCards[0].avatar, "fox");
    assert.equal(result.answerCards[1].choice, (q.correct + 1) % 4);
    assert.equal(result.answerCards[1].correct, false);
    assert.equal(result.answerCards[2].choice, null);
    assert.equal(result.answerCards[2].correct, null);
    assert(result.answerCards.every((p) => !("token" in p) && !("key" in p)));
  }
  mutateDB(
    r.pin,
    "$s['phase']='countdown';$s['countdownUntil']=microtime(true)+30",
  );
  assert.equal(
    (await call("room", { pin: r.pin })).data.answerCards,
    undefined,
  );
  mutateDB(r.pin, "$s['phase']='finished'");
  assert.equal(
    (await call("room", { pin: r.pin })).data.answerCards,
    undefined,
  );
});

test("family comparison exposes only the current reference answer and guess after reveal", async () => {
  const r = await create("family", { seconds: 90 });
  const participants = [];
  for (const [name, role, avatar] of [
    ["Ada", "Anne", "wizard"],
    ["Emir", "Baba", "robot"],
  ]) {
    const joined = (await call("join", { pin: r.pin, name, role, avatar }))
      .data;
    participants.push(joined);
    const profile = Object.fromEntries(
      r.prompts.map((p, i) => [p.id, `${name} özel yanıt ${i}`]),
    );
    assert.equal(
      (
        await call(
          "family_profile",
          { pin: r.pin, answers: profile },
          { token: joined.token },
        )
      ).status,
      200,
    );
  }
  await call("family_start", { pin: r.pin }, { admin: true });
  const q = JSON.parse(
    mutateDB(r.pin, 'echo json_encode($s["questions"][0])').toString(),
  );
  const room = (await call("room", { pin: r.pin })).data;
  const subject = participants.find(
    (p) => p.room.me.id === room.question.subject.id,
  );
  const guesser = participants.find((p) => p !== subject);
  const guessed = await call(
    "family_answer",
    { pin: r.pin, questionId: q.id, choice: (q.correct + 1) % 4 },
    { token: guesser.token },
  );
  assert.equal(guessed.status, 200);
  assert.equal(guessed.data.answerCards, undefined);
  assert.equal(guessed.data.question.correct, undefined);
  assert.equal(
    (await call("room", { pin: r.pin }, { token: subject.token })).data
      .answerCards,
    undefined,
  );
  await call(
    "family_advance",
    { pin: r.pin, expectedIndex: 0, expectedPhase: "question" },
    { admin: true },
  );
  for (const p of participants) {
    const result = (await call("room", { pin: r.pin }, { token: p.token }))
      .data;
    const reference = result.answerCards.find((c) => c.reference);
    const guess = result.answerCards.find((c) => !c.reference);
    assert.equal(result.answerCards.length, 2);
    assert.equal(result.answerCards.find((c) => c.isMe).name, p.room.me.name);
    assert.equal(reference.name, subject.room.me.name);
    assert.equal(reference.choice, q.correct);
    assert.equal(reference.correct, true);
    assert.equal(reference.points, 0);
    assert.equal(guess.name, guesser.room.me.name);
    assert.equal(guess.correct, false);
    assert.equal(guess.points, 0);
    assert.equal(result.profiles, undefined);
    assert.equal(result.myProfile, undefined);
    assert(
      result.answerCards.every((c) => !("profile" in c) && !("answers" in c)),
    );
  }
});

test("tournament deduplicates areas, freezes prize, votes on length and accumulates private scores across rounds", async () => {
  execFileSync("php", [
    "-r",
    "$db=new PDO('sqlite:'.$argv[1]);$db->exec('DELETE FROM arena_limits');",
    db,
  ]);
  assert.equal(
    (
      await call(
        "create",
        { mode: "tournament", title: "Ödülsüz" },
        { admin: true },
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        "create",
        {
          mode: "tournament",
          title: "Elle seçim",
          prize: "Kupa",
          questionIds: ["some-question"],
        },
        { admin: true },
      )
    ).status,
    400,
  );
  const room = await create("tournament", { prize: "Kitap hediyesi" });
  assert.equal(room.prize, "Kitap hediyesi");
  assert.equal(
    (await call("tournament_start", { pin: room.pin }, { admin: true })).status,
    409,
  );
  const ada = await join(room.pin, "Ada"),
    ece = await join(room.pin, "Ece");
  const choices = (token, categories) =>
    call("tournament_choices", { pin: room.pin, categories }, { token });
  for (const invalid of [
    [],
    ["cografya", "cografya"],
    ["cografya", "futbol"],
    ["unknown"],
    [5],
    "cografya",
  ])
    assert.equal((await choices(ada.token, invalid)).status, 400);
  assert.equal((await choices("wrong", ["cografya"])).status, 401);
  assert.equal((await choices(ada.token, ["futbol"])).status, 200);
  assert.equal(
    (await call("tournament_start", { pin: room.pin }, { admin: true })).status,
    409,
  );
  let updated = await choices(ece.token, ["futbol"]);
  assert.equal(updated.status, 200);
  assert.equal(
    updated.data.roundTotal,
    1,
    "Duplicate choices produce one round",
  );
  assert.equal(updated.data.categoryVotes.futbol, 2);
  assert.equal(updated.data.readyCount, 2, "A duplicate still counts as ready");
  assert.equal(
    (await choices(ece.token, ["gezegenler"])).status,
    409,
    "Duplicate does not grant another choice",
  );
  assert.equal(
    (await choices(ada.token, ["cografya"])).status,
    409,
    "The first player's choice is also locked",
  );
  assert.equal(
    (await choices(ece.token, ["futbol"])).status,
    200,
    "Retrying the same choice is idempotent",
  );
  const resumed = await call("room", { pin: room.pin }, { token: ece.token });
  assert.deepEqual(resumed.data.myCategories, ["futbol"]);
  assert.equal(resumed.data.readyCount, 2);
  const cem = await join(room.pin, "Cem"),
    deniz = await join(room.pin, "Deniz");
  await choices(cem.token, ["cografya"]);
  updated = await choices(deniz.token, ["gezegenler"]);
  assert.equal(updated.data.roundTotal, 3);
  assert.equal(
    (
      await call(
        "tournament_prize",
        { pin: room.pin, prize: "Kupa" },
        { token: ada.token },
      )
    ).status,
    401,
  );
  assert.equal(
    (
      await call(
        "tournament_prize",
        { pin: room.pin, prize: "Kupa" },
        { admin: true },
      )
    ).status,
    200,
  );
  updated = await call("tournament_start", { pin: room.pin }, { admin: true });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.phase, "voting");
  assert.equal(updated.data.question, undefined);
  assert.equal(updated.data.tournamentDecks, undefined);
  assert.equal(
    (await call("join", { pin: room.pin, name: "Geç kalan" })).status,
    409,
  );
  assert.equal((await choices(ada.token, ["arabalar"])).status, 409);
  assert.equal(
    (await call("tournament_start", { pin: room.pin }, { admin: true })).status,
    409,
  );
  assert.equal(
    (
      await call(
        "tournament_prize",
        { pin: room.pin, prize: "Başka" },
        { admin: true },
      )
    ).status,
    409,
  );
  assert.equal(
    (
      await call(
        "advance",
        { pin: room.pin, expectedIndex: -1, expectedPhase: "voting" },
        { admin: true },
      )
    ).status,
    409,
  );
  const vote = (token, count) =>
    call("tournament_vote", { pin: room.pin, count }, { token });
  for (const invalid of [7, "5", null])
    assert.equal((await vote(ada.token, invalid)).status, 400);
  assert.equal((await vote(ada.token, 5)).data.voteCount, 1);
  assert.equal((await vote(ada.token, 5)).data.voteCount, 1);
  await vote(ece.token, 10);
  await vote(cem.token, 5);
  updated = await vote(deniz.token, 10);
  assert.equal(updated.data.phase, "countdown");
  assert.equal(updated.data.questionsPerRound, 10, "Ties choose ten");
  assert.equal(updated.data.total, 30);
  assert.equal(updated.data.question, undefined);
  const deck = JSON.parse(
    mutateDB(
      room.pin,
      "echo json_encode($s['questions']);$s['countdownUntil']=microtime(true)-0.1",
    ),
  );
  assert.equal(new Set(deck.map((q) => q.id)).size, 30);
  for (let round = 0; round < 3; round++) {
    const group = deck.slice(round * 10, (round + 1) * 10);
    assert.equal(new Set(group.map((q) => q.category)).size, 1);
    assert(group.filter((q) => q.difficulty === "expert").length <= 1);
  }
  let current = (await call("room", { pin: room.pin }, { token: ada.token }))
    .data;
  assert.equal(current.phase, "question");
  assert.equal(current.index, 0);
  assert.equal(current.category, deck[0].category);
  assert.equal(current.question.correct, undefined);
  const answered = await call(
    "answer",
    { pin: room.pin, questionId: current.question.id, choice: deck[0].correct },
    { token: ada.token },
  );
  assert.equal(answered.status, 200);
  assert.equal(
    answered.data.me.score,
    0,
    "Points remain private before reveal",
  );
  assert.equal(answered.data.myAnswer.points, undefined);
  assert.equal(
    (
      await call(
        "answer",
        { pin: room.pin, questionId: current.question.id, choice: 0 },
        { token: ada.token },
      )
    ).status,
    409,
  );
  await call(
    "advance",
    { pin: room.pin, expectedIndex: 0, expectedPhase: "question" },
    { admin: true },
  );
  current = (await call("room", { pin: room.pin }, { token: ada.token })).data;
  const score = current.me.score;
  assert(score >= 500);
  assert.equal(current.answerCards.find((p) => p.isMe).correct, true);
  mutateDB(
    room.pin,
    "$s['index']=9;$s['phase']='question';$s['deadline']=microtime(true)-8.2;unset($s['revealUntil'],$s['countdownUntil'])",
  );
  current = (await call("room", { pin: room.pin }, { token: ada.token })).data;
  assert.equal(current.index, 10);
  assert.equal(current.category, deck[10].category);
  assert.equal(current.roundIndex, 1);
  assert.equal(current.me.score, score);
  mutateDB(
    room.pin,
    "$s['index']=29;$s['phase']='question';$s['deadline']=microtime(true)-5.1;unset($s['revealUntil'],$s['countdownUntil'])",
  );
  current = (await call("room", { pin: room.pin }, { token: ada.token })).data;
  assert.equal(current.phase, "finished");
  assert.equal(current.players[0].name, "Ada");
  assert.equal(current.players[0].score, score);
  assert.equal(current.prize, "Kupa");
});

test("legacy multi-area lobbies must choose one area before starting, then stay locked", async () => {
  const room = await create("tournament", { prize: "Kupa" });
  const a = await join(room.pin, "Eski seçim"),
    b = await join(room.pin, "Tek seçim");
  await call(
    "tournament_choices",
    { pin: room.pin, categories: ["futbol"] },
    { token: b.token },
  );
  mutateDB(
    room.pin,
    "$keys=array_keys($s['players']);$s['tournamentChoices'][$keys[0]]=['cografya','gezegenler']",
  );
  const before = await call("room", { pin: room.pin }, { token: a.token });
  assert.equal(before.data.readyCount, 1);
  assert.equal(
    (await call("tournament_start", { pin: room.pin }, { admin: true })).status,
    409,
  );
  assert.equal(
    (
      await call(
        "tournament_choices",
        { pin: room.pin, categories: ["futbol"] },
        { token: a.token },
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await call(
        "tournament_choices",
        { pin: room.pin, categories: ["cografya"] },
        { token: a.token },
      )
    ).status,
    409,
  );
  const started = await call(
    "tournament_start",
    { pin: room.pin },
    { admin: true },
  );
  assert.equal(started.status, 200);
  assert.deepEqual(started.data.rounds, ["futbol"]);
});

test("tournament majority, no-vote timeout, early vote closure and reconnect use one stable automatic deck", async () => {
  for (const scenario of ["five", "timeout", "early"]) {
    const room = await create("tournament", { prize: "Şampiyonluk kupası" });
    const people = [];
    for (const name of ["Ali", "Ece", "Can"]) {
      const p = await join(room.pin, name);
      people.push(p);
      await call(
        "tournament_choices",
        { pin: room.pin, categories: ["cografya"] },
        { token: p.token },
      );
    }
    const start = await call(
      "tournament_start",
      { pin: room.pin },
      { admin: true },
    );
    assert.equal(
      start.data.roundTotal,
      1,
      "Shared area produces exactly one round",
    );
    assert.equal(
      (await call("tournament_vote_close", { pin: room.pin }, { admin: true }))
        .status,
      409,
    );
    if (scenario === "five") {
      for (let i = 0; i < 3; i++)
        await call(
          "tournament_vote",
          { pin: room.pin, count: i === 2 ? 10 : 5 },
          { token: people[i].token },
        );
    } else if (scenario === "early") {
      await call(
        "tournament_vote",
        { pin: room.pin, count: 5 },
        { token: people[0].token },
      );
      assert.equal(
        (
          await call(
            "tournament_vote_close",
            { pin: room.pin },
            { token: people[0].token },
          )
        ).status,
        401,
      );
      assert.equal(
        (
          await call(
            "tournament_vote_close",
            { pin: room.pin },
            { admin: true },
          )
        ).status,
        200,
      );
    } else mutateDB(room.pin, "$s['voteUntil']=microtime(true)-0.1");
    let snapshot = (
      await call("room", { pin: room.pin }, { token: people[0].token })
    ).data;
    assert.equal(snapshot.phase, "countdown");
    assert.equal(snapshot.questionsPerRound, scenario === "timeout" ? 10 : 5);
    assert.equal(snapshot.total, scenario === "timeout" ? 10 : 5);
    // Advancing the stored timer simulates a reconnect after voting/countdown.
    mutateDB(
      room.pin,
      scenario === "timeout"
        ? "$s['voteUntil']=microtime(true)-3.1"
        : "$s['countdownUntil']=microtime(true)-0.1",
    );
    const first = (
      await call("room", { pin: room.pin }, { token: people[0].token })
    ).data;
    const second = (
      await call("room", { pin: room.pin }, { token: people[1].token })
    ).data;
    assert.equal(first.phase, "question");
    assert.deepEqual(
      first.question,
      second.question,
      "Read-only synchronization cannot reshuffle a deck",
    );
    assert.equal(
      (
        await call(
          "tournament_vote",
          { pin: room.pin, count: 10 },
          { token: people[0].token },
        )
      ).status,
      409,
    );
    if (scenario !== "timeout") {
      const levels = JSON.parse(
        mutateDB(
          room.pin,
          "echo json_encode(array_column($s['questions'],'difficulty'))",
        ),
      );
      assert.deepEqual(levels, Array(5).fill("general"));
    }
  }
});

test("creators can join and answer in quiz, family and tournament while retaining management", async () => {
  for (const mode of ["quiz", "family", "tournament"]) {
    const room = await create(mode, {
      prize: "Kitap",
      seconds: mode === "quiz" ? 20 : 90,
    });
    const joined = await call(
      "join",
      { pin: room.pin, name: "Kurucu", role: "Baba", avatar: "robot" },
      { admin: true },
    );
    assert.equal(joined.status, 200);
    assert.equal(
      joined.data.room.canManage,
      true,
      "Joining must not temporarily remove management",
    );
    assert.equal(joined.data.room.me.name, "Kurucu");
    const opt = { admin: true, token: joined.data.token };
    const guest = await call("join", {
      pin: room.pin,
      name: "Yarışmacı",
      role: "Çocuk",
    });
    assert.equal(guest.status, 200);
    assert.equal(guest.data.room.canManage, false);
    const reload = (await call("room", { pin: room.pin }, opt)).data;
    assert.equal(reload.playerCount, 2);
    assert.equal(reload.me.name, "Kurucu");
    assert.equal(reload.canManage, true);
    if (mode === "family") {
      for (const [player, options] of [
        [joined.data, opt],
        [guest.data, { token: guest.data.token }],
      ]) {
        const answers = Object.fromEntries(
          room.prompts.map((p) => [
            p.id,
            player.token === joined.data.token ? "Mantı" : "Pizza",
          ]),
        );
        assert.equal(
          (await call("family_profile", { pin: room.pin, answers }, options))
            .status,
          200,
        );
      }
      assert.equal(
        (await call("family_start", { pin: room.pin }, opt)).status,
        200,
      );
      mutateDB(
        room.pin,
        "foreach($s['questions'] as $i=>$q){if($q['subjectKey']!==hash('sha256'," +
          JSON.stringify(joined.data.token) +
          ")){$s['index']=$i;break;}}$s['deadline']=microtime(true)+90",
      );
    } else if (mode === "tournament") {
      await call(
        "tournament_choices",
        { pin: room.pin, categories: ["cografya"] },
        opt,
      );
      await call(
        "tournament_choices",
        { pin: room.pin, categories: ["cografya"] },
        { token: guest.data.token },
      );
      assert.equal(
        (await call("tournament_start", { pin: room.pin }, opt)).status,
        200,
      );
      const vote = await call(
        "tournament_vote",
        { pin: room.pin, count: 5 },
        opt,
      );
      assert.equal(vote.data.myVote, 5);
      assert.equal(vote.data.canManage, true);
      await call(
        "tournament_vote",
        { pin: room.pin, count: 5 },
        { token: guest.data.token },
      );
      mutateDB(room.pin, "$s['countdownUntil']=microtime(true)-0.1");
    } else
      assert.equal(
        (
          await call(
            "advance",
            { pin: room.pin, expectedIndex: -1, expectedPhase: "lobby" },
            opt,
          )
        ).status,
        200,
      );
    const current = (await call("room", { pin: room.pin }, opt)).data;
    assert.equal(
      current.question.correct,
      undefined,
      "Creator also waits for reveal",
    );
    const correct = Number(
      mutateDB(
        room.pin,
        "echo $s['questions'][" + current.index + "]['correct']",
      ),
    );
    const answer = await call(
      mode === "family" ? "family_answer" : "answer",
      { pin: room.pin, questionId: current.question.id, choice: correct },
      opt,
    );
    assert.equal(answer.status, 200, JSON.stringify(answer.data));
    assert.equal(answer.data.canManage, true);
    assert.equal(answer.data.myAnswer.choice, correct);
    assert.equal(answer.data.myAnswer.points, undefined);
    assert.equal(answer.data.me.score, 0);
    mutateDB(room.pin, "$s['deadline']=microtime(true)-0.1");
    const revealed = (await call("room", { pin: room.pin }, opt)).data;
    assert.equal(revealed.phase, "reveal");
    assert(revealed.me.score > 0);
    assert(revealed.answerCards.find((p) => p.isMe).correct);
    assert.equal((await call("close", { pin: room.pin }, opt)).status, 200);
  }
});

test("manual selection enforces the expert cap and custom questions persist their level", async () => {
  const pool = (
    await call("questions", { category: "cografya" }, { admin: true })
  ).data;
  const general = pool.filter((q) => q.difficulty === "general");
  const expert = pool.filter((q) => q.difficulty === "expert");
  const payload = {
    mode: "quiz",
    title: "Dengeli yarışma",
    category: "cografya",
  };
  const rejected = await call(
    "create",
    {
      ...payload,
      questionIds: [...general.slice(0, 8), ...expert.slice(0, 2)].map(
        (q) => q.id,
      ),
    },
    { admin: true },
  );
  assert.equal(rejected.status, 400);
  assert.match(rejected.data.error, /en fazla 1/);
  for (const chosen of [
    general.slice(0, 10),
    [...general.slice(0, 9), expert[0]],
  ]) {
    const room = await call(
      "create",
      { ...payload, questionIds: chosen.map((q) => q.id) },
      { admin: true },
    );
    assert.equal(room.status, 200);
    const actual = JSON.parse(
      execFileSync(
        "php",
        [
          "-r",
          "$db=new PDO('sqlite:'.$argv[1]);$q=$db->prepare('SELECT state FROM arena_rooms WHERE pin=?');$q->execute([$argv[2]]);echo $q->fetchColumn();",
          db,
          room.data.pin,
        ],
        { encoding: "utf8" },
      ),
    );
    assert.deepEqual(
      actual.questions.map((q) => q.id).sort(),
      chosen.map((q) => q.id).sort(),
    );
    await call("close", { pin: room.data.pin }, { admin: true });
  }
  const custom = {
    category: "cografya",
    text: "Özel sorunun düzeyi nasıl kaydedilir?",
    options: ["A", "B", "C", "D"],
    correct: 0,
  };
  assert.equal(
    (
      await call(
        "question_save",
        { ...custom, difficulty: "easy-but-invalid" },
        { admin: true },
      )
    ).status,
    400,
  );
  for (const level of ["general", "expert", undefined]) {
    const saved = await call(
      "question_save",
      { ...custom, ...(level ? { difficulty: level } : {}) },
      { admin: true },
    );
    assert.equal(saved.status, 200);
    assert.equal(saved.data.difficulty, level ?? "expert");
    const loaded = (
      await call("questions", { category: "cografya" }, { admin: true })
    ).data.find((q) => q.id === saved.data.id);
    assert.equal(loaded.difficulty, level ?? "expert");
    await call("question_delete", { id: saved.data.id }, { admin: true });
  }
});

const sql = (code) =>
  execFileSync("php", [
    "-r",
    `$db=new PDO('sqlite:'.$argv[1]);${code}`,
    db,
  ]).toString();
const clearLoginLimits = () => sql("$db->exec('DELETE FROM arena_limits');");
const sessionCookie = (r) => r.cookie.split(";")[0];
async function soloUser(name) {
  clearLoginLimits();
  assert.equal(
    (
      await call(
        "user_create",
        { username: name, password: "test" },
        { admin: true },
      )
    ).status,
    200,
  );
  const login = await call("login", { username: name, password: "test" });
  assert.equal(login.status, 200);
  return { cookie: sessionCookie(login), id: login.data.user.id };
}
const soloMutation = (scope, code) =>
  sql(
    `$q=$db->prepare('SELECT state FROM arena_solo WHERE scope=?');$q->execute([${JSON.stringify(scope)}]);$s=json_decode($q->fetchColumn(),true);${code};$db->prepare('UPDATE arena_solo SET state=? WHERE scope=?')->execute([json_encode($s),${JSON.stringify(scope)}]);`,
  );

test("normal accounts have one active session; admin devices remain independent", async () => {
  const first = await soloUser("one-device");
  const second = await call("login", {
    username: "one-device",
    password: "test",
  });
  assert.equal(second.status, 200);
  const secondOpt = { cookie: sessionCookie(second) };
  assert.equal((await call("status", {}, first)).data.admin, false);
  assert.equal((await call("rooms", {}, first)).status, 401);
  assert.equal(
    (await call("profile_update", { username: "stolen" }, first)).status,
    401,
  );
  assert.equal((await call("status", {}, secondOpt)).data.admin, true);
  await call("logout", {}, first); // A revoked device cannot log out the active one.
  assert.equal((await call("status", {}, secondOpt)).data.admin, true);
  const ownerTwo = await call("login", { password: "local-test-password" });
  assert.equal(ownerTwo.status, 200);
  assert.equal((await call("status", {}, { admin: true })).data.admin, true);
  assert.equal(
    (await call("status", {}, { cookie: sessionCookie(ownerTwo) })).data.admin,
    true,
  );
});

test("admin can test a user's interface without replacing their session or changing credentials", async () => {
  const user = await soloUser("preview-user");
  assert.equal((await fetch(base + "?action=preview_start")).status, 405);
  assert.equal((await call("preview_start", { userId: 1 }, user)).status, 403);
  assert.equal((await call("preview_stop", {}, user)).status, 403);
  const owner = await call("login", { password: "local-test-password" });
  const opt = { cookie: sessionCookie(owner) };
  assert.equal(
    (
      await call(
        "preview_start",
        { userId: user.id },
        { ...opt, origin: "https://evil.example" },
      )
    ).status,
    403,
  );
  const preview = await call("preview_start", { userId: user.id }, opt);
  assert.equal(preview.status, 200);
  assert.equal(preview.data.user.id, user.id);
  assert.equal(preview.data.user.role, "host");
  assert.equal(preview.data.preview.username, "preview-user");
  assert.equal((await call("status", {}, user)).data.admin, true);
  assert.equal((await call("users", {}, opt)).status, 403);
  assert.equal((await call("questions", {}, opt)).status, 403);
  assert.equal(
    (await call("profile_update", { username: "changed" }, opt)).status,
    403,
  );
  assert.equal(
    (
      await call(
        "password_change",
        { currentPassword: "test", newPassword: "other" },
        opt,
      )
    ).status,
    403,
  );
  assert.equal((await call("preview_start", { userId: 1 }, opt)).status, 403);
  const game = await call("solo_start", { category: "futbol" }, opt);
  assert.equal(game.status, 200);
  assert.equal(game.data.preview, true);
  const hash = await import("node:crypto");
  const scope =
    "test:" +
    hash.createHash("sha256").update(opt.cookie.split("=")[1]).digest("hex");
  soloMutation(scope, "$s['deadline']=microtime(true)-1000");
  const result = await call("solo_state", {}, opt);
  assert.equal(result.data.game.phase, "finished");
  assert.equal(result.data.stats.games, 1);
  assert.equal((await call("solo_summary", {}, user)).data.stats.games, 0);
  const back = await call("preview_stop", {}, opt);
  assert.equal(back.data.user.role, "owner");
  assert.equal(back.data.preview, null);
  assert.equal(
    (await call("status", {}, user)).data.user.username,
    "preview-user",
  );
  assert.equal(
    (await call("status", {}, { admin: true })).data.user.role,
    "owner",
  );
});

test("solo mode protects questions, validates actions, and persists a server-scored personal record", async () => {
  const user = await soloUser("solo-player"),
    scope = `user:${user.id}`;
  assert.equal((await call("solo_summary")).status, 401);
  assert.equal(
    (await call("solo_start", { category: "cografya" })).status,
    401,
  );
  assert.equal((await fetch(base + "?action=solo_start")).status, 405);
  assert.equal(
    (
      await call(
        "solo_start",
        { category: "cografya" },
        { ...user, origin: "https://evil.example" },
      )
    ).status,
    403,
  );
  assert.equal(
    (await call("solo_start", { category: "unknown" }, user)).status,
    400,
  );
  let start = await call(
    "solo_start",
    { category: "cografya", score: 999999 },
    user,
  );
  assert.equal(start.status, 200);
  let game = start.data.game;
  const id = game.id;
  assert.equal(game.score, 0);
  assert.equal(game.question.correct, undefined);
  assert.equal(game.questions, undefined);
  assert.equal(game.review, undefined);
  assert.equal(game.question.options.length, 4);
  assert.equal(
    (await call("solo_start", { category: "futbol" }, user)).status,
    409,
  );
  assert.equal((await call("solo_state", {}, user)).data.game.id, id);
  assert.equal(
    (
      await call(
        "solo_answer",
        { gameId: id, questionId: game.question.id, choice: 4 },
        user,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        "solo_answer",
        { gameId: "fake", questionId: game.question.id, choice: 0 },
        user,
      )
    ).status,
    409,
  );
  const another = await soloUser("solo-other");
  assert.equal(
    (await call("solo_state", { userId: user.id }, another)).data.game,
    null,
  );
  assert.equal(
    (
      await call(
        "solo_answer",
        { gameId: id, questionId: game.question.id, choice: 0 },
        another,
      )
    ).status,
    409,
  );
  const questions = JSON.parse(
    soloMutation(scope, "echo json_encode($s['questions'])"),
  );
  assert.equal(questions.length, 10);
  assert.ok(questions.filter((q) => q.difficulty === "expert").length <= 1);
  for (let i = 0; i < 10; i++) {
    const q = questions[i],
      choice = i < 8 ? q.correct : (q.correct + 1) % 4;
    const answer = await call(
      "solo_answer",
      { gameId: id, questionId: q.id, choice, score: 100000, userId: 1 },
      user,
    );
    assert.equal(answer.status, 200);
    assert.equal(answer.data.game.phase, "reveal");
    assert.equal(answer.data.game.question.correct, q.correct);
    assert.equal(
      (
        await call(
          "solo_answer",
          { gameId: id, questionId: q.id, choice },
          user,
        )
      ).status,
      409,
    );
    soloMutation(scope, "$s['until']=microtime(true)-0.1");
    const countdown = await call("solo_state", {}, user);
    if (i < 9) {
      assert.equal(countdown.data.game.phase, "countdown");
      assert.equal(countdown.data.game.question, undefined);
      soloMutation(scope, "$s['until']=microtime(true)-0.1");
      game = (await call("solo_state", {}, user)).data.game;
      assert.equal(game.index, i + 1);
      assert.equal(game.question.correct, undefined);
    }
  }
  const finished = await call("solo_summary", {}, user);
  assert.equal(finished.data.game.phase, "finished");
  assert.equal(finished.data.game.score, 800);
  assert.equal(finished.data.game.correctCount, 8);
  assert.equal(finished.data.game.review.length, 10);
  assert.equal(finished.data.stats.best, 800);
  assert.equal(finished.data.stats.games, 1);
  assert.equal(+finished.data.stats.categories[0].best, 800);
  assert.equal((await call("solo_state", {}, user)).data.stats.games, 1); // Refresh never duplicates a result.
  const next = await call("solo_start", { category: "cografya" }, user);
  assert.notEqual(next.data.game.id, id);
  const nextIds = JSON.parse(
    soloMutation(scope, "echo json_encode(array_column($s['questions'],'id'))"),
  );
  assert.equal(
    nextIds.filter((id) => questions.some((q) => q.id === id)).length,
    0,
  );
  await call("solo_abandon", { gameId: next.data.game.id }, user);
  const summary = await call("solo_summary", {}, user);
  assert.equal(summary.data.game, null);
  assert.equal(summary.data.stats.games, 1);
  assert.equal((await call("solo_summary", {}, another)).data.stats.games, 0);
});

test("solo timeouts, mixed topics, and a new device resume the same private game", async () => {
  const user = await soloUser("solo-resume");
  const start = await call("solo_start", { category: "mixed" }, user);
  assert.equal(start.status, 200);
  const again = await call("login", {
    username: "solo-resume",
    password: "test",
  });
  const opt = { cookie: sessionCookie(again) };
  assert.equal((await call("solo_state", {}, user)).status, 401);
  assert.equal(
    (await call("solo_state", {}, opt)).data.game.id,
    start.data.game.id,
  );
  soloMutation(`user:${user.id}`, "$s['deadline']=microtime(true)-1000");
  const end = await call("solo_state", {}, opt);
  assert.equal(end.data.game.phase, "finished");
  assert.equal(end.data.game.score, 0);
  assert.equal(
    end.data.game.review.filter((q) => q.choice === null).length,
    10,
  );
  assert.equal(end.data.stats.games, 1);
  assert.equal(
    (
      await call(
        "solo_answer",
        {
          gameId: start.data.game.id,
          questionId: start.data.game.question.id,
          choice: 0,
        },
        opt,
      )
    ).status,
    409,
  );
});

test("estimate quiz conceals guesses, handles decimal ties, and awards only the closest once", async () => {
  const room = await create("quiz", { category: "estimate" }),
    { pin } = room;
  assert.equal(room.quizType, "estimate");
  assert.equal(room.total, 10);
  const ada = await join(pin, "Ada"),
    ece = await join(pin, "Ece"),
    cem = await join(pin, "Cem");
  await join(pin, "Deniz");
  await call(
    "advance",
    { pin, expectedIndex: -1, expectedPhase: "lobby" },
    { admin: true },
  );
  mutateDB(
    pin,
    "$s['questions'][0]['answer']=100.5;$s['questions'][0]['unit']='metre'",
  );
  let current = (await call("room", { pin }, { token: ada.token })).data;
  assert.equal(current.question.answer, undefined);
  assert.equal(current.question.source, undefined);
  assert.equal(current.estimateResults, undefined);
  assert.equal(current.question.options, undefined);
  assert.equal(
    (
      await call(
        "answer",
        { pin, questionId: current.question.id, guess: "1e3" },
        { token: ada.token },
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        "answer",
        { pin, questionId: current.question.id, guess: "Infinity" },
        { token: ada.token },
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        "answer",
        { pin, questionId: current.question.id, guess: "1.000.000" },
        { token: ada.token },
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        "answer",
        { pin, questionId: current.question.id, guess: [] },
        { token: ada.token },
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        "answer",
        { pin, questionId: "old", guess: "99.5" },
        { token: ada.token },
      )
    ).status,
    409,
  );
  const answered = await call(
    "answer",
    { pin, questionId: current.question.id, guess: "99,5" },
    { token: ada.token },
  );
  assert.equal(answered.status, 200);
  assert.deepEqual(answered.data.myAnswer, { guess: 99.5 });
  assert.equal(answered.data.me.score, 0);
  assert.equal(
    (
      await call(
        "answer",
        { pin, questionId: current.question.id, guess: 100.5 },
        { token: ada.token },
      )
    ).status,
    409,
  );
  await call(
    "answer",
    { pin, questionId: current.question.id, guess: "101.5" },
    { token: ece.token },
  );
  await call(
    "answer",
    { pin, questionId: current.question.id, guess: 500 },
    { token: cem.token },
  );
  const hidden = (await call("room", { pin }, { admin: true })).data;
  assert.ok(hidden.players.every((p) => p.score === 0));
  assert.equal(hidden.estimateResults, undefined);
  const reveal = await call(
    "advance",
    { pin, expectedIndex: 0, expectedPhase: "question" },
    { admin: true },
  );
  assert.equal(reveal.status, 200);
  assert.equal(reveal.data.question.answer, 100.5);
  const results = reveal.data.estimateResults;
  assert.equal(results.find((p) => p.name === "Ada").points, 1000);
  assert.equal(results.find((p) => p.name === "Ece").points, 1000);
  assert.equal(results.find((p) => p.name === "Cem").points, 0);
  assert.equal(results.find((p) => p.name === "Deniz").guess, null);
  assert.equal(
    (await call("room", { pin }, { token: ada.token })).data.me.score,
    1000,
  );
  mutateDB(pin, "$s['revealUntil']=microtime(true)-4");
  const next = (await call("room", { pin }, { token: ada.token })).data;
  assert.equal(next.index, 1);
  assert.equal(next.me.score, 1000);
  assert.equal(next.question.answer, undefined);
  const none = await call(
    "advance",
    { pin, expectedIndex: 1, expectedPhase: "question" },
    { admin: true },
  );
  assert.equal(none.status, 200);
  assert.ok(none.data.estimateResults.every((p) => p.points === 0));
  assert.equal(
    (await call("room", { pin }, { token: ada.token })).data.me.score,
    1000,
  );
});

test("estimate deadlines award closest guesses on reads and preserve them on later writes", async () => {
  const { pin } = await create("quiz", { category: "estimate" }),
    player = await join(pin, "Tahminci");
  await join(pin, "Diğer tahminci");
  await call(
    "advance",
    { pin, expectedIndex: -1, expectedPhase: "lobby" },
    { admin: true },
  );
  let current = (await call("room", { pin })).data;
  await call(
    "answer",
    { pin, questionId: current.question.id, guess: "-2,125" },
    { token: player.token },
  );
  mutateDB(pin, "$s['deadline']=microtime(true)-1");
  for (let i = 0; i < 2; i++) {
    const r = (await call("room", { pin }, { token: player.token })).data;
    assert.equal(r.phase, "reveal");
    assert.equal(r.me.score, 1000);
    assert.equal(r.myAnswer.guess, -2.125);
  }
  await call(
    "advance",
    { pin, expectedIndex: 0, expectedPhase: "reveal" },
    { admin: true },
  );
  const next = (await call("room", { pin }, { token: player.token })).data;
  assert.equal(next.index, 1);
  assert.equal(next.me.score, 1000);
});

test("binary games show exactly Evet/Hayır, score normally, and reject nonexistent choices", async () => {
  const { pin } = await create("quiz", { category: "binary" }),
    player = await join(pin, "Meraklı");
  await join(pin, "Diğer meraklı");
  const start = await call(
    "advance",
    { pin, expectedIndex: -1, expectedPhase: "lobby" },
    { admin: true },
  );
  assert.deepEqual(start.data.question.options, ["Evet", "Hayır"]);
  assert.equal(start.data.question.correct, undefined);
  assert.equal(
    (
      await call(
        "answer",
        { pin, questionId: start.data.question.id, choice: 2 },
        { token: player.token },
      )
    ).status,
    400,
  );
  mutateDB(pin, "$s['questions'][0]['correct']=0");
  const a = await call(
    "answer",
    { pin, questionId: start.data.question.id, choice: 0 },
    { token: player.token },
  );
  assert.equal(a.status, 200);
  assert.equal(a.data.me.score, 0);
  const r = await call(
    "advance",
    { pin, expectedIndex: 0, expectedPhase: "question" },
    { admin: true },
  );
  assert.equal(r.data.question.correct, 0);
  assert.ok(r.data.players[0].score >= 500);
  assert.ok(r.data.question.explanation.length > 10);
  assert.equal(r.data.answerCards[0].correct, true);
});

test("dedicated mixed pool produces 20 questions from 20 topics with no adjacent-game repeats", async () => {
  const decks = [];
  for (let i = 0; i < 15; i++) {
    const room = await create("quiz", { category: "mixed" });
    assert.equal(room.total, 20);
    assert.equal(room.quizType, "mixed");
    let deck;
    execFileSync("php", [
      "-r",
      `$db=new PDO('sqlite:'.$argv[1]);$q=$db->prepare('SELECT state FROM arena_rooms WHERE pin=?');$q->execute([$argv[2]]);$s=json_decode($q->fetchColumn(),true);file_put_contents($argv[3],json_encode($s['questions']));`,
      db,
      room.pin,
      path.join(dir, "mixed.json"),
    ]);
    const { readFileSync } = await import("node:fs");
    deck = JSON.parse(readFileSync(path.join(dir, "mixed.json")));
    const counts = {};
    for (const q of deck) counts[q.category] = (counts[q.category] || 0) + 1;
    assert.equal(Object.keys(counts).length, 20);
    assert.equal(Object.values(counts).filter((n) => n === 2).length, 0);
    assert.ok(Object.values(counts).every((n) => n <= 2));
    assert.ok(
      deck.every((q) => q.difficulty === "general" && q.options.length === 4),
    );
    if (i)
      assert.equal(
        deck.filter((q) => decks[i - 1].some((p) => p.id === q.id)).length,
        0,
      );
    decks.push(deck);
  }
  for (const type of ["estimate", "binary"]) {
    const a = await create("quiz", { category: type }),
      b = await create("quiz", { category: type });
    const ids = (pin) =>
      JSON.parse(
        execFileSync("php", [
          "-r",
          `$db=new PDO('sqlite:'.$argv[1]);$q=$db->prepare('SELECT state FROM arena_rooms WHERE pin=?');$q->execute([$argv[2]]);echo json_encode(array_column(json_decode($q->fetchColumn(),true)['questions'],'id'));`,
          db,
          pin,
        ]),
      );
    assert.equal(ids(a.pin).filter((id) => ids(b.pin).includes(id)).length, 0);
  }
  assert.equal(
    (
      await call(
        "create",
        {
          mode: "quiz",
          category: "mixed",
          title: "Yanlış seçim",
          questionIds: ["x"],
        },
        { admin: true },
      )
    ).status,
    400,
  );
});

test("idle lobbies warn after a minute, acknowledgement does not extend expiry, and cancellation persists", async () => {
  const room = await create("quiz");
  assert.equal(room.startWarning, false);
  assert.equal(room.startBy, room.createdAt + 180);
  mutateDB(room.pin, "$s['createdAt']=time()-61");
  const warned = await call("room", { pin: room.pin }, { admin: true });
  assert.equal(warned.data.startWarning, true);
  assert.equal(
    (await call("room", { pin: room.pin })).data.startWarning,
    false,
  );
  assert.equal((await call("idle_continue", { pin: room.pin })).status, 401);
  const continued = await call(
    "idle_continue",
    { pin: room.pin },
    { admin: true },
  );
  assert.equal(continued.status, 200);
  assert.equal(continued.data.startWarning, false);
  assert.equal(continued.data.startBy, warned.data.startBy);
  assert.equal(
    (await call("room", { pin: room.pin }, { admin: true })).data.startWarning,
    false,
  );
  mutateDB(room.pin, "$s['createdAt']=time()-181");
  const expired = await call("room", { pin: room.pin });
  assert.equal(expired.data.phase, "closed");
  assert.equal(expired.data.closeReason, "not_started");
  assert.equal(expired.data.startBy, null);
  mutateDB(
    room.pin,
    "if($s['phase']!=='closed'||$s['closedAt']!==$s['createdAt']+180)throw new Exception('Expiry not persisted')",
  );
  assert.equal(
    (await call("join", { pin: room.pin, name: "Too late" })).status,
    409,
  );
  assert.equal(
    (
      await call(
        "advance",
        { pin: room.pin, expectedPhase: "lobby", expectedIndex: -1 },
        { admin: true },
      )
    ).status,
    409,
  );
  const manual = await create("quiz");
  assert.equal(
    (await call("idle_cancel", { pin: manual.pin }, { admin: true })).data
      .closeReason,
    "cancelled",
  );
});

test("idle expiry covers family, tournament and undrawn raffles, including list reads and late writes", async () => {
  for (const mode of ["family", "tournament", "raffle"]) {
    const room = await create(
      mode,
      mode === "tournament" ? { prize: "Test ödülü" } : {},
    );
    mutateDB(room.pin, "$s['createdAt']=time()-181");
    const rooms = await call("rooms", {}, { admin: true });
    const expired = rooms.data.find((r) => r.pin === room.pin);
    assert.equal(expired.phase, "closed", mode);
    assert.equal(expired.closeReason, "not_started");
    mutateDB(
      room.pin,
      "if($s['phase']!=='closed')throw new Exception('List expiry not saved')",
    );
  }
  const late = await create("quiz");
  mutateDB(late.pin, "$s['createdAt']=time()-181");
  assert.equal(
    (await call("idle_continue", { pin: late.pin }, { admin: true })).status,
    409,
  );
  mutateDB(
    late.pin,
    "if($s['phase']!=='closed')throw new Exception('Write expiry not saved')",
  );
});

test("started games and live clouds are not cancelled; stale warning actions cannot close started games", async () => {
  const room = await create("quiz", { seconds: 20 });
  const player = await join(room.pin, "Oyuncu");
  await join(room.pin, "İkinci oyuncu");
  await call(
    "advance",
    { pin: room.pin, expectedPhase: "lobby", expectedIndex: -1 },
    { admin: true },
  );
  mutateDB(room.pin, "$s['createdAt']=time()-300");
  const playing = await call(
    "room",
    { pin: room.pin },
    { token: player.token, admin: true },
  );
  assert.equal(playing.data.phase, "question");
  assert.equal(playing.data.startWarning, false);
  assert.equal(playing.data.startBy, null);
  assert.equal(
    (await call("idle_cancel", { pin: room.pin }, { admin: true })).status,
    409,
  );
  assert.equal((await call("room", { pin: room.pin })).data.phase, "question");
  const cloud = await create("cloud");
  mutateDB(cloud.pin, "$s['createdAt']=time()-300");
  assert.equal((await call("room", { pin: cloud.pin })).data.phase, "open");
  const raffle = await create("raffle");
  await call("entries", { pin: raffle.pin, names: ["Ada"] }, { admin: true });
  await call("draw", { pin: raffle.pin }, { admin: true });
  mutateDB(raffle.pin, "$s['createdAt']=time()-300");
  assert.equal((await call("room", { pin: raffle.pin })).data.phase, "open");
});

test("quiz setup defaults to ten seconds and accepts selectable lengths across all formats", async () => {
  for (const category of ["cografya", "estimate", "binary", "mixed"]) {
    const defaultRoom = await call(
      "create",
      { mode: "quiz", title: "Varsayılan tur", category },
      { admin: true },
    );
    assert.equal(defaultRoom.status, 200);
    assert.equal(defaultRoom.data.seconds, 10);
    assert.equal(defaultRoom.data.total, category === "mixed" ? 20 : 10);
    let previous = new Set();
    for (const [questionCount, seconds] of [
      [10, 10],
      [20, 15],
      [15, 20],
      [20, 10],
    ]) {
      const room = await create("quiz", { category, questionCount, seconds });
      assert.equal(room.total, questionCount);
      assert.equal(room.seconds, seconds);
      const deck = JSON.parse(
        mutateDB(room.pin, "echo json_encode($s['questions'])").toString(),
      );
      assert.equal(new Set(deck.map((q) => q.id)).size, questionCount);
      if (category !== "cografya")
        assert(
          deck.every((q) => !previous.has(q.id)),
          "A different round length must still exclude the previous deck",
        );
      previous = new Set(deck.map((q) => q.id));
      if (category === "mixed") {
        const counts = {};
        deck.forEach(
          (q) => (counts[q.category] = (counts[q.category] || 0) + 1),
        );
        assert.equal(Object.keys(counts).length, Math.min(20, questionCount));
        assert(
          Math.max(...Object.values(counts)) <= (questionCount === 20 ? 2 : 1),
        );
      }
      if (category === "cografya")
        assert.equal(
          deck.filter((q) => q.difficulty === "expert").length,
          Math.floor(questionCount / 10),
        );
      await join(room.pin, "Birinci yarışmacı");
      await join(room.pin, "İkinci yarışmacı");
      const started = await call(
        "advance",
        { pin: room.pin, expectedIndex: -1, expectedPhase: "lobby" },
        { admin: true },
      );
      assert(started.data.deadline - started.data.serverTime > seconds - 1);
      assert(started.data.deadline - started.data.serverTime <= seconds);
      mutateDB(
        room.pin,
        "$s['index']=count($s['questions'])-1;$s['phase']='question';$s['deadline']=microtime(true)-6",
      );
      const finished = await call("room", { pin: room.pin });
      assert.equal(finished.data.phase, "finished");
      assert.equal(finished.data.index, questionCount - 1);
    }
  }
});

test("quiz setup rejects unsupported options and matches manual selection to the chosen size", async () => {
  for (const option of [
    { questionCount: 0 },
    { questionCount: 11 },
    { questionCount: 25 },
    { questionCount: "15" },
    { questionCount: [] },
    { seconds: 9 },
    { seconds: 30 },
    { seconds: "10" },
  ]) {
    const r = await call(
      "create",
      {
        mode: "quiz",
        title: "Geçersiz seçenek",
        category: "cografya",
        ...option,
      },
      { admin: true },
    );
    assert.equal(r.status, 400);
  }
  const bank = (
    await call("questions", { category: "cografya" }, { admin: true })
  ).data;
  const general = bank
    .filter((q) => q.difficulty === "general")
    .map((q) => q.id);
  const expert = bank.filter((q) => q.difficulty === "expert").map((q) => q.id);
  for (const count of [15, 20]) {
    const limit = Math.floor(count / 10);
    const ids = [...general.slice(0, count - limit), ...expert.slice(0, limit)];
    const room = await create("quiz", {
      questionCount: count,
      questionIds: ids,
    });
    assert.equal(room.total, count);
    assert.deepEqual(
      JSON.parse(
        mutateDB(
          room.pin,
          "echo json_encode(array_column($s['questions'],'id'))",
        ).toString(),
      ).sort(),
      ids.sort(),
    );
    for (const questionIds of [
      ids.slice(1),
      [...general.slice(0, count - limit - 1), ...expert.slice(0, limit + 1)],
    ]) {
      assert.equal(
        (
          await call(
            "create",
            {
              mode: "quiz",
              title: "Seçim kontrolü",
              category: "cografya",
              questionCount: count,
              questionIds,
            },
            { admin: true },
          )
        ).status,
        400,
      );
    }
  }
});

test("World Cup category supports 10/15/20 questions, manual library access and tournament/solo selection", async () => {
  const counts = await call("categories");
  assert.equal(counts.data["dunya-kupasi"], 250);
  const library = await call(
    "questions",
    { category: "dunya-kupasi" },
    { admin: true },
  );
  assert.equal(library.data.length, 250);
  for (const questionCount of [10, 15, 20]) {
    const room = await create("quiz", {
      category: "dunya-kupasi",
      questionCount,
    });
    assert.equal(room.total, questionCount);
    const deck = JSON.parse(
      mutateDB(room.pin, "echo json_encode($s['questions'])").toString(),
    );
    assert(deck.every((q) => q.category === "dunya-kupasi"));
    assert.equal(
      deck.filter((q) => q.difficulty === "expert").length,
      Math.floor(questionCount / 10),
    );
  }
  const tournament = await create("tournament", { prize: "Kupa" });
  const player = await join(tournament.pin, "Kupa Taraftarı");
  assert.equal(
    (
      await call(
        "tournament_choices",
        { pin: tournament.pin, categories: ["dunya-kupasi"] },
        { token: player.token },
      )
    ).status,
    200,
  );
  const solo = await call(
    "solo_start",
    { category: "dunya-kupasi" },
    { admin: true },
  );
  assert.equal(solo.status, 200);
  assert.equal(
    (await call("solo_abandon", { gameId: solo.data.game.id }, { admin: true }))
      .status,
    200,
  );
});

test("film category supports rotating 10/15/20 decks, manual selection, solo and tournament", async () => {
  assert.equal((await call("categories")).data.film, 250);
  const library = await call(
    "questions",
    { category: "film" },
    { admin: true },
  );
  assert.equal(library.data.length, 250);
  let previous = [];
  for (const questionCount of [10, 15, 20]) {
    const room = await create("quiz", { category: "film", questionCount });
    assert.equal(room.total, questionCount);
    const deck = JSON.parse(
      mutateDB(room.pin, "echo json_encode($s['questions'])").toString(),
    );
    assert(deck.every((q) => q.category === "film"));
    assert.equal(
      deck.filter((q) => q.difficulty === "expert").length,
      Math.floor(questionCount / 10),
    );
    assert.equal(deck.filter((q) => previous.includes(q.id)).length, 0);
    previous = deck.map((q) => q.id);
  }
  const questionIds = library.data
    .filter((q) => q.difficulty === "general")
    .slice(0, 10)
    .map((q) => q.id);
  assert.equal(
    (await create("quiz", { category: "film", questionCount: 10, questionIds }))
      .total,
    10,
  );
  const tournament = await create("tournament", { prize: "Sinema gecesi" });
  const player = await join(tournament.pin, "Film Sever");
  assert.equal(
    (
      await call(
        "tournament_choices",
        { pin: tournament.pin, categories: ["film"] },
        { token: player.token },
      )
    ).status,
    200,
  );
  const solo = await call("solo_start", { category: "film" }, { admin: true });
  assert.equal(solo.status, 200);
  assert.equal(
    (await call("solo_abandon", { gameId: solo.data.game.id }, { admin: true }))
      .status,
    200,
  );
});

const creditBalance = async (user) => {
  const r = await call("credits", {}, user);
  assert.equal(r.status, 200, JSON.stringify(r));
  return r.data;
};
const creditRoom = async (user, mode = "quiz", withPlayers = true) => {
  const r = await call(
    "create",
    { mode, title: "Kredi testi", category: "cografya", prize: "Aile kupası" },
    user,
  );
  assert.equal(r.status, 200, JSON.stringify(r));
  if (mode === "quiz" && withPlayers) {
    await join(r.data.pin, "Kredi oyuncusu bir");
    await join(r.data.pin, "Kredi oyuncusu iki");
  }
  return r.data;
};
const setCreditLimits = async (user, extra = {}) => {
  const r = await call(
    "credit_update",
    {
      userId: user.id,
      dailyLimit: 5,
      monthlyLimit: 150,
      participantLimit: 10,
      roomLimit: 1,
      raffleLimit: 50,
      note: "Yerel limit testi",
      ...extra,
    },
    { admin: true },
  );
  assert.equal(r.status, 200, JSON.stringify(r));
};
const startCreditQuiz = (user, room, extra = {}) =>
  call(
    "advance",
    { pin: room.pin, expectedPhase: "lobby", expectedIndex: -1, ...extra },
    user,
  );

test("credits: private balances, free creation/cancellation, one open event and participant caps", async () => {
  const user = await soloUser("credit-capacity");
  const fresh = await creditBalance(user);
  assert.equal(fresh.dailyRemaining, 5);
  assert.equal(fresh.monthlyRemaining, 150);
  assert.equal(fresh.available, 5);
  assert.equal(fresh.participantLimit, 10);
  assert.equal((await call("credits")).status, 401);
  assert.equal((await call("credits", { userId: 1 }, user)).status, 403);
  assert.equal(
    (
      await call(
        "credit_bonus",
        { userId: user.id, amount: 5, note: "Yetkisiz bonus" },
        user,
      )
    ).status,
    403,
  );
  assert.equal(
    (await call("credit_update", { userId: user.id }, user)).status,
    403,
  );
  const room = await creditRoom(user, "quiz", false);
  assert.equal((await creditBalance(user)).available, 5);
  assert.equal(
    (await call("create", { mode: "raffle", title: "İkinci oda" }, user))
      .status,
    409,
  );
  assert.equal(
    (await call("solo_start", { category: "cografya" }, user)).status,
    409,
  );
  // The host is an ordinary participant when joining their own room.
  for (let i = 0; i < 10; i++)
    assert.equal(
      (
        await call(
          "join",
          { pin: room.pin, name: "Kişi " + i },
          i === 0 ? user : {},
        )
      ).status,
      200,
    );
  assert.equal(
    (await call("join", { pin: room.pin, name: "On birinci" })).status,
    409,
  );
  assert.equal((await creditBalance(user)).available, 5);
  assert.equal((await call("close", { pin: room.pin }, user)).status, 200);
  const unused = await creditRoom(user, "cloud");
  assert.equal(unused.phase, "lobby");
  mutateDB(unused.pin, "$s['createdAt']=time()-181");
  assert.equal(
    (await call("room", { pin: unused.pin }, user)).data.phase,
    "closed",
  );
  assert.equal((await creditBalance(user)).available, 5);
  const solo = await call("solo_start", { category: "cografya" }, user);
  assert.equal(solo.status, 200);
  assert.equal((await creditBalance(user)).available, 4);
  assert.equal(
    (
      await call(
        "create",
        { mode: "quiz", title: "Solo sırasında", category: "cografya" },
        user,
      )
    ).status,
    409,
  );
  assert.equal(
    (await call("solo_abandon", { gameId: solo.data.game.id }, user)).status,
    200,
  );
  assert.equal(
    (await creditBalance(user)).available,
    4,
    "voluntary abandonment is not refundable",
  );
});

test("credits: daily/monthly caps, bonus fallback, retries, refunds and ongoing games", async () => {
  const user = await soloUser("credit-quota");
  await setCreditLimits(user, { dailyLimit: 1, monthlyLimit: 2 });
  let room = await creditRoom(user);
  const requestId = randomUUID();
  assert.equal(
    (await startCreditQuiz(user, room, { requestId: null })).status,
    400,
  );
  assert.equal((await creditBalance(user)).available, 1);
  const starts = await Promise.all([
    startCreditQuiz(user, room, { requestId }),
    startCreditQuiz(user, room, { requestId }),
  ]);
  assert.deepEqual(starts.map((r) => r.status).sort(), [200, 409]);
  let balance = await creditBalance(user);
  assert.equal(balance.available, 0);
  assert.equal(balance.history.length, 1);
  assert.equal(balance.monthlyRemaining, 1);
  assert.equal(
    (
      await call(
        "advance",
        { pin: room.pin, expectedPhase: "question", expectedIndex: 0 },
        user,
      )
    ).status,
    200,
    "paid game continues at zero credits",
  );
  assert.equal((await call("close", { pin: room.pin }, user)).status, 200);
  room = await creditRoom(user);
  assert.equal((await startCreditQuiz(user, room)).status, 409);
  assert.equal(
    (await call("room", { pin: room.pin }, user)).data.phase,
    "lobby",
  );
  assert.equal((await creditBalance(user)).history.length, 1);
  const refund = {
    userId: user.id,
    eventId: balance.history[0].id,
    note: "Doğrulanmış teknik sorun",
    requestId: randomUUID(),
  };
  assert.equal((await call("credit_refund", refund, user)).status, 403);
  assert.equal(
    (await call("credit_refund", refund, { admin: true })).status,
    200,
  );
  assert.equal(
    (await call("credit_refund", refund, { admin: true })).status,
    409,
  );
  assert.equal(
    (
      await call(
        "credit_refund",
        { ...refund, requestId: randomUUID() },
        { admin: true },
      )
    ).status,
    200,
  );
  assert.equal((await creditBalance(user)).available, 1);
  assert.equal((await startCreditQuiz(user, room)).status, 200);
  await call("close", { pin: room.pin }, user);
  // A new day restores the daily allowance but still counts this month's use.
  sql(
    `$db->exec("UPDATE arena_credit_events SET period_day='2000-01-01' WHERE user_id=${user.id} AND state='spent'");`,
  );
  balance = await creditBalance(user);
  assert.equal(balance.dailyRemaining, 1);
  assert.equal(balance.monthlyRemaining, 1);
  room = await creditRoom(user);
  assert.equal((await startCreditQuiz(user, room)).status, 200);
  await call("close", { pin: room.pin }, user);
  await setCreditLimits(user, { dailyLimit: 5, monthlyLimit: 2 });
  assert.equal(
    (await creditBalance(user)).available,
    0,
    "monthly cap is independent of daily reset",
  );
  const bonus = {
    userId: user.id,
    amount: 2,
    note: "Test bonusu",
    requestId: randomUUID(),
  };
  assert.equal(
    (await call("credit_bonus", bonus, { admin: true })).status,
    200,
  );
  assert.equal(
    (await call("credit_bonus", bonus, { admin: true })).status,
    409,
  );
  room = await creditRoom(user);
  assert.equal((await startCreditQuiz(user, room)).status, 200);
  balance = await creditBalance(user);
  assert.equal(balance.bonus, 1);
  assert.equal(balance.monthlyRemaining, 0);
  const bonusEvent = balance.history.find((e) => e.bonusUsed === 1);
  assert(bonusEvent);
  await call(
    "credit_refund",
    { userId: user.id, eventId: bonusEvent.id, note: "Bonus iade testi" },
    { admin: true },
  );
  assert.equal((await creditBalance(user)).bonus, 2);
  // Resetting the month does not accumulate old daily credits.
  sql(
    `$db->exec("UPDATE arena_credit_events SET period_day='2000-01-01',period_month='2000-01' WHERE user_id=${user.id}");`,
  );
  balance = await creditBalance(user);
  assert.equal(balance.dailyRemaining, 5);
  assert.equal(balance.monthlyRemaining, 2);
  assert.equal(balance.available, 4);
});

test("credits: cloud questions and raffle spins charge once and validate before charging", async () => {
  const user = await soloUser("credit-modules");
  let room = await creditRoom(user, "cloud");
  const guest = await call("join", { pin: room.pin, name: "Misafir" });
  assert.equal(guest.status, 200);
  assert.equal(
    (
      await call(
        "words",
        { pin: room.pin, promptVersion: 1, words: ["mutlu"] },
        { token: guest.data.token },
      )
    ).status,
    409,
  );
  assert.equal(
    (await call("cloud_start", { pin: room.pin }, user)).status,
    200,
  );
  assert.equal((await creditBalance(user)).available, 4);
  assert.equal(
    (
      await call(
        "words",
        { pin: room.pin, promptVersion: 1, words: ["mutlu"] },
        { token: guest.data.token },
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await call(
        "prompt",
        { pin: room.pin, promptVersion: 1, prompt: "x" },
        user,
      )
    ).status,
    400,
  );
  const next = {
    pin: room.pin,
    promptVersion: 1,
    prompt: "En sevdiğin şehir?",
    requestId: randomUUID(),
  };
  assert.equal((await call("prompt", next, user)).status, 200);
  assert.equal((await call("prompt", next, user)).status, 409);
  assert.equal((await creditBalance(user)).available, 4);
  await call("close", { pin: room.pin }, user);
  room = await creditRoom(user, "raffle");
  assert.equal((await call("draw", { pin: room.pin }, user)).status, 409);
  const names = Array.from({ length: 50 }, (_, i) => "Çekiliş " + i);
  assert.equal(
    (await call("entries", { pin: room.pin, names: [...names, "Fazla"] }, user))
      .status,
    400,
  );
  assert.equal(
    (await call("entries", { pin: room.pin, names }, user)).status,
    200,
  );
  assert.equal(
    (await call("entries", { pin: room.pin, names: ["Fazla"] }, user)).status,
    400,
  );
  assert.equal((await creditBalance(user)).available, 4);
  const spin = { pin: room.pin, expectedDrawId: null, requestId: randomUUID() };
  assert.equal((await call("draw", spin, user)).status, 200);
  mutateDB(
    room.pin,
    "$s['draw']['settleAt']=microtime(true)-1;$s['draw']['revealAt']=microtime(true)-2",
  );
  assert.equal((await call("draw", spin, user)).status, 409);
  const current = (await call("room", { pin: room.pin }, user)).data;
  assert.equal(
    (
      await call(
        "draw",
        {
          pin: room.pin,
          expectedDrawId: current.draw.id,
          requestId: spin.requestId,
        },
        user,
      )
    ).status,
    200,
    "later spins in the same event do not charge another game",
  );
  assert.equal((await creditBalance(user)).available, 3);
  await call("close", { pin: room.pin }, user);
  room = await creditRoom(user, "family");
  assert.equal(room.participantLimit, 10);
  assert.equal(
    (await call("family_start", { pin: room.pin }, user)).status,
    409,
  );
  for (const [name, role] of [
    ["Anne", "anne"],
    ["Baba", "baba"],
  ]) {
    const guest = await call("join", { pin: room.pin, name, role });
    assert.equal(guest.status, 200);
    const answers = Object.fromEntries(
      room.prompts.map((p, i) => [p.id, "Örnek cevap " + i]),
    );
    assert.equal(
      (
        await call(
          "family_profile",
          { pin: room.pin, answers },
          { token: guest.data.token },
        )
      ).status,
      200,
    );
  }
  assert.equal(
    (await call("family_start", { pin: room.pin }, user)).status,
    200,
  );
  assert.equal(
    (await call("family_start", { pin: room.pin }, user)).status,
    409,
  );
  assert.equal((await creditBalance(user)).available, 2);
});

async function creditTournament(user) {
  const room = await creditRoom(user, "tournament");
  for (const [i, category] of ["cografya", "futbol", "cografya"].entries()) {
    const p = await call("join", { pin: room.pin, name: "Turnuvacı " + i });
    assert.equal(p.status, 200);
    assert.equal(
      (
        await call(
          "tournament_choices",
          { pin: room.pin, categories: [category] },
          { token: p.data.token },
        )
      ).status,
      200,
    );
  }
  return room;
}
test("credits: a full tournament costs one game, regardless of selected rounds", async () => {
  const user = await soloUser("credit-tournament");
  await setCreditLimits(user, { dailyLimit: 1 });
  const room = await creditTournament(user);
  assert.equal((await call("tournament_start", {pin:room.pin}, user)).status,200);
  let balance=await creditBalance(user);
  assert.equal(balance.available,0);
  assert.equal(balance.reserved,0);
  assert.equal(balance.history.length,1);
  assert.equal((await call("tournament_start", {pin:room.pin}, user)).status,409);
  mutateDB(room.pin,"$s['voteUntil']=microtime(true)-1000");
  assert.equal((await call("room",{pin:room.pin},user)).data.phase,"finished");
  balance=await creditBalance(user);
  assert.equal(balance.available,0);
  assert.equal(balance.history.length,1);
  const next=await creditTournament(user);
  assert.equal((await call("tournament_start",{pin:next.pin},user)).status,409);
});

test("credits: started tournament expiry, late refunds, owner preview and transaction rollback", async () => {
  const user = await soloUser("credit-refunds");
  let room = await creditTournament(user);
  await call("tournament_start", { pin: room.pin }, user);
  // Starting a tournament spends one game, even if the host leaves during voting.
  mutateDB(
    room.pin,
    "$s['expiresAt']=time()-1;$s['voteUntil']=microtime(true)+30",
  );
  let b = await creditBalance(user);
  assert.equal(b.available, 4);
  assert.equal(b.reserved, 0);
  room = await creditRoom(user);
  await startCreditQuiz(user, room);
  await call("close", { pin: room.pin }, user);
  b = await creditBalance(user);
  const event = b.history.find((e) => e.state === "spent");
  sql(
    `$db->exec("UPDATE arena_credit_events SET period_day='2000-01-01' WHERE user_id=${user.id} AND state='spent'");`,
  );
  const before = await creditBalance(user);
  await call(
    "credit_refund",
    {
      userId: user.id,
      eventId: event.id,
      note: "Ertesi gün teknik hata iadesi",
    },
    { admin: true },
  );
  b = await creditBalance(user);
  assert.equal(b.bonus, 1);
  assert.equal(b.monthlyRemaining, before.monthlyRemaining);
  assert.equal(b.available, before.available, "a refund bonus cannot exceed the daily cap");
  await call(
    "credit_refund",
    { userId: user.id, eventId: event.id, note: "Tekrarlanan iade" },
    { admin: true },
  );
  assert.equal((await creditBalance(user)).bonus, 1);
  room = await creditRoom(user);
  // Fail the room write after its debit: both writes must roll back together.
  sql(
    `$db->exec("CREATE TRIGGER reject_credit_room BEFORE UPDATE ON arena_rooms WHEN NEW.pin='${room.pin}' BEGIN SELECT RAISE(ABORT,'test failure'); END");`,
  );
  b = await creditBalance(user);
  const req = randomUUID();
  assert.equal(
    (await startCreditQuiz(user, room, { requestId: req })).status,
    500,
  );
  sql("$db->exec('DROP TRIGGER reject_credit_room');");
  assert.equal((await creditBalance(user)).available, b.available);
  assert.equal(
    (await startCreditQuiz(user, room, { requestId: req })).status,
    200,
  );
  await call("close", { pin: room.pin }, user);
  const actorLogin = await call("login", {
    username: "admin",
    password: "local-test-password",
  });
  assert.equal(actorLogin.status, 200);
  const actor = { cookie: sessionCookie(actorLogin) };
  assert.equal(
    (await call("preview_start", { userId: user.id }, actor)).status,
    200,
  );
  b = await creditBalance(user);
  const solo = await call("solo_start", { category: "cografya" }, actor);
  assert.equal(solo.status, 200);
  assert.equal((await creditBalance(user)).available, b.available);
  assert.equal((await call("credits", {}, actor)).data.preview, true);
  await call("preview_stop", {}, actor);
  assert.equal((await creditBalance({ admin: true })).unlimited, true);
});

test("credit periods reset at Istanbul midnight including month and year boundaries", () => {
  const periods = JSON.parse(
    execFileSync(
      "php",
      [
        "-r",
        `require 'api/credits.php';echo json_encode(array_map(fn($s)=>creditPeriod(new DateTimeImmutable($s)),['2026-10-31T20:59:59Z','2026-10-31T21:00:00Z','2026-12-31T21:00:00Z']));`,
      ],
      { cwd: root, encoding: "utf8" },
    ),
  );
  assert.equal(periods[0].day, "2026-10-31");
  assert.equal(periods[1].day, "2026-11-01");
  assert.equal(periods[1].month, "2026-11");
  assert.equal(periods[2].month, "2027-01");
  assert.equal(
    periods[0].dailyResetAt,
    Date.parse("2026-10-31T21:00:00Z") / 1000,
  );
  assert.equal(periods[0].dailyResetAt, periods[0].monthlyResetAt);
});

test("room credit balances belong to the host and stay private from participants and other hosts", async () => {
  const user = await soloUser("credit-room-view");
  const other = await soloUser("credit-room-other");
  const room = await creditRoom(user);
  const guest = await join(room.pin, "Kredi misafiri");
  assert.equal((await call("credits", { pin: room.pin })).status, 401);
  assert.equal(
    (await call("credits", { pin: room.pin }, { token: guest.token })).status,
    401,
  );
  assert.equal((await call("credits", { pin: room.pin }, other)).status, 403);
  assert.equal((await call("credits", { pin: "000000" }, user)).status, 404);
  assert.equal((await startCreditQuiz(user, room)).status, 200);
  const own = (await call("credits", { pin: room.pin }, user)).data;
  assert.equal(own.available, 4);
  const adminView = (await call("credits", { pin: room.pin }, { admin: true }))
    .data;
  assert.equal(adminView.unlimited, false);
  assert.equal(
    adminView.available,
    4,
    "admin sees the room owner's balance, not their unlimited balance",
  );
  mutateDB(room.pin, "$s['deadline']=microtime(true)-1000");
  assert.equal(
    (await call("room", { pin: room.pin }, user)).data.phase,
    "finished",
  );
  assert.equal(
    (await call("credits", { pin: room.pin }, user)).data.available,
    4,
    "completion does not charge again",
  );
});

test('native bearer login is revocable, never inherits browser cookies, and rejects foreign origins', async () => {
  const denied = await call('login', {password:'local-test-password'}, {native:true,origin:'https://evil.example'});
  assert.equal(denied.status,403);
  assert.equal((await call('rooms',{}, {native:true,admin:true})).status,401);
  const login = await call('login',{password:'local-test-password'},{native:true});
  assert.equal(login.status,200);
  assert.match(login.session,/^[a-f0-9]{64}$/);
  assert.equal(login.cookie,null);
  assert.equal((await call('rooms',{}, {native:true,bearer:login.session})).status,200);
  assert.equal((await call('status',{}, {native:true,bearer:login.session})).data.user.role,'owner');
  assert.equal((await call('rooms',{}, {bearer:login.session})).status,401);
  assert.equal((await call('login',{password:'local-test-password'}, {origin:'https://localhost'})).status,403);
  assert.equal((await call('logout',{}, {native:true,bearer:login.session})).session,'cleared');
  assert.equal((await call('rooms',{}, {native:true,bearer:login.session})).status,401);
});

test("manual cancellation reaches players and rejects further answers", async () => {
  const room = await create("quiz");
  const player = await join(room.pin, "İptal kontrolü");
  await join(room.pin, "Diğer oyuncu");
  await call("advance", { pin: room.pin, expectedIndex: -1, expectedPhase: "lobby" }, { admin: true });
  const active = (await call("room", { pin: room.pin }, { token: player.token })).data;
  const forbidden = await call("close", { pin: room.pin }, { token: player.token });
  assert.equal(forbidden.status, 401);
  const cancelled = await call("close", { pin: room.pin }, { admin: true });
  assert.equal(cancelled.status, 200);
  assert.equal(cancelled.data.phase, "closed");
  assert.equal(cancelled.data.closeReason, "cancelled");
  const seen = (await call("room", { pin: room.pin }, { token: player.token })).data;
  assert.equal(seen.phase, "closed");
  assert.equal(seen.closeReason, "cancelled");
  const answer = await call("answer", { pin: room.pin, questionId: active.question.id, choice: 0 }, { token: player.token });
  assert.equal(answer.status, 409);
  const repeated = await call("close", { pin: room.pin }, { admin: true });
  assert.equal(repeated.status, 200);
  assert.equal(repeated.data.closeReason, "cancelled");
});


test("five games are shared across web and native, including bonus and legacy accounts", async()=>{
  const user=await soloUser("five-shared");
  await creditBalance(user);
  sql(`$db->exec("UPDATE arena_credit_accounts SET daily_limit=10,bonus=100 WHERE user_id=${user.id}");`);
  assert.equal((await creditBalance(user)).dailyLimit,5);
  for(let i=0;i<5;i++){
    const room=await creditRoom(user);
    assert.equal((await startCreditQuiz(user,room)).status,200);
    await call("close",{pin:room.pin},user);
    assert.equal((await creditBalance(user)).available,4-i);
  }
  const auth=await call("login",{username:"five-shared",password:"test"},{native:true});
  assert.equal(auth.status,200);
  const native={native:true,bearer:auth.session};
  assert.equal((await call("solo_start",{category:"cografya"},native)).status,409);
  assert.equal((await creditBalance(native)).available,0);
  assert.equal((await creditBalance(native)).bonus,100);
  assert.equal((await call("credit_update",{userId:user.id,dailyLimit:6,monthlyLimit:150,participantLimit:10,roomLimit:1,raffleLimit:50,note:"Invalid higher daily limit"},{admin:true})).status,400);
});


test("quiz host uses profile identity, needs a second player, and failed starts never charge credits", async () => {
  const user = await soloUser("profile-host");
  const other = await soloUser("profile-other");
  const room = await creditRoom(user, "quiz", false);
  const start = () => call("advance", { pin: room.pin, expectedIndex: -1, expectedPhase: "lobby" }, user);
  assert.equal((await start()).status, 409, "Empty rooms cannot start through the API");
  assert.equal((await creditBalance(user)).available, 5);
  assert.equal((await call("join", { pin: room.pin, asHost: true, avatar: "fox" })).status, 403);
  assert.equal((await call("join", { pin: room.pin, asHost: true, avatar: "fox" }, other)).status, 403);
  const host = await call("join", { pin: room.pin, asHost: true, name: "Spoofed name", avatar: "fox" }, user);
  assert.equal(host.status, 200);
  assert.equal(host.data.room.me.name, "profile-host");
  assert.equal(host.data.room.me.avatar, "fox");
  assert.equal(host.data.room.canManage, true);
  const reload = await call("room", { pin: room.pin }, { ...user, token: host.data.token });
  assert.equal(reload.data.me.name, "profile-host");
  assert.equal(reload.data.me.avatar, "fox");
  assert.equal((await call("join", { pin: room.pin, asHost: true, avatar: "robot" }, user)).status, 409);
  assert.equal((await call("join", { pin: room.pin, name: "İkinci kurucu" }, user)).status, 409);
  const blocked = await start();
  assert.equal(blocked.status, 409);
  assert.match(blocked.data.error, /Kendini Dene/);
  const waiting = (await call("room", { pin: room.pin }, user)).data;
  assert.equal(waiting.phase, "lobby");
  assert.equal(waiting.index, -1);
  assert.equal(waiting.playerCount, 1);
  const balance = await creditBalance(user);
  assert.equal(balance.available, 5);
  assert.equal(balance.history.length, 0);
  await join(room.pin, "Arkadaş");
  assert.equal((await start()).status, 200);
  assert.equal((await creditBalance(user)).available, 4);
  await call("close", { pin: room.pin }, user);
  const solo = await call("solo_start", { category: "cografya" }, user);
  assert.equal(solo.status, 200, "Solo mode remains available with no other players");
  await call("solo_abandon", { gameId: solo.data.game.id }, user);
});

test("a lone guest cannot start a quiz while the host only presents", async () => {
  const room = await create("quiz");
  await join(room.pin, "Tek misafir");
  const result = await call("advance", { pin: room.pin, expectedIndex: -1, expectedPhase: "lobby" }, { admin: true });
  assert.equal(result.status, 409);
  assert.match(result.data.error, /Kendini Dene/);
});
