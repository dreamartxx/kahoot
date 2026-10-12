export const reminderIds = [73001, 73002];
export const reminderChannel = "family-reminders";
// Two one-off, inexact alarms. Never repeat indefinitely or wake a sleeping phone.
export function reminderPlan(now = new Date()) {
  return [
    [
      3,
      "Özledik seni! ✨",
      "Birlikte güzel bir anıya ne dersin? Oyunlar seni bekliyor.",
    ],
    [
      7,
      "Bir yarışmaya ne dersin? 🏆",
      "Ailenle buluş ya da Kendini Dene ile kendi rekorunu geç.",
    ],
  ].map(([days, title, body], index) => {
    const at = new Date(now);
    at.setDate(at.getDate() + days);
    at.setHours(19, 0, 0, 0);
    // Keep at least three/seven full days of inactivity for late-evening visits.
    if (at.getTime() - now.getTime() < days * 86400000)
      at.setDate(at.getDate() + 1);
    return {
      id: reminderIds[index],
      title,
      body,
      schedule: { at, allowWhileIdle: false },
      isExactNotification: false,
      channelId: reminderChannel,
      smallIcon: "ic_reminder",
      iconColor: "#7954DA",
      autoCancel: true,
      extra: { kind: "family-reminder" },
    };
  });
}
// Serialize resume, permission and toggle actions so an old resume cannot
// re-schedule a reminder after the user has turned reminders off.
export function createReminderController({
  notifications,
  storage,
  clock = () => new Date(),
}) {
  const key = "arena:reminders";
  let queue = Promise.resolve();
  const enabled = () => storage.getItem(key) === "on";
  const serial = (fn) => {
    const operation = queue.then(fn);
    queue = operation.catch(() => {});
    return operation;
  };
  const cancel = () =>
    notifications.cancel({ notifications: reminderIds.map((id) => ({ id })) });
  async function schedule() {
    await notifications.createChannel({
      id: reminderChannel,
      name: "Oyun hatırlatmaları",
      description: "Yeniden birlikte oynamak için nazik hatırlatmalar",
      importance: 3,
      visibility: 0,
      vibration: false,
    });
    await notifications.schedule({ notifications: reminderPlan(clock()) });
  }
  return {
    enabled,
    status: () =>
      serial(async () => ({
        enabled: enabled(),
        permission: (await notifications.checkPermissions()).display,
      })),
    setEnabled: (value) =>
      serial(async () => {
        if (!value) {
          // Persist OFF first so future launches do not re-arm after a failure.
          storage.setItem(key, "off");
          await cancel();
          await notifications.removeDeliveredNotifications({
            notifications: reminderIds.map((id) => ({ id })),
          });
          return false;
        }
        let { display } = await notifications.checkPermissions();
        if (display !== "granted")
          ({ display } = await notifications.requestPermissions());
        if (display !== "granted") {
          storage.setItem(key, "off");
          return false;
        }
        await cancel();
        try {
          await schedule();
          storage.setItem(key, "on");
        } catch (error) {
          storage.setItem(key, "off");
          await cancel().catch(() => {});
          throw error;
        }
        return true;
      }),
    onActive: () =>
      serial(async () => {
        await cancel();
        await notifications.removeDeliveredNotifications({
          notifications: reminderIds.map((id) => ({ id })),
        });
        // Never request OS permission on launch or resume.
        if (
          enabled() &&
          (await notifications.checkPermissions()).display === "granted"
        )
          await schedule();
      }),
  };
}
