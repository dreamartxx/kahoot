import React, { useEffect, useState } from "react";
import { Crown, Gift, Check, Play, Users, Clock } from "lucide-react";
import { categories, catById } from "./api";
import { CharacterAvatar } from "./CharacterAvatar";
import "./tournament.css";

export function TournamentIntro({ onCreate }) {
  return (
    <section className="tournament-intro">
      <div>
        <span className="eyebrow">HERKESİN BİR UZMANLIK ALANI VAR</span>
        <h2>
          Sen alanını seç.
          <br />
          Zirvede buluşalım.
        </h2>
        <p>
          Futbol benden, gezegenler senden! Güçlü olduğunuz alanları seçin. Aynı
          alanlar tek turda birleşsin, puanlar büyük finalde buluşsun.
        </p>
        <button className="btn" onClick={onCreate}>
          <Crown size={20} /> Turnuva oluştur
        </button>
        <div className="tournament-intro-steps">
          <span>01 · Ödülü belirle</span>
          <span>02 · Alanını seç</span>
          <span>03 · 5 ya da 10 soruya oy ver</span>
        </div>
      </div>
      <div className="tournament-cup" aria-hidden="true">
        <span>✦ BÜYÜK FİNAL ✦</span>
        <b>🏆</b>
        <small>Birçok alan. Tek şampiyonluk.</small>
        <i>“Bu alan benim!”</i>
      </div>
    </section>
  );
}

export function TournamentBanner({ room }) {
  const count = room.questionsPerRound;
  const index = room.phase === "countdown" ? room.index + 1 : room.index;
  const round = count
    ? Math.min(room.roundTotal - 1, Math.floor(Math.max(0, index) / count))
    : 0;
  const category = catById(room.rounds[round]);
  return (
    <aside className="tournament-banner" aria-label="Turnuva bilgileri">
      <div>
        <Gift size={26} />
        <span>
          <small>TURNUVA ÖDÜLÜ</small>
          <strong>{room.prize}</strong>
        </span>
      </div>
      {count && (
        <div className="tournament-round-meta">
          <Crown size={23} />
          <span>
            {room.phase === "finished"
              ? "Büyük final · Toplam puanlar"
              : `${category.emoji} ${category.name} · Alan ${round + 1}/${room.roundTotal}`}
            <small>
              Her alanda {count} soru · Toplam {room.total} soru
            </small>
          </span>
        </div>
      )}
    </aside>
  );
}

