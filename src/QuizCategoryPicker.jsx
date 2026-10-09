import React, { useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  List,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { categories } from "./api";
import "./quiz-categories.css";

const themes = {
  cografya: ["#237a81", "#102d52", "#91fff0", "KEŞFET"],
  dinozor: ["#9251cc", "#382253", "#e6b8ff", "GEÇMİŞE GİT"],
  hayvanlar: ["#d88b27", "#68361e", "#ffdc8c", "DOĞAYA KARIŞ"],
  turkiye: ["#da5d72", "#662347", "#ffc2cd", "YOLA ÇIK"],
  meshur: ["#168f9c", "#163a65", "#b3ffff", "ŞEHİRLERİ TANI"],
  plakalar: ["#5c6cdc", "#242e68", "#c6d4ff", "ROTANI BUL"],
  ulkeler: ["#3099b1", "#203d72", "#b2f1ff", "SINIRLARI AŞ"],
  bayraklar: ["#b7589d", "#4f285f", "#ffd0ee", "DÜNYAYI TANI"],
  enler: ["#598d68", "#213c44", "#d3ffb7", "ZİRVEYİ KEŞFET"],
  gezegenler: ["#7151c7", "#251944", "#d9c0ff", "UZAYA AÇIL"],
  futbol: ["#329774", "#173d44", "#a6ffd3", "SAHAYA ÇIK"],
  kaleciler: ["#477bd4", "#22355e", "#b9d8ff", "KALEYİ KORU"],
  arabalar: ["#d46b39", "#66323c", "#ffcca4", "VİTES YÜKSELT"],
  "turkiye-tarihi": ["#b57941", "#57343b", "#ffe3a1", "İZLERİ TAKİP ET"],
  "osmanli-tarihi": ["#a6843d", "#43382b", "#ffe5a5", "TARİHE DOKUN"],
  "islam-tarihi": ["#328f85", "#183d45", "#b1f6d7", "GEÇMİŞİ KEŞFET"],
  "peygamberler-tarihi": ["#7462ab", "#363455", "#dfd1ff", "KISSALARI KEŞFET"],
  "genel-kultur": ["#bf8834", "#5b344d", "#ffe99d", "MERAKINI TAKİP ET"],
};
const viewKey = "arena:quiz-category-view";
const readView = () => {
  try {
    return localStorage.getItem(viewKey) === "list" ? "list" : "cards";
  } catch {
    return "cards";
  }
};
function relativePosition(index, active, length) {
  let offset = index - active;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;
  return offset;
}
export default function QuizCategoryPicker({ counts, onChoose }) {
  const [view, setView] = useState(readView);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(categories[0].id);
  const gesture = useRef(null),
    dragged = useRef(false);
  const items = categories.filter((c) =>
    c.name
      .toLocaleLowerCase("tr")
      .includes(query.trim().toLocaleLowerCase("tr")),
  );
  const active = Math.max(
    0,
    items.findIndex((c) => c.id === selected),
  );
  const current = items[active];
  function changeView(next) {
    setView(next);
    try {
      localStorage.setItem(viewKey, next);
    } catch {
      /* The choice still works without browser storage. */
    }
  }
  function move(step) {
    if (items.length)
      setSelected(items[(active + step + items.length) % items.length].id);
  }
  function swipeEnd(e) {
    const start = gesture.current;
    gesture.current = null;
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x,
      dy = e.clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      dragged.current = true;
      move(dx < 0 ? 1 : -1);
    }
  }
  return (
    <section className="quiz-picker" aria-label="Bilgi yarışması konusu seç">
      <div className="quiz-picker-toolbar">
        <div className="quiz-picker-label">
          <Sparkles size={19} />
          <span>
            <b>Konunu seç, sahneye çık.</b>
            <small>{categories.length} konu · Her turda 10 soru</small>
          </span>
        </div>
        <div className="quiz-picker-tools">
          <div className="quiz-topic-search">
            <Search size={17} />
            <input
              aria-label="Yarışma konusu ara"
              placeholder="Konu ara…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Konu aramasını temizle"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div
            className="quiz-view-switch"
            role="group"
            aria-label="Konu görünümü"
          >
            <button
              aria-pressed={view === "cards"}
              onClick={() => changeView("cards")}
            >
              <Layers size={17} /> Kartlar
            </button>
            <button
              aria-pressed={view === "list"}
              onClick={() => changeView("list")}
            >
              <List size={18} /> Liste
            </button>
          </div>
        </div>
      </div>
      {!items.length ? (
        <div className="quiz-picker-empty">
          <Search size={32} />
          <h3>Bu isimde bir konu bulamadık.</h3>
          <p>Başka bir kelime dene veya tüm konulara dön.</p>
          <button className="btn secondary" onClick={() => setQuery("")}>
            Tüm konuları göster
          </button>
        </div>
      ) : view === "cards" ? (
        <div className="quiz-showcase">
          <div className="quiz-stage-aurora" aria-hidden="true" />
          <div className="quiz-showcase-header">
            <div>
              <span className="quiz-stage-kicker">
                MERAKIN NEREYE GÖTÜRSÜN?
              </span>
              <h2>
                Bir kart seç.<span> Heyecanı başlat.</span>
              </h2>
            </div>
            <span className="quiz-stage-badge">
              <span /> {items.length} konu seni bekliyor
            </span>
          </div>
          <div
            className="quiz-card-stage"
            role="region"
            aria-roledescription="karusel"
            aria-label="Konu kartları, ok tuşlarıyla gezinebilirsin"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.target.closest("input")) return;
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                e.currentTarget.focus();
                move(e.key === "ArrowRight" ? 1 : -1);
              } else if (e.key === "Home" || e.key === "End") {
                e.preventDefault();
                e.currentTarget.focus();
                setSelected(items[e.key === "Home" ? 0 : items.length - 1].id);
              }
            }}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              dragged.current = false;
              gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
            }}
            onPointerUp={swipeEnd}
            onPointerCancel={() => {
              gesture.current = null;
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") gesture.current = null;
            }}
          >
            <div className="quiz-stage-floor" aria-hidden="true" />
            <span className="quiz-stage-spark spark-left" aria-hidden="true">
              ✦
            </span>
            <span className="quiz-stage-spark spark-right" aria-hidden="true">
              ✧
            </span>
            {items.map((c, i) => {
              const offset = relativePosition(i, active, items.length),
                distance = Math.abs(offset),
                visible = distance <= 2;
              const [color, deep, light, label] = themes[c.id];
              return (
                <button
                  key={c.id}
                  className={`quiz-show-card ${offset === 0 ? "is-current" : ""}`}
                  data-visible={visible}
                  aria-hidden={!visible}
                  tabIndex={offset === 0 ? 0 : -1}
                  aria-label={
                    offset === 0
                      ? `${c.name} yarışması oluştur`
                      : `${c.name} konusunu öne getir`
                  }
                  style={{
                    "--card-color": color,
                    "--card-deep": deep,
                    "--card-light": light,
                    "--card-offset": Math.max(-3, Math.min(3, offset)),
                    "--card-distance": Math.min(distance, 3),
                    zIndex: 10 - distance,
                  }}
                  onClick={() => {
                    if (dragged.current) {
                      dragged.current = false;
                      return;
                    }
                    offset === 0 ? onChoose(c.id) : setSelected(c.id);
                  }}
                >
                  <span className="quiz-card-shine" aria-hidden="true" />
                  <span className="quiz-card-top">
                    <span className="quiz-card-label">{label}</span>
                    <span className="quiz-card-number">
                      {String(
                        categories.findIndex((x) => x.id === c.id) + 1,
                      ).padStart(2, "0")}
                    </span>
                  </span>
                  <span className="quiz-card-art" aria-hidden="true">
                    <span className="quiz-art-orbit" />
                    <span className="quiz-art-orbit orbit-cross" />
                    <span className="quiz-art-disc" />
                    <span className="quiz-art-star star-one">✦</span>
                    <span className="quiz-art-star star-two">✧</span>
                    <span className="quiz-art-dot" />
                    <span className="quiz-art-emoji">{c.emoji}</span>
                  </span>
                  <span className="quiz-card-copy">
                    <span className="quiz-card-name">{c.name}</span>
                    <span className="quiz-card-description">{c.desc}</span>
                    <span className="quiz-card-facts">
                      <span>
                        <b>{counts[c.id] ?? c.count}</b> soruluk havuz
                      </span>
                      <i />
                      <span>
                        <b>10</b> soruluk tur
                      </span>
                    </span>
                  </span>
                  <span className="quiz-card-choose">
                    {offset === 0 ? "Bu konuyla yarış" : "Konuyu keşfet"}
                    <ArrowUpRight size={20} />
                  </span>
                </button>
              );
            })}
          </div>
          <div className="quiz-deck-controls">
            <button
              className="quiz-deck-arrow"
              aria-label="Önceki konu"
              disabled={items.length < 2}
              onClick={() => move(-1)}
            >
              <ChevronLeft size={24} />
            </button>
            <div className="quiz-deck-position">
              <p aria-live="polite" aria-atomic="true">
                <b>{current.name}</b>
                <span>
                  {String(active + 1).padStart(2, "0")} /{" "}
                  {String(items.length).padStart(2, "0")}
                </span>
              </p>
              <div className="quiz-deck-dots" aria-label="Konuya git">
                {items.map((c, i) => (
                  <button
                    key={c.id}
                    className={i === active ? "active" : ""}
                    aria-label={`${c.name} kartını göster`}
                    aria-current={i === active ? "true" : undefined}
                    onClick={() => setSelected(c.id)}
                  />
                ))}
              </div>
            </div>
            <button
              className="quiz-deck-arrow"
              aria-label="Sonraki konu"
              disabled={items.length < 2}
              onClick={() => move(1)}
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <p className="quiz-deck-hint">
            Kartları kaydır veya oklarla gez. Ortadaki karta dokun, yarışmanı
            oluştur.
          </p>
        </div>
      ) : (
        <div className="quiz-category-list" aria-label="Konu listesi">
          {items.map((c, i) => (
            <button
              key={c.id}
              className="quiz-category-row"
              onClick={() => onChoose(c.id)}
            >
              <span className="quiz-list-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="quiz-list-icon"
                style={{ background: c.color }}
                aria-hidden="true"
              >
                {c.emoji}
              </span>
              <span className="quiz-list-copy">
                <b>{c.name}</b>
                <small>{c.desc}</small>
              </span>
              <span className="quiz-list-count">
                {counts[c.id] ?? c.count} soru
              </span>
              <span className="quiz-list-action">
                Yarışma oluştur <ArrowUpRight size={18} />
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
