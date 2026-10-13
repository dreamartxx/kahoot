import React, { useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { categories } from "./api";
import { quizFormats } from "./QuizFormats";
import ModuleGuide from "./ModuleGuide";
import "./mobile-quiz-picker.css";

const games = [
  ...quizFormats.map((f) => ({
    ...f,
    desc: f.description,
    count: f.pool,
    special: true,
  })),
  ...categories,
];
export default function MobileQuizPicker({ counts, onChoose }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const rail = useRef(null);
  const items = games.filter((g) =>
    g.name
      .toLocaleLowerCase("tr")
      .includes(query.trim().toLocaleLowerCase("tr")),
  );
  function move(next) {
    const i = Math.max(0, Math.min(items.length - 1, next));
    const el = rail.current;
    if (el?.children[i])
      el.scrollTo({
        left: el.children[i].offsetLeft - el.children[0].offsetLeft,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
  }
  return (
    <section className="mobile-quiz-picker" aria-label="Yarışma seç">
      <header>
        <span>OYUNUNU SEÇ</span>
        <h1>Merakını takip et.</h1>
        <p>Bir kart seç, birlikte heyecanı başlat.</p>
      </header>
      <label className="mobile-quiz-search">
        <Search size={18} />
        <input
          aria-label="Yarışma ara"
          placeholder="Konu veya oyun ara…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIndex(0);
            if (rail.current) rail.current.scrollLeft = 0;
          }}
        />
      </label>
      {items.length ? (
        <>
          <div
            className="mobile-quiz-rail"
            ref={rail}
            tabIndex={0}
            role="region"
            aria-roledescription="karusel"
            aria-label="Yarışma kartları"
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                move(index + (e.key === "ArrowRight" ? 1 : -1));
              }
              if (e.key === "Home" || e.key === "End") {
                e.preventDefault();
                move(e.key === "Home" ? 0 : items.length - 1);
              }
            }}
            onScroll={(e) => {
              const el = e.currentTarget;
              const step = el.children[1]
                ? el.children[1].offsetLeft - el.children[0].offsetLeft
                : 1;
              setIndex(
                Math.max(
                  0,
                  Math.min(items.length - 1, Math.round(el.scrollLeft / step)),
                ),
              );
            }}
          >
            {items.map((g, i) => (
              <article
                className="mobile-quiz-card"
                key={g.id}
                style={{ "--game-hue": (i * 37 + 265) % 360 }}
                aria-label={`${g.name}, ${i + 1} / ${items.length}`}
              >
                <div className="mobile-quiz-card-top">
                  <span>{g.special ? "SÜRPRİZ OYUN" : "BİLGİ YARIŞMASI"}</span>
                  <ModuleGuide mode={g.special ? g.id : "quiz"} compact />
                </div>
                <div className="mobile-quiz-art" aria-hidden="true">
                  <i>✦</i>
                  <span>{g.emoji}</span>
                  <i>✧</i>
                </div>
                <div className="mobile-quiz-copy">
                  <h2>{g.name}</h2>
                  <p>{g.desc}</p>
                </div>
                <div className="mobile-quiz-facts">
                  <span>
                    <b>{counts[g.id] ?? g.count}</b> soru havuzu
                  </span>
                  <span>10 · 15 · 20 soru</span>
                </div>
                <button
                  className="mobile-quiz-start"
                  onClick={() => onChoose(g.id)}
                  aria-label={`${g.name} yarışması oluştur`}
                >
                  Bu oyunu seç <ArrowUpRight size={20} />
                </button>
              </article>
            ))}
          </div>
          <div className="mobile-quiz-controls">
            <button
              aria-label="Önceki yarışma"
              disabled={index === 0}
              onClick={() => move(index - 1)}
            >
              <ChevronLeft />
            </button>
            <div aria-live="polite">
              <b>{items[index]?.name}</b>
              <span>
                {index + 1} / {items.length} · Yana kaydır
              </span>
            </div>
            <button
              aria-label="Sonraki yarışma"
              disabled={index === items.length - 1}
              onClick={() => move(index + 1)}
            >
              <ChevronRight />
            </button>
          </div>
        </>
      ) : (
        <p className="mobile-quiz-empty">
          Bu aramayla eşleşen yarışma yok. Başka bir kelime dene.
        </p>
      )}
    </section>
  );
}
