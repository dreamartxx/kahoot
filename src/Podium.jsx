import React from "react";
import { CharacterAvatar } from "./CharacterAvatar";
import { rankPlayers } from "./ranking";
import "./podium.css";

export default function Podium({ players }) {
  const top = rankPlayers(players).slice(0, 6);
  if (!top.length) return null;
  return (
    <section className="podium-show" aria-label="İlk altı yarışmacı podyumu">
      <div className="podium-sparkles" aria-hidden="true">
        ✦ <span>✧</span> ✦ <span>✧</span> ✦
      </div>
      <div className="podium-heading">
        <span>YILDIZLAR SAHNEDE</span>
        <h3>Şampiyonlar podyumu</h3>
        <p>Her oyun yeni bir yıldız doğurur.</p>
      </div>
      <ol className="podium-stage" style={{ "--podium-count": top.length }}>
        {top.map((p, i) => (
          <li
            key={p.id || p.name}
            className={`podium-player podium-rank-${Math.min(p.rank, 6)}`}
            style={{
              "--step": Math.max(0, 7 - p.rank),
              "--reveal-delay": `${(top.length - i - 1) * 120}ms`,
              order: [3, 4, 2, 5, 1, 6][i],
            }}
          >
            <div className="podium-contestant">
              {p.rank === 1 && (
                <span className="podium-crown" aria-label="Birinci">
                  ♛
                </span>
              )}
              <CharacterAvatar id={p.avatar} />
              <strong title={p.name}>{p.name}</strong>
              {p.role && <small className="podium-role">{p.role}</small>}
              <span className="podium-score">
                {p.score.toLocaleString("tr-TR")} <small>puan</small>
              </span>
            </div>
            <div className="podium-step">
              <b>
                {p.rank}
                <small>. sıra</small>
              </b>
              <span aria-hidden="true">{p.rank === 1 ? "★" : "✦"}</span>
            </div>
          </li>
        ))}
      </ol>
      <p className="podium-note">Eşit puan alanlar aynı dereceyi paylaşır.</p>
    </section>
  );
}
