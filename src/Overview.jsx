import React from "react";
import { ArrowUpRight } from "lucide-react";
import "./overview.css";
import { moduleTeasers } from "./ModuleTeasers";

const modules = [
  {
    id: "quiz",
    title: "Bilgi Yarışması",
    label: "BİLGİNİ KONUŞTUR",
    description: "Konunu seç. Heyecanı başlat.",
    detail: "18 konu · 10 soruluk turlar",
    action: "Konuları keşfet",
  },
  {
    id: "family",
    title: "Beni Tanıyor musun?",
    label: "BİRBİRİNİ YENİDEN KEŞFET",
    description: "Aynı aile, bir sürü küçük sır.",
    detail: "Sana özel cevaplar · Birlikte yarış",
    action: "Ailece oyna",
  },
  {
    id: "raffle",
    title: "Çarkıfelek",
    label: "ŞANSINI SAHNEYE ÇIKAR",
    description: "Çark dönsün. Sürpriz seni bulsun.",
    detail: "Manuel liste · Excel · QR katılımı",
    action: "Çarkı döndür",
  },
  {
    id: "cloud",
    title: "Kelime Bulutu",
    label: "FİKİRLERİN RENKLENSİN",
    description: "Bir kelime söyle. Birlikte büyüsün.",
    detail: "Canlı katılım · Ortak fikirler",
    action: "Kelimeleri buluştur",
  },
];
function ModuleArt({ type }) {
  return (
    <span className={`overview-art art-${type}`} aria-hidden="true">
      <span className="overview-art-orbit" />
      <span className="overview-art-glow" />
      <span className="overview-spark overview-spark-one">✦</span>
      <span className="overview-spark overview-spark-two">✧</span>
      {type === "quiz" && (
        <>
          <span className="overview-answer answer-a">▲</span>
          <span className="overview-answer answer-b">◆</span>
          <span className="overview-answer answer-c">●</span>
          <span className="overview-trophy">🏆</span>
          <span className="overview-score">✦ +1.000</span>
        </>
      )}
      {type === "family" && (
        <>
          <span className="overview-family-ring" />
          <span className="overview-heart">💖</span>
          <span className="overview-avatar avatar-mom">👩🏻</span>
          <span className="overview-avatar avatar-dad">👨🏽</span>
          <span className="overview-avatar avatar-kid">🧒🏼</span>
          <span className="overview-family-note">Beni en iyi kim tanır?</span>
        </>
      )}
      {type === "raffle" && (
        <>
          <span className="overview-wheel">
            <span className="overview-wheel-colors" />
            <span className="overview-wheel-center">★</span>
          </span>
          <span className="overview-wheel-pointer" />
          <span className="overview-wheel-confetti confetti-a" />
          <span className="overview-wheel-confetti confetti-b" />
          <span className="overview-wheel-confetti confetti-c" />
        </>
      )}
      {type === "cloud" && (
        <>
          <span className="overview-bubble bubble-joy">
            neşe<small>24</small>
          </span>
          <span className="overview-bubble bubble-together">
            birlikte<small>18</small>
          </span>
          <span className="overview-bubble bubble-dream">
            hayal<small>12</small>
          </span>
          <span className="overview-bubble bubble-play">
            oyun<small>8</small>
          </span>
          <span className="overview-bubble bubble-tiny" />
        </>
      )}
    </span>
  );
}
export default function Overview({ onChoose }) {
  return (
    <section className="overview-grid" aria-label="Etkinlik modülleri">
      <h1 className="overview-sr-only">Bugün ne oynuyoruz?</h1>
      {modules.map((m, i) => (
        <button
          key={m.id}
          className={`overview-card overview-${m.id}`}
          onClick={() => onChoose(m.id)}
          aria-label={m.title}
        >
          <span className="overview-card-grain" aria-hidden="true" />
          <span className="overview-card-top">
            <span className="overview-module-number">0{i + 1}</span>
            <span>{m.label}</span>
            <span className="overview-corner-star" aria-hidden="true">
              ✦
            </span>
          </span>
          <ModuleArt type={m.id} />
          <span className="overview-card-copy">
            <span className="overview-module-detail">{m.detail}</span>
            <h2>{m.title}</h2>
            <span className="overview-description">{m.description}</span>
            <span className="overview-teaser">
              <span>{moduleTeasers[m.id].notes[0][0]}</span>
              <span aria-hidden="true">{moduleTeasers[m.id].notes[0][1]}</span>
            </span>
          </span>
          <span className="overview-card-bottom">
            <span>{m.action}</span>
            <span className="overview-arrow">
              <ArrowUpRight size={23} />
            </span>
          </span>
        </button>
      ))}
    </section>
  );
}
