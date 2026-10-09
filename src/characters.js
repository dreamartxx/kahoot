const files = import.meta.glob("./characters/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});
export const characters = [
  ["astronaut", "Astronot", "Uzay", "#59d7ef"],
  ["robot", "Robot", "Uzay", "#60e9b7"],
  ["alien", "Uzaylı", "Uzay", "#b08bfa"],
  ["wizard", "Büyücü", "Masal", "#a28bfa"],
  ["dragon", "Ejderha", "Masal", "#4ad8ad"],
  ["unicorn", "Unicorn", "Masal", "#f8a6d9"],
  ["knight", "Şövalye", "Masal", "#7eb5ff"],
  ["ninja", "Ninja", "Macera", "#9299ff"],
  ["fox", "Tilki", "Hayvanlar", "#ffa769"],
  ["panda", "Panda", "Hayvanlar", "#ff8b9c"],
  ["cat", "Kedi", "Hayvanlar", "#c9a2ff"],
  ["dinosaur", "Dinozor", "Hayvanlar", "#67e5d1"],
  ["penguin", "Penguen", "Hayvanlar", "#94d6ff"],
  ["footballer", "Golcü", "Spor", "#ffe27a"],
  ["goalkeeper", "Kaleci", "Spor", "#ff9f92"],
  ["racer", "Yarışçı", "Spor", "#ffc076"],
  ["chef", "Şef", "Meslekler", "#78e1dc"],
  ["scientist", "Bilim İnsanı", "Meslekler", "#a4bdff"],
  ["pirate", "Korsan", "Macera", "#ffc071"],
  ["diver", "Dalgıç", "Macera", "#60ddeb"],
].map(([id, name, theme, color]) => ({
  id,
  name,
  theme,
  color,
  image: files[`./characters/${id}.webp`],
}));
export const characterById = (id) =>
  characters.find((c) => c.id === id) || characters[0];
