import React, { useState } from "react";
import { ArrowRight, KeyRound, Play, Sparkles } from "lucide-react";
import GameArt from "./GameArt";
import ModuleGuide from "./ModuleGuide";
import { ThemePicker } from "./Preferences";
import quizStudio from "./assets/quiz-studio.webp";
import "./overview.css";

const games = [
  {
    id: "tournament",
    title: "Turnuva",
    tag: "BİRLİKTE MEYDAN OKU",
    description: "Alanını seç. Büyük finale yürü.",
    action: "Turnuva kur",
  },
  {
    id: "solo",
    title: "Kendini Dene",
    tag: "KENDİ REKORUNU GEÇ",
    description: "Kimseyi bekleme. Bilgini keşfet.",
    action: "Nasıl oynayacağını seç",
  },
  ...[
    [
      "estimate",
      "En Yakın Tahmin",
      "Bilmesen de yaklaş. İçinden geleni söyle.",
    ],
    ["binary", "Sence Hangisi?", "Bir evet, bir hayır. Bir sürü sürpriz."],
    ["family", "Beni Tanıyor musun?", "Sevdiklerini yeniden keşfet."],
  ].map(([id, title, description]) => ({
    id,
    title,
    description,
    tag: "MEYDAN OKU",
    action: "Oyununu seç",
  })),
  {
    id: "raffle",
    title: "Çarkıfelek",
    tag: "ÇARK & KELİMELER",
    description: "Çark dönsün, şans seni bulsun.",
    action: "Çarkı hazırla",
  },
  {
    id: "cloud",
    title: "Kelime Bulutu",
    tag: "ÇARK & KELİMELER",
    description: "Bir kelime söyle. Birlikte büyüsün.",
    action: "Kelimeleri buluştur",
  },
];
export default function Overview({
  onChoose,
  onJoin,
  username,
  activeRoom,
  onResume,
}) {
  const [pin, setPin] = useState("");
  return (
    <section className="studio-home" aria-label="Oyun alanın">
      <header className="studio-heading">
        <div>
          <p>
            İYİ Kİ GELDİN
            {username ? `, ${username.toLocaleUpperCase("tr")}` : ""}{" "}
            <span>✦</span>
          </p>
          <h1>Bugün ne oynuyoruz?</h1>
        </div>
        <ThemePicker compact />
      </header>
      <section className="studio-join" aria-label="Oyun koduyla katıl">
        <div className="studio-join-copy">
          <span className="studio-key">
            <KeyRound size={23} />
          </span>
          <div>
            <h2>Bir oyuna mı davetlisin?</h2>
            <p>Kodunu gir, aynı heyecana katıl.</p>
          </div>
        </div>
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
            placeholder="6 haneli oyun kodu"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          />
          <button type="submit">
            Oyuna katıl <ArrowRight size={18} />
          </button>
        </form>
      </section>
      {activeRoom && (
        <button
          className="studio-resume"
          onClick={() => onResume(activeRoom.pin)}
        >
          <span>
            <i /> Açık oyunun: <strong>{activeRoom.title}</strong>
          </span>
          Devam et <ArrowRight size={17} />
        </button>
      )}
      <div className="studio-featured">
        <article className="studio-hero">
          <img
            className="studio-hero-image"
            src={quizStudio}
            alt=""
            fetchPriority="high"
          />
          <ModuleGuide mode="quiz" compact />
          <div className="studio-hero-copy">
            <span className="studio-kicker">
              <Sparkles size={14} /> BİRLİKTE BİLMENİN HEYECANI
            </span>
            <h2>Bilgi Yarışması</h2>
            <p>
              Bir konu seç. Sevdiklerini çağır.
              <br />
              Her soruda heyecanı paylaş.
            </p>
            <button className="studio-primary" onClick={() => onChoose("quiz")}>
              Yarışma oluştur <ArrowRight size={18} />
            </button>
          </div>
          <button
            className="studio-concepts"
            onClick={() => onChoose("concepts")}
          >
            Farklı bir oyun mu? <strong>Konseptleri keşfet</strong>
            <ArrowRight size={15} />
          </button>
        </article>
        <article className="studio-family">
          <ModuleGuide mode="family" compact />
          <span className="studio-family-art">
            <GameArt mode="family" />
          </span>
          <span className="studio-kicker">AYNI AİLE, TATLI SIRLAR</span>
          <h2>Beni Tanıyor musun?</h2>
          <p>
            En sevdiğin yemeği kim biliyor?
            <br />
            Birbirinizi yeniden keşfedin.
          </p>
          <button onClick={() => onChoose("family")}>
            Ailece oyna <ArrowRight size={18} />
          </button>
        </article>
      </div>
      <div className="studio-section-title">
        <div>
          <h2>Meydan Oku</h2>
          <p>İster kendine meydan oku, ister herkesi oyuna dahil et.</p>
        </div>
        <span>5 farklı meydan okuma</span>
      </div>
      <div className="studio-games studio-challenges">
        {games
          .filter((game) => !["raffle", "cloud"].includes(game.id))
          .map((game) => (
            <article
              className={`studio-game studio-game-${game.id}`}
              key={game.id}
            >
              <ModuleGuide mode={game.id} compact />
              <button
                className="studio-game-action"
                onClick={() => onChoose(game.id)}
                aria-label={game.title}
              >
                <span className="studio-game-art">
                  <GameArt mode={game.id} />
                </span>
                <span className="studio-game-copy">
                  <span className="studio-kicker">{game.tag}</span>
                  <h3>{game.title}</h3>
                  <span className="studio-game-description">
                    {game.description}
                  </span>
                </span>
                <span className="studio-game-cta">
                  {game.action}
                  <ArrowRight size={17} />
                </span>
              </button>
            </article>
          ))}
      </div>
      <div className="studio-section-title">
        <div>
          <h2>Çark &amp; Kelimeler</h2>
          <p>Şansı döndür, fikirleri buluştur.</p>
        </div>
      </div>
      <div className="studio-games">
        {games
          .filter((game) => ["raffle", "cloud"].includes(game.id))
          .map((game) => (
            <article
              className={`studio-game studio-game-${game.id}`}
              key={game.id}
            >
              <ModuleGuide mode={game.id} compact />
              <button
                className="studio-game-action"
                onClick={() => onChoose(game.id)}
              >
                <span className="studio-game-art">
                  <GameArt mode={game.id} />
                </span>
                <span className="studio-game-copy">
                  <h3>{game.title}</h3>
                  <span className="studio-game-description">
                    {game.description}
                  </span>
                </span>
                <span className="studio-game-cta">
                  {game.action}
                  <ArrowRight size={17} />
                </span>
              </button>
            </article>
          ))}
      </div>
      <footer className="studio-foot">
        <span>
          <Play size={14} /> Bir oyun kur, kodu paylaş, birlikte başla.
        </span>
        <button onClick={() => onChoose("events")}>
          Etkinliklerim <ArrowRight size={14} />
        </button>
      </footer>
    </section>
  );
}
