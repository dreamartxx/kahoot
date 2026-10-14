import quiz from "./assets/quiz-studio.webp";
const images = import.meta.glob("./assets/premium/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});
export const artFor = (id) => images[`./assets/premium/${id}.webp`] || quiz;
