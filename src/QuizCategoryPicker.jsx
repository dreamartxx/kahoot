import React, { useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  List,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { categories } from "./api";
import { searchQuizzes } from "./quiz-search";
import ModuleGuide from "./ModuleGuide";
import { artFor } from "./art-assets";
import "./quiz-categories.css";
const groups = [
  ["all", "Tüm konular"],
  [
    "nature",
    "Dünya & Doğa",
    [
      "cografya",
      "dinozor",
      "hayvanlar",
      "ulkeler",
      "bayraklar",
      "enler",
      "gezegenler",
    ],
  ],
  ["turkey", "Türkiye", ["turkiye", "meshur", "plakalar"]],
  [
    "history",
    "Tarih",
    ["turkiye-tarihi", "osmanli-tarihi", "islam-tarihi", "peygamberler-tarihi"],
  ],
  [
    "life",
    "Spor & Yaşam",
    ["futbol", "kaleciler", "dunya-kupasi", "arabalar", "film", "genel-kultur"],
  ],
];
export default function QuizCategoryPicker({ counts = {}, onChoose }) {
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem("arena:quiz-category-view") === "list"
        ? "list"
        : "cards";
    } catch {
      return "cards";
    }
  });
  const [query, setQuery] = useState(""),
    [group, setGroup] = useState("all"),
    [page, setPage] = useState(0);
  const ids = groups.find((g) => g[0] === group)?.[2];
  const items = searchQuizzes(categories, query).filter(
    (c) => !ids || ids.includes(c.id),
  );
  const pages = Math.max(1, Math.ceil(items.length / 8));
  const current = Math.min(page, pages - 1);
  function changeView(next) {
    setView(next);
    try {
      localStorage.setItem("arena:quiz-category-view", next);
    } catch {
      /* Optional preference. */
    }
  }
  return (
    <section className="topic-gallery" aria-label="Bilgi yarışması konusu seç">
      <header className="gallery-heading">
        <div>
          <span>
            <Sparkles size={15} /> MERAKIN NEREYE GÖTÜRSÜN?
          </span>
          <h1>Bir konu. Binbir heyecan.</h1>
          <p>Sevdiğin alanı seç, yarışmanı birkaç adımda oluştur.</p>
        </div>
        <div className="gallery-total">
          <b>{categories.length}</b>
          <span>keşfedilecek konu</span>
          <ModuleGuide mode="quiz" compact />
        </div>
      </header>
      <div className="gallery-toolbar">
        <label className="gallery-search">
          <Search size={20} />
          <input
            aria-label="Yarışma konusu ara"
            type="search"
            placeholder="Konu veya ilgi alanı ara…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
          {query && (
            <button
              aria-label="Konu aramasını temizle"
              onClick={() => {
                setQuery("");
                setPage(0);
              }}
            >
              <X size={17} />
            </button>
          )}
        </label>
        <div className="gallery-view" role="group" aria-label="Konu görünümü">
          <button
            aria-pressed={view === "cards"}
            onClick={() => changeView("cards")}
          >
            <Grid2X2 size={17} /> Kartlar
          </button>
          <button
            aria-pressed={view === "list"}
            onClick={() => changeView("list")}
          >
            <List size={18} /> Liste
          </button>
        </div>
      </div>
      <div className="gallery-groups" role="group" aria-label="Konu grupları">
        {groups.map(([id, name]) => (
          <button
            key={id}
            aria-pressed={group === id}
            onClick={() => {
              setGroup(id);
              setPage(0);
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <div className={`gallery-items gallery-${view}`}>
        {items.slice(current * 8, current * 8 + 8).map((c) => (
          <button
            className="gallery-card"
            key={c.id}
            onClick={() => onChoose(c.id)}
            aria-label={`${c.name} yarışması oluştur`}
          >
            <span className="gallery-art">
              <img
                src={artFor(c.id)}
                alt=""
                width="900"
                height="600"
                loading="lazy"
                decoding="async"
              />
              <span className="gallery-count">
                {counts[c.id] ?? c.count} soru
              </span>
            </span>
            <span className="gallery-card-copy">
              <strong>{c.name}</strong>
              <span>{c.desc}</span>
              <span className="gallery-card-cta">
                Konuyu seç <ArrowUpRight size={18} />
              </span>
            </span>
          </button>
        ))}
      </div>
      {!items.length && (
        <div className="gallery-empty">
          <Search size={30} />
          <h3>Bu aramada bir konu bulamadık.</h3>
          <p>Farklı bir kelime dene veya filtreleri temizle.</p>
          <button
            onClick={() => {
              setQuery("");
              setGroup("all");
              setPage(0);
            }}
          >
            Tüm konulara dön
          </button>
        </div>
      )}
      <footer className="gallery-pagination">
        <span role="status">
          {items.length} konu
          {items.length > 8
            ? ` · ${current * 8 + 1}–${Math.min((current + 1) * 8, items.length)} gösteriliyor`
            : ""}
        </span>
        <div>
          <button
            aria-label="Önceki konular"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <b>
            {current + 1} / {pages}
          </b>
          <button
            aria-label="Sonraki konular"
            disabled={current === pages - 1}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </footer>
    </section>
  );
}