export function TournamentLobby({ room, host, screen, action, busy, now, QR }) {
  const [chosen, setChosen] = useState(room.myCategories || []);
  const [prize, setPrize] = useState(room.prize);
  const saved = (room.myCategories || []).join(",");
  useEffect(() => setChosen(room.myCategories || []), [saved]);
  useEffect(() => setPrize(room.prize), [room.prize]);
  const voting = room.phase === "voting";
  const seconds = Math.max(0, Math.ceil((room.voteUntil || 0) - now));
  const canPlay = !screen && room.me;
  const changed =
    [...chosen].sort().join(",") !==
    [...(room.myCategories || [])].sort().join(",");
  return (
    <div className="tournament-layout">
      <section className="tournament-main">
        <div className="tournament-section-heading">
          <Crown size={30} />
          <div>
            <span className="eyebrow">
              {voting ? "SÖZ KATILIMCILARDA" : "ALANINI SAHNEYE ÇIKAR"}
            </span>
            <h2>
              {voting
                ? "Her alanda kaç soru olsun?"
                : canPlay
                  ? "En iyi olduğun alanları seç"
                  : "Şampiyon adaylarını bekliyoruz"}
            </h2>
          </div>
        </div>
        {voting ? (
          <>
            <p>
              Çoğunluğun tercihi tüm alanlarda geçerli. Eşitlikte veya hiç oy
              verilmezse 10 soru oynanır.
            </p>
            <div className="tournament-vote-timer">
              <Clock size={18} />
              {seconds > 0
                ? `${seconds} saniye kaldı`
                : "Oylama tamamlanıyor…"}{" "}
              <span>
                {room.voteCount}/{room.playerCount} kişi oy verdi
              </span>
            </div>
            <div className="tournament-vote-options">
              {[5, 10].map((n) => (
                <button
                  key={n}
                  className={room.myVote === n ? "is-selected" : ""}
                  disabled={!canPlay || busy || seconds === 0}
                  onClick={() => action("tournament_vote", { count: n })}
                  aria-pressed={room.myVote === n}
                >
                  <b>{n}</b>
                  <strong>soru / alan</strong>
                  <span>{room.roundTotal * n} soru toplam</span>
                  <small>
                    {room.votes[n]} oy{" "}
                    {room.myVote === n ? "· Senin tercihin ✓" : ""}
                  </small>
                </button>
              ))}
            </div>
            <p className="muted">
              Herkes oy verince veya süre dolunca 3–2–1 ile otomatik başlarız.
            </p>
            {host && (
              <button
                className="btn full"
                disabled={busy || room.voteCount === 0}
                onClick={() => action("tournament_vote_close")}
              >
                <Play size={18} /> Mevcut oylarla başlat
              </button>
            )}
          </>
        ) : (
          <>
            <p>
              {canPlay
                ? "Bir veya birden fazla alan seçebilirsin. Aynı alanı seçenler için tek yarışma yapılır; herkes bütün alanlarda yarışır."
                : "Katılımcılar QR koduyla gelsin, güçlü oldukları alanları seçsin. Seçilen her alan turnuvaya yalnızca bir kez eklenir."}
            </p>
            {canPlay && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  action("tournament_choices", { categories: chosen });
                }}
              >
                <div className="tournament-category-grid">
                  {categories.map((c) => (
                    <label
                      key={c.id}
                      className={chosen.includes(c.id) ? "is-selected" : ""}
                    >
                      <input
                        type="checkbox"
                        checked={chosen.includes(c.id)}
                        disabled={busy}
                        onChange={() =>
                          setChosen(
                            chosen.includes(c.id)
                              ? chosen.filter((id) => id !== c.id)
                              : [...chosen, c.id],
                          )
                        }
                      />
                      <span aria-hidden="true">{c.emoji}</span>
                      <strong>{c.name}</strong>
                    </label>
                  ))}
                </div>
                <button
                  className="btn full"
                  disabled={
                    busy ||
                    chosen.length === 0 ||
                    (!changed && room.myCategories.length > 0)
                  }
                >
                  <Check size={19} />
                  {room.myCategories.length && !changed
                    ? "Alanların kaydedildi"
                    : "Alanlarımı kaydet"}{" "}
                  · {chosen.length} alan
                </button>
              </form>
            )}
            {(host || screen) && (
              <div className="tournament-pin">{room.pin}</div>
            )}
            {host && (
              <>
                <form
                  className="tournament-prize-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    action("tournament_prize", { prize });
                  }}
                >
                  <label className="field">
                    <span>Turnuva ödülü</span>
                    <input
                      required
                      maxLength={200}
                      value={prize}
                      onChange={(e) => setPrize(e.target.value)}
                    />
                  </label>
                  <button
                    className="btn secondary"
                    disabled={busy || !prize.trim() || prize === room.prize}
                  >
                    Ödülü güncelle
                  </button>
                </form>
                <button
                  className="btn full"
                  disabled={
                    busy ||
                    room.playerCount < 2 ||
                    room.readyCount !== room.playerCount ||
                    prize !== room.prize
                  }
                  onClick={() => action("tournament_start")}
                >
                  <Play size={19} /> Turnuvayı başlat · Soru sayısını oylayın
                </button>
                <p className="muted">
                  En az 2 kişi katılıp alanlarını kaydetmeli. Ödül turnuva
                  başladıktan sonra değişmez.
                </p>
              </>
            )}
            {canPlay && room.myCategories.length > 0 && (
              <p className="tournament-ready-note">
                <Check size={19} />{" "}
                {host
                  ? "Alanların hazır! Herkes hazır olunca turnuvayı başlatabilirsin."
                  : "Hazırsın! Kurucu turnuvayı başlatınca 5 veya 10 soruya oy vereceksin."}
              </p>
            )}
          </>
        )}
        <div className="tournament-round-list">
          <h3>
            {voting ? "Turnuvanın alanları" : "Seçilen alanlar"} ·{" "}
            {room.roundTotal}
          </h3>
          {room.rounds.length ? (
            <div>
              {room.rounds.map((id) => (
                <span key={id}>
                  {catById(id).emoji} {catById(id).name}{" "}
                  <small>
                    {room.categoryVotes[id]} kişi seçti · tek yarışma
                  </small>
                </span>
              ))}
            </div>
          ) : (
            <p className="muted">İlk alan seçimini bekliyoruz…</p>
          )}
        </div>
      </section>
      <aside className="tournament-side">
        {(host || screen) && !voting && <QR pin={room.pin} />}
        <h3>
          <Users size={20} /> Katılımcılar{" "}
          <span>
            {voting ? room.voteCount : room.readyCount}/{room.playerCount} hazır
          </span>
        </h3>
        <div className="tournament-participants">
          {room.tournamentParticipants.map((p) => (
            <div key={p.name}>
              <CharacterAvatar id={p.avatar} />
              <span>
                <strong>{p.name}</strong>
                <small>
                  {voting
                    ? p.voted
                      ? "Oyunu verdi ✓"
                      : "Soru sayısını seçiyor…"
                    : p.categories.length
                      ? p.categories.map((id) => catById(id).name).join(" · ")
                      : "Alanlarını seçiyor…"}
                </small>
              </span>
            </div>
          ))}
        </div>
        {!room.playerCount && (
          <p className="muted">İlk şampiyon adayını bekliyoruz.</p>
        )}
        <p className="muted">
          Sorular havuzdan otomatik hazırlanır. Tüm alanlardaki puanlar büyük
          finalde toplanır.
        </p>
      </aside>
    </div>
  );
}
