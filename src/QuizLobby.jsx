import React, { useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  LibraryBig,
  Play,
  Plus,
  Radio,
  Users,
} from "lucide-react";
import { CharacterAvatar } from "./CharacterAvatar";
import ModuleGuide from "./ModuleGuide";

/** The pre-game room shares one viewport on mobile, desktop and Android. */
export default function QuizLobby({
  room,
  pin,
  host,
  screen,
  busy,
  QR,
  onJoin,
  onStart,
  onCopy,
  guideMode = "quiz",
}) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(room.players.length / 10));
  const current = Math.min(page, pageCount - 1);
  const inviting = host || screen;
  return (
    <main
      className={`quiz-lobby ${inviting ? "is-presenting" : "is-waiting"}`}
      aria-label="Yarışma paneli"
    >
      <header className="quiz-lobby-heading">
        <div>
          <span className="quiz-lobby-eyebrow">
            <Radio size={14} /> YARIŞMA LOBİSİ
          </span>
          <h1 title={room.title}>{room.title}</h1>
          <div className="quiz-lobby-meta">
            <span>
              <LibraryBig size={14} /> {room.total} soru
            </span>
            <span>
              <Clock size={14} /> {room.seconds} sn
            </span>
            <span>
              <Users size={14} /> En fazla {room.participantLimit || 10} kişi
            </span>
          </div>
        </div>
        {!screen && <ModuleGuide mode={guideMode} compact />}
      </header>

      <div className="quiz-lobby-body">
        {inviting ? (
          <section className="quiz-lobby-invite" aria-label="Oyuna davet et">
            <div className="quiz-lobby-code">
              <span>OYUN KODU</span>
              <strong aria-label={`Oyun kodu: ${pin}`}>
                {pin.split("").map((digit, index) => (
                  <i key={index} aria-hidden="true">
                    {digit}
                  </i>
                ))}
              </strong>
              <p>Kodu paylaş, birlikte başlayın.</p>
              <button className="quiz-lobby-copy" onClick={onCopy}>
                <Copy size={16} /> Bağlantıyı kopyala
              </button>
            </div>
            <div className="quiz-lobby-qr">
              <QR pin={pin} />
              <span>Okut ve katıl</span>
            </div>
          </section>
        ) : (
          <section className="quiz-lobby-ready">
            <span className="quiz-lobby-ready-icon">
              <Check size={32} />
            </span>
            <h2>Yerini aldın, {room.me?.name || "hazır ol"}!</h2>
            <p>Sunucu başlattığında ilk soru bu ekranda açılacak.</p>
          </section>
        )}

        <section className="quiz-lobby-people" aria-label="Katılımcılar">
          <div className="quiz-lobby-people-heading">
            <h2>
              <Users size={18} /> Katılımcılar{" "}
              <b aria-live="polite">{room.playerCount}</b>
            </h2>
            <span className="quiz-lobby-live">
              <i /> Canlı
            </span>
          </div>
          {room.players.length ? (
            <ul className="quiz-lobby-roster">
              {room.players
                .slice(current * 10, current * 10 + 10)
                .map((player, index) => (
                  <li key={player.id || `${player.name}:${index}`}>
                    <CharacterAvatar id={player.avatar} />
                    <span title={player.name}>{player.name}</span>
                    {room.me?.name === player.name && <small>Sen</small>}
                  </li>
                ))}
            </ul>
          ) : (
            <div className="quiz-lobby-empty">
              <span>
                <Users size={30} />
              </span>
              <h3>İlk oyuncu kim olacak?</h3>
              <p>Katılan herkes burada görünecek.</p>
            </div>
          )}
          {pageCount > 1 && (
            <nav
              className="quiz-lobby-roster-nav"
              aria-label="Katılımcı listesi"
            >
              <button
                aria-label="Önceki katılımcılar"
                disabled={current === 0}
                onClick={() => setPage(current - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <span>
                {current + 1} / {pageCount}
              </span>
              <button
                aria-label="Sonraki katılımcılar"
                disabled={current === pageCount - 1}
                onClick={() => setPage(current + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </nav>
          )}
          {host && (
            <div className="quiz-lobby-host">
              {room.me ? (
                <span>
                  <Check size={16} /> Sen de yarışmacısın
                </span>
              ) : (
                <button onClick={onJoin} disabled={busy}>
                  <Plus size={16} /> Ben de yarışacağım
                </button>
              )}
              <a
                href={`#screen/${pin}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Seyirci ekranını aç"
              >
                <ArrowUpRight size={16} />
                <span>Seyirci ekranı</span>
              </a>
            </div>
          )}
        </section>
      </div>

      <footer className="quiz-lobby-launch">
        {host ? (
          <>
            <span>
              {room.playerCount >= 2
                ? "Herkes hazırsa sahne sizin!"
                : "Birlikte başlamak için en az 2 yarışmacı gerekli."}
            </span>
            <button
              className="quiz-lobby-start"
              disabled={busy}
              onClick={onStart}
            >
              <Play size={19} fill="currentColor" />{" "}
              {busy ? "Hazırlanıyor…" : "Yarışmayı başlat"}
            </button>
          </>
        ) : (
          <p role="status">
            <span className="quiz-lobby-pulse" /> Sunucunun başlatması
            bekleniyor…
          </p>
        )}
      </footer>
    </main>
  );
}
