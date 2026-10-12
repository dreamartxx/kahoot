import { test } from "node:test";
import assert from "node:assert/strict";
import {
  reminderPlan,
  reminderIds,
  createReminderController,
} from "../src/reminder-plan.js";
function fixture(permission = "granted") {
  const data = new Map(),
    calls = [],
    pending = new Map();
  const notifications = {
    checkPermissions: async () => ({ display: permission }),
    requestPermissions: async () => {
      calls.push("permission");
      return { display: permission };
    },
    createChannel: async () => {
      calls.push("channel");
    },
    cancel: async ({ notifications }) => {
      notifications.forEach(({ id }) => pending.delete(id));
      calls.push("cancel");
    },
    removeDeliveredNotifications: async () => {},
    schedule: async ({ notifications }) => {
      notifications.forEach((n) => pending.set(n.id, n));
      calls.push("schedule");
    },
  };
  const controller = createReminderController({
    notifications,
    storage: {
      getItem: (key) => data.get(key),
      setItem: (key, value) => data.set(key, value),
    },
    clock: () => new Date(2026, 9, 12, 22, 30),
  });
  return { controller, calls, pending, notifications, data };
}
test("reminders are only two future evening notifications with no exact alarm or repeat", () => {
  for (const now of [
    new Date(2026, 9, 12, 10),
    new Date(2026, 9, 31, 23),
    new Date(2026, 11, 31, 23),
  ]) {
    const plan = reminderPlan(now);
    assert.deepEqual(
      plan.map((n) => n.id),
      reminderIds,
    );
    plan.forEach((n, i) => {
      assert.ok(n.schedule.at - now >= [3, 7][i] * 86400000);
      assert.equal(n.schedule.at.getHours(), 19);
      assert.equal(n.isExactNotification, false);
      assert.equal(n.schedule.allowWhileIdle, false);
      assert.equal(n.schedule.repeats, undefined);
    });
  }
});
test("first launch does not prompt or schedule, denied opt-in never schedules", async () => {
  const f = fixture("denied");
  await f.controller.onActive();
  assert.ok(!f.calls.includes("permission"));
  assert.equal(await f.controller.setEnabled(true), false);
  assert.equal(f.pending.size, 0);
  assert.equal(f.controller.enabled(), false);
});
test("return visits replace existing notifications; disabling beats queued resume", async () => {
  const f = fixture();
  await f.controller.setEnabled(true);
  assert.equal(f.pending.size, 2);
  await f.controller.onActive();
  assert.equal(f.pending.size, 2);
  await Promise.all([
    f.controller.onActive(),
    f.controller.setEnabled(false),
    f.controller.onActive(),
  ]);
  assert.equal(f.pending.size, 0);
  assert.equal(f.controller.enabled(), false);
});
test("revoked OS permission prevents silent resume prompts", async () => {
  const f = fixture();
  await f.controller.setEnabled(true);
  f.notifications.checkPermissions = async () => ({ display: "denied" });
  await f.controller.onActive();
  assert.equal(f.pending.size, 0);
  assert.ok(!f.calls.includes("permission"));
});
test("partial scheduling failure is rolled back and later toggles still work", async () => {
  const f = fixture();
  const schedule = f.notifications.schedule;
  f.notifications.schedule = async (options) => {
    await schedule(options);
    throw Error("device failure");
  };
  await assert.rejects(f.controller.setEnabled(true), /device failure/);
  assert.equal(f.pending.size, 0);
  assert.equal(f.controller.enabled(), false);
  f.notifications.schedule = schedule;
  assert.equal(await f.controller.setEnabled(true), true);
});
