import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  Play,
  Pencil,
  Trophy,
} from "lucide-react";

const label = (person) => `${person.name} (${person.role})`;
const avatars = ["🦊", "🐼", "🐯", "🐸", "🐨", "🦁"];

function FamilyProfile({ room, action, busy }) {
  const draftKey = `arena-family-draft:${room.pin}:${room.me.id}`;
  const [answers, setAnswers] = useState(() => {
    if (room.myProfile) return room.myProfile;
    try {
      return JSON.parse(sessionStorage.getItem(draftKey)) || {};
    } catch {
      return {};
    }
  });
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(answers));
    } catch {}
  }, [answers, draftKey]);
  const completed = room.prompts.filter((p) => answers[p.id]?.trim()).length;
  if (room.myProfile && !editing)
    return (
      <section className="family-ready">
        <div className="family-hero-emoji">💌</div>
        <span className="eyebrow">10 CEVABIN HAZIR</span>
        <h2>Seni ne kadar tanıyorlar?</h2>
        <p>
          Cevapların kaydedildi. Herkes hazır olduğunda sunucu oyunu başlatacak.
        </p>
        <p className="muted">Diğerleri şimdilik cevaplarını göremez.</p>
        <button className="btn secondary" onClick={() => setEditing(true)}>
          <Pencil size={17} /> Cevaplarımı düzenle
        </button>
      </section>
    );
  return (
    <form
      className="family-profile"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await action("family_profile", { answers })) {
          setEditing(false);
          try {
            sessionStorage.removeItem(draftKey);
          } catch {}
        }
      }}
    >
      <div className="family-form-heading">
        <span className="eyebrow">ÖNCE SENİ TANIYALIM</span>
        <h2>{label(room.me)}</h2>
        <p>
          Herkes bu oyun için seçilen aynı 10 soruyu kendisi için cevaplıyor.
          Kısa ve net yaz; örneğin “Mantı” veya “Mavi”.
        </p>
        <span className="family-counter">{completed} / 10 cevap hazır</span>
      </div>
      <div className="family-profile-grid">
        {room.prompts.map((prompt, index) => (
          <label className="family-field" key={prompt.id}>
            <span>
              <b>{String(index + 1).padStart(2, "0")}</b>
              {prompt.text}
            </span>
            <input
              required
              maxLength={80}
              autoComplete="off"
              placeholder="Benim cevabım…"
              value={answers[prompt.id] || ""}
              onChange={(e) =>
                setAnswers((old) => ({ ...old, [prompt.id]: e.target.value }))
              }
            />
          </label>
        ))}
      </div>
      <button className="btn full" disabled={busy || completed !== 10}>
        {busy ? "Kaydediliyor…" : "Cevaplarım hazır"}
        <CheckCircle2 size={20} />
      </button>
      <p className="muted">
        Oyun başlayana kadar cevaplarını düzenleyebilirsin.
      </p>
    </form>
  );
}

