import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (name) =>
  JSON.parse(
    readFileSync(new URL(`../data/quiz-${name}.json`, import.meta.url)),
  );
test("special pools contain 200 estimates, 200 binary claims and 250 balanced mixed questions", () => {
  const estimate = read("estimate"),
    binary = read("binary"),
    mixed = read("mixed");
  assert.equal(estimate.length, 200);
  assert.equal(binary.length, 200);
  assert.equal(mixed.length, 250);
  for (const pool of [estimate, binary, mixed]) {
    assert.equal(new Set(pool.map((q) => q.id)).size, pool.length);
    assert.equal(new Set(pool.map((q) => q.text)).size, pool.length);
    assert.ok(
      pool.every((q) => q.text.includes("?") && q.explanation.length > 5),
    );
  }
  assert.ok(
    estimate.every(
      (q) =>
        Number.isFinite(q.answer) &&
        Math.abs(q.answer) <= 1e12 &&
        q.unit &&
        !q.options,
    ),
  );
  assert.ok(
    binary.every(
      (q) =>
        JSON.stringify(q.options) === '["Evet","Hayır"]' &&
        [0, 1].includes(q.correct),
    ),
  );
  const yes = binary.filter((q) => q.correct === 0).length;
  assert.ok(yes >= 90 && yes <= 110);
  const counts = {};
  for (const q of mixed) {
    counts[q.category] = (counts[q.category] || 0) + 1;
    assert.equal(q.options.length, 4);
    assert.equal(q.difficulty, "general");
  }
  assert.equal(Object.keys(counts).length, 18);
  assert.ok(Object.values(counts).every((n) => n === 13 || n === 14));
});
