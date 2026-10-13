import React from "react";
import { createPortal } from "react-dom";
import { Sparkles } from "lucide-react";

export default function CountdownScene({ number, next, total, mode = "quiz" }) {
  const theme =
    mode === "family"
      ? "family"
      : mode === "tournament"
        ? "tournament"
        : "quiz";
  return createPortal(
    <section
      className={`countdown-scene countdown-theme-${theme}`}
      aria-label="Soru geçişi"
    >
      <div className="countdown-aura" aria-hidden="true" />
      <div className="countdown-stars" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            style={{ "--i": i, "--star-top": `${16 + (i % 3) * 26}%` }}
          >
            ✦
          </span>
        ))}
      </div>
      <div className="countdown-topline">
        <Sparkles size={18} /> SIRADAKİ HEYECANA HAZIR MISIN?
      </div>
      <div className="countdown-core" aria-hidden="true">
        <i className="countdown-track" />
        <i className="countdown-track second" />
        <div className="countdown-sphere">
          <strong key={number}>{number > 0 ? number : "✦"}</strong>
        </div>
      </div>
      <div
        className="countdown-copy"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="countdown-announcement">
          {number > 0 ? number : "Yeni soru hazırlanıyor"}
        </span>
        <h2>
          {number === 3
            ? "Hazırlan."
            : number === 2
              ? "Odaklan."
              : number === 1
                ? "Sıra sende!"
                : "Heyecan geliyor…"}
        </h2>
        <p>
          Soru <b>{next}</b> <span>/ {total}</span>
        </p>
      </div>
      <div className="countdown-beats" aria-hidden="true">
        {[3, 2, 1].map((n) => (
          <i key={n} className={number <= n ? "lit" : ""} />
        ))}
      </div>
      <small>
        {number > 0
          ? "Bir nefes al. Bildiklerinle parla."
          : "Bağlantı bekleniyor, birazdan devam edeceğiz."}
      </small>
    </section>,
    document.body,
  );
}
