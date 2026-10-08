import { test } from "node:test";
import assert from "node:assert/strict";
import { quizTransition } from "../src/quiz-transition.js";
const room = {
  mode: "quiz",
  phase: "question",
  index: 0,
  total: 10,
  deadline: 100,
};
test("mobile countdown renders 3, 2, 1 from the last question even with no further responses", () => {
  assert.equal(quizTransition(room, 104.99), null);
  assert.deepEqual(
    [105, 106, 107].map((now) => quizTransition(room, now).number),
    [3, 2, 1],
  );
  assert.deepEqual(quizTransition(room, 108), { number: 0, next: 2 });
  assert.deepEqual(quizTransition(room, 115), { number: 0, next: 2 });
  assert.equal(quizTransition({ ...room, index: 1, deadline: 128 }, 115), null);
});
test("a delayed reveal popup cannot cover the locally scheduled countdown", () => {
  const reveal = { ...room, phase: "reveal", revealUntil: 92 };
  assert.equal(quizTransition(reveal, 91.9), null);
  assert.equal(quizTransition(reveal, 92).number, 3);
  assert.equal(quizTransition(reveal, 94).number, 1);
  assert.equal(
    quizTransition({ ...reveal, phase: "countdown", countdownUntil: 95 }, 94)
      .number,
    1,
  );
});
test("family transitions share the timeline, with no extra countdown after the last question", () => {
  assert.equal(quizTransition({ ...room, mode: "family" }, 105).number, 3);
  for (const phase of ["lobby", "finished", "closed"])
    assert.equal(quizTransition({ ...room, phase }, 105), null);
  assert.equal(quizTransition({ ...room, index: 9 }, 105), null);
  assert.equal(quizTransition({ ...room, mode: "cloud" }, 105), null);
  assert.equal(quizTransition(null, 105), null);
});
