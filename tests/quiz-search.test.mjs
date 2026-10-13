import test from "node:test";
import assert from "node:assert/strict";
import { normalizeQuizSearch, searchQuizzes } from "../src/quiz-search.js";
const games = [
  { id: "turkiye", name: "Türkiye", desc: "Her köşesi bir hikâye" },
  { id: "turkiye-tarihi", name: "Türkiye tarihi" },
  { id: "dunya-kupasi", name: "Dünya Kupası" },
  { id: "dinozor", name: "Dinozorlar" },
  { id: "futbol", name: "Futbol" },
];
test("Turkish and ASCII input find the same topics regardless of case", () => {
  for (const query of ["Türkiye", "TURKIYE", "türkiye", "turkiye"])
    assert.deepEqual(
      searchQuizzes(games, query).map((g) => g.id),
      ["turkiye", "turkiye-tarihi"],
    );
  assert.equal(normalizeQuizSearch("İSLAM  TARİHİ"), "islam tarihi");
});
test("multiword queries, aliases and descriptions narrow topic choices", () => {
  assert.equal(searchQuizzes(games, "tarihi turkiye")[0].id, "turkiye-tarihi");
  assert.equal(searchQuizzes(games, "dinazor")[0].id, "dinozor");
  assert.deepEqual(
    searchQuizzes(games, "futbol").map((g) => g.id),
    ["dunya-kupasi", "futbol"],
  );
  assert.equal(searchQuizzes(games, "hikaye")[0].id, "turkiye");
  assert.equal(searchQuizzes(games, "   "), games);
  assert.deepEqual(searchQuizzes(games, "olmayan konu"), []);
});
