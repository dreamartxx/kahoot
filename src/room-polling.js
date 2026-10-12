// The 3–2–1 animation uses the local server timeline; it needs no 300 ms polls.
export function roomPollDelay(
  room,
  { failures = 0, hidden = false, random = Math.random() } = {},
) {
  const jitter = Math.floor(Math.max(0, Math.min(1, random)) * 250);
  if (failures)
    return Math.min(15000, 2000 * 2 ** Math.min(failures - 1, 3)) + jitter;
  if (["closed", "finished"].includes(room?.phase)) return null;
  if (hidden) return 5000 + jitter;
  const base = 1500 + jitter;
  if (!["quiz", "family", "tournament"].includes(room?.mode)) return base;
  const boundary = {
    question: room.deadline,
    reveal: room.revealUntil,
    countdown: room.countdownUntil,
  }[room.phase];
  if (!Number.isFinite(boundary) || !Number.isFinite(room.serverTime))
    return base;
  // Poll just after a phase boundary so the next question arrives promptly.
  // Stale timestamps cannot cause a tight retry loop.
  const remaining = (boundary - room.serverTime) * 1000;
  return remaining > 0
    ? Math.min(base, Math.max(150, remaining + 60 + jitter))
    : base;
}
