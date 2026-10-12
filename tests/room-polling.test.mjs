import { test } from "node:test";
import assert from "node:assert/strict";
import { roomPollDelay } from "../src/room-polling.js";
import { quizTransition } from "../src/quiz-transition.js";
const opts = { random: 0 };
test("room refreshes align with transitions without continuously fast polling", () => {
  const room = {
    mode: "quiz",
    phase: "question",
    serverTime: 100,
    deadline: 110,
    index: 0,
    total: 10,
  };
  assert.equal(roomPollDelay(room, opts), 1500);
  assert.ok(
    Math.abs(roomPollDelay({ ...room, serverTime: 109.8 }, opts) - 260) < 0.001,
  );
  assert.equal(roomPollDelay({ ...room, serverTime: 111 }, opts), 1500);
  assert.deepEqual(
    [115, 116, 117].map((t) => quizTransition(room, t).number),
    [3, 2, 1],
  );
  for (const mode of ["quiz", "family", "tournament"]) {
    assert.equal(
      roomPollDelay(
        { mode, phase: "reveal", serverTime: 100, revealUntil: 101 },
        opts,
      ),
      1060,
    );
    assert.equal(
      roomPollDelay(
        { mode, phase: "countdown", serverTime: 100, countdownUntil: 100.5 },
        opts,
      ),
      560,
    );
  }
});
test("hidden/finished rooms and failures do not keep aggressive polling", () => {
  assert.equal(
    roomPollDelay({ phase: "lobby" }, { ...opts, hidden: true }),
    5000,
  );
  for (const phase of ["closed", "finished"])
    assert.equal(roomPollDelay({ phase }, opts), null);
  assert.deepEqual(
    [1, 2, 3, 4, 9].map((failures) =>
      roomPollDelay(null, { ...opts, failures }),
    ),
    [2000, 4000, 8000, 15000, 15000],
  );
  assert.equal(roomPollDelay({ phase: "lobby" }, { random: 1 }), 1750);
});
