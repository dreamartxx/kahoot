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
    const r = await create(mode, { seconds: 30 });
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
      next.deadline - next.serverTime > 29 &&
        next.deadline - next.serverTime <= 30,
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
