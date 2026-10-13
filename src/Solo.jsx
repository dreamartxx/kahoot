import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Trophy,
  Target,
  Sparkles,
  RotateCcw,
  Clock,
  Check,
  X,
} from "lucide-react";
import { api, categories, catById } from "./api";
import ModuleGuide from "./ModuleGuide";
import GameCreditNotice, { gameCreditMoment } from "./GameCreditNotice";
import { flagAssets } from "./flag-assets";
import flagCountries from "../data/flag-countries.json";
import "./solo.css";
import MobileSoloDashboard from "./MobileSoloDashboard";
import useCompactLayout from "./useCompactLayout";
const names = Object.fromEntries(flagCountries.map((c) => [c.code, c.name]));
const topic = (id) =>
  id === "mixed" ? { name: "Karışık konular", emoji: "✨" } : catById(id);
function Option({ value }) {
  const code = value?.startsWith("flag:") ? value.slice(5) : null;
  return code && flagAssets[code] ? (
    <img
      className="solo-flag"
      src={flagAssets[code]}
      alt={`${names[code]} bayrağı`}
    />
  ) : (
    value
  );
}
export default function Solo({ onBack }) {
  const compact = useCompactLayout();
  const [data, setData] = useState(null),
    [category, setCategory] = useState("mixed"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [now, setNow] = useState(Date.now()),
    [dismissed, setDismissed] = useState(null);
  const offset = useRef(0),
    alive = useRef(true),
    pending = useRef(false),
    epoch = useRef(0);
  function receive(next) {
    if (!alive.current) return;
    if (next.game) offset.current = next.game.serverTime * 1000 - Date.now();
    setData((old) => ({ ...old, ...next }));
    setError("");
  }
  useEffect(() => {
    alive.current = true;
    api("solo_summary")
      .then(receive)
      .catch((e) => setError(e.message));
    const clock = setInterval(() => setNow(Date.now()), 200);
    return () => {
      alive.current = false;
      clearInterval(clock);
    };
  }, []);
  const game = data?.game,
    playing = game && !["finished", "abandoned"].includes(game.phase);
  useEffect(() => {
    if (!playing) return;
    let stopped = false,
      timer;
    async function poll() {
      try {
        if (!pending.current) {
          const version = epoch.current;
          const next = await api("solo_state");
          if (!stopped && !pending.current && version === epoch.current)
            receive(next);
        }
      } catch (e) {
        if (!stopped) setError(e.message);
      }
      if (!stopped) timer = setTimeout(poll, 800);
    }
    timer = setTimeout(poll, 800);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [playing, game?.id, game?.index, game?.phase]);
  async function action(name, extra = {}) {
    if (pending.current) return;
    pending.current = true;
    epoch.current++;
    setBusy(true);
    setError("");
    try {
      receive(await api(name, { gameId: game?.id, ...extra }));
      if (name === "solo_start") setDismissed(null);
    } catch (e) {
      setError(e.message);
    } finally {
      pending.current = false;
      if (alive.current) setBusy(false);
    }
  }
  const stats = data?.stats,
    finished = game?.phase === "finished" && dismissed !== game.id;
  const serverNow = (now + offset.current) / 1000;
  const countdown =
    game?.phase === "countdown" ||
    (game?.phase === "reveal" && game.index < 9 && serverNow >= game.until);
  const countdownUntil =
    game?.phase === "countdown" ? game.until : (game?.until || 0) + 3;
  const remaining = Math.max(
    0,
    Math.ceil(
      (countdown
        ? countdownUntil
        : game?.phase === "question"
          ? game.deadline
          : game?.until) - serverNow,
    ),
  );
  return (
    <section
      className="solo-page"
      data-playing={playing}
      data-mobile-start={compact && !playing && !finished}
      data-screen-key={`${game?.phase}:${game?.question?.id || game?.index}`}
    >
      <div className="solo-heading">
        <span className="eyebrow">KENDİNLE YARIŞ</span>
        <h1>
          Kendini Dene<span>✦</span>
        </h1>
        <p>Merakını takip et. Bildiklerini keşfet. Kendi rekorunu geç.</p>
      </div>
      <ModuleGuide mode="solo" />
      {data?.preview && (
        <p className="notice">
          Admin testi: bu denemeler kullanıcının skorlarına eklenmez.
        </p>
      )}
      {error && (
        <div className="account-error" role="alert">
          {error}{" "}
          <button
            className="text-btn"
            onClick={() =>
              api("solo_summary")
                .then(receive)
                .catch((e) => setError(e.message))
            }
          >
            Yenile
          </button>
        </div>
      )}
      {(playing || finished) && gameCreditMoment(game) && (
        <GameCreditNotice
          key={`${game.id}:${gameCreditMoment(game)}`}
          moment={gameCreditMoment(game)}
        />
      )}
      {!data ? (
        <p className="empty">Kişisel oyun alanın hazırlanıyor…</p>
      ) : playing ? (
        <section className="solo-stage" aria-label="Kişisel bilgi testi">
          <div className="solo-game-top">
            <span>
              {topic(game.category).emoji} {topic(game.category).name}
            </span>
            <strong>{game.index + 1} / 10</strong>
            <span>
              <Trophy size={18} />
              {game.score}
            </span>
          </div>
          <div className="solo-progress">
            <i style={{ width: `${game.index * 10}%` }} />
          </div>
          {countdown ? (
            <div className="solo-countdown" role="status">
              <p>Yeni soruya hazır mısın?</p>
              <strong key={remaining}>{remaining || "…"}</strong>
              <span>Sıradaki doğru senin olsun!</span>
            </div>
          ) : (
            <>
              <div className="solo-clock">
                <Clock size={17} />
                {game.phase === "question"
                  ? `${remaining} saniye`
                  : `Yeni soru ${remaining} saniye içinde`}
              </div>
              <h2>{game.question?.text}</h2>
              <div className="solo-options">
                {game.question?.options.map((value, i) => (
                  <button
                    key={`${game.question.id}-${i}`}
                    disabled={
                      busy || game.phase !== "question" || remaining === 0
                    }
                    className={`solo-option ${game.phase === "reveal" ? (i === game.question.correct ? "correct" : i === game.answer?.choice ? "incorrect" : "muted-option") : ""}`}
                    onClick={() =>
                      action("solo_answer", {
                        questionId: game.question.id,
                        choice: i,
                      })
                    }
                  >
                    <span className="solo-letter">{"ABCD"[i]}</span>
                    <Option value={value} />
                    {game.phase === "reveal" && i === game.question.correct && (
                      <Check size={22} />
                    )}
                  </button>
                ))}
              </div>
              {game.phase === "reveal" && (
                <div
                  className={`solo-feedback ${game.answer?.correct ? "good" : "bad"}`}
                  role="status"
                >
                  <strong>
                    {game.answer?.correct
                      ? "🎉 Tebrikler, doğru bildin! +100 puan"
                      : game.answer?.choice === null
                        ? "Süre doldu. Bir sonrakinde yakala!"
                        : "Yanlış cevap. Öğrenmeye devam!"}
                  </strong>
                  {game.question.explanation && (
                    <p>{game.question.explanation}</p>
                  )}
                </div>
              )}
            </>
          )}
          <button
            className="text-btn solo-end"
            disabled={busy}
            onClick={() => action("solo_abandon")}
          >
            Testi bitir · skor kaydedilmez
          </button>
        </section>
      ) : finished ? (
        <section className="solo-result">
          <div className="solo-medal" aria-hidden="true">
            🏆
          </div>
          <span className="eyebrow">BU TUR TAMAMLANDI</span>
          <h2>
            {game.correctCount >= 8
              ? "Bilgin parlıyor!"
              : game.correctCount >= 5
                ? "Güzel bir başlangıç!"
                : "Her soruyla yeni bir keşif!"}
          </h2>
          <strong className="solo-result-score">
            {game.score}
            <small> / 1.000 puan</small>
          </strong>
          <p>
            {game.correctCount} doğru · {10 - game.correctCount} yanlış veya boş
            · %{game.correctCount * 10} başarı
          </p>
          {game.score > 0 && game.score >= (stats?.best || 0) && (
            <span className="solo-record">
              <Sparkles size={18} /> Kişisel en yüksek skorun!
            </span>
          )}
          <p className="solo-context">
            Bu sonuç, {topic(game.category).name.toLocaleLowerCase("tr")}{" "}
            alanındaki bu 10 soruya ait. Farklı turlarla gelişimini takip et.
          </p>
          <div className="solo-result-actions">
            <button
              className="btn"
              onClick={() => action("solo_start", { category: game.category })}
              disabled={busy}
            >
              <RotateCcw size={18} /> Tekrar dene
            </button>
            <button
              className="btn secondary"
              onClick={() => setDismissed(game.id)}
            >
              Konu seç ve rekorları gör
            </button>
          </div>
          <details className="solo-review">
            <summary>Cevaplarımı incele</summary>
            {game.review.map((q, i) => (
              <article key={i}>
                <h3>
                  {i + 1}. {q.text}
                </h3>
                <p
                  className={
                    q.choice === q.correct ? "review-good" : "review-bad"
                  }
                >
                  {q.choice === q.correct ? (
                    <Check size={18} />
                  ) : (
                    <X size={18} />
                  )}{" "}
                  Senin cevabın:{" "}
                  {q.choice === null ? (
                    "Boş"
                  ) : (
                    <Option value={q.options[q.choice]} />
                  )}
                </p>
                <p>
                  Doğru cevap: <Option value={q.options[q.correct]} />
                </p>
                {q.explanation && <small>{q.explanation}</small>}
              </article>
            ))}
          </details>
        </section>
      ) : compact ? (
        <MobileSoloDashboard
          category={category}
          onCategory={setCategory}
          onStart={() => action("solo_start", { category })}
          busy={busy}
          stats={stats}
          onBack={onBack}
        />
      ) : (
        <>
          <div className="solo-dashboard">
            <section className="solo-launch">
              <div className="solo-orb" aria-hidden="true">
                ?<span>✦</span>
              </div>
              <span className="eyebrow">SAHNE SADECE SENİN</span>
              <h2>
                Acaba ne kadar
                <br />
                biliyorum?
              </h2>
              <p>Kimseyi bekleme. Konunu seç, 10 soruda kendine meydan oku.</p>
              <label className="field">
                <span>Hangi alanda kendini denemek istersin?</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="mixed">✨ Karışık konular</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="btn full"
                disabled={busy}
                onClick={() => action("solo_start", { category })}
              >
                Hemen başla <ArrowRight size={20} />
              </button>
              <div className="solo-rules">
                <span>10 soru</span>
                <span>30 sn / soru</span>
                <span>Doğruya 100 puan</span>
              </div>
            </section>
            <section className="solo-records">
              <div className="solo-record-heading">
                <Trophy size={28} />
                <span>
                  KENDİ ZİRVENE OYNA<h2>En yüksek skorun</h2>
                </span>
              </div>
              <strong className="solo-best">
                {stats?.best || 0}
                <small>/ 1.000</small>
              </strong>
              <p>
                {stats?.games
                  ? `${stats.games} tamamlanan test · %${Math.round((stats.correctTotal / (stats.games * 10)) * 100)} genel doğruluk`
                  : "İlk rekorunu yazmaya hazır mısın?"}
              </p>
              <div className="solo-topic-records">
                {stats?.categories?.length ? (
                  stats.categories.map((c) => (
                    <div key={c.category}>
                      <span>
                        {topic(c.category).emoji} {topic(c.category).name}
                        <small>{c.games} test</small>
                      </span>
                      <strong>{c.best}</strong>
                    </div>
                  ))
                ) : (
                  <div className="solo-record-empty">
                    <Target size={32} />
                    <p>
                      Her konuda kendi zirven.
                      <br />
                      İlk testinle burada yerini al.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
          {stats?.recent?.length > 0 && (
            <section className="solo-history">
              <h2>Son denemelerin</h2>
              <div>
                {stats.recent.map((r) => (
                  <article key={r.id}>
                    <span>{topic(r.category).emoji}</span>
                    <div>
                      <strong>{topic(r.category).name}</strong>
                      <small>
                        {new Date(r.finishedAt * 1000).toLocaleDateString("tr")}{" "}
                        · {r.correctCount}/10 doğru
                      </small>
                    </div>
                    <b>
                      {r.score}
                      <small>puan</small>
                    </b>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </section>
  );
}
