import { test } from "node:test";
import assert from "node:assert/strict";
import { rankPlayers } from "../src/ranking.js";

test("podium orders scores, keeps avatar identity and gives ties the same competition rank", () => {
  const players = [
    { name: "Altıncı", score: 100, avatar: "robot" },
    { name: "Şampiyon", score: 900, avatar: "fox" },
    { name: "Ortak", score: 900, avatar: "dragon" },
    { name: "Üçüncü", score: 700, avatar: "wizard" },
    { name: "Dördüncü", score: 500, avatar: "panda" },
    { name: "Beşinci", score: 200, avatar: "diver" },
    { name: "Yedinci", score: 0, avatar: "cat" },
  ];
  const ranked = rankPlayers(players);
  assert.deepEqual(
    ranked.map((p) => p.rank),
    [1, 1, 3, 4, 5, 6, 7],
  );
  assert.equal(ranked[0].avatar, "fox");
  assert.equal(ranked[1].avatar, "dragon");
  assert.equal(ranked.slice(0, 6).at(-1).name, "Altıncı");
  assert.equal(players[0].name, "Altıncı");
  assert.deepEqual(rankPlayers([]), []);
  assert.deepEqual(
    rankPlayers([{ name: "Tek", score: 0 }]).map((p) => p.rank),
    [1],
  );
});
