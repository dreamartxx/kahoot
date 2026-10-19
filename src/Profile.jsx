import React from "react";
import {
  LibraryBig,
  ShieldCheck,
  KeyRound,
  Users,
  ChevronRight,
  LogOut,
  CircleHelp,
  Settings,
} from "lucide-react";
import Credits from "./Credits";
import { PwaInstall } from "./PwaInstall";
import { CharacterAvatar } from "./CharacterAvatar";
import ProfileIdentity from "./ProfileIdentity";
import PrivacyLinks from "./PrivacyLinks";
import Preferences from "./Preferences";

export default function Profile({
  user,
  preview = false,
  rooms,
  onPassword,
  onLogout,
  onUsers,
  onLibrary,
  onHelp,
  onEvents,
  onUpdate,
}) {
  const owner = user.role === "owner";
  const open = rooms.filter(
    (r) => !["closed", "finished"].includes(r.phase),
  ).length;
  return (
    <section className="profile-page">
      <div className="profile-heading">
        <span className="eyebrow">SANA AİT BİR ALAN</span>
        <h1>Profil ve ayarlar</h1>
        <p>Hesabın, tercihlerin ve ihtiyacın olan her şey burada.</p>
      </div>
      <section className="profile-identity" aria-label="Hesabım">
        <CharacterAvatar id={user.avatar} />
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
          Admin test görünümünde hesap bilgileri değiştirilemez.
        </p>
      )}
      <ProfileIdentity
        key={user.id}
        user={user}
        preview={preview}
        onUpdate={onUpdate}
      />
      <Preferences />
      <section className="profile-card profile-legal">
        <h2>
          <ShieldCheck size={21} /> Gizlilik ve destek
        </h2>
        <p>Politikalar, hesap silme ve iletişim.</p>
        <PrivacyLinks />
      </section>
      <Credits />
      <div className="profile-sections">
        <section
          className="profile-card profile-settings"
          aria-label="Kullanıcı ayarları"
        >
          <h2>
            <Settings size={21} /> Kullanıcı ayarları
          </h2>
          <button
            className="profile-setting-row"
            disabled={preview || user.authProvider === "google"}
            onClick={onPassword}
          >
            <span className="setting-icon">
              <KeyRound size={21} />
            </span>
            <span>
              <strong>
                {user.authProvider === "google"
                  ? "Google ile bağlı"
                  : "Şifremi değiştir"}
              </strong>
              <small>
                {user.authProvider === "google"
                  ? "Giriş güvenliğini Google hesabından yönet"
                  : "Hesabının giriş şifresini güncelle"}
              </small>
            </span>
            <ChevronRight size={18} />
          </button>
          <button className="profile-setting-row" onClick={onEvents}>
            <span className="setting-icon">
              <LibraryBig size={21} />
            </span>
            <span>
              <strong>Oyunlarım ve geçmişim</strong>
              <small>Açık odaların ve tamamlanan etkinliklerin</small>
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
