// Competition ranking: tied scores share a rank; the next rank skips those places.
export function rankPlayers(players) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  let rank = 0;
  return sorted.map((player, index) => {
    if (index === 0 || player.score !== sorted[index - 1].score)
      rank = index + 1;
    return { ...player, rank };
  });
}
