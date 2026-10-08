import { test } from "node:test";
import assert from "node:assert/strict";
import { winnerRotation, wheelEase } from "../src/wheel-utils.js";

test("wheel lands on the server winner for small and large participant pools", () => {
  for (const count of [1, 2, 3, 8, 37, 2000]) {
    for (let index = 0; index < count; index++) {
      for (const from of [0, 1943.7, 8952]) {
        const rotation = winnerRotation(index, count, from);
        const pointerOffset =
          (((rotation + (index * 360) / count) % 360) + 360) % 360;
        assert(Math.min(pointerOffset, 360 - pointerOffset) < 0.000001);
        assert(rotation - from >= 720);
      }
    }
  }
  assert.equal(wheelEase(0), 0);
  assert.equal(wheelEase(1), 1);
  assert(wheelEase(0.5) > 0.5);
});
