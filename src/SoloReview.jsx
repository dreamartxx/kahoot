import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SoloReview({ questions, renderOption }) {
  const [index, setIndex] = useState(0);
  const question = questions[index];
  if (!question) return <p>Henüz cevap yok.</p>;
  return (
    <section className="solo-review-card" aria-label="Cevap inceleme">
      <p className="solo-review-position">
        Soru {index + 1} / {questions.length}
      </p>
      <h3>{question.text}</h3>
      <p
        className={
          question.choice === question.correct ? "review-good" : "review-bad"
        }
      >
        Senin cevabın:{" "}
        {question.choice === null
          ? "Boş"
          : renderOption(question.options[question.choice])}
      </p>
      <p>Doğru cevap: {renderOption(question.options[question.correct])}</p>
      {question.explanation && <p>{question.explanation}</p>}
      <nav aria-label="Cevaplar arasında geçiş">
        <button
          className="btn secondary"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          <ChevronLeft size={18} /> Önceki
        </button>
        <button
          className="btn secondary"
          disabled={index === questions.length - 1}
          onClick={() => setIndex(index + 1)}
        >
          Sonraki <ChevronRight size={18} />
        </button>
      </nav>
    </section>
  );
}
