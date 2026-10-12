import React, { useState } from "react";
import {
  LibraryBig,
  UserRound,
  ShieldCheck,
  KeyRound,
  Users,
  ChevronRight,
  LogOut,
  CircleHelp,
  Check,
  Settings,
} from "lucide-react";
import Credits from "./Credits";
import { api } from "./api";
import { PwaInstall } from "./PwaInstall";

export default function Profile({
  user,
  preview = false,
  rooms,
  onPassword,
  onLogout,
  onUsers,
  onLibrary,
  onHelp,
  onUpdate,
}) {
  const [username, setUsername] = useState(user.username);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const owner = user.role === "owner";
  const open = rooms.filter(
    (r) => !["closed", "finished"].includes(r.phase),
  ).length;
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await api("profile_update", { username });
      onUpdate(result.user);
      setUsername(result.user.username);
      setMessage(
        "Kullanıcı adın güncellendi. Sonraki girişinde bu adı kullan.",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="profile-page">
      <div className="profile-heading">
        <span className="eyebrow">SANA AİT BİR ALAN</span>
        <h1>Profil ve ayarlar</h1>
        <p>Hesabın, tercihlerin ve ihtiyacın olan her şey burada.</p>
      </div>
      <section className="profile-identity" aria-label="Hesabım">
        <div className="profile-monogram">
          {user.username.slice(0, 1).toLocaleUpperCase("tr")}
          <span>✦</span>
        </div>
        <div>
          <span className="profile-role">
            <ShieldCheck size={14} />
            {owner ? "Yönetici" : "Etkinlik sunucusu"}
          </span>
          <h2>{user.username}</h2>
          <p>Güzel anların oyun kurucusu.</p>
        </div>
        <div className="profile-stat">
          <strong>{open}</strong>
          <span>{owner ? "Açık etkinlik" : "Açık etkinliğin"}</span>
        </div>
      </section>
      {preview && (
        <p className="notice">
          Admin test görünümünde kullanıcı adı ve şifre değiştirilemez.
        </p>
      )}
      <Credits />
      <div className="profile-grid">
        <form className="profile-card" onSubmit={save}>
          <h2>
            <UserRound size={21} /> Hesap bilgilerin
          </h2>
          <p>
            Giriş yaparken kullandığın kullanıcı adını buradan
            değiştirebilirsin.
          </p>
          <label className="field">
            <span>Kullanıcı adı</span>
            <input
              disabled={preview}
              autoComplete="username"
              name="username"
              required
              maxLength={64}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setMessage("");
              }}
              autoCapitalize="none"
              spellCheck={false}
            />
          </label>
          <small>
            Harf, rakam, nokta, tire veya alt çizgi kullanabilirsin.
          </small>
          {error && (
            <p role="alert" className="account-error">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="account-success">
              <Check size={18} />
              {message}
            </p>
          )}
          <button
            className="btn full"
            disabled={preview || busy || username.trim() === user.username}
          >
            {busy ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
            <Check size={18} />
          </button>
        </form>
        <section
          className="profile-card profile-settings"
          aria-label="Kullanıcı ayarları"
        >
          <h2>
            <Settings size={21} /> Kullanıcı ayarları
          </h2>
          <button
            className="profile-setting-row"
            disabled={preview}
            onClick={onPassword}
          >
            <span className="setting-icon">
              <KeyRound size={21} />
            </span>
            <span>
              <strong>Şifremi değiştir</strong>
              <small>Hesabının giriş şifresini güncelle</small>
            </span>
            <ChevronRight size={18} />
          </button>
          <PwaInstall className="profile-install" />
          <button className="profile-setting-row" onClick={onHelp}>
            <span className="setting-icon mint">
              <CircleHelp size={21} />
            </span>
            <span>
              <strong>Nasıl oynanır?</strong>
              <small>İlk oyununa hızlıca hazırlan</small>
            </span>
            <ChevronRight size={18} />
          </button>
          {owner && (
            <button className="profile-setting-row" onClick={onLibrary}>
              <span className="setting-icon">
                <LibraryBig size={21} />
              </span>
              <span>
                <strong>Soru kütüphanesi</strong>
                <small>Soruları incele ve düzenle</small>
              </span>
              <ChevronRight size={18} />
            </button>
          )}
          {owner && (
            <button className="profile-setting-row" onClick={onUsers}>
              <span className="setting-icon peach">
                <Users size={21} />
              </span>
              <span>
                <strong>Kullanıcı yönetimi</strong>
                <small>Hesap oluştur ve kullanıcıları yönet</small>
              </span>
              <ChevronRight size={18} />
            </button>
          )}
          <button
            className="profile-setting-row profile-logout"
            onClick={onLogout}
          >
            <span className="setting-icon">
              <LogOut size={21} />
            </span>
            <span>
              <strong>Çıkış yap</strong>
              <small>Bu cihazdaki oturumunu kapat</small>
            </span>
            <ChevronRight size={18} />
          </button>
        </section>
      </div>
      {!owner && (
        <p className="profile-privacy">
          <ShieldCheck size={17} /> Bu alanda yalnızca kendi hesap bilgilerini
          görürsün.
        </p>
      )}
    </section>
  );
}
