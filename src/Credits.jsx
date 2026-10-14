import React, { useEffect, useState } from "react";
import { api } from "./api";
import "./credits.css";
const when = (n) =>
  new Date(n * 1000).toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
export default function Credits({ userId, manage = false }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [limits, setLimits] = useState({}),
    [bonus, setBonus] = useState(5),
    [note, setNote] = useState("");
  async function load() {
    try {
      const d = await api("credits", userId ? { userId } : {});
      setData(d);
      setLimits({
        dailyLimit: d.dailyLimit,
        monthlyLimit: d.monthlyLimit,
        participantLimit: d.participantLimit,
        roomLimit: d.roomLimit,
        raffleLimit: d.raffleLimit,
      });
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
    const timer = manage ? null : setInterval(load, 60000);
    addEventListener("arena-credits-changed", load);
    return () => {
      clearInterval(timer);
      removeEventListener("arena-credits-changed", load);
    };
  }, [userId, manage]);
  async function change(action, extra) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api(action, { userId, note, ...extra });
      setMessage("Kredi işlemi kaydedildi.");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="credits-panel"
      aria-label={manage ? "Kredi yönetimi" : "Oyun kredilerim"}
    >
      <div className="credits-heading">
        <span>✦</span>
        <div>
          <small>ÜCRETSİZ AİLE PAKETİ</small>
          <h2>{manage ? "Kredi yönetimi" : "Oyun kredilerim"}</h2>
        </div>
        <button type="button" className="text-btn" onClick={load}>
          Yenile
        </button>
      </div>
      {error && (
        <p role="alert" className="account-error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="account-success">
          {message}
        </p>
      )}
      {data && (
        <>
          {data.preview && (
            <p className="notice">
              Yönetici test görünümü: yaptığın denemeler kullanıcının kredisini
              harcamaz.
            </p>
          )}
          {data.unlimited ? (
            <p className="notice">
              Yönetici test hesabı: kredi ve açık etkinlik sınırı uygulanmaz.
            </p>
          ) : (
            <>
              <div className="credit-balances">
                <div>
                  <small>Bugün kalan</small>
                  <strong>
                    {data.dailyRemaining}
                    <em> / {data.dailyLimit}</em>
                  </strong>
                  <span>{when(data.dailyResetAt)} yenilenir</span>
                </div>
                <div>
                  <small>Bu ay kalan</small>
                  <strong>
                    {data.monthlyRemaining}
                    <em> / {data.monthlyLimit}</em>
                  </strong>
                  <span>{when(data.monthlyResetAt)} yenilenir</span>
                </div>
                <div>
                  <small>Bonus kredi</small>
                  <strong>{data.bonus}</strong>
                  <span>Süresi dolmaz</span>
                </div>
              </div>
              <p>
                <b>Şimdi kullanılabilir: {data.available} kredi.</b>{" "}
                {data.reserved > 0 &&
                  `${data.reserved} kredi turnuva turları için ayrıldı.`}
              </p>
              <p className="muted">
                {data.participantLimit} canlı katılımcı · {data.roomLimit} açık
                etkinlik · çekilişte {data.raffleLimit} isim
              </p>
            </>
          )}
          <details className="credit-rules">
            <summary>Krediler nasıl çalışır?</summary>
            <p>
              Günlük en fazla 5 oyun başlatabilirsin. Web ve uygulama aynı hakları kullanır. Günlük kullanım aylık kotadan da düşer. Günlük haklar birikmez;
              kotalar Türkiye saatiyle gece yarısı ve ayın ilk günü yenilenir.
              Bonus yalnızca aylık haklarını tamamlar; günlük 5 oyun sınırını artırmaz.
            </p>
            <p>
              Bilgi yarışması, aile oyunu, kendini dene, turnuva, çark etkinliği ve kelime bulutu etkinliği 1 kredi. Aynı etkinlikte sonraki çark çevirmeleri veya kelime soruları ek kredi harcamaz. Oda kurmak ve kodla katılmak ücretsiz.
            </p>
            <p>
              Turnuvanın tamamı, kategori sayısından bağımsız olarak 1 oyun hakkıdır. Oyun başlamadan iptal etmek hak harcamaz. Başlayan oyundan ayrılmak hakkı geri vermez. Doğrulanan sistem hatalarını yönetici iade edebilir.
            </p>
            <p>Ödeme veya abonelik yok.</p>
          </details>
          {manage && !data.unlimited && (
            <div className="credit-admin">
              <h3>Hesabın limitleri</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  change("credit_update", limits);
                }}
              >
                <div className="credit-fields">
                  {[
                    ["dailyLimit", "Günlük oyun hakkı", 0, 5],
                    ["monthlyLimit", "Aylık kredi", 0, 100000],
                    ["participantLimit", "Katılımcı sınırı", 1, 300],
                    ["roomLimit", "Açık etkinlik sınırı", 1, 20],
                    ["raffleLimit", "Çekiliş isim sınırı", 1, 2000],
                  ].map(([key, label, min, max]) => (
                    <label className="field" key={key}>
                      <span>{label}</span>
                      <input
                        type="number"
                        required
                        min={min}
                        max={max}
                        value={limits[key] ?? ""}
                        onChange={(e) =>
                          setLimits({
                            ...limits,
                            [key]: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
                <label className="field">
                  <span>İşlem açıklaması (limit, bonus veya iade)</span>
                  <input
                    required
                    minLength={3}
                    maxLength={300}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ör. Aile test kullanımı"
                  />
                </label>
                <button className="btn" disabled={busy}>
                  Limitleri kaydet
                </button>
              </form>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  change("credit_bonus", { amount: bonus });
                }}
              >
                <label className="field">
                  <span>Verilecek bonus kredi</span>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10000}
                    value={bonus}
                    onChange={(e) => setBonus(Number(e.target.value))}
                  />
                </label>
                <button
                  className="btn"
                  disabled={busy || note.trim().length < 3}
                >
                  Bonus ekle
                </button>
              </form>
            </div>
          )}
          <h3>Son kredi hareketleri</h3>
          {!data.history.length ? (
            <p className="muted">Henüz kredi kullanılmadı.</p>
          ) : (
            <ul className="credit-history">
              {data.history.map((e) => (
                <li key={e.id}>
                  <div>
                    <strong>{e.title}</strong>
                    <small>
                      {when(e.createdAt)} ·{" "}
                      {e.state === "reserved"
                        ? "Turnuva için ayrıldı"
                        : ["refunded", "compensated"].includes(e.state)
                          ? "İade edildi"
                          : "Kullanıldı"}
                      {e.note && ` · ${e.note}`}
                    </small>
                  </div>
                  <b>{e.amount} kredi</b>
                  {manage && e.state === "spent" && (
                    <button
                      className="text-btn"
                      disabled={busy || note.trim().length < 3}
                      onClick={() => change("credit_refund", { eventId: e.id })}
                    >
                      İade et
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
