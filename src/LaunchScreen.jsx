import React from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import "./launch-screen.css";

export default function LaunchScreen({ error, onRetry }) {
  return (
    <main
      className="launch-scene"
      data-screen-fit="true"
      data-screen-key="launch"
    >
      <div className="launch-ambient" aria-hidden="true" />
      <div className="launch-signature" aria-hidden="true">
        BİR OYUNDAN DAHA FAZLASI
      </div>
      <div className="launch-center">
        <div className="launch-emblem" aria-hidden="true">
          <div className="launch-orbit launch-orbit-one" />
          <div className="launch-orbit launch-orbit-two" />
          <span className="launch-star launch-star-one">✦</span>
          <span className="launch-star launch-star-two">✧</span>
          <img
            src="/icons/icon-512.png?v=varmisin-v1"
            alt=""
            width="512"
            height="512"
            fetchPriority="high"
          />
        </div>
        <h1 className="launch-wordmark">
          Varmısın<span aria-hidden="true">✦</span>
        </h1>
        <p className="launch-tagline">Birlikte oyna. Anı paylaş.</p>
        {error ? (
          <div className="launch-recovery" role="alert">
            <h2>Bağlantıyı yeniden kuralım.</h2>
            <p>
              Oyuna şu anda bağlanamadık. Kısa bir süre sonra tekrar
              deneyebilirsin.
            </p>
            <button type="button" onClick={onRetry}>
              <RefreshCw size={17} aria-hidden="true" /> Tekrar dene
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="launch-progress" role="status">
            <span className="launch-sr-only">
              Varmısın açılıyor. Lütfen bekle.
            </span>
            <span className="launch-progress-track" aria-hidden="true">
              <i />
            </span>
          </div>
        )}
      </div>
      <div className="launch-footer" aria-hidden="true">
        <span /> GÜZEL ANLAR BURADA BAŞLAR <span />
      </div>
    </main>
  );
}
