import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, Sparkles, UserRound } from "lucide-react";
import { CharacterAvatar } from "./CharacterAvatar";
import "./join-game.css";

export default function JoinGame({
  room,
  pin,
  modeName,
  name,
  onName,
  profile,
  role,
  onRole,
  busy,
  error,
  onSubmit,
}) {
  const attempted = useRef(false);
  const [joining, setJoining] = useState(false);
  const automatic = !!profile && room.mode !== "family";
  const submit = async (e) => {
    e?.preventDefault();
    setJoining(true);
    try {
      await onSubmit();
    } finally {
      setJoining(false);
    }
  };
  useEffect(() => {
    if (automatic && !attempted.current) {
      attempted.current = true;
      submit();
    }
  }, [automatic]);
  return (
    <main className="join-game" data-screen-fit="true" aria-label="Oyuna katıl">
      <header className="join-game-nav">
        <a href="#">
          <ChevronLeft size={18} /> Geri
        </a>
        <span>
          OYUN KODU <b>{pin}</b>
        </span>
      </header>
      <form className="join-game-card join-game-simple" onSubmit={submit}>
        <header className="join-game-heading">
          <span>
            <Sparkles size={14} /> {modeName}
          </span>
          <h1 title={room.title}>{room.title}</h1>
          <p>
            {profile
              ? "Profilin hazır. Haydi, oyuna!"
              : "Bir isim yeter. Eğlenceye katıl!"}
          </p>
        </header>
        {profile ? (
          <div className="join-game-profile">
            <CharacterAvatar id={profile.avatar} decorative={false} />
            <strong>{profile.username}</strong>
            <p>
              {automatic
                ? joining
                  ? "Profilinle katılıyorsun…"
                  : "Katılımı tekrar deneyebilirsin."
                : "Oyuna profilindeki isim ve simgeyle katılacaksın."}
            </p>
          </div>
        ) : (
          <>
            <div className="join-game-guest-art" aria-hidden="true">
              <UserRound size={48} />
              <Sparkles size={23} />
            </div>
            <label>
              <span>Oyunda görünecek ismin</span>
              <input
                required
                minLength={2}
                maxLength={32}
                placeholder="İsmin veya takma adın"
                value={name}
                onChange={(e) => onName(e.target.value)}
                autoComplete="nickname"
                enterKeyHint="go"
              />
            </label>
            <p className="join-game-auto-hint">
              Simgen senin için otomatik seçilecek.
            </p>
          </>
        )}
        {room.mode === "family" && (
          <label className="join-game-role">
            <span>Ailedeki rolün</span>
            <input
              required
              maxLength={24}
              value={role}
              onChange={(e) => onRole(e.target.value)}
              placeholder="Anne, baba, çocuk, teyze…"
              enterKeyHint="go"
            />
          </label>
        )}
        {error && (
          <p className="join-game-error" role="alert">
            {error}
          </p>
        )}
        <div className="join-game-submit">
          <button disabled={busy || joining || (!profile && !name.trim())}>
            {joining || busy
              ? "Katılıyorsun…"
              : automatic
                ? "Tekrar dene"
                : "Ben de varım!"}
            <ArrowRight size={20} />
          </button>
          <p>
            {profile
              ? "Adını ve simgeni profil ayarlarından değiştirebilirsin."
              : "Kayıt gerekmez. Takma ad kullanabilirsin."}
          </p>
        </div>
      </form>
    </main>
  );
}
