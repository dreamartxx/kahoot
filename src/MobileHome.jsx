import React, { useId, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ModuleGuide from "./ModuleGuide";
import { characterById } from "./characters";
import PrivacyLinks from "./PrivacyLinks";
import { ThemePicker } from "./Preferences";
const cards = [
  ["quiz", "Bilgi Yarışması", "Bilgini konuştur."],
  ["family", "Beni Tanıyor musun?", "Birbirinizi yeniden keşfedin."],
  ["raffle", "Çarkıfelek", "Şans bu kez kimden yana?"],
  ["cloud", "Kelime Bulutu", "Bir kelime, bin fikir."],
  ["tournament", "Turnuva", "Bu evin şampiyonu kim?"],
  ["solo", "Kendini Dene", "Kendi rekorunu geç."],
];
export default function MobileHome({ username, onChoose, onJoin }) {
  const [pin, setPin] = useState("");
  const [group, setGroup] = useState(0);
  const panelId = useId();
  const groups = ["Birlikte", "Eğlence", "Meydan oku"];
  return (
    <section className="mobile-design-home">
      <div className="mobile-home-heading">
        <div>
          <p className="mobile-hello">
            {username
              ? `İyi ki geldin, ${username}`
              : "Bir araya gel, oyuna kapıl."}{" "}
            ✦
          </p>
          <h1>
            Bugün ne <em>oynuyoruz?</em>
          </h1>
        </div>
        <ThemePicker compact />
      </div>
      <section className="mobile-code-card">
        <span aria-hidden="true">✦</span>
        <h2>Herkes hazır mı?</h2>
        <p>Oyun kodunu gir, eğlenceye katıl.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (/^\d{6}$/.test(pin)) onJoin(pin);
          }}
        >
          <input
            aria-label="6 haneli oyun kodu"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Oyun kodu"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          />
          <button type="submit">
            Katıl <ArrowUpRight size={18} />
          </button>
        </form>
      </section>
      <div
        className="mobile-game-tabs"
        role="tablist"
        aria-label="Oyun grupları"
      >
        {groups.map((title, i) => (
          <button
            key={title}
            type="button"
            role="tab"
            id={`${panelId}-tab-${i}`}
            aria-selected={group === i}
            aria-controls={panelId}
            tabIndex={group === i ? 0 : -1}
            onClick={() => setGroup(i)}
            onKeyDown={(e) => {
              const next =
                e.key === "ArrowRight"
                  ? (i + 1) % 3
                  : e.key === "ArrowLeft"
                    ? (i + 2) % 3
                    : e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? 2
                        : null;
              if (next !== null) {
                e.preventDefault();
                setGroup(next);
                document.getElementById(`${panelId}-tab-${next}`)?.focus();
              }
            }}
          >
            {title}
          </button>
        ))}
      </div>
      <div
        className="mobile-game-grid"
        role="tabpanel"
        id={panelId}
        aria-labelledby={`${panelId}-tab-${group}`}
      >
        {cards
          .slice(group * 2, group * 2 + 2)
          .map(([id, title, description]) => (
            <article key={id} className={`mobile-game-tile mobile-tile-${id}`}>
              <ModuleGuide mode={id} compact />
              <button
                className="mobile-tile-action"
                onClick={() => onChoose(id)}
              >
                <span className="mobile-tile-art" aria-hidden="true">
                  {id === "quiz" && (
                    <>
                      <b className="mini-question">?</b>
                      <img src={characterById("wizard").image} alt="" />
                    </>
                  )}
                  {id === "family" && (
                    <>
                      <img src={characterById("cat").image} alt="" />
                      <img src={characterById("fox").image} alt="" />
                      <b className="mini-heart">♥</b>
                    </>
                  )}
                  {id === "raffle" && <span className="mini-wheel">★</span>}
                  {id === "tournament" && (
                    <>
                      <img src={characterById("knight").image} alt="" />
                      <span className="game-trophy">
                        <i>★</i>
                      </span>
                      <b className="game-spark">✦</b>
                    </>
                  )}
                  {id === "solo" && (
                    <>
                      <span className="game-target">
                        <i>↗</i>
                      </span>
                      <img src={characterById("astronaut").image} alt="" />
                      <b className="game-spark">✦</b>
                    </>
                  )}
                  {id === "cloud" && (
                    <>
                      <span className="mini-bubble">
                        neşe<small>12</small>
                      </span>
                      <span className="mini-bubble">
                        aile<small>8</small>
                      </span>
                    </>
                  )}
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
                <ArrowUpRight className="mobile-tile-arrow" size={17} />
              </button>
            </article>
          ))}
      </div>
      <p className="mobile-home-foot">En güzel anılar, birlikte oynarken. ♥</p>
      <PrivacyLinks />
    </section>
  );
}
