import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const bank = JSON.parse(
  readFileSync(new URL("../data/questions.json", import.meta.url)),
);
test("10 categories each contain 100 unique four-choice questions", () => {
  const counts = {};
  const ids = new Set(),
    texts = new Set();
  for (const q of bank) {
    counts[q.category] = (counts[q.category] || 0) + 1;
    assert(!ids.has(q.id));
    ids.add(q.id);
    assert(!texts.has(q.text));
    texts.add(q.text);
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4);
    assert(q.text.length > 10);
  }
  assert.equal(Object.keys(counts).length, 10);
  assert(Object.values(counts).every((n) => n === 100));
  assert.equal(bank.length, 1000);
});
