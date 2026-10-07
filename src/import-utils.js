export function stripHeader(input) {
  const names = input
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
  const header = (names[0] || "")
    .replace(/^\uFEFF/, "")
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ");
  if (
    [
      "ad",
      "adı",
      "ad soyad",
      "adı soyadı",
      "isim",
      "name",
      "katılımcı",
    ].includes(header)
  )
    names.shift();
  if (names.length > 2000) throw new Error("En fazla 2.000 isim yükleyin.");
  if (!names.length) throw new Error("İlk sütunda isim bulunamadı.");
  return names;
}
