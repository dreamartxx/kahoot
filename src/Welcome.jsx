import React, { useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Trophy,
  Heart,
  Ticket,
  Cloud,
} from "lucide-react";
export default function Welcome({ onLogin, onJoin }) {
  const [pin, setPin] = useState("");
  return (
    <main className="welcome">
      <div className="welcome-orbit orbit-one" aria-hidden="true" />
      <div className="welcome-orbit orbit-two" aria-hidden="true" />
      <header className="welcome-header">
        <a href="#" className="welcome-brand">
          bilgi<span>arena</span>
          <i>✦</i>
        </a>
        <button className="welcome-login" onClick={onLogin}>
          <ShieldCheck size={18} /> Yönetici / Sunucu girişi
        </button>
      </header>
      <section className="welcome-center">
        <div className="welcome-emblem" aria-hidden="true">
          <span>✦</span>
          <b>?</b>
          <i>★</i>
          <small>✦</small>
        </div>
        <p className="welcome-eyebrow">HERKES OYUNA DAHİL.</p>
        <h1>
          Eğlenceye
          <br />
          <em>sen de katıl!</em>
        </h1>
        <p className="welcome-intro">
          Bir kod. Birlikte yaşanacak bir sürü güzel an.
        </p>
        <form
          className="welcome-pin"
          onSubmit={(e) => {
            e.preventDefault();
            if (/^\d{6}$/.test(pin)) onJoin(pin);
          }}
        >
          <label htmlFor="welcome-code">OYUN KODUNU GİR</label>
          <input
            id="welcome-code"
            aria-label="Oyun kodu"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000 000"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          />
          <button type="submit">
            Oyuna katıl <ArrowRight size={23} />
          </button>
          <p>Sunucunun paylaştığı 6 haneli kodu kullan.</p>
        </form>
        <div className="welcome-modes">
          <span>
            <Trophy />
            Bilgi yarışması
          </span>
          <span>
            <Heart />
            Aile oyunu
          </span>
          <span>
            <Ticket />
            Çarkıfelek
          </span>
          <span>
            <Cloud />
            Kelime bulutu
          </span>
        </div>
      </section>
      <footer className="welcome-footer">
        <span>Telefonun hazırsa, sen de hazırsın.</span>
        <button onClick={onLogin}>
          Etkinlik oluştur <ArrowRight size={16} />
        </button>
      </footer>
    </main>
  );
}
