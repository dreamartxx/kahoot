import React, { useEffect, useState } from "react";
import { Check, Heart, Search } from "lucide-react";
import { api } from "./api";
import "./family-question-picker.css";

export default function FamilyQuestionPicker({ selected, onChange, count }) {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    api("family_questions")
      .then((rows) => {
        if (active) setQuestions(rows);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  const filtered = questions.filter((q) =>
    q.text
      .toLocaleLowerCase("tr")
      .includes(search.toLocaleLowerCase("tr").trim()),
  );
  return (
    <section
      className="family-question-picker"
      aria-label="Hazır aile sorularını seç"
    >
      <div className="family-picker-heading">
        <Heart size={24} aria-hidden="true" />
        <div>
          <h3>Bu oyunun soruları senden</h3>
          <p>Birbirinizi hangi yönlerinizle tanıyorsunuz?</p>
        </div>
        <strong
          role="status"
          aria-label={`${selected.length} / ${count} hazır soru seçildi`}
        >
          {selected.length} / {count}
        </strong>
      </div>
      <p className="family-picker-hint">
        {count === 0
          ? "10 özel soru ekledin. Hazır soru seçmene gerek yok."
          : `Havuzdan ${count} soru seç. Seçtiğin sorular herkese sorulur; yarışmada karışık sırayla gelir.`}
      </p>
      {selected.length > count && (
        <p role="alert" className="family-picker-error">
          Özel sorulara yer açmak için {selected.length - count} hazır sorunun
          seçimini kaldır.
        </p>
      )}
      {(count > 0 || selected.length > 0) && (
        <>
          <label className="family-picker-search">
            <Search size={18} aria-hidden="true" />
            <input
              aria-label="Aile sorularında ara"
              placeholder="Yemek, renk, tatil…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          {error ? (
            <div role="alert" className="family-picker-error">
              {error}{" "}
              <button
                type="button"
                className="text-btn"
                onClick={() => setAttempt(attempt + 1)}
              >
                Tekrar dene
              </button>
            </div>
          ) : !questions.length ? (
            <p role="status">Sorular yükleniyor…</p>
          ) : (
            <>
              <div className="family-picker-list">
                {filtered.map((q) => {
                  const checked = selected.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className={`family-picker-card ${checked ? "is-selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!checked && selected.length >= count}
                        onChange={() =>
                          onChange(
                            checked
                              ? selected.filter((id) => id !== q.id)
                              : [...selected, q.id],
                          )
                        }
                      />
                      <span>{q.text}</span>
                      {checked && <Check size={18} aria-hidden="true" />}
                    </label>
                  );
                })}
              </div>
              {!filtered.length && (
                <p className="muted">Bu aramayla eşleşen soru yok.</p>
              )}
            </>
          )}
        </>
      )}
      {selected.length > 0 && (
        <button
          type="button"
          className="text-btn family-picker-clear"
          onClick={() => onChange([])}
        >
          Seçimleri temizle
        </button>
      )}
    </section>
  );
}
