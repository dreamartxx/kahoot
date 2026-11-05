import { createHash } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const bank = JSON.parse(
  readFileSync(new URL("../data/questions.json", import.meta.url)),
);
test("20 categories contain reviewed, unique four-choice questions; plates stay at 81", () => {
  const sizes = JSON.parse(readFileSync(new URL("../data/question-counts.json", import.meta.url)));
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
  assert.equal(Object.keys(counts).length, 20);
  for (const [category, count] of Object.entries(counts))
    assert.equal(count, sizes[category]);

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
  const dedicated = bank.filter(
    (q) => q.category === "plakalar" && q.text.includes(" ilinin trafik"),
  );
  assert.equal(dedicated.length, 81);
  assert.equal(new Set(dedicated.map((q) => q.text)).size, 81);
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
  assert.equal(new Set(flagQuestions.map(q => q.options[q.correct])).size, flagQuestions.length);
  for (const q of flagQuestions) {
    const country = countries.find(c => q.options[q.correct] === 'flag:' + c.code);
    assert(country && q.text.startsWith(country.name + ' '), q.text);
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
  assert(records.length >= 40);
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

test("all 81 plate questions retain their exact wording, options, answers and IDs", () => {
  assert.equal(
    createHash("sha256")
      .update(JSON.stringify(bank.filter(q => q.category === "plakalar")))
      .digest("hex"),
    "1353eb43b97d24c14f83abbfdb9d5cf7e822c5c2c755a8991e7c4855d45f05eb",
  );
});

test("World Cup archive has reviewed questions, broad topics, sources and limited specialist detail", () => {
  const pool = bank.filter((q) => q.category === "dunya-kupasi");
  assert(pool.length >= 40);
  assert(pool.filter((q) => q.difficulty === "general").length >= 36);
  assert(pool.filter((q) => q.difficulty === "expert").length > 0);
  assert(pool.filter((q) => q.topic === "turkiye").length >= 10);
  assert(new Set(pool.map((q) => q.topic)).size >= 10);
  for (const q of pool) {
    assert(q.explanation.length >= 15);
    assert(["fifa.com", "www.fifa.com", "www.tff.org", "www.theifab.com", "inside.fifa.com"].includes(new URL(q.source).hostname));
    assert(!q.text.includes("son şampiyon kim"), "Time-dependent records must state their cutoff");
  }
  const answer = (fragment) => { const q = pool.find((q) => q.text.includes(fragment)); assert(q, fragment); return q.options[q.correct]; };
  assert.equal(answer("1950 FIFA Dünya Kupası şampiyonluğunu"), "Uruguay");
  assert.equal(answer("Türkiye 2002 Dünya Kupası’nı hangi dereceyle"), "Üçüncü");
  assert.equal(answer("2022 sonu itibarıyla erkekler Dünya Kupası toplam gol"), "Miroslav Klose");
  assert.equal(answer("2010 Dünya Kupası’nda eşitlik kriterleri"), "Thomas Müller");
  assert.equal(answer("1950 Dünya Kupası’nın şampiyon belirleme"), "Son aşamada final grubu vardı");
});

test("film archive balances Turkish/world cinema, animation and general knowledge", () => {
  const pool = bank.filter((q) => q.category === "film");
  assert(pool.length >= 40);
  assert(pool.filter((q) => q.difficulty === "general").length > pool.length * 0.8);
  assert(pool.some(q => q.difficulty === "expert"));
  assert.equal(new Set(pool.map((q) => q.topic)).size, 8);
  assert(pool.filter((q) => q.topic === "animasyon").length >= 20);
  assert(pool.filter((q) => q.topic === "turk-filmleri" || q.topic === "yesilcam-ve-turk-oyuncular").length >= 20);
  for (const q of pool) assert(q.explanation.length > 20, q.text);
  const answer = (fragment) => { const q = pool.find((q) => q.text.includes(fragment)); assert(q, fragment); return q.options[q.correct]; };
  assert.equal(answer("G.O.R.A. (2004) filmini kim yönetti"), "Ömer Faruk Sorak");
  assert.equal(answer("2017 Oscar töreninde"), "Ay Işığı / Moonlight");
  assert.equal(answer("2020 Oscar töreninde"), "Parazit / Parasite");
  assert.equal(answer("Örümcek-Adam (2002) filminde Peter Parker"), "Tobey Maguire");
  assert.equal(answer("Hababam Sınıfı (1975) filminde Mahmut Hoca"), "Münir Özkul");
  assert.equal(answer("Coco filminin kültürel dünyası"), "Meksika");
  const awards = pool.filter((q) => q.text.includes("Oscar töreninde"));
  assert(awards.length > 1 && awards.length < 10);
  assert(awards.every((q) => q.source.endsWith(q.text.slice(0, 4))));
});
