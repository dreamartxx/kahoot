import ScreenPages from "./ScreenPages";
import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Sparkles, X } from "lucide-react";
import "./module-guide.css";

const guides = {
  estimate: {
    name: "En Yakın Tahmin",
    emoji: "🎯",
    accent: "#a879bf",
    intro: "Tam bilmesen de en yakını sen olabilirsin.",
    steps: [
      [
        "Oyunu kur",
        "200 soruluk havuzdan 10, 15 veya 20 soru seç. Soru süresi 10 saniye; istersen 15 veya 20 yap. QR veya oyun kodunu paylaş.",
      ],
      [
        "Tahminini yaz",
        "Sayıyı, ekrandaki birime göre yaz. Tahminler süre bitene kadar gizli kalır.",
      ],
      [
        "En yakın kazanır",
        "Gerçek cevaba en yakın olan 1.000 puan alır. Eşit yakınlık varsa hepsi puan kazanır.",
      ],
    ],
    note: "Hesaplama sorusu yok. Önceki oyunun soruları sonraki oyuna gelmez.",
  },
  binary: {
    name: "Sence Hangisi?",
    emoji: "🤔",
    accent: "#549888",
    intro: "Evet mi? Hayır mı? Şaşırmaya hazır ol.",
    steps: [
      [
        "Bir araya gelin",
        "200 ilginç sorudan 10, 15 veya 20 soru hazırlanır. Süreyi 10, 15 veya 20 saniye seç. Kodu veya QR'ı paylaş.",
      ],
      [
        "Tarafını seç",
        "Evet ya da Hayır'a dokun. Doğru ve hızlı cevapla puan kazan.",
      ],
      [
        "Gerçeği keşfet",
        "Süre bitince doğru cevabı ve açıklamasını gör. 3–2–1 ile otomatik devam et.",
      ],
    ],
    note: "Sorular kişisel görüş değil, doğrulanabilir bilgiler sorar. Önceki oyunun soruları tekrarlanmaz.",
  },
  mixed: {
    name: "Ortaya Karışık",
    emoji: "🎲",
    accent: "#bd9755",
    intro: "20 konu. Soru sayısı senin seçimin.",
    steps: [
      [
        "Karışımı başlat",
        "250 soruluk havuzdan 10, 15 veya 20 soru hazırlanır. Soru süresi varsayılan 10 saniye; 15 veya 20 de seçebilirsin.",
      ],
      [
        "Her alanda yarış",
        "10, 15 veya 20 soruluk oyunlarda her soru farklı bir konudan gelir.",
      ],
      [
        "Yeni tur, yeni sorular",
        "Aynı kurucunun önceki karışık yarışmasındaki sorular bir sonraki oyunda kullanılmaz.",
      ],
    ],
    note: "Kategoriler en fazla iki kez görünür. Tamamı genel bilgi sorularıdır.",
  },
  solo: {
    name: "Kendini Dene",
    emoji: "✨",
    accent: "#7b68ac",
    intro: "Tek başına oyna. Kendi rekorunu geç.",
    steps: [
      [
        "Konunu seç",
        "Bir konu veya karışık konular seç. Kimseyi beklemeden 10 soruluk testine başla.",
      ],
      [
        "Kendini dene",
        "Her soruda 30 saniyen var. Dört şıktan birini seç; her doğru cevap 100 puan. Sorular 3–2–1 ile ilerler.",
      ],
      [
        "Gelişimini gör",
        "Test sonunda doğru oranını ve cevaplarını incele. En yüksek skorların ve son denemelerin hesabında saklanır.",
      ],
    ],
    note: "Her turda en fazla bir uzmanlık sorusu gelir. Yarım bırakılan testler rekorlara eklenmez.",
  },
  quiz: {
    name: "Bilgi yarışması",
    emoji: "⚡",
    accent: "#8a63c2",
    intro: "Konunu seç. Bilgini konuştur.",
    steps: [
      [
        "Oyunu kur",
        "Konu ve soru sayısını (10, 15, 20) seç. Süre 10 saniyeden başlar; 15 veya 20 de seçebilirsin. Kodu veya QR’ı paylaş.",
      ],
      [
        "Doğru şıkkı bul",
        "Dört seçenekten birini işaretle. Doğru ve hızlı cevaplarla puan kazan.",
      ],
      [
        "Zirveye çık",
        "Sorular 3–2–1 ile otomatik ilerler. Finalde toplam puanınla sıralamaya gir.",
      ],
    ],
    note: "Kurucu da “Ben de yarışacağım” ile aynı ekrandan oyuna katılabilir.",
  },
  tournament: {
    name: "Turnuva",
    emoji: "🏆",
    accent: "#a78340",
    intro: "Bir alan seç. Bütün turlarda yarış.",
    steps: [
      [
        "Ödül ve tek alan",
        "Kurucu ödülü yazar. En az iki kişi katılır; herkes yalnızca bir alan seçip onaylar.",
      ],
      [
        "Aynı alan, tek tur",
        "Başkasının seçtiği alanı da seçebilirsin. Seçimin kilitlenir; tekrar seçim hakkı verilmez.",
      ],
      [
        "Oyla ve yarış",
        "Her alan için 5 veya 10 soruya oy verin. Sorular otomatik gelir, tüm turların puanları toplanır.",
      ],
    ],
    note: "Herkes seçilen tüm alanlarda oynar. Oylamada eşitlik olursa 10 soru seçilir.",
  },
  family: {
    name: "Beni Tanıyor musun?",
    emoji: "💗",
    accent: "#c26894",
    intro: "Aileni ne kadar iyi tanıyorsun?",
    steps: [
      [
        "Soruları hazırla",
        "Kurucu 10 soruyu havuzdan seçer, rastgele hazırlatır veya kendi sorularını ekler.",
      ],
      [
        "Kendini anlat",
        "İsmini ve ailedeki rolünü yaz. Herkes kendi cevaplarını kaydedince oyun başlar.",
      ],
      [
        "Birbirinizi tanıyın",
        "Diğer aile üyeleriyle ilgili doğru şıkkı seç. Kendi sorundan puan almazsın; finalde en iyi tanıyan belli olur.",
      ],
    ],
    note: "Kişisel cevaplar önceden gösterilmez. Sonuçlar ve karşılaştırma kartları soru kapanınca açılır.",
  },
  raffle: {
    name: "Çarkıfelek",
    emoji: "🎡",
    accent: "#c88a50",
    intro: "İsimler hazırsa, şans sahnede!",
    steps: [
      [
        "İsimleri ekle",
        "İsmi yazıp “İsim ekle”ye bas. İstersen Excel listesi yükle veya QR ile katılımcı al.",
      ],
      [
        "Çarkı döndür",
        "Kurucu çekilişi başlatır. Çark hızlanır, yavaşlar ve kazananın üzerinde durur.",
      ],
      [
        "Kazananı kutla",
        "Sonucu herkes birlikte görür. Sonraki çekilişlerde önceki kazananlar tekrar seçilmez.",
      ],
    ],
    note: "Kodu veya QR’ı paylaşarak katılımcıları etkinliğe davet edebilirsin.",
  },
  cloud: {
    name: "Kelime bulutu",
    emoji: "💭",
    accent: "#4a9b97",
    intro: "Bir kelime söyle. Birlikte büyüsün.",
    steps: [
      [
        "Sorunu sor",
        "Kurucu herkesin cevaplayabileceği bir soru yazar ve katılım kodunu paylaşır.",
      ],
      [
        "Kelimeni gönder",
        "Katılımcılar telefonlarından bir ile üç kelime gönderir.",
      ],
      [
        "Bulutu izle",
        "Aynı kelimeyi yazanların sayısı arttıkça balon büyür. Balon üzerindeki sayı katılımı gösterir.",
      ],
    ],
    note: "Kurucu yeni soru sorduğunda yeni bir kelime bulutu başlar.",
  },
};

