import React from "react";
import "./module-teasers.css";

export const moduleTeasers = {
  quiz: {
    title: "“Bunu kesin biliyorum!” diyenler buraya.",
    caption: "Biraz merak, biraz rekabet, bolca “Aaa, öyle miymiş?”",
    notes: [
      ["Bu bayrak hangi ülkenin?", "🏳️"],
      ["Dinozorları kim daha iyi tanır?", "🦖"],
      ["Bu şehrin nesi meşhur?", "🧿"],
      ["Gezegenleri karıştırma!", "🪐"],
      ["Golü bilgiyle at!", "⚽"],
      ["Zirveye son bir doğru!", "🏆"],
    ],
  },
  family: {
    title: "Her cevapta küçük bir “Seni biliyorum!”",
    caption: "Birbirimizi yeniden keşfediyoruz.",
    notes: [
      ["Babamın favorisi?", "🍝"],
      ["Annem hangi rengi sever?", "💜"],
      ["Kardeşimin hayalindeki tatil?", "🏖️"],
      ["Dedemin favori şarkısı?", "🎵"],
      ["Teyzem çay mı, kahve mi?", "☕"],
      ["Beni en iyi kim tanır?", "🏆"],
    ],
  },
  raffle: {
    title: "“Bir sonraki benim!” heyecanı.",
    caption: "İsimler çarkta. Gözler sahnede. Alkışlar hazır mı?",
    notes: [
      ["Şans bugün kime gülecek?", "🍀"],
      ["Sıradaki isim seninki mi?", "🎟️"],
      ["Nefesler tutuldu…", "🎡"],
      ["Bir tur daha heyecan!", "✨"],
      ["Adın çarkta, gözün sürprizde!", "🎁"],
      ["Alkışlar kazanana!", "👏"],
    ],
  },
  cloud: {
    title: "Bir soru, birbirinden renkli cevaplar.",
    caption: "Aklına ilk geleni söyle. Bakalım kaç kişi seninle aynı fikirde?",
    notes: [
      ["Bugünü tek kelimeyle anlat!", "💭"],
      ["Tatil deyince aklına ne gelir?", "🏖️"],
      ["Bizim aile bir kelime olsa?", "🏡"],
      ["Seni ne mutlu eder?", "☀️"],
      ["Aynı fikirde kaç kişiyiz?", "🎈"],
      ["Bir kelime söyle, rengini kat!", "🌈"],
    ],
  },
};

export default function ModuleTeasers({ mode, board = false }) {
  const content = moduleTeasers[mode];
  if (!content) return null;
  return (
    <section
      className={`module-teasers teaser-${mode} ${board ? "teaser-board" : ""}`}
      aria-label={`${content.title} Tanıtım örnekleri`}
    >
      <div className="teaser-heading">
        <span>OYUNUN TADI ŞİMDİDEN BURADA</span>
        <h3>{content.title}</h3>
        {!board && <p>{content.caption}</p>}
      </div>
      <ul className="teaser-notes">
        {content.notes.map(([text, emoji], i) => (
          <li
            key={text}
            style={{
              "--note-tilt": `${[-4, 3, -2, 4, -3, 2][i]}deg`,
              "--note-delay": `${i * -0.7}s`,
            }}
          >
            <span>{text}</span>
            <span className="teaser-note-emoji" aria-hidden="true">
              {emoji}
            </span>
          </li>
        ))}
      </ul>
      {board && <p className="teaser-caption">{content.caption}</p>}
    </section>
  );
}
