// Absolute count scale: another word's growth never shrinks this word.
export function bubbleMetrics(count) {
  const scale = Math.log2(Math.max(0, Number(count) || 0) + 1);
  return { size: 76 + 28 * scale, fontSize: 12 + 4 * scale };
}
