import React from "react";
import { CheckCircle2, XCircle, Clock3, Heart } from "lucide-react";
import { CharacterAvatar } from "./CharacterAvatar";
import "./answer-comparison.css";

export default function AnswerComparison({
  room,
  renderOption = (value) => value,
  compact = false,
}) {
  if (room.phase !== "reveal" || !room.answerCards?.length) return null;
  const cards = [...room.answerCards].sort(
    (a, b) =>
      Number(b.isMe) - Number(a.isMe) ||
      Number(b.reference) - Number(a.reference),
  );
  const card = (p) => {
    const status =
      p.choice === null ? "unanswered" : p.correct ? "correct" : "wrong";
    const StatusIcon = p.reference
      ? Heart
      : status === "correct"
        ? CheckCircle2
        : status === "wrong"
          ? XCircle
          : Clock3;
    return (
      <article
        className={`comparison-card comparison-${status}${p.isMe ? " comparison-me" : ""}`}
        key={p.name}
      >
        <div className="comparison-label">
          {p.isMe
            ? "Senin cevabın"
            : cards.length === 2 && room.me
              ? "Karşıdakinin cevabı"
              : "Yarışmacının cevabı"}
        </div>
        <div className="comparison-person">
          <CharacterAvatar id={p.avatar} />
          <div>
            <strong>{p.name}</strong>
            {p.role && <small>{p.role}</small>}
          </div>
        </div>
        <div className="comparison-choice">
          {p.choice === null
            ? "Cevap verilmedi"
            : renderOption(room.question.options[p.choice])}
        </div>
        <div className="comparison-verdict">
          <StatusIcon size={20} />
          <b>
            {p.reference
              ? "Kendi yanıtı"
              : status === "correct"
                ? "Doğru cevap!"
                : status === "wrong"
                  ? "Yanlış cevap"
                  : "Süre doldu"}
          </b>
          {p.points > 0 && <span>+{p.points}</span>}
        </div>
        {p.reference && (
          <small className="comparison-reference">
            {p.isMe ? "Bu soru senin hakkında" : "Bu soru onun hakkında"} · Puan
            verilmez
          </small>
        )}
      </article>
    );
  };
  return (
    <section
      className={`answer-comparison ${compact ? "comparison-compact" : ""}`}
      aria-label="Yarışmacıların cevapları"
    >
      {!compact && (
        <div className="comparison-heading">
          <span>CEVAPLAR AÇILDI</span>
          <h3>Kim ne cevap verdi?</h3>
        </div>
      )}
      <div className="comparison-grid">{cards.slice(0, 2).map(card)}</div>
      {cards.length > 2 && (
        <details className="comparison-more">
          <summary>Diğer {cards.length - 2} yarışmacının cevabını gör</summary>
          <div className="comparison-grid">{cards.slice(2).map(card)}</div>
        </details>
      )}
      <div className="comparison-answer">
        <CheckCircle2 size={18} />
        <span>
          Doğru cevap:{" "}
          <strong>
            {renderOption(room.question.options[room.question.correct])}
          </strong>
        </span>
      </div>
    </section>
  );
}
