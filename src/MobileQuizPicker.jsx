import React, { useRef, useState, useLayoutEffect } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import { categories } from "./api";
import { quizFormats } from "./QuizFormats";
import TopicChooser from "./TopicChooser";
import ModuleGuide from "./ModuleGuide";
import GameArt from "./GameArt";
import "./mobile-quiz-picker.css";
import { searchQuizzes } from "./quiz-search";

const concepts = [
  {
    id: "family",
    name: "Beni Tanıyor musun?",
    desc: "Aynı aile, bir sürü küçük sır. Birbirinizi yeniden keşfedin.",
    count: 50,
    special: true,
  },
  ...quizFormats.map((f) => ({
    ...f,
    desc: f.description,
    count: f.pool,
    special: true,
  })),
];
export default function MobileQuizPicker({
  counts,
  onChoose,
  onFamily,
  collection = "topics",
}) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const rail = useRef(null);
  const [chooser, setChooser] = useState(false);
  const [pendingTopic, setPendingTopic] = useState(null);
  const games = collection === "topics" ? categories : concepts;
  const items = searchQuizzes(games, query);
  const search = useRef(null);
  function updateQuery(value) {
    setQuery(value);
    setIndex(0);
    if (rail.current) rail.current.scrollLeft = 0;
  }
  useLayoutEffect(() => {
    if (!pendingTopic) return;
    const i = items.findIndex((g) => g.id === pendingTopic);
    const el = rail.current;
    if (i >= 0 && el?.children[i]) {
      el.scrollTo({
        left: el.children[i].offsetLeft - el.children[0].offsetLeft,
        behavior: "instant",
      });
      setIndex(i);
    }
    setPendingTopic(null);
  }, [pendingTopic, items]);
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
        <span>
          {collection === "topics" ? "BİLGİ YARIŞMASI" : "KONSEPTLER"}
        </span>
        <h1>
          {collection === "topics" ? "Konunu seç." : "Oyuna farklı bir tat."}
        </h1>
      </header>
      {collection === "topics" && (
        <form
          className="quiz-search-tools"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            search.current?.blur();
          }}
        >
          <div className="mobile-quiz-search">
            <Search size={20} aria-hidden="true" />
            <input
              ref={search}
              type="search"
              aria-label="Konu ara"
              placeholder="Konu ara: futbol, Türkiye…"
              autoComplete="off"
              enterKeyHint="search"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") updateQuery("");
              }}
            />
            {query && (
              <button
                type="button"
                aria-label="Aramayı temizle"
                onClick={() => {
                  updateQuery("");
                  search.current?.focus();
                }}
              >
                <X size={19} />
              </button>
            )}
          </div>
          <div className="quiz-quick-select">
            <span aria-live="polite">
              {query.trim() ? `${items.length} konu bulundu` : "Doğrudan seç"}
            </span>
            <button
              type="button"
              className="quiz-topic-trigger"
              aria-label="Konu seç"
              aria-haspopup="dialog"
              aria-expanded={chooser}
              onClick={() => setChooser(true)}
            >
              <span>
                {items[index]?.emoji}{" "}
                {items[index]?.name || "Tüm konuları keşfet"}
              </span>
              <ChevronDown size={18} />
            </button>
          </div>
        </form>
      )}
      {chooser && (
        <TopicChooser
          selected={items[index]?.id}
          onClose={() => setChooser(false)}
          onSelect={(id) => {
            updateQuery("");
            setPendingTopic(id);
            setChooser(false);
          }}
        />
      )}
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
                className={`mobile-quiz-card ${g.id === "family" ? "family-concept-card" : ""}`}
                key={g.id}
                style={{
                  "--game-hue":
                    g.id === "family"
                      ? 335
                      : (games.indexOf(g) * 37 + 265) % 360,
                }}
                aria-label={`${g.name}, ${i + 1} / ${items.length}`}
              >
                <div className="mobile-quiz-card-top">
                  <span>
                    {g.id === "family"
                      ? "BİZE ÖZEL"
                      : g.special
                        ? "KONSEPT YARIŞMA"
                        : "KONU YARIŞMASI"}
                  </span>
                  <ModuleGuide mode={g.special ? g.id : "quiz"} compact />
                </div>
                <div className="mobile-quiz-art" aria-hidden="true">
                  <GameArt
                    mode={g.special ? g.id : "quiz"}
                    category={g.special ? undefined : g.id}
                    active={i === index}
                  />
                </div>
                <div className="mobile-quiz-copy">
                  <h2>{g.name}</h2>
                  <p>{g.desc}</p>
                </div>
                <div className="mobile-quiz-facts">
                  <span>
                    <b>{counts[g.id] ?? g.count}</b> soru havuzu
                  </span>
                  <span>
                    {g.id === "family"
                      ? "Sana özel cevaplar"
                      : "10 · 15 · 20 soru"}
                  </span>
                </div>
                <button
                  className="mobile-quiz-start"
                  onClick={() =>
                    g.id === "family" ? onFamily() : onChoose(g.id)
                  }
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
        <div className="mobile-quiz-empty" role="status">
          <Search size={32} />
          <h2>Bu konuyu bulamadık.</h2>
          <p>Daha kısa bir kelime dene veya tüm konulara dön.</p>
          <button onClick={() => updateQuery("")}>Tüm konuları göster</button>
        </div>
      )}
    </section>
  );
}
