import React, { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { api } from "./api";
import PlayModePicker from "./PlayModePicker";
import ThemedSelect from "./ThemedSelect";
import "./personal-quiz.css";

const blankQuestion = () => ({
  text: "",
  options: ["", "", "", ""],
  correct: null,
});
const keyOf = (s) => s.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr");

function problem(q, all, index) {
  if (q.text.trim().length < 5) return "Soruyu en az 5 karakterle yaz.";
  if (all.some((item, i) => i !== index && keyOf(item.text) === keyOf(q.text)))
    return "Bu soruyu zaten ekledin.";
  if (q.options.some((value) => !value.trim()))
    return "Dört şıkkın tamamını doldur.";
  if (new Set(q.options.map(keyOf)).size !== 4)
    return "Şıklar birbirinden farklı olmalı.";
  if (q.correct === null) return "Doğru şıkkın yanındaki harfe dokun.";
  return "";
}

export default function PersonalQuizEditor({ onDone }) {
  const [deck, setDeck] = useState(() => [blankQuestion()]);
  const [index, setIndex] = useState(0);
  const [setup, setSetup] = useState(false);
  const [title, setTitle] = useState("");
  const [seconds, setSeconds] = useState(10);
  const [playMode, setPlayMode] = useState("multi");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const q = deck[index];
  function update(changes) {
    setDeck(
      deck.map((item, i) => (i === index ? { ...item, ...changes } : item)),
    );
    setError("");
  }
  function finishQuestions() {
    for (const [i, item] of deck.entries()) {
      const message = problem(item, deck, i);
      if (message) {
        setIndex(i);
        setError(message);
        return;
      }
    }
    setError("");
    setSetup(true);
  }
  async function createRoom(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const room = await api("create", {
        mode: "quiz",
        category: "personal",
        personalQuestions: deck,
        title,
        seconds,
        playMode,
      });
      onDone(room);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  if (setup)
    return (
      <form className="personal-editor" onSubmit={createRoom}>
        <button
          type="button"
          className="text-btn"
          onClick={() => {
            setSetup(false);
            setError("");
          }}
        >
          ← {deck.length} soruyu düzenle
        </button>
        <label className="field">
          <span>Yarışmanın adı</span>
          <input
            required
            minLength={2}
            maxLength={100}
            value={title}
            placeholder="Örn. Bizim film gecemiz"
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <PlayModePicker value={playMode} onChange={setPlayMode} />
        <label className="field">
          <span>Soru başına süre</span>
          <ThemedSelect
            value={seconds}
            onChange={(e) => setSeconds(Number(e.target.value))}
          >
            {[10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n} saniye
              </option>
            ))}
          </ThemedSelect>
        </label>
        {error && <p role="alert">{error}</p>}
        <button className="btn" disabled={busy}>
          {busy ? "Oluşturuluyor…" : "Yarışma lobisini aç"}
        </button>
      </form>
    );
  return (
    <section className="personal-editor" aria-label="Soru düzenleyici">
      <div className="personal-nav">
        <button
          className="text-btn"
          disabled={index === 0}
          onClick={() => {
            setIndex(index - 1);
            setError("");
          }}
          aria-label="Önceki soru"
        >
          ←
        </button>
        <strong aria-live="polite">
          Soru {index + 1} / {deck.length}
        </strong>
        <button
          className="text-btn"
          disabled={index === deck.length - 1}
          onClick={() => {
            setIndex(index + 1);
            setError("");
          }}
          aria-label="Sonraki soru"
        >
          →
        </button>
        <button
          className="icon-btn"
          disabled={deck.length === 1}
          aria-label="Bu soruyu kaldır"
          onClick={() => {
            setDeck(deck.filter((_, i) => i !== index));
            setIndex(Math.min(index, deck.length - 2));
            setError("");
          }}
        >
          <Trash2 size={17} />
        </button>
      </div>
      <label className="field">
        <span>Soru metni</span>
        <textarea
          rows={2}
          maxLength={500}
          value={q.text}
          onChange={(e) => update({ text: e.target.value })}
        />
      </label>
      <fieldset>
        <legend>Dört şıkkı yaz, doğru şıkkı işaretle</legend>
        {q.options.map((option, i) => {
          const letter = "ABCD"[i];
          return (
            <div key={letter} className="personal-answer">
              <button
                type="button"
                aria-label={letter + " şıkkı doğru"}
                aria-pressed={q.correct === i}
                onClick={() => update({ correct: i })}
              >
                {q.correct === i ? <Check size={18} /> : letter}
              </button>
              <input
                aria-label={letter + " şıkkı"}
                maxLength={180}
                value={option}
                placeholder={letter + " şıkkı"}
                onChange={(e) =>
                  update({
                    options: q.options.map((v, j) =>
                      i === j ? e.target.value : v,
                    ),
                  })
                }
              />
            </div>
          );
        })}
      </fieldset>
      {error && <p role="alert">{error}</p>}
      <div className="personal-actions">
        <button
          type="button"
          className="btn secondary"
          disabled={deck.length >= 20}
          onClick={() => {
            const message = problem(q, deck, index);
            if (message) {
              setError(message);
              return;
            }
            setDeck([...deck, blankQuestion()]);
            setIndex(deck.length);
            setError("");
          }}
        >
          <Plus size={16} /> Soru ekle
        </button>
        <button type="button" className="btn" onClick={finishQuestions}>
          Soruları tamamla
        </button>
      </div>
    </section>
  );
}
