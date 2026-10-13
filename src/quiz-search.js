// Match Turkish names even when the phone keyboard uses ASCII characters.
export function normalizeQuizSearch(value) {
  return String(value || "")
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
const aliases = {
  dinozor: "dinazor dinozorlar tarih öncesi",
  cografya: "doğa dünya harita",
  hayvanlar: "doğa canlılar hayvan",
  gezegenler: "uzay astronomi güneş sistemi",
  futbol: "spor top",
  "dunya-kupasi": "spor futbol dünya kupası",
  kaleciler: "spor futbol kaleci",
  arabalar: "otomobil araba araç motor",
  film: "sinema filmler",
  meshur: "şehirler iller meşhur yemek kültür",
  plakalar: "plaka şehir il kodu",
  bayraklar: "bayrak ülkeler",
  enler: "rekor en büyük en yüksek en derin",
};
export function searchQuizzes(games, query) {
  const words = normalizeQuizSearch(query).split(" ").filter(Boolean);
  if (!words.length) return games;
  return games.filter((game) => {
    const text = normalizeQuizSearch(
      [game.name, game.desc, aliases[game.id]].join(" "),
    );
    return words.every((word) => text.includes(word));
  });
}
