import { Capacitor } from "@capacitor/core";
import { createReminderController } from "./reminder-plan.js";
export const remindersAvailable =
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
let controller;
export async function getReminders() {
  if (!remindersAvailable) return null;
  controller ||= import("@capacitor/local-notifications").then(
    ({ LocalNotifications }) =>
      createReminderController({
        notifications: LocalNotifications,
        storage: localStorage,
      }),
  );
  return controller;
}
export async function refreshReminders() {
  const reminders = await getReminders();
  if (reminders) await reminders.onActive();
}
