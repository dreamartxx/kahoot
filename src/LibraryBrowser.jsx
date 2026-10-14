import React, { useState } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { categories } from "./api";
import { artFor } from "./art-assets";
import { normalizeQuizSearch } from "./quiz-search";
import ThemedSelect from "./ThemedSelect";
import "./library-browser.css";
export default function LibraryBrowser({
  cat,
  onCategory,
  questions,
  loading,
  error,
  onRetry,
  onAdd,
  onDelete,
  renderOption,
}) {
  const [query, setQuery] = useState(""),
    [level, setLevel] = useState("all"),
    [source, setSource] = useState("all"),
    [page, setPage] = useState(0);
  const category = categories.find((c) => c.id === cat);
  const filtered = questions.filter(
    (q) =>
      normalizeQuizSearch(q.text).includes(normalizeQuizSearch(query)) &&
      (level === "all" ||
        (level === "general"
          ? q.difficulty === "general"
          : q.difficulty !== "general")) &&
      (source === "all" ||
        q.id.startsWith("custom-") === (source === "custom")),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const current = Math.min(page, pages - 1);
  const reset = () => {
    setQuery("");
    setLevel("all");
    setSource("all");
    setPage(0);
  };
  return (
    <section className="question-library" aria-label="Soru kütüphanesi">
      <header className="library-hero">
        <img src={artFor(cat)} alt="" width="900" height="600" />
        <div className="library-hero-copy">
          <span>
            <BookOpen size={15} /> MERAKIN KÜTÜPHANESİ
          </span>
          <h1>
            İyi bir oyun,
            <br />
            iyi bir soruyla başlar.
          </h1>
          <p>
            Havuzu keşfet. Cevapları incele.
            <br />
            Kendi merakını sorulara dönüştür.
          </p>
          <button onClick={onAdd}>
            <Plus size={18} /> Yeni soru ekle
          </button>
        </div>
        <div className="library-hero-topic">
          <span>ŞİMDİ KEŞFEDİYORSUN</span>
          <strong>{category.name}</strong>
          <span>{loading ? "Hazırlanıyor…" : `${questions.length} soru`}</span>
        </div>
      </header>
      <div className="library-workspace">
        <div className="library-control-heading">
          <div>
            <h2>Soru koleksiyonun</h2>
            <p>Bir soruyu aç; dört şıkkı, doğru cevabı ve açıklamasını gör.</p>
          </div>
          <SlidersHorizontal size={21} />
        </div>
        <div className="library-controls">
          <label className="library-category">
            <span>KONU</span>
            <ThemedSelect
              aria-label="Soru kategorisi"
              value={cat}
              onChange={(e) => {
                reset();
                onCategory(e.target.value);
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </ThemedSelect>
          </label>
          <label className="library-search-field">
            <span>SORULARDA ARA</span>
            <div>
              <Search size={18} />
              <input
                type="search"
                aria-label="Sorularda ara"
                placeholder="Merak ettiğin bir kelime yaz…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setPage(0);
                  }}
                  aria-label="Soru aramasını temizle"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </label>
        </div>
        <div className="library-filterbar">
          <div className="library-levels" role="group" aria-label="Soru düzeyi">
            {[
              ["all", "Tümü"],
              ["general", "Genel bilgi"],
              ["expert", "Detay / uzmanlık"],
            ].map(([id, name]) => (
              <button
                key={id}
                aria-pressed={level === id}
                onClick={() => {
                  setLevel(id);
                  setPage(0);
                }}
              >
                {name}
              </button>
            ))}
          </div>
          <ThemedSelect
            aria-label="Soru kaynağı"
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">Tüm kaynaklar</option>
            <option value="ready">Hazır sorular</option>
            <option value="custom">Kendi sorularım</option>
          </ThemedSelect>
        </div>
        <p className="library-results" role="status">
          {loading ? "Sorular yükleniyor…" : `${filtered.length} soru bulundu`}
          <span>Her 10 soruda en fazla 1 detay sorusu</span>
        </p>
        {error ? (
          <div className="library-empty" role="alert">
            <h3>Sorular yüklenemedi.</h3>
            <p>{error}</p>
            <button onClick={onRetry}>Yeniden dene</button>
          </div>
        ) : loading ? (
          <div className="library-skeleton" aria-hidden="true">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} />
            ))}
          </div>
        ) : (
          <div className="question-collection">
            {filtered.slice(current * 8, current * 8 + 8).map((q, i) => (
              <details className="question-entry" key={q.id}>
                <summary>
                  <span className="question-number">
                    {String(current * 8 + i + 1).padStart(2, "0")}
                  </span>
                  <span className="question-entry-copy">
                    <span className="question-entry-meta">
                      <b>{category.name}</b>
                      <span>
                        {q.difficulty === "general"
                          ? "Genel bilgi"
                          : "Detay / uzmanlık"}
                      </span>
                      {q.id.startsWith("custom-") && <em>Sana ait</em>}
                    </span>
                    <strong>{q.text}</strong>
                  </span>
                  <ChevronDown size={20} className="question-expand" />
                </summary>
                <div className="question-answer-panel">
                  <div className="question-answer-grid">
                    {q.options.map((o, j) => (
                      <div key={j} className={j === q.correct ? "correct" : ""}>
                        <b>{String.fromCharCode(65 + j)}</b>
                        <span>{renderOption(o)}</span>
                        {j === q.correct && (
                          <Check size={18} aria-label="Doğru cevap" />
                        )}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="question-explanation">
                      <span>BİR DE BUNU BİL</span>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                  {q.id.startsWith("custom-") && (
                    <button
                      className="library-delete"
                      onClick={() => onDelete(q)}
                    >
                      <Trash2 size={14} /> Soruyu sil
                    </button>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
        {!loading && !error && !filtered.length && (
          <div className="library-empty">
            <Search size={28} />
            <h3>Burada henüz bir eşleşme yok.</h3>
            <p>Aramayı veya filtreleri değiştir; yeni sorular keşfet.</p>
            <button onClick={reset}>Filtreleri temizle</button>
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <footer className="library-pagination">
            <span>
              {current * 8 + 1}–{Math.min((current + 1) * 8, filtered.length)} /{" "}
              {filtered.length} soru
            </span>
            <div>
              <button
                aria-label="Önceki sorular"
                disabled={current === 0}
                onClick={() => setPage(current - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <b>
                {current + 1} / {pages}
              </b>
              <button
                aria-label="Sonraki sorular"
                disabled={current === pages - 1}
                onClick={() => setPage(current + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </footer>
        )}
      </div>
    </section>
  );
}
