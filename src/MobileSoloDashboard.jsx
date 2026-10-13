import ThemedSelect from "./ThemedSelect";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Trophy, X } from "lucide-react";
import { categories, catById } from "./api";
import GameArt from "./GameArt";
import { MobileStage } from "./MobileModuleLanding";
const topic = (id) =>
  id === "mixed" ? { name: "Karışık konular", emoji: "✨" } : catById(id);
function Records({ stats, onClose }) {
  const ref = useRef(null);
  const [view, setView] = useState("topics");
  const [selected, setSelected] = useState("");
  useEffect(() => {
    const focus = document.activeElement;
    ref.current.showModal();
    return () => focus?.focus();
  }, []);
  const records =
    view === "topics" ? stats?.categories || [] : stats?.recent || [];
  const record =
    records.find(
      (r) =>
        String(r.category && view === "topics" ? r.category : r.id) ===
        selected,
    ) || records[0];
  return createPortal(
    <dialog
      ref={ref}
      className="mobile-records-dialog"
      aria-labelledby="records-title"
      onCancel={onClose}
    >
      <header>
        <h2 id="records-title">Kendi zirvene oyna</h2>
        <button onClick={onClose} aria-label="Rekorları kapat">
          <X />
        </button>
      </header>
      <div className="mobile-record-summary">
        <Trophy size={28} />
        <strong>
          {stats?.best || 0}
          <small> / 1.000 puan</small>
        </strong>
        <span>{stats?.games || 0} tamamlanan test</span>
      </div>
      <div className="module-record-switch" aria-label="İstatistik türü">
        {[
          ["topics", "Konular"],
          ["recent", "Son denemeler"],
        ].map(([id, title]) => (
          <button
            key={id}
            aria-pressed={view === id}
            onClick={() => {
              setView(id);
              setSelected("");
            }}
          >
            {title}
          </button>
        ))}
      </div>
      {record ? (
        <>
          <label className="module-topic">
            <span>{view === "topics" ? "Konu seç" : "Deneme seç"}</span>
            <ThemedSelect
              value={view === "topics" ? record.category : record.id}
              onChange={(e) => setSelected(e.target.value)}
            >
              {records.map((r) => (
                <option
                  key={view === "topics" ? r.category : r.id}
                  value={view === "topics" ? r.category : r.id}
                >
                  {topic(r.category).name}
                  {view === "recent"
                    ? ` · ${new Date(r.finishedAt * 1000).toLocaleDateString("tr")} · ${r.score} puan`
                    : ""}
                </option>
              ))}
            </ThemedSelect>
          </label>
          <div className="mobile-record-detail">
            <b>
              {topic(record.category).emoji} {topic(record.category).name}
            </b>
            <strong>
              {view === "topics" ? record.best : record.score}
              <small> puan</small>
            </strong>
            <p>
              {view === "topics"
                ? `${record.games} test tamamlandı`
                : `${record.correctCount}/10 doğru · ${new Date(record.finishedAt * 1000).toLocaleDateString("tr")}`}
            </p>
          </div>
        </>
      ) : (
        <p className="module-record-empty">
          İlk oyununu tamamla, rekorun burada parlasın.
        </p>
      )}
    </dialog>,
    document.body,
  );
}
export default function MobileSoloDashboard({
  category,
  onCategory,
  onStart,
  busy,
  stats,
  onBack,
}) {
  const [records, setRecords] = useState(false);
  return (
    <>
      <MobileStage mode="solo" name="Kendini Dene" onBack={onBack}>
        <div className="module-screen-art">
          <GameArt mode="solo" />
        </div>
        <div className="module-screen-copy">
          <h2>Kendi rekorunu geç.</h2>
          <p>Konunu seç. 10 soruda kendini keşfet.</p>
        </div>
        <label className="module-topic">
          <span>Hangi alanda yarışıyoruz?</span>
          <ThemedSelect
            value={category}
            onChange={(e) => onCategory(e.target.value)}
          >
            <option value="mixed">✨ Karışık konular</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </ThemedSelect>
        </label>
        <button className="module-primary" disabled={busy} onClick={onStart}>
          {busy ? "Hazırlanıyor…" : "Hemen başla"}
          <ArrowRight size={21} />
        </button>
        <button className="module-best" onClick={() => setRecords(true)}>
          <Trophy size={22} />
          <span>
            En yüksek skorun{" "}
            <b>
              {stats?.best || 0} <small>/ 1.000</small>
            </b>
          </span>
          <ArrowRight size={18} />
        </button>
        <p className="module-solo-rules">
          10 soru · 30 saniye · Doğruya 100 puan
        </p>
      </MobileStage>
      {records && <Records stats={stats} onClose={() => setRecords(false)} />}
    </>
  );
}
