import test from "node:test";
import assert from "node:assert/strict";
import { roomHostControls } from "../src/room-access.js";

test("creator retains controls through an invitation; guests and spectator views do not", () => {
  const own = { canManage: true, isCreator: true };
  assert.equal(roomHostControls("host", true, own), true);
  assert.equal(roomHostControls("join", true, own), true);
  assert.equal(roomHostControls("join", false, own), false);
  assert.equal(roomHostControls("screen", true, own), false);
  assert.equal(
    roomHostControls("join", true, { canManage: true, isCreator: false }),
    false,
  );
  assert.equal(roomHostControls("host", true, { canManage: false }), false);
  assert.equal(roomHostControls("host", true, null), false);
});
