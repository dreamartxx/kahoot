import React, { useState, useEffect } from "react";
import { Users, Plus, ShieldCheck, Pencil, X, Check } from "lucide-react";
import { api } from "./api";
export default function UserManagement({ currentUser, onUpdate }) {
  const [users, setUsers] = useState([]),
    [editing, setEditing] = useState(null),
    [name, setName] = useState(""),
    [pass, setPass] = useState(""),
    [active, setActive] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [loading, setLoading] = useState(true);
  async function load() {
    try {
      setUsers(await api("users"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  function edit(u) {
    setEditing(u);
    setName(u.username);
    setPass("");
    setActive(u.active);
    setError("");
    setMessage("");
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api(editing?.id ? "user_update" : "user_create", {
        ...(editing?.id ? { id: editing.id, active } : {}),
        username: name,
        ...(pass || !editing?.id ? { password: pass } : {}),
      });
      setMessage(
        editing?.id
          ? "Hesap güncellendi."
          : "Hesap oluşturuldu. Kullanıcı adı ve şifreyle giriş yapabilir.",
      );
      setEditing(null);
      setName("");
      setPass("");
      setActive(true);
      await load();
      onUpdate();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="account-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <Users size={18} /> YÖNETİCİ PANELİ
          </div>
          <h1>Birlikte oyun kuralım.</h1>
          <p>
            Kullanıcı adı ve şifre ver, etkinliklerini kendileri yönetsinler.
          </p>
        </div>
      </div>
      <div className="account-grid">
        <form className="account-form" onSubmit={save}>
          <div className="account-form-title">
            <h2>{editing ? "Hesabı düzenle" : "Yeni kullanıcı"}</h2>
            {editing && (
              <button
                type="button"
                className="icon-btn"
                aria-label="Düzenlemeyi iptal et"
                onClick={() => {
                  setEditing(null);
                  setName("");
                  setPass("");
                  setActive(true);
                  setError("");
                }}
              >
                <X />
              </button>
            )}
          </div>
          <label className="field">
            <span>Kullanıcı adı</span>
            <input
              required
              maxLength={64}
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          {editing?.role !== "owner" && (
            <label className="field">
              <span>
                {editing ? "Yeni şifre (değiştirmek istersen)" : "Şifre"}
              </span>
              <input
                type="password"
                autoComplete="new-password"
                required={!editing}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
              <small>
                {editing
                  ? "Boş bırakırsan mevcut şifre korunur."
                  : "İstediğin uzunlukta belirle; yalnızca boş bırakma."}
              </small>
            </label>
          )}
          {editing?.role === "owner" && (
            <p className="muted">
              Kendi şifreni menüdeki “Şifremi değiştir” bölümünden
              yenileyebilirsin.
            </p>
          )}
          {editing && editing.role !== "owner" && (
            <label className="account-active">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />{" "}
              Hesap aktif
            </label>
          )}
          {error && (
            <p className="account-error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="account-success" role="status">
              <Check size={18} />
              {message}
            </p>
          )}
          <button className="btn full" disabled={busy}>
            {busy
              ? "Kaydediliyor…"
              : editing
                ? "Değişiklikleri kaydet"
                : "Kullanıcı oluştur"}
            {!busy && <Plus size={18} />}
          </button>
          <p className="account-hint">
            <ShieldCheck size={18} /> Yeni kullanıcılar kendi oyunlarını
            yönetir. Soru kütüphanesine ve kullanıcı hesaplarına yalnızca sen
            erişebilirsin.
          </p>
        </form>
        <div className="account-list">
          <h2>
            Hesaplar <span>{users.length}</span>
          </h2>
          {loading ? (
            <p>Hesaplar yükleniyor…</p>
          ) : (
            users.map((u) => (
              <article key={u.id} className="account-row">
                <div className="account-avatar">
                  {u.username.slice(0, 1).toLocaleUpperCase("tr")}
                </div>
                <div className="account-info">
                  <strong>
                    {u.username}
                    {u.id === currentUser.id && <small> · Sen</small>}
                  </strong>
                  <p>
                    {u.role === "owner" ? "Yönetici" : "Etkinlik sunucusu"} ·{" "}
                    {u.active ? "Aktif" : "Pasif"}
                  </p>
                </div>
                <button
                  className="icon-btn"
                  aria-label={`${u.username} hesabını düzenle`}
                  onClick={() => edit(u)}
                >
                  <Pencil size={18} />
                </button>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
