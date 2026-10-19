import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { api } from "./api";
import { CharacterAvatar } from "./CharacterAvatar";
import { characters, characterById } from "./characters";
import "./profile-identity.css";

export default function ProfileIdentity({
  user,
  preview = false,
  onUpdate,
  onboarding = false,
}) {
  const automaticName =
    user.authProvider === "google" &&
    /^oyuncu_[a-f0-9]{10}$/.test(user.username);
  const [username, setUsername] = useState(automaticName ? "" : user.username);
  const [avatar, setAvatar] = useState(
    () =>
      characterById(
        user.avatar ||
          (user.authProvider === "google"
            ? null
            : localStorage.getItem("arena:character")),
      ).id,
  );
  const [page, setPage] = useState(() =>
    Math.floor(
      Math.max(
        0,
        characters.findIndex((c) => c.id === avatar),
      ) / 4,
    ),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const selected = characterById(avatar);
  async function save(e) {
    e.preventDefault();
    if (busy || preview) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const result = await api("profile_update", {
        username: username.trim(),
        avatar,
      });
      onUpdate(result.user);
      setUsername(result.user.username);
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="profile-card identity-editor"
      onSubmit={save}
      aria-label="Kullanıcı adı ve karakter"
    >
      <header>
        <span className="eyebrow">
          <Sparkles size={16} /> SAHNE SENİN
        </span>
        <h2>{onboarding ? "Seni nasıl tanıyalım?" : "Adın ve karakterin"}</h2>
        <p>
          {onboarding
            ? "Oyunda görünecek adını yaz, seni yansıtan karakteri seç."
            : "Kullanıcı adını ve profil simgeni buradan değiştirebilirsin."}
        </p>
      </header>
      <div
        className="identity-preview"
        style={{ "--character-color": selected.color }}
      >
        <CharacterAvatar id={avatar} decorative={false} />
        <div>
          <strong>{username.trim() || "Senin adın"}</strong>
          <span>{selected.name} · Senin oyun stilin</span>
        </div>
      </div>
      <label className="field">
        <span>Kullanıcı adın</span>
        <input
          name="username"
          autoComplete="username"
          maxLength={64}
          required
          value={username}
          disabled={preview || busy}
          placeholder="Örneğin: Deniz"
          autoCapitalize="none"
          spellCheck={false}
          onChange={(e) => {
            setUsername(e.target.value);
            setSaved(false);
            setError("");
          }}
        />
      </label>
      <small>Harf, rakam, nokta, tire veya alt çizgi kullanabilirsin.</small>
      <fieldset disabled={preview || busy} className="identity-characters">
        <legend>
          Karakterini seç <span>20 karakter</span>
        </legend>
        <div className="identity-options">
          {characters.slice(page * 4, page * 4 + 4).map((c) => (
            <button
              type="button"
              key={c.id}
              aria-label={`${c.name} karakterini seç`}
              aria-pressed={avatar === c.id}
              onClick={() => {
                setAvatar(c.id);
                setSaved(false);
              }}
            >
              <CharacterAvatar id={c.id} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
        <div className="identity-pages">
          <button
            type="button"
            aria-label="Önceki karakterler"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ArrowLeft size={18} />
          </button>
          <span aria-live="polite">{page + 1} / 5</span>
          <button
            type="button"
            aria-label="Sonraki karakterler"
            disabled={page === 4}
            onClick={() => setPage((p) => p + 1)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="account-error">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="account-success">
          <Check size={18} /> Profilin kaydedildi.
        </p>
      )}
      <button
        className="btn full"
        disabled={
          preview ||
          busy ||
          !username.trim() ||
          (!onboarding &&
            !user.needsProfileSetup &&
            username.trim() === user.username &&
            avatar === user.avatar)
        }
      >
        {busy
          ? "Kaydediliyor…"
          : onboarding
            ? "Profilimi kaydet, başlayalım"
            : "Profilimi kaydet"}
        <Check size={18} />
      </button>
      <p className="identity-hint">
        {user.authProvider === "google"
          ? "Google ile giriş yapmaya devam edeceksin. "
          : "Sonraki girişinde yeni kullanıcı adını kullan. "}
        Karakterin web ve uygulamada hesabınla birlikte gelir.
      </p>
    </form>
  );
}
