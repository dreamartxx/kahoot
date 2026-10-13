import React from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";
import GameArt from "./GameArt";
import ModuleGuide from "./ModuleGuide";
const modules = {
  tournament: {
    name: "Turnuva",
    title: "Bu evin şampiyonu kim?",
    description:
      "Herkes en iyi olduğu alanı seçsin. Puanlar büyük finalde buluşsun.",
    facts: ["Tek alan seç", "5 ya da 10 soru", "Büyük ödül"],
    action: "Turnuva oluştur",
  },
  raffle: {
    name: "Çarkıfelek",
    title: "Şans bu kez kimden yana?",
    description: "İsimleri ekle, çarkı döndür. Kazananı birlikte alkışlayın.",
    facts: ["İsim ekle", "Excel yükle", "QR ile katıl"],
    action: "Çekiliş oluştur",
  },
  cloud: {
    name: "Kelime Bulutu",
    title: "Bir kelime, bin fikir.",
    description: "Sorunu sor. Ortak kelimeler renkli balonlara dönüşsün.",
    facts: ["Canlı cevaplar", "3 kelime", "Birlikte büyür"],
    action: "Kelime bulutu oluştur",
  },
  family: {
    name: "Beni Tanıyor musun?",
    title: "Aynı ev, kaç küçük sır?",
    description: "Sevdiklerini yeniden keşfet. Aileyi en iyi tanıyan sen ol.",
    facts: ["50 soruluk havuz", "10 soru", "Sana özel"],
    action: "Aile yarışması oluştur",
  },
};
export function MobileStage({ mode, name, onBack, children }) {
  return (
    <section
      className={`mobile-module-screen module-${mode}`}
      aria-label={name}
    >
      <header className="module-screen-header">
        {onBack && (
          <button
            className="module-back"
            onClick={onBack}
            aria-label="Oyun seçimine dön"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <h1>{name}</h1>
        <ModuleGuide mode={mode} compact />
      </header>
      <div className="module-screen-card">{children}</div>
    </section>
  );
}
export default function MobileModuleLanding({
  mode,
  onCreate,
  onBack,
  activeRoom,
  onResume,
  onEvents,
}) {
  const info = modules[mode];
  return (
    <MobileStage mode={mode} name={info.name} onBack={onBack}>
      <div className="module-screen-art">
        <GameArt mode={mode} />
      </div>
      <div className="module-screen-copy">
        <h2>{info.title}</h2>
        <p>{info.description}</p>
      </div>
      <div className="module-screen-facts">
        {info.facts.map((fact) => (
          <span key={fact}>{fact}</span>
        ))}
      </div>
      <button className="module-primary" onClick={onCreate}>
        {info.action}
        <ArrowRight size={21} />
      </button>
      <button
        className="module-secondary"
        onClick={activeRoom ? () => onResume(activeRoom.pin) : onEvents}
      >
        {activeRoom ? "Açık oyununa devam et" : "Oyunlarım ve geçmişim"}
        <ArrowRight size={16} />
      </button>
    </MobileStage>
  );
}
