import test from "node:test";
import assert from "node:assert/strict";
import { screenPageOffsets } from "../src/screen-pages.js";
test("a fitting screen has no pagination", () => {
  assert.deepEqual(screenPageOffsets(500, 600), [0]);
  assert.deepEqual(screenPageOffsets(500, 0), [0]);
});
test("normal cards and fields start intact on the next page", () => {
  const offsets = screenPageOffsets(1250, 500, [
    [300, 620],
    [700, 850],
    [900, 1230],
  ]);
  assert.equal(offsets[1], 300);
  for (const [top, bottom] of [
    [300, 620],
    [700, 850],
    [900, 1230],
  ]) {
    assert.ok(
      offsets.some(
        (start, i) =>
          start <= top &&
          Math.min(start + 500, offsets[i + 1] ?? Infinity) >= bottom,
      ),
    );
  }
});
test("very long content has monotonic pages and no inaccessible gaps", () => {
  for (const height of [120, 320, 518, 774]) {
    const offsets = screenPageOffsets(12000, height, [[0, 10000]]);
    assert.equal(offsets[0], 0);
    offsets.slice(1).forEach((next, i) => {
      assert.ok(next > offsets[i]);
      assert.ok(next <= offsets[i] + height);
    });
    assert.ok(offsets.at(-1) + height >= 11998);
  }
});