function FamilyResults({ results }) {
  const ranking = results.ranking;
  const most = ranking.filter((p) => p.score === ranking[0]?.score);
  const least = ranking.filter((p) => p.score === ranking.at(-1)?.score);
  return (
    <section className="family-results">
      <div className="family-result-intro">
        <span className="family-hero-emoji">🏡</span>
        <span className="eyebrow">AYNI AİLE, YENİ KEŞİFLER</span>
        <h2>Birbirinizi ne kadar tanıyorsunuz?</h2>
        <p>
          Her doğru 100 puan. Kendi soruların puana dahil değil; eşit puanlar
          aynı sırayı paylaşır.
        </p>
      </div>
      <div className="family-highlights">
        <article>
          <Trophy size={25} />
          <small>Ailesini en iyi tanıyan</small>
          <strong>{most.map(label).join(", ")}</strong>
          <span>
            {most[0]?.correct} / {most[0]?.total} doğru
          </span>
        </article>
        <article>
          <Heart size={25} />
          <small>Bu turda en az doğru cevaplayan</small>
          <strong>{least.map(label).join(", ")}</strong>
          <span>
            {least[0]?.correct} / {least[0]?.total} doğru · Birbirinizi
            keşfetmeye devam!
          </span>
        </article>
      </div>
      <div className="family-rankings" aria-label="Aile oyunu puan tablosu">
        {ranking.map((p) => (
          <div className="family-ranking-row" key={p.id}>
            <span className="family-rank">{p.rank}</span>
            <div>
              <strong>{label(p)}</strong>
              <small>
                {p.correct} / {p.total} doğru · %{p.percent} tanıma oranı
              </small>
              <div className="family-meter">
                <span style={{ width: `${p.percent}%` }} />
              </div>
            </div>
            <b>
              {p.score}
              <small>puan</small>
            </b>
          </div>
        ))}
      </div>
      <h3>Kimi, kim daha iyi tanıyor?</h3>
      <div className="family-person-results">
        {results.byPerson.map((person, index) => {
          const best = person.knowers.filter(
            (p) => p.correct === person.knowers[0]?.correct,
          );
          const last = person.knowers.filter(
            (p) => p.correct === person.knowers.at(-1)?.correct,
          );
          return (
            <article key={person.id}>
              <span className="family-person-avatar">
                {avatars[index % avatars.length]}
              </span>
              <h4>{label(person)}</h4>
              <p>
                <b>En çok tanıyan:</b> {best.map(label).join(", ")}{" "}
                <span>({best[0]?.correct}/10)</span>
              </p>
              <p>
                <b>En az tanıyan:</b> {last.map(label).join(", ")}{" "}
                <span>({last[0]?.correct}/10)</span>
              </p>
              <details>
                <summary>Tüm sonuçları gör</summary>
                {person.knowers.map((p) => (
                  <div className="family-knower" key={p.id}>
                    <span>{label(p)}</span>
                    <b>{p.correct}/10</b>
                  </div>
                ))}
              </details>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function FamilyRoom({
  room,
  host,
  screen,
  action,
  busy,
  left,
  QR,
}) {
  if (room.phase === "finished")
    return <FamilyResults results={room.results} />;
  if (room.phase === "lobby")
    return (
      <div className="family-room">
        <div className="family-lobby-layout">
          <section className="family-lobby-card">
            {room.me && !host && !screen ? (
              <FamilyProfile
                key={room.me.id}
                room={room}
                action={action}
                busy={busy}
              />
            ) : (
              <>
                <span className="family-hero-emoji">🏡</span>
                <span className="eyebrow">BENİ TANIYOR MUSUN?</span>
                <h2>Ailen burada, sürprizler yolda.</h2>
                <p>
                  QR’ı okut veya oyun kodunu gir. Adını ve ailedeki rolünü yaz,
                  kendinle ilgili 10 soruyu cevapla.
                </p>
                <div className="lobby-pin">
                  {room.pin.split("").map((digit, i) => (
                    <span key={i}>{digit}</span>
                  ))}
                </div>
                <p className="family-round-info">
                  {room.playerCount >= 2
                    ? `${room.playerCount} kişi × 10 soru = ${room.playerCount * 10} soruluk oyun. Herkes diğerleri hakkında ${10 * (room.playerCount - 1)} soru cevaplar.`
                    : "Başlamak için en az 2 aile üyesi gerekli."}
                </p>
                {host && (
                  <>
                    <button
                      className="btn"
                      disabled={
                        busy ||
                        room.playerCount < 2 ||
                        room.readyCount !== room.playerCount
                      }
                      onClick={() => action("family_start")}
                    >
                      <Play size={18} /> Aile yarışmasını başlat
                    </button>
                    <a
                      className="text-btn family-join-link"
                      href={`#join/${room.pin}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ben de yarışmacı olarak katılayım <ArrowRight size={16} />
                    </a>
                  </>
                )}
              </>
            )}
          </section>
          <aside className="family-roster">
            {(host || screen) && <QR pin={room.pin} />}
            <h3>
              Bizim aile{" "}
              <span>
                {room.readyCount}/{room.playerCount} hazır
              </span>
            </h3>
            <p>Herkes cevaplarını tamamlayınca başlayabiliriz.</p>
            <div className="family-roster-list">
              {room.players.map((p, i) => (
                <div key={p.id}>
                  <span className="family-person-avatar">
                    {avatars[i % avatars.length]}
                  </span>
                  <span>
                    <strong>{p.name}</strong>
                    <small>{p.role}</small>
                  </span>
                  <span
                    className={`family-ready-badge ${p.ready ? "is-ready" : ""}`}
                  >
                    {p.ready ? "Hazır ✓" : "Hazırlanıyor"}
                  </span>
                </div>
              ))}
            </div>
            {!room.playerCount && <p>İlk aile üyesini bekliyoruz…</p>}
          </aside>
        </div>
      </div>
    );
  const q = room.question;
  if (!q) return null;
  const reveal = room.phase === "reveal";
  const cannotAnswer =
    host ||
    screen ||
    !room.me ||
    room.ownQuestion ||
    busy ||
    !!room.myAnswer ||
    reveal ||
    left === 0;
  return (
    <section className="quiz-stage family-quiz">
      <div className="quiz-progress">
        <span>
          SORU {room.index + 1} / {room.total}
        </span>
        <div className="timer">{reveal ? <CheckCircle2 /> : left}</div>
        <span>
          {room.answeredCount} / {room.eligibleCount} cevap
        </span>
      </div>
      <div className="family-subject">
        <Heart size={18} /> Bu kez {label(q.subject)} hakkında
      </div>
      <h2>{q.text}</h2>
      {room.ownQuestion && (
        <div className="family-own-question">
          💛 Bu soru senin hakkında. Bakalım seni kim tanıyor! Bu soruda puan
          kazanmazsın.
        </div>
      )}
      <div className="answer-grid">
        {q.options.map((option, i) => (
          <button
            key={i}
            className={`answer answer-${i}${room.myAnswer?.choice === i ? " selected" : ""}${reveal ? (q.correct === i ? " correct" : " dim") : ""}`}
            disabled={cannotAnswer}
            onClick={() =>
              action("family_answer", { questionId: q.id, choice: i })
            }
          >
            <span className="answer-shape">{["▲", "◆", "●", "■"][i]}</span>
            <b>{option}</b>
            {reveal && q.correct === i && <CheckCircle2 size={24} />}
          </button>
        ))}
      </div>
      {!reveal && room.myAnswer && (
        <div className="answer-feedback">
          <CheckCircle2 size={20} /> Cevabın alındı. Birazdan öğreniyoruz!
        </div>
      )}
      {reveal && (
        <div className="reveal-note">
          <strong>
            {label(q.subject)} diyor ki: “{q.options[q.correct]}”
          </strong>
          {room.myAnswer && (
            <p>
              {room.myAnswer.points
                ? "Onu tanıyorsun! +100 puan"
                : "Yeni bir şey öğrendin. Sıradaki soruda görüşürüz!"}
            </p>
          )}
        </div>
      )}
      <p className="auto-question-note" role="status">
        {reveal
          ? room.index === room.total - 1
            ? "Aile skorları birazdan otomatik açılacak."
            : "Doğru cevap gösteriliyor. Ardından 3–2–1 ile sıradaki soru!"
          : "Süre bitince cevaplar gösterilecek ve yeni soruya otomatik geçilecek."}
      </p>
      {host && !reveal && (
        <button
          className="btn next-btn"
          disabled={busy}
          onClick={() =>
            action("family_advance", {
              expectedIndex: room.index,
              expectedPhase: room.phase,
            })
          }
        >
          {!reveal
            ? "Cevabı göster"
            : room.index === room.total - 1
              ? "Aile skorlarını göster"
              : "Sıradaki kişi ve soru"}
          <ArrowRight size={18} />
        </button>
      )}
    </section>
  );
}
