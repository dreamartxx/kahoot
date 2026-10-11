import React, { useEffect, useState } from "react";
import {
  Crown,
  Gift,
  Check,
  Play,
  Users,
  Clock,
  LockKeyhole,
  ChevronDown,
} from "lucide-react";
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
          Futbol benden, gezegenler senden! Herkes güçlü olduğu tek bir alanı
          seçsin. Aynı alanlar tek turda birleşsin, puanlar büyük finalde
          buluşsun.
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
  const [chosen, setChosen] = useState(room.myCategories?.[0] || "");
  const [prize, setPrize] = useState(room.prize);
  const saved = (room.myCategories || []).join(",");
  useEffect(() => setChosen(room.myCategories?.[0] || ""), [saved]);
  useEffect(() => setPrize(room.prize), [room.prize]);
  const voting = room.phase === "voting";
  const seconds = Math.max(0, Math.ceil((room.voteUntil || 0) - now));
  const canPlay = !screen && room.me;
  const locked = room.myCategories?.length === 1;
  const duplicateCount = room.categoryVotes[chosen] || 0;
  const selectedCategory = categories.find((c) => c.id === chosen);
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
                  ? "Tek alan. Tek seçim."
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
                ? "Herkes yalnızca bir alan seçer. Seçimini onayladıktan sonra değiştiremezsin. Aynı alanı seçenler tek turda buluşur."
                : "Herkes QR koduyla katılıp tek bir alan seçsin. Aynı alan tekrar seçilirse yeni hak verilmez; o alanda tek tur oynanır."}
            </p>
            {canPlay &&
              (locked ? (
                <div className="tournament-locked-choice" role="status">
                  <span className="chosen-area-emoji" aria-hidden="true">
                    {selectedCategory?.emoji}
                  </span>
                  <div>
                    <small>SEÇİMİN KİLİTLENDİ</small>
                    <strong>{selectedCategory?.name}</strong>
                    <p>
                      {duplicateCount > 1
                        ? `${duplicateCount} kişi aynı alanı seçti. Tek tur oynanacak; yeni seçim hakkı yok.`
                        : "Alanını seçtin. Artık turnuvaya hazırsın."}
                    </p>
                  </div>
                  <LockKeyhole size={20} />
                </div>
              ) : (
                <form
                  className="tournament-choice-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    action("tournament_choices", { categories: [chosen] });
                  }}
                >
                  {room.myCategories?.length > 1 && (
                    <p className="muted">
                      Tek alan kuralı güncellendi. Önceki seçimlerinden birini
                      veya başka bir alanı onayla.
                    </p>
                  )}
                  <label htmlFor="tournament-area">En iyi olduğun alan</label>
                  <div className="tournament-select-wrap">
                    <span aria-hidden="true">
                      {selectedCategory?.emoji || "✨"}
                    </span>
                    <select
                      id="tournament-area"
                      value={chosen}
                      required
                      disabled={busy}
                      onChange={(e) => setChosen(e.target.value)}
                    >
                      <option value="" disabled>
                        Bir alan seç…
                      </option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                          {room.categoryVotes[c.id]
                            ? ` · ${room.categoryVotes[c.id]} kişi seçti`
                            : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={20} aria-hidden="true" />
                  </div>
                  <p className="tournament-choice-hint">
                    {duplicateCount
                      ? `Bu alanı ${duplicateCount} kişi seçti. Sen de seçebilirsin; tek tur olur, ikinci seçim hakkı verilmez.`
                      : "Seçimini onaylayınca kilitlenir. Herkes seçilen tüm alanlarda yarışır."}
                  </p>
                  <button className="btn full" disabled={busy || !chosen}>
                    <LockKeyhole size={18} />
                    {busy ? "Kaydediliyor…" : "Seçimimi onayla"}
                  </button>
                </form>
              ))}
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
                  En az 2 kişi katılıp birer alan seçmeli. Ödül turnuva
                  başladıktan sonra değişmez.
                </p>
              </>
            )}
            {canPlay && locked && (
              <p className="tournament-ready-note">
                <Check size={19} />{" "}
                {host
                  ? "Seçimin hazır! Herkes hazır olunca turnuvayı başlatabilirsin."
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
                      : "Alanını seçiyor…"}
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