function GuidePopup({ guide, onClose }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    ref.current.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);
  return createPortal(
    <dialog
      ref={ref}
      className="guide-dialog"
      style={{ "--guide-accent": guide.accent }}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            onClose();
        }
      }}
    >
      <div className="guide-popup-head">
        <span className="guide-popup-emoji" aria-hidden="true">
          {guide.emoji}
        </span>
        <div>
          <span className="guide-eyebrow">3 ADIMDA OYUNA HAZIR OL</span>
          <h2 id={titleId}>{guide.name}</h2>
        </div>
        <button
          type="button"
          className="guide-close"
          onClick={onClose}
          aria-label="Oyun rehberini kapat"
          autoFocus
        >
          <X size={21} />
        </button>
      </div>
      <ScreenPages dialog>
        <p className="guide-intro">{guide.intro}</p>
        <div className="guide-content">
          <ol>
            {guide.steps.map(([title, text], i) => (
              <li key={title}>
                <span className="guide-step-number">0{i + 1}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="guide-note">
            <Sparkles size={18} />
            <span>{guide.note}</span>
          </p>
        </div>
        <button type="button" className="guide-done" onClick={onClose}>
          Anladım, hazırım!
        </button>
      </ScreenPages>
    </dialog>,
    document.body,
  );
}

export default function ModuleGuide({ mode, compact = false }) {
  const [open, setOpen] = useState(false);
  const guide = guides[mode];
  if (!guide) return null;
  return (
    <div
      className={`module-guide ${compact ? "is-compact" : ""}`}
      style={{ "--guide-accent": guide.accent }}
    >
      <button
        type="button"
        className="guide-trigger"
        aria-label={`${guide.name}: Nasıl oynanır?`}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <BookOpen size={18} />
        <span>Nasıl oynanır?</span>
        <Sparkles size={14} aria-hidden="true" />
      </button>
      {open && <GuidePopup guide={guide} onClose={() => setOpen(false)} />}
    </div>
  );
}
