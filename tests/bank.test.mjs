import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const bank = JSON.parse(
  readFileSync(new URL("../data/questions.json", import.meta.url)),
);
test("14 categories contain 1481 unique four-choice questions", () => {
  const counts = {};
  const ids = new Set(),
    texts = new Set();
  for (const q of bank) {
    counts[q.category] = (counts[q.category] || 0) + 1;
    assert(!ids.has(q.id));
    ids.add(q.id);
    assert(!texts.has(q.text));
    texts.add(q.text);
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4);
    assert(q.text.length > 10);
  }
  assert.equal(Object.keys(counts).length, 14);
  assert.equal(counts.turkiye, 200);
  assert.equal(counts.plakalar, 81);
  assert(
    Object.entries(counts)
      .filter(([key]) => !["turkiye", "plakalar"].includes(key))
      .every(([, n]) => n === 100),
  );
  assert.equal(bank.length, 1481);
});

test("Türkiye retains only 20 metropolitan plates; local specialties cover all 81 provinces", () => {
  const major = new Set(
    "İstanbul,Ankara,İzmir,Bursa,Antalya,Adana,Konya,Gaziantep,Şanlıurfa,Mersin,Kocaeli,Diyarbakır,Hatay,Manisa,Kayseri,Samsun,Balıkesir,Kahramanmaraş,Aydın,Tekirdağ".split(
      ",",
    ),
  );
  const plates = bank.filter(
    (q) => q.category === "turkiye" && q.text.includes("plaka kodu"),
  );
  assert.equal(plates.length, 20);
  assert.deepEqual(new Set(plates.map((q) => q.options[q.correct])), major);
  const dedicated = bank.filter((q) => q.category === "plakalar");
  assert.deepEqual(
    new Set(dedicated.map((q) => q.options[q.correct])),
    new Set(
      Array.from({ length: 81 }, (_, i) => String(i + 1).padStart(2, "0")),
    ),
  );
  const cities = new Set(
    dedicated.map((q) => q.text.split(" ilinin trafik")[0]),
  );
  assert.deepEqual(
    new Set(
      bank
        .filter((q) => q.category === "meshur")
        .map((q) => q.options[q.correct]),
    ),
    cities,
  );
});
test("every flag question has four local SVG choices and the matching country's correct flag", () => {
  const countries = JSON.parse(
    readFileSync(new URL("../data/flag-countries.json", import.meta.url)),
  );
  const codes = new Set(countries.map((c) => c.code));
  const flagQuestions = bank.filter((q) => q.category === "bayraklar");
  assert.equal(flagQuestions.length, countries.length);
  for (const { code, name } of countries) {
    const q = flagQuestions.find(
      (q) => q.text === `${name} ülkesinin bayrağı hangisidir?`,
    );
    assert(q);
    assert.equal(q.options[q.correct], `flag:${code}`);
    for (const option of q.options) {
      assert(option.startsWith("flag:"));
      assert(codes.has(option.slice(5)));
      assert(
        existsSync(
          new URL(
            `../node_modules/flag-icons/flags/4x3/${option.slice(5)}.svg`,
            import.meta.url,
          ),
        ),
      );
    }
  }
});
test("superlative options are names, with optional explanatory measurements", () => {
  const records = bank.filter((q) => q.category === "enler");
  assert.equal(records.length, 100);
  for (const q of records) {
    assert(
      q.options.every((option) => !/^\d/.test(option)),
      q.text,
    );
    assert(q.explanation.length > 65, q.text);
  }
  const everest = records.find((q) =>
    q.text.includes("Dünya'nın en yüksek zirvesi"),
  );
  assert.equal(everest.options[everest.correct], "Everest");
  assert(everest.explanation.includes("8.848,86"));
  const deepest = records.find((q) =>
    q.text.includes("bilinen en derin noktası"),
  );
  assert.equal(deepest.options[deepest.correct], "Challenger Çukuru");
  assert(deepest.explanation.includes("10.935"));
});
