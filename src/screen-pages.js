// Choose page starts without cutting a normal-sized control or paragraph.
// Oversized content overlaps by a few lines so no content becomes unreachable.
export function screenPageOffsets(total, height, blocks = []) {
  if (
    !Number.isFinite(total) ||
    !Number.isFinite(height) ||
    height <= 0 ||
    total <= height + 2
  )
    return [0];
  const result = [0];
  while (result.at(-1) + height < total - 2) {
    const start = result.at(-1);
    const edge = start + height;
    const crossing = blocks.filter(
      ([top, bottom]) =>
        top > start + 1 &&
        top < edge &&
        bottom > edge &&
        bottom - top < height,
    );
    const candidate = crossing.length
      ? Math.min(...crossing.map(([top]) => top))
      : edge - Math.min(32, height * 0.1);
    const next = Math.max(start + 1, Math.floor(candidate));
    result.push(next);
  }
  return result;
}
