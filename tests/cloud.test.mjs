import { test } from "node:test";
import assert from "node:assert/strict";
import { bubbleMetrics } from "../src/cloud-utils.js";
test("every added vote enlarges its balloon, independently of other words", () => {
  for (let count = 1; count <= 300; count++) {
    const previous = bubbleMetrics(count - 1),
      current = bubbleMetrics(count);
    assert(current.size > previous.size);
    assert(current.fontSize > previous.fontSize);
    assert(current.size < 320, "Fits mobile layout within the 300-player cap");
  }
});
