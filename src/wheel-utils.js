// Segment centers start at twelve o'clock. The pointer stays fixed there.
export function winnerRotation(index, count, from = 0) {
  const target =
    (((360 - (index * 360) / Math.max(1, count)) % 360) + 360) % 360;
  return from + 720 + ((target - (from % 360) + 360) % 360);
}

export function wheelEase(progress) {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, progress)), 3);
}
