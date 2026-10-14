import React from "react";
import { ArrowUpRight } from "lucide-react";
import "./overview.css";
import GameArt from "./GameArt";
import ModuleGuide from "./ModuleGuide";
import { moduleTeasers } from "./ModuleTeasers";

const modules = [
  {
    id: "solo",
    title: "Kendini Dene",
    label: "BUGÜNKÜ RAKİBİN DÜNKÜ SEN",
    description: "Merak et. Kendini keşfet. Rekorunu geç.",
    detail: "Tek kişi · 10 soru · Kişisel rekorlar",
    action: "Kendime meydan okuyorum",
  },
  {
    id: "tournament",
    title: "Turnuva",
    label: "BÜYÜK ÖDÜLE GİDEN YOL",
    description: "Senin alanın. Ortak heyecan. Büyük final.",
    detail: "Alanını seç · 5 ya da 10 soru · Toplam puan",
    action: "Turnuvayı başlat",
  },
  {
    id: "quiz",
    title: "Bilgi Yarışması",
    label: "BİLGİNİ KONUŞTUR",
    description: "Konunu seç. Heyecanı başlat.",
    detail: "20 konu · 3 özel yarışma",
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
export default function Overview({ onChoose }) {
  return (
    <section className="overview-grid" aria-label="Etkinlik modülleri">
      <h1 className="overview-sr-only">Bugün ne oynuyoruz?</h1>
      {modules.map((m, i) => (
        <article
          key={m.id}
          className={`overview-module overview-module-${m.id}`}
        >
          <ModuleGuide mode={m.id} compact />
          <button
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
            <span className="overview-premium-art">
              <GameArt mode={m.id} />
            </span>
            <span className="overview-card-copy">
              <span className="overview-module-detail">{m.detail}</span>
              <h2>{m.title}</h2>
              <span className="overview-description">{m.description}</span>
              <span className="overview-teaser">
                <span>{moduleTeasers[m.id].notes[0][0]}</span>
                <span aria-hidden="true">
                  {moduleTeasers[m.id].notes[0][1]}
                </span>
              </span>
            </span>
            <span className="overview-card-bottom">
              <span>{m.action}</span>
              <span className="overview-arrow">
                <ArrowUpRight size={23} />
              </span>
            </span>
          </button>
        </article>
      ))}
    </section>
  );
}
