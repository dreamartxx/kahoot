import React, { useId, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ModuleGuide from "./ModuleGuide";
import GameArt from "./GameArt";
import PrivacyLinks from "./PrivacyLinks";
import { ThemePicker } from "./Preferences";
const cards = [
  ["tournament", "Turnuva", "Bu evin şampiyonu kim?"],
  ["solo", "Kendini Dene", "Kendi rekorunu geç."],
  ["raffle", "Çarkıfelek", "Şans bu kez kimden yana?"],
  ["cloud", "Kelime Bulutu", "Bir kelime, bin fikir."],
];
export default function MobileHome({
  username,
  initialGroup = 0,
  onChoose,
  onJoin,
  onBrowse,
  activeRoom,
  onResume,
}) {
  const [pin, setPin] = useState("");
  const [group, setGroup] = useState(initialGroup);
  const [animated, setAnimated] = useState(null);
  const panelId = useId();
  const browse = (collection) =>
    onBrowse ? onBrowse(collection) : onChoose("quiz");
  const groups = ["Yarışmalar", "Meydan Oku", "Çark & Kelimeler"];
  return (
    <section className={`mobile-design-home ${activeRoom ? "has-resume" : ""}`}>
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
      {activeRoom && (
        <button
          className="mobile-resume"
          onClick={() => onResume(activeRoom.pin)}
        >
          <span>
            <b>Oyununa devam et</b>
            <small>{activeRoom.title}</small>
          </span>
          <ArrowUpRight size={20} />
        </button>
      )}
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
            onClick={() => {
              setGroup(i);
              setAnimated(null);
            }}
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
                setAnimated(null);
                document.getElementById(`${panelId}-tab-${next}`)?.focus();
              }
            }}
          >
            {title}
          </button>
        ))}
      </div>
      <div
        className={`mobile-game-grid ${group === 0 ? "quiz-heart-panel" : ""}`}
        role="tabpanel"
        id={panelId}
        aria-labelledby={`${panelId}-tab-${group}`}
      >
        {group === 0 ? (
          <>
            <article className="quiz-heart-card">
              <button
                type="button"
                className="quiz-heart-open"
                aria-label="Bilgi Yarışmasını aç"
                onClick={() => browse("topics")}
              />
              <div className="quiz-heart-top">
                <span>BİLGİNİ KONUŞTUR</span>
                <ModuleGuide mode="quiz" compact />
              </div>
              <GameArt mode="quiz" />
              <div className="quiz-heart-copy">
                <h2>Bilgi Yarışması</h2>
                <p>Her konu yeni bir heyecan.</p>
              </div>
              <div className="quiz-heart-choices">
                <button onClick={() => browse("topics")}>
                  Konuları keşfet <ArrowUpRight size={17} />
                </button>
              </div>
            </article>
            <button
              className="family-spotlight"
              onClick={() => onChoose("family")}
            >
              <GameArt mode="family" active={false} />
              <span>
                <small>BİRBİRİNİ YENİDEN KEŞFET</small>
                <b>Beni Tanıyor musun?</b>
              </span>
              <ArrowUpRight size={18} />
            </button>
          </>
        ) : (
          cards
            .slice((group - 1) * 2, group * 2)
            .map(([id, title, description]) => (
              <article
                key={id}
                className={`mobile-game-tile mobile-tile-${id}`}
                onPointerEnter={() => setAnimated(id)}
                onFocus={() => setAnimated(id)}
              >
                <ModuleGuide mode={id} compact />
                <button
                  className="mobile-tile-action"
                  onClick={() => onChoose(id)}
                >
                  <GameArt
                    mode={id}
                    active={
                      animated
                        ? animated === id
                        : id === cards[(group - 1) * 2][0]
                    }
                  />
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <ArrowUpRight className="mobile-tile-arrow" size={17} />
                </button>
              </article>
            ))
        )}
      </div>
      <p className="mobile-home-foot">En güzel anılar, birlikte oynarken. ♥</p>
      {!username && (
        <details className="mobile-legal-menu">
          <summary>Bilgi ve destek</summary>
          <PrivacyLinks />
        </details>
      )}
    </section>
  );
}
