import React, { useState } from "react";
import {
  Crown,
  Gift,
  Users,
  Play,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { categories, catById } from "./api";
import ThemedSelect from "./ThemedSelect";
import ModuleGuide from "./ModuleGuide";
import { CharacterAvatar } from "./CharacterAvatar";
import "./tournament-compact.css";

export default function TournamentCompactLobby({
  room,
  host,
  screen,
  busy,
  now,
  action,
  onJoin,
  onQr,
}) {
  const [chosen, setChosen] = useState("");
  const [page, setPage] = useState(0);
  const [editingPrize, setEditingPrize] = useState(false);
  const [prize, setPrize] = useState(room.prize);
  const voting = room.phase === "voting";
  const canPlay = !screen && !!room.me;
  const locked = room.myCategories?.[0];
  const participants = room.tournamentParticipants || [];
  const pages = Math.max(1, Math.ceil(participants.length / 3));
  const current = Math.min(page, pages - 1);
  const remaining = Math.max(0, Math.ceil((room.voteUntil || 0) - now));
  const ready = room.playerCount >= 2 && room.readyCount === room.playerCount;
  return (
    <section className="tournament-compact" aria-label="Turnuva odası">
      <div className="tc-heading">
        <div>
          <span>
            <Crown size={14} /> TURNUVA ODASI
          </span>
          <h1 title={room.title}>{room.title}</h1>
        </div>
        <ModuleGuide mode="tournament" compact />
      </div>
      <div className="tc-invite">
        <div>
          <small>OYUN KODU</small>
          <strong>{room.pin}</strong>
        </div>
        {(host || screen) && (
          <button type="button" onClick={onQr}>
            QR ile davet et
          </button>
        )}
      </div>
      {editingPrize && host && !voting ? (
        <form
          className="tc-prize-edit"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await action("tournament_prize", { prize }))
              setEditingPrize(false);
          }}
        >
          <input
            aria-label="Turnuva ödülü"
            value={prize}
            required
            maxLength={200}
            onChange={(e) => setPrize(e.target.value)}
          />
          <button className="btn" disabled={busy || !prize.trim()}>
            Kaydet
          </button>
          <button
            type="button"
            className="text-btn"
            onClick={() => setEditingPrize(false)}
          >
            Vazgeç
          </button>
        </form>
      ) : (
        <div className="tc-prize" title={room.prize}>
          <Gift size={18} />
          <span>
            <small>BÜYÜK ÖDÜL</small>
            <strong>{room.prize}</strong>
          </span>
          {host && !voting && (
            <button
              className="text-btn"
              onClick={() => {
                setPrize(room.prize);
                setEditingPrize(true);
              }}
            >
              Düzenle
            </button>
          )}
        </div>
      )}
      <div className="tc-choice">
        {voting ? (
          <>
            <div className="tc-section-title">
              <strong>Her alanda kaç soru?</strong>
              <span>{remaining} sn</span>
            </div>
            <div className="tc-votes">
              {[5, 10].map((n) => (
                <button
                  key={n}
                  disabled={!canPlay || busy || remaining === 0}
                  aria-pressed={room.myVote === n}
                  onClick={() => action("tournament_vote", { count: n })}
                >
                  <b>{n}</b> soru{" "}
                  <small>
                    {room.votes[n]} oy {room.myVote === n ? "· Seçimin ✓" : ""}
                  </small>
                </button>
              ))}
            </div>
          </>
        ) : canPlay ? (
          locked ? (
            <div className="tc-locked">
              <Check size={22} />
              <div>
                <strong>
                  {catById(locked).emoji} {catById(locked).name}
                </strong>
                <p>Alanını seçtin, turnuvaya hazırsın.</p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                action("tournament_choices", { categories: [chosen] });
              }}
            >
              <label htmlFor="compact-tournament-area">
                En iyi olduğun alan
              </label>
              <div className="tc-select">
                <ThemedSelect
                  id="compact-tournament-area"
                  required
                  value={chosen}
                  disabled={busy}
                  onChange={(e) => setChosen(e.target.value)}
                >
                  <option value="" disabled>
                    Alanını seç
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                      {room.categoryVotes[c.id]
                        ? ` · ${room.categoryVotes[c.id]} kişi`
                        : ""}
                    </option>
                  ))}
                </ThemedSelect>
                <button className="btn" disabled={busy || !chosen}>
                  Onayla
                </button>
              </div>
              <p>Tek seçim hakkın var. Ortak alanlar tek turda birleşir.</p>
            </form>
          )
        ) : host ? (
          <button className="tc-join" disabled={busy} onClick={onJoin}>
            <Users size={20} />
            <span>
              Ben de yarışacağım
              <small>Profilindeki isim ve simgeyle katıl</small>
            </span>
            <ChevronRight size={18} />
          </button>
        ) : (
          <p>Katılımcılar alanlarını seçiyor.</p>
        )}
      </div>
      <div className="tc-roster">
        <div className="tc-section-title">
          <strong>
            <Users size={16} /> {room.playerCount} katılımcı
          </strong>
          <span>
            {voting ? room.voteCount : room.readyCount}/{room.playerCount} hazır
          </span>
        </div>
        {participants.length ? (
          <div className="tc-players">
            {participants.slice(current * 3, current * 3 + 3).map((p, i) => (
              <div key={`${p.name}-${i}`}>
                <CharacterAvatar id={p.avatar} />
                <strong title={p.name}>{p.name}</strong>
                <small>
                  {voting
                    ? p.voted
                      ? "Oy verdi ✓"
                      : "Oy bekleniyor"
                    : p.categories.length
                      ? catById(p.categories[0]).name
                      : "Alan seçiyor…"}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p className="tc-empty">Kodu paylaş, ilk rakibini davet et.</p>
        )}
        {pages > 1 && (
          <nav aria-label="Katılımcılar">
            <button
              aria-label="Önceki katılımcılar"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              {current + 1} / {pages}
            </span>
            <button
              aria-label="Sonraki katılımcılar"
              disabled={current === pages - 1}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </nav>
        )}
      </div>
      <footer className="tc-start">
        {host ? (
          <>
            <button
              className="btn full"
              disabled={busy || (voting ? room.voteCount === 0 : !ready)}
              onClick={() =>
                action(voting ? "tournament_vote_close" : "tournament_start")
              }
            >
              <Play size={18} />
              {voting ? "Mevcut oylarla başlat" : "Turnuvayı başlat"}
            </button>
            <p role="status">
              {voting
                ? "Herkes oy verince veya süre dolunca oyun başlar."
                : room.playerCount < 2
                  ? "Başlamak için en az 2 yarışmacı gerekli."
                  : !ready
                    ? "Herkes bir alan seçtiğinde başlayabilirsin."
                    : "Hazırsınız! Önce 5 veya 10 soruya oy verilecek."}
            </p>
          </>
        ) : (
          <p role="status">
            {voting
              ? "Oylar tamamlanınca 3–2–1 ile başlıyoruz."
              : "Kurucu turnuvayı başlatınca oylamaya geçeceğiz."}
          </p>
        )}
      </footer>
    </section>
  );
}
