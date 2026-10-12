import React, { useEffect, useState } from "react";
import { api } from "./api";
import "./credits.css";

// Only the opening question and final result get a compact balance message.
export function gameCreditMoment(game) {
  if (!game) return null;
  if (game.phase === "finished" || (game.phase === "closed" && game.index >= 0))
    return "finished";
  if (game.phase === "question" && game.index === 0) return "started";
  if (
    game.mode === "tournament" &&
    (game.phase === "voting" ||
      (game.phase === "countdown" && game.index === -1))
  )
    return "started";
  return null;
}

export default function GameCreditNotice({ pin, moment }) {
  const [balance, setBalance] = useState(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setBalance(null);
    setFailed(false);
    api("credits", pin ? { pin } : {})
      .then((data) => {
        if (active) setBalance(data);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [pin, moment, retry]);
  return (
    <aside
      className="game-credit-notice"
      role="status"
      aria-label="Kalan kredi"
    >
      <span aria-hidden="true">✦</span>
      <div>
        <small>
          {moment === "finished" ? "Yarışma sona erdi" : "Yarışma başladı"}
        </small>
        {balance ? (
          <>
            <strong>
              Kalan kredi: {balance.unlimited ? "Sınırsız" : balance.available}
            </strong>
            {!balance.unlimited && (
              <p>
                Bugün {balance.dailyRemaining} · Bu ay{" "}
                {balance.monthlyRemaining}
                {balance.bonus > 0 && ` · Bonus ${balance.bonus}`}
              </p>
            )}
            {balance.reserved > 0 && (
              <p>
                {balance.reserved} kredi turnuvanın kalan turları için ayrıldı.
              </p>
            )}
            {(balance.unlimited || balance.preview) && (
              <p>Yönetici testi · Kredi harcanmadı.</p>
            )}
          </>
        ) : failed ? (
          <>
            <p>Kalan kredi şu an alınamadı.</p>
            <button
              type="button"
              className="text-btn"
              onClick={() => setRetry((n) => n + 1)}
            >
              Tekrar dene
            </button>
          </>
        ) : (
          <p>Kalan kredi kontrol ediliyor…</p>
        )}
      </div>
    </aside>
  );
}
