// Render transitions from the last known server timeline, even if a mobile poll
// takes longer than the entire three-second countdown.
export function quizTransition(room, now) {
  if (
    !room ||
    !["quiz", "family"].includes(room.mode) ||
    !["question", "reveal", "countdown"].includes(room.phase) ||
    room.index >= room.total - 1
  )
    return null;
  const startsAt =
    room.phase === "countdown"
      ? room.countdownUntil - 3
      : (room.revealUntil ?? room.deadline + 5);
  const endsAt = startsAt + 3;
  if (!Number.isFinite(endsAt) || now < startsAt) return null;
  return {
    number: Math.max(0, Math.min(3, Math.ceil(endsAt - now))),
    next: room.index + 2,
  };
}
