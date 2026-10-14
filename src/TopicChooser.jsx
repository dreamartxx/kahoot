import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Search, Sparkles, X } from "lucide-react";
import { categories } from "./api";
import { searchQuizzes } from "./quiz-search";
import "./topic-chooser.css";
import { artFor } from "./art-assets";

const groups = [
  {
    name: "Dünya & Doğa",
    icon: "🌍",
    ids: [
      "cografya",
      "ulkeler",
      "bayraklar",
      "gezegenler",
      "enler",
      "hayvanlar",
      "dinozor",
    ],
  },
  { name: "Türkiye", icon: "🧿", ids: ["turkiye", "meshur", "plakalar"] },
  {
    name: "Tarih",
    icon: "🏛️",
    ids: [
      "turkiye-tarihi",
      "osmanli-tarihi",
      "islam-tarihi",
      "peygamberler-tarihi",
    ],
  },
  {
    name: "Spor & Yaşam",
    icon: "⚽",
    ids: [
      "futbol",
      "dunya-kupasi",
      "kaleciler",
      "film",
      "arabalar",
      "genel-kultur",
    ],
  },
];
export default function TopicChooser({ selected, onSelect, onClose }) {
  const dialog = useRef(null),
    close = useRef(null),
    title = useId();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState(
    Math.max(
      0,
      groups.findIndex((g) => g.ids.includes(selected)),
    ),
  );
  const matches = searchQuizzes(categories, query);
  const items = matches.filter((item) => groups[group].ids.includes(item.id));
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current.showModal();
    close.current?.focus();
    return () => previous?.focus?.();
  }, []);
  function search(value) {
    setQuery(value);
    const next = searchQuizzes(categories, value);
    if (!next.some((item) => groups[group].ids.includes(item.id)))
      setGroup(
        Math.max(
          0,
          groups.findIndex((g) => next.some((item) => g.ids.includes(item.id))),
        ),
      );
  }
  return createPortal(
    <dialog
      ref={dialog}
      className="topic-chooser"
      aria-labelledby={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <header>
        <div>
          <span>
            <Sparkles size={13} /> MERAKIN NEREYE?
          </span>
          <h2 id={title}>Konunu keşfet</h2>
        </div>
        <button
          ref={close}
          type="button"
          className="topic-close"
          aria-label="Konu seçimini kapat"
          onClick={onClose}
        >
          <X size={21} />
        </button>
      </header>
      <form
        className="topic-search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          e.currentTarget.querySelector("input")?.blur();
        }}
      >
        <Search size={18} />
        <input
          type="search"
          aria-label="Konular içinde ara"
          placeholder="Konu veya ilgi alanı ara…"
          value={query}
          onChange={(e) => search(e.target.value)}
          autoComplete="off"
          enterKeyHint="search"
        />
        {query && (
          <button
            type="button"
            aria-label="Konu aramasını temizle"
            onClick={() => search("")}
          >
            <X size={17} />
          </button>
        )}
      </form>
      <div className="topic-groups" role="tablist" aria-label="Konu grupları">
        {groups.map((g, i) => (
          <button
            type="button"
            role="tab"
            aria-selected={group === i}
            aria-controls={`${title}-panel`}
            id={`${title}-tab-${i}`}
            key={g.name}
            tabIndex={group === i ? 0 : -1}
            onKeyDown={(e) => {
              const next =
                e.key === "ArrowRight"
                  ? (i + 1) % groups.length
                  : e.key === "ArrowLeft"
                    ? (i + groups.length - 1) % groups.length
                    : e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? groups.length - 1
                        : null;
              if (next !== null) {
                e.preventDefault();
                setGroup(next);
                document.getElementById(`${title}-tab-${next}`)?.focus();
              }
            }}
            onClick={() => setGroup(i)}
          >
            <span aria-hidden="true">{g.icon}</span>
            {g.name}
            {query && (
              <small>
                {matches.filter((item) => g.ids.includes(item.id)).length}
              </small>
            )}
          </button>
        ))}
      </div>
      <div
        className="topic-grid"
        role="tabpanel"
        id={`${title}-panel`}
        aria-labelledby={`${title}-tab-${group}`}
      >
        {items.map((g) => (
          <button
            type="button"
            className={g.id === selected ? "is-selected" : ""}
            key={g.id}
            onClick={() => onSelect(g.id)}
            aria-pressed={g.id === selected}
          >
            <span className="topic-glyph" aria-hidden="true">
              <img
                src={artFor(g.id)}
                alt=""
                loading="lazy"
                width="80"
                height="60"
              />
            </span>
            <b>{g.name}</b>
            {g.id === selected && <Check className="topic-check" size={14} />}
          </button>
        ))}
        {!items.length && (
          <p className="topic-empty">
            Bu grupta eşleşme yok. Diğer grupları seçebilir veya aramanı
            değiştirebilirsin.
          </p>
        )}
      </div>
      <p className="topic-hint">Bir konuya dokun, yarışma kartını hemen aç.</p>
    </dialog>,
    document.body,
  );
}
