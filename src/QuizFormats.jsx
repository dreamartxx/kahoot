import React, { useState } from "react";
import { ArrowUpRight, Send, Trophy, Check, Target } from "lucide-react";
import { CharacterAvatar } from "./CharacterAvatar";
import ModuleGuide from "./ModuleGuide";
import "./quiz-formats.css";
export const quizFormats = [
  {
    id: "estimate",
    name: "En Yakın Tahmin",
    emoji: "🎯",
    pool: 200,
    total: 10,
    kicker: "BİLMESEN DE YAKLAŞ",
    tag: "Sayıyı yaz · En yakın kazanır",
    description:
      "Bir ahtapotun kaç kalbi var? Eyfel'de kaç perçin? Hesap yapma, içinden geçeni söyle.",
    rules:
      "200 soruluk havuzdan 10 soru. Sayısal tahminini gizli gönder. Süre sonunda en yakın tahmin 1.000 puan alır; eşit yakınlıktakilerin hepsi kazanır. Bir önceki oyunun soruları tekrar gelmez.",
  },
  {
    id: "binary",
    name: "Sence Hangisi?",
    emoji: "🤔",
    pool: 200,
    total: 10,
    kicker: "BİR EVET, BİR SÜRPRİZ",
    tag: "Evet mi, hayır mı?",
    description:
      "Yarasalar gerçekten kör mü? Bildiğini sandığın şeyler seni şaşırtabilir.",
    rules:
      "200 ilginç sorudan 10 tanesi gelir. Evet veya Hayır seç; doğru ve hızlı cevapla puan kazan. Soru kapanınca açıklamasını gör. Bir önceki oyunun soruları tekrar gelmez.",
  },
  {
    id: "mixed",
    name: "Ortaya Karışık",
    emoji: "🎲",
    pool: 250,
    total: 20,
    kicker: "HER KONUDAN BİR TUTAM",
    tag: "18 kategori · 20 soru",
    description:
      "Uzaydan futbola, tarihten hayvanlara. Bir sonraki sorunun nereden geleceği sürpriz!",
    rules:
      "Kendine ait 250 soruluk genel bilgi havuzundan 20 soru. Her 18 kategoriden bir soru, iki farklı kategoriden birer ek soru gelir. Hiçbir kategori ikiyi geçmez; önceki yarışmanın soruları tamamen dışarıda kalır.",
  },
];
export const quizFormat = (id) => quizFormats.find((f) => f.id === id);
export function QuizFormats({ onChoose }) {
  return (
    <section className="quiz-formats" aria-label="Özel bilgi yarışmaları">
      <div className="format-heading">
        <span className="eyebrow">BİLGİNİN ÜÇ YENİ HALİ</span>
        <h2>
          Bazen bilirsin.
          <br />
          <em>Bazen harika sallarsın.</em>
        </h2>
        <p>Bir oyun seç. Sohbeti, merakı ve rekabeti aynı masaya getir.</p>
      </div>
      <div className="format-cards">
        {quizFormats.map((f) => (
          <article className={`format-card format-${f.id}`} key={f.id}>
            <ModuleGuide mode={f.id} compact />
            <button
              onClick={() => onChoose(f.id)}
              aria-label={`${f.name} oluştur`}
            >
              <span className="format-kicker">{f.kicker}</span>
              <span className="format-art" aria-hidden="true">
                {f.emoji}
                <i>✦</i>
              </span>
              <h3>{f.name}</h3>
              <strong className="format-tag">{f.tag}</strong>
              <p>{f.description}</p>
              <div className="format-pool">
                <span>
                  <b>{f.pool}</b> soruluk havuz
                </span>
                <span>
                  <b>{f.total}</b> soruluk oyun
                </span>
              </div>
              <span className="format-cta">
                Oyunu kur <ArrowUpRight size={21} />
              </span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
export function EstimateRound({ room, screen, busy, left, action }) {
  const [guess, setGuess] = useState("");
  const fmt = (n) =>
    Number(n).toLocaleString("tr-TR", { maximumFractionDigits: 3 });
  if (room.phase === "reveal")
    return (
      <section className="estimate-reveal">
        <div className="estimate-target">
          <span>GERÇEK CEVAP</span>
          <strong>
            {fmt(room.question.answer)} <small>{room.question.unit}</small>
          </strong>
          <p>
            {room.estimateResults?.some((r) => r.points > 0)
              ? "En yakın tahmin sahnede! Eşit uzaklıktaki tahminler birlikte kazanır."
              : "Bu soruya tahmin gelmedi. Sıradakinde şansını dene!"}
          </p>
        </div>
        <div className="estimate-rankings">
          {room.estimateResults?.map((p) => (
            <article
              className={`${p.points ? "estimate-winner" : ""} ${p.isMe ? "estimate-me" : ""}`}
              key={p.name}
            >
              <CharacterAvatar id={p.avatar} />
              <div>
                <strong>
                  {p.name}
                  {p.isMe ? " · Sen" : ""}
                </strong>
                <small>
                  {p.guess === null
                    ? "Tahmin gelmedi"
                    : `Fark: ${fmt(p.distance)} ${room.question.unit}`}
                </small>
              </div>
              <b>
                {p.guess === null ? "—" : fmt(p.guess)}
                <small>{p.points ? `+${p.points} puan` : "0 puan"}</small>
              </b>
              {p.points > 0 && <Trophy size={23} />}
            </article>
          ))}
        </div>
      </section>
    );
  if (!room.me || screen)
    return (
      <div className="estimate-wait">
        <Target size={42} />
        <h3>Tahminler gizlice toplanıyor.</h3>
        <p>Telefonundan sayıyı yaz. Doğru cevaba en yakın olan puanı kapar!</p>
        <span>
          Cevap birimi: <b>{room.question?.unit}</b>
        </span>
      </div>
    );
  if (room.myAnswer)
    return (
      <div className="estimate-submitted" role="status">
        <Check size={32} />
        <span>TAHMİNİN KİLİTLENDİ</span>
        <strong>
          {fmt(room.myAnswer.guess)} <small>{room.question.unit}</small>
        </strong>
        <p>Diğer tahminler süre bitince açılacak.</p>
      </div>
    );
  return (
    <form
      className="estimate-form"
      onSubmit={(e) => {
        e.preventDefault();
        action("answer", { questionId: room.question.id, guess });
      }}
    >
      <label htmlFor="numeric-guess">
        Sence cevap kaç <b>{room.question.unit}</b>?
      </label>
      <div className="estimate-input">
        <input
          id="numeric-guess"
          autoComplete="off"
          inputMode="decimal"
          placeholder="Tahminini yaz"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          required
          maxLength={18}
          pattern="-?[0-9]+([.,][0-9]{1,3})?"
        />
        <span>{room.question.unit}</span>
      </div>
      <small>
        Binlik ayırıcı kullanma. Ondalık için virgül veya nokta yazabilirsin.
      </small>
      <button className="btn" disabled={busy || left === 0 || !guess.trim()}>
        <Send size={18} /> Tahminimi gönder
      </button>
      <p>Hesap makinesi yok. İçinden geçen sayı var. ✦</p>
    </form>
  );
}
