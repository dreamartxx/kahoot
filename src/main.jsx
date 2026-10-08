import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutGrid,
  Trophy,
  Heart,
  Ticket,
  Cloud,
  LibraryBig,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Search,
  ChevronRight,
  Users,
  Clock,
  Play,
  X,
  Check,
  LogOut,
  Copy,
  Maximize,
  Volume2,
  VolumeX,
  Upload,
  Download,
  Sparkles,
  Radio,
  ShieldCheck,
  RefreshCw,
  ChevronLeft,
  Settings,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import QRCode from "qrcode";
import { api, categories, catById } from "./api";
import { stripHeader } from "./import-utils";
import { bubbleMetrics } from "./cloud-utils";
import { winnerRotation, wheelEase } from "./wheel-utils";
import { flagAssets } from "./flag-assets";
import flagCountries from "../data/flag-countries.json";
import FamilyRoom from "./FamilyRoom";
import { quizTransition } from "./quiz-transition";
import { PwaInstall, PwaNotices } from "./PwaInstall";
import { setupPwa } from "./pwa";
import "./style.css";
const modes = {
  family: { name: "Beni Tanıyor musun?", icon: Heart, color: "rose" },
  quiz: { name: "Bilgi yarışması", icon: Trophy, color: "purple" },
  raffle: { name: "Çekiliş", icon: Ticket, color: "peach" },
  cloud: { name: "Kelime bulutu", icon: Cloud, color: "mint" },
};
const flagNames = Object.fromEntries(
  flagCountries.map(({ code, name }) => [code, name]),
);
function OptionContent({ value, showName = false }) {
  const code = value.startsWith("flag:") ? value.slice(5) : null;
  if (!code || !flagAssets[code]) return value;
  return (
    <span className="flag-option">
      <img
        src={flagAssets[code]}
        alt={`${flagNames[code]} bayrağı`}
        width="160"
        height="120"
      />
      {showName && <span>{flagNames[code]}</span>}
    </span>
  );
}
function Button({ children, secondary = false, className = "", ...p }) {
  return (
    <button
      className={`btn ${secondary ? "secondary" : ""} ${className}`}
      {...p}
    >
      {children}
    </button>
  );
}
function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Modal({ title, onClose, children, wide = false }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    el.showModal();
    const close = (e) => {
      if (e.key === "Escape") onClose();
    };
    el.addEventListener("keydown", close);
    return () => el.removeEventListener("keydown", close);
  }, []);
  return (
    <dialog ref={ref} className={wide ? "wide" : ""} onCancel={onClose}>
      <div className="modal-head">
        <h2>{title}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Kapat">
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function App() {
  const [route, setRoute] = useState(location.hash.slice(1));
  const [tab, setTab] = useState("home");
  const [status, setStatus] = useState({ configured: true, admin: false });
  const [counts, setCounts] = useState({});
  const [rooms, setRooms] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState("");
  const [joining, setJoining] = useState("");
  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 5000);
  };
  async function refresh() {
    try {
      let s = await api("status");
      setStatus(s);
      if (s.configured) {
        setCounts(await api("categories"));
        if (s.admin) setRooms(await api("rooms"));
      }
    } catch (e) {
      notify(e.message);
    }
  }
  useEffect(() => {
    refresh();
    const fn = () => setRoute(location.hash.slice(1));
    addEventListener("hashchange", fn);
    return () => removeEventListener("hashchange", fn);
  }, []);
  const go = (path) => (location.hash = path);
  const create = (mode, cat = "cografya") => {
    if (!status.configured) {
      notify("Önce sunucu kurulumu tamamlanmalı.");
      return;
    }
    setModal(
      status.admin
        ? { type: "create", mode, cat }
        : { type: "login", next: { type: "create", mode, cat } },
    );
  };
  const nav = (id) => {
    setTab(id);
    go("");
    if (id === "library" && !status.admin) setModal({ type: "login" });
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const visibleRooms = rooms.filter(
    (room) =>
      (tab === "home" || room.mode === tab) &&
      (showCompleted || !["finished", "closed"].includes(room.phase)),
  );
  let body;
  if (route === "setup")
    body = (
      <Setup
        notify={notify}
        onDone={() => {
          go("");
          refresh();
        }}
      />
    );
  else if (/^(host|join|screen)\//.test(route)) {
    let [kind, pin] = route.split("/");
    body = (
      <Room
        key={kind + pin}
        kind={kind}
        pin={pin}
        admin={status.admin}
        notify={notify}
        onLogin={() => setModal({ type: "login" })}
        onBack={() => {
          go("");
          refresh();
        }}
      />
    );
  } else
    body = (
      <div className="shell">
        <aside className="sidebar">
          <a className="brand" href="#">
            <span className="brand-icon">
              b<span>✦</span>
            </span>
            <span>
              bilgi<span className="brand-light">arena</span>
              <small>HERKES OYUNA DAHİL.</small>
            </span>
          </a>
          <div className="nav-label">STÜDYONUZ</div>
          <nav>
            {[
              ["home", "Genel bakış", LayoutGrid],
              ["quiz", "Bilgi yarışması", Trophy],
              ["family", "Beni Tanıyor musun?", Heart],
              ["raffle", "Çekiliş", Ticket],
              ["cloud", "Kelime bulutu", Cloud],
              ["library", "Soru kütüphanesi", LibraryBig],
            ].map(([id, label, Icon]) => (
              <button
                className={tab === id ? "active" : ""}
                key={id}
                onClick={() => nav(id)}
              >
                <Icon size={20} />
                {label}
                {tab === id && <span className="nav-dot" />}
              </button>
            ))}
            <PwaInstall />
            {status.admin && (
              <button onClick={() => setModal({ type: "password" })}>
                <Settings size={20} /> Şifremi değiştir
              </button>
            )}
          </nav>
          <div className="sidebar-tip">
            <div className="tip-icon">
              <Sparkles size={24} />
            </div>
            <strong>Bir ekran, bir sürü heyecan.</strong>
            <p>
              Katılımcılar QR’ı okutsun.
              <br />
              Eğlenceye birlikte başlayın.
            </p>
            <button onClick={() => setModal({ type: "how" })}>
              Nasıl çalışır? <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="sidebar-bottom">
            <span className="avatar">{status.admin ? "Y" : "M"}</span>
            <div>
              <b>
                {status.admin ? "Yönetici stüdyosu" : "Merhaba, oyun kurucu!"}
              </b>
              <small>
                {status.admin
                  ? "Etkinlikleriniz hazır"
                  : "Birlikte daha eğlenceli"}
              </small>
            </div>
            <button
              aria-label={status.admin ? "Çıkış yap" : "Yönetici girişi"}
              className="icon-btn"
              onClick={async () => {
                if (status.admin) {
                  await api("logout");
                  setStatus((s) => ({ ...s, admin: false }));
                  setRooms([]);
                } else setModal({ type: "login" });
              }}
            >
              {status.admin ? <LogOut size={17} /> : <Settings size={17} />}
            </button>
          </div>
        </aside>
        <main className="main">
          <header className="topbar">
            <div className="breadcrumb">
              Stüdyo <ChevronRight size={14} />
              <b>
                {tab === "home"
                  ? "Genel bakış"
                  : tab === "library"
                    ? "Soru kütüphanesi"
                    : modes[tab]?.name}
              </b>
            </div>
            <form
              className="join-inline"
              onSubmit={(e) => {
                e.preventDefault();
                if (/^\d{6}$/.test(joining)) go("join/" + joining);
                else notify("6 haneli etkinlik kodunu girin.");
              }}
            >
              <label className="join-label" htmlFor="game-code">
                <strong>
                  Oyuna katıl <span aria-hidden="true">✦</span>
                </strong>
                <span>6 haneli oyun kodunu gir, eğlenceye katıl.</span>
              </label>
              <input
                id="game-code"
                aria-label="Oyun kodu"
                placeholder="6 haneli kod"
                inputMode="numeric"
                autoComplete="off"
                enterKeyHint="go"
                pattern="[0-9]{6}"
                maxLength={6}
                value={joining}
                onChange={(e) => setJoining(e.target.value.replace(/\D/g, ""))}
              />
              <button type="submit">
                Oyuna katıl <ArrowUpRight size={21} />
              </button>
            </form>
          </header>
          <div className="content">
            {!status.configured && (
              <div className="notice">
                <Settings size={18} /> Sunucu bağlantısı kurulum bekliyor.{" "}
                <a href="#setup">Kurulumu aç</a>
              </div>
            )}
            {tab === "library" ? (
              <Library admin={status.admin} notify={notify} refresh={refresh} />
            ) : (
              <>
                <section className="page-heading">
                  <div>
                    <div className="eyebrow">
                      <span className="small-spark">✦</span> BİRLİKTE DAHA
                      EĞLENCELİ
                    </div>
                    <h1>
                      {tab === "home"
                        ? "Sıradaki güzel anı başlat."
                        : tab === "quiz"
                          ? "Bilgiyi heyecana dönüştür."
                          : tab === "raffle"
                            ? "Biraz şans, bolca heyecan."
                            : tab === "family"
                              ? "Aynı ev, kaç küçük sır?"
                              : "Herkesin fikri burada büyür."}
                    </h1>
                    <p>
                      {tab === "home"
                        ? "Yarış, şansını dene, fikrini paylaş. Bugün ne oynuyoruz?"
                        : tab === "quiz"
                          ? "Bir konu seç, QR kodunu paylaş. Geri sayım başlasın."
                          : tab === "raffle"
                            ? "İsimleri ekle, çarkı döndür. Sürpriz kimin için?"
                            : tab === "family"
                              ? "Aileni ne kadar tanıyorsun? Birlikte keşfedin, birlikte gülün."
                              : "Sorunu sor. Aynı kelimeler buluştukça balonlar büyüsün."}
                    </p>
                  </div>
                  {tab === "quiz" ? (
                    <Button
                      className="quiz-create-button"
                      onClick={() => create("quiz")}
                    >
                      <Plus size={19} /> Bilgi yarışması oluştur
                    </Button>
                  ) : (
                    <span className="live-badge">
                      <i /> Etkileşimli etkinlik stüdyosu
                    </span>
                  )}
                </section>
                {tab === "home" && (
                  <section className="hero">
                    <div className="hero-copy">
                      <span className="pill">
                        <Sparkles size={14} /> BİLGİ, HEYECAN, BİRAZ DA REKABET
                      </span>
                      <h2>
                        Telefonlar hazırsa,
                        <br />
                        <span>sahne sizin.</span>
                      </h2>
                      <p>
                        Bir QR koduyla herkesi oyuna dahil et.
                        <br />
                        En güzel cevaplar, en büyük alkışlar burada.
                      </p>
                      <Button onClick={() => create("quiz")}>
                        Yarışma oluştur <ArrowUpRight size={18} />
                      </Button>
                      <div className="hero-foot">
                        <span className="mini-avatars">
                          🙋🏻‍♀️<span>👨🏽‍🚀</span>
                          <span>👩🏼‍🎤</span>
                        </span>
                        <span>Uygulama indirmeden, hep birlikte.</span>
                      </div>
                    </div>
                    <div className="hero-art" aria-hidden="true">
                      <span className="art-star star-a">✦</span>
                      <span className="art-star star-b">✧</span>
                      <span className="orbit" />
                      <div className="art-card card-back">
                        <span>OYUNA HAZIR MISIN?</span>
                        <div className="fake-code">6 2 4 8 1 0</div>
                        <div className="fake-people">● ● ● ● ●</div>
                      </div>
                      <div className="trophy-art">🏆</div>
                      <div className="float-label label-top">
                        <span className="green-check">✓</span> Doğru cevap!
                      </div>
                      <div className="float-label label-bottom">
                        <span>⚡</span> +1.000 puan
                      </div>
                      <span className="art-dot dot-a" />
                      <span className="art-dot dot-b" />
                      <div className="tiny-shape">▲</div>
                    </div>
                  </section>
                )}
                {tab === "home" && (
                  <>
                    <div className="section-heading">
                      <h2>Dört farklı yol, aynı heyecan.</h2>
                      <span>Bir modül seç, anı paylaş</span>
                    </div>
                    <section className="module-grid">
                      {Object.entries(modes).map(([id, m]) => {
                        const Icon = m.icon;
                        return (
                          <button
                            key={id}
                            className={"module-card " + m.color}
                            onClick={() => nav(id)}
                          >
                            <div className="module-top">
                              <span className="module-icon">
                                <Icon size={25} />
                              </span>
                              <ArrowUpRight size={21} />
                            </div>
                            <h3>{m.name}</h3>
                            <p>
                              {id === "quiz"
                                ? "Bilgiler yarışsın, skorlar konuşsun."
                                : id === "raffle"
                                  ? "Çark dönsün, şansını konuştur."
                                  : id === "family"
                                    ? "Aileni tanı, küçük sürprizleri keşfet."
                                    : "Fikirler buluşsun, kelimeler büyüsün."}
                            </p>
                            <span className="module-tag">
                              {id === "quiz"
                                ? `${categories.length} konu · 10 soruluk turlar`
                                : id === "raffle"
                                  ? "Manuel liste veya Excel"
                                  : id === "family"
                                    ? "50 soruluk havuz · Her oyunda 10 soru"
                                    : "Canlı katılım · Ortak fikirler"}
                            </span>
                          </button>
                        );
                      })}
                    </section>
                  </>
                )}
                {(tab === "home" || tab === "quiz") && (
                  <>
                    <div className="section-heading topics-heading">
                      <div>
                        <h2>Merak ettiğin konuyu seç.</h2>
                        <p>
                          Genişleyen soru havuzları. Her turda yeni bir meydan
                          okuma.
                        </p>
                      </div>
                      <div className="search">
                        <Search size={17} />
                        <input
                          aria-label="Konu ara"
                          placeholder="Konu ara..."
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="category-grid">
                      {categories
                        .filter((c) =>
                          c.name
                            .toLocaleLowerCase("tr")
                            .includes(filter.toLocaleLowerCase("tr")),
                        )
                        .map((c) => (
                          <button
                            key={c.id}
                            className="category-card"
                            onClick={() => create("quiz", c.id)}
                          >
                            <div
                              className="category-illustration"
                              style={{ background: c.color }}
                            >
                              <span>{c.emoji}</span>
                              <span className="category-count">
                                {counts[c.id] ?? c.count} soru
                              </span>
                              <span className="deco-ring" />
                            </div>
                            <div className="category-text">
                              <h3>
                                {c.name}
                                <ArrowUpRight size={17} />
                              </h3>
                              <p>{c.desc}</p>
                              <div>
                                <Clock size={12} />
                                10 soruluk yarışma
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                    {!categories.some((c) =>
                      c.name
                        .toLocaleLowerCase("tr")
                        .includes(filter.toLocaleLowerCase("tr")),
                    ) && (
                      <div className="empty">Bu aramayla eşleşen konu yok.</div>
                    )}
                  </>
                )}
                {tab === "family" && (
                  <section className="family-intro">
                    <div>
                      <span className="eyebrow">BENİ TANIYOR MUSUN?</span>
                      <h2>
                        En sevdiği yemeği
                        <br />
                        bildiğine emin misin?
                      </h2>
                      <p>
                        Yemekten müziğe, tatilden hobilere 50 soru. Her oyunda
                        farklı 10 soruyla bakalım aileyi en iyi kim tanıyor?
                      </p>
                      <Button onClick={() => create("family")}>
                        <Heart size={19} /> Aile yarışması oluştur
                      </Button>
                      <div className="family-steps">
                        <span>
                          <b>01</b> 50 sorudan seçilen 10 cevap
                        </span>
                        <span>
                          <b>02</b> Ailenden karışık sorular
                        </span>
                        <span>
                          <b>03</b> Kim kimi tanıyor?
                        </span>
                      </div>
                    </div>
                    <div className="family-intro-art" aria-hidden="true">
                      <span className="family-art-heart">♥</span>
                      <div className="family-art-house">🏡</div>
                      <div className="family-art-note note-one">
                        Babamın favorisi? 🍝
                      </div>
                      <div className="family-art-note note-two">
                        Annem hangi rengi sever? 💜
                      </div>
                      <div className="family-art-caption">
                        Birbirimizi yeniden keşfediyoruz.
                      </div>
                    </div>
                  </section>
                )}
                {tab === "raffle" && (
                  <section className="feature-stage peach">
                    <div>
                      <span className="eyebrow">ŞANS SAHNEYE ÇIKIYOR</span>
                      <h2>
                        Heyecanı biraz
                        <br />
                        döndürelim.
                      </h2>
                      <p>
                        İsimleri elle ekle veya Excel’den yükle.
                        <br />
                        Kocaman çark dönsün, heyecan büyüsün.
                        <br />
                        Durduğunda kazananı hep birlikte alkışlayalım.
                      </p>
                      <Button onClick={() => create("raffle")}>
                        Çekiliş oluştur <Plus size={18} />
                      </Button>
                      <small>
                        Tekrarsız kazananlar · QR ile katılım · .xlsx ve .csv
                      </small>
                    </div>
                    <RaffleWheel
                      room={{
                        entryCount: 32,
                        draw: null,
                        serverTime: Date.now() / 1000,
                      }}
                      preview
                    />
                  </section>
                )}
                {tab === "cloud" && (
                  <section className="feature-stage mint">
                    <div>
                      <span className="eyebrow">HER FİKİR BİR RENK</span>
                      <h2>
                        Küçük kelimeler.
                        <br />
                        Büyük bir resim.
                      </h2>
                      <p>
                        Bir soru sor, cevapları canlı izle.
                        <br />
                        Aynı kelimeyi yazan kişi sayısı arttıkça
                        <br />
                        balon da büyüsün.
                      </p>
                      <Button onClick={() => create("cloud")}>
                        Kelime bulutu oluştur <Plus size={18} />
                      </Button>
                      <small>
                        Kişi başına 3 kelime · Canlı sayaç · Türkçe uyumlu
                      </small>
                    </div>
                    <div className="cloud-preview">
                      <WordCloud
                        words={[
                          { text: "heyecan", count: 24 },
                          { text: "birlikte", count: 18 },
                          { text: "keşif", count: 12 },
                          { text: "eğlence", count: 20 },
                          { text: "merak", count: 9 },
                          { text: "ilham", count: 6 },
                        ]}
                      />
                      <small>Örnek görünüm</small>
                    </div>
                  </section>
                )}
                {status.admin && (
                  <section className="recent">
                    <div className="section-heading recent-heading">
                      <h2>Etkinliklerin</h2>
                      <label className="completed-toggle">
                        <input
                          type="checkbox"
                          checked={showCompleted}
                          onChange={(event) =>
                            setShowCompleted(event.target.checked)
                          }
                        />
                        Tamamlananları göster
                      </label>
                      <button className="text-btn" onClick={refresh}>
                        <RefreshCw size={14} /> Yenile
                      </button>
                    </div>
                    {visibleRooms.length ? (
                      visibleRooms.map((r) => (
                        <button
                          className="room-row"
                          key={r.pin}
                          onClick={() => go("host/" + r.pin)}
                        >
                          <span className={"room-icon " + modes[r.mode].color}>
                            {React.createElement(modes[r.mode].icon, {
                              size: 20,
                            })}
                          </span>
                          <div>
                            <b>{r.title}</b>
                            <small>
                              {modes[r.mode].name} · Kod: {r.pin}
                            </small>
                          </div>
                          <span className="room-status">
                            {["finished", "closed"].includes(r.phase)
                              ? "Tamamlandı"
                              : "Açık"}
                          </span>
                          <span>
                            <Users size={15} /> {r.playerCount}
                          </span>
                          <ChevronRight size={18} />
                        </button>
                      ))
                    ) : (
                      <div className="empty">
                        {showCompleted
                          ? "Henüz etkinlik yok. Yeni bir etkinlik oluşturarak başlayabilirsin."
                          : "Açık etkinlik yok. Yeni bir etkinlik oluşturabilir veya tamamlananları gösterebilirsin."}
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
            <footer>
              <span>
                bilgi arena <span className="footer-dot">✦</span> Güzel anlar
                birlikte başlar.
              </span>
              <span>
                {total || categories.reduce((sum, c) => sum + c.count, 0)} soru{" "}
                <i>·</i> {categories.length} konu <i>·</i> Sonsuz merak
              </span>
            </footer>
          </div>
        </main>
      </div>
    );
  return (
    <>
      {body}
      <PwaNotices />
      {toast && (
        <div role="status" className="toast">
          <AlertCircle size={18} />
          {toast}
        </div>
      )}
      {modal?.type === "login" && (
        <Login
          onClose={() => setModal(null)}
          onDone={() => {
            refresh();
            setStatus((s) => ({ ...s, admin: true }));
            setModal(modal.next || null);
          }}
          notify={notify}
        />
      )}{" "}
      {modal?.type === "password" && (
        <ChangePassword onClose={() => setModal(null)} notify={notify} />
      )}
      {modal?.type === "create" && (
        <Create
          mode={modal.mode}
          initialCat={modal.cat}
          onClose={() => setModal(null)}
          onDone={(r) => {
            setModal(null);
            go("host/" + r.pin);
          }}
          notify={notify}
        />
      )}{" "}
      {modal?.type === "how" && (
        <Modal title="Herkes oyuna dahil." onClose={() => setModal(null)}>
          <div className="how-steps">
            {[
              [
                "01",
                "Etkinliğini oluştur",
                "Yarışma, çekiliş veya kelime bulutunu seç.",
              ],
              [
                "02",
                "QR kodunu paylaş",
                "Katılımcılar telefonlarından isimleriyle katılsın.",
              ],
              [
                "03",
                "Ekranı büyüt, eğlenceyi başlat",
                "Sunucu ekranını yansıt. Cevapları, skorları ve sürprizleri canlı takip et.",
              ],
            ].map(([n, t, p]) => (
              <div key={n}>
                <span>{n}</span>
                <section>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </section>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
function Login({ onClose, onDone, notify }) {
  const [pass, setPass] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <Modal title="Stüdyona hoş geldin" onClose={onClose}>
      <p className="muted">
        Etkinlik oluşturmak ve soruları yönetmek için giriş yap.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await api("login", { password: pass });
            onDone();
          } catch (e) {
            notify(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Yönetici şifresi">
          <input
            autoFocus
            type="password"
            autoComplete="current-password"
            required
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
        </Field>
        <Button disabled={busy} className="full">
          {busy ? "Giriş yapılıyor…" : "Stüdyoya gir"} <ArrowRight size={18} />
        </Button>
      </form>
    </Modal>
  );
}
function ChangePassword({ onClose, notify }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Modal title="Şifremi değiştir" onClose={onClose}>
      <p className="muted">
        Şifreni istediğin uzunlukta belirle. Yalnızca boş bırakma.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await api("password_change", { currentPassword, newPassword });
            notify("Şifren değiştirildi. Diğer yönetici oturumları kapatıldı.");
            onClose();
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Mevcut şifren">
          <input
            autoFocus
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </Field>
        <Field label="Yeni şifren">
          <input
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Field>
        {error && <p role="alert">{error}</p>}
        <Button className="full" disabled={busy}>
          {busy ? "Kaydediliyor…" : "Şifreyi güncelle"} <Check size={18} />
        </Button>
      </form>
    </Modal>
  );
}
function Create({ mode, initialCat, onClose, onDone, notify }) {
  const [cat, setCat] = useState(initialCat),
    [title, setTitle] = useState(
      mode === "quiz"
        ? catById(initialCat).name + " Yarışması"
        : mode === "raffle"
          ? "Şanslı Anlar"
          : mode === "family"
            ? "Bizim Aile"
            : "Fikirler Buluşuyor",
    ),
    [seconds, setSeconds] = useState(mode === "family" ? 45 : 20),
    [prompt, setPrompt] = useState("Bugünü tek kelimeyle anlat!"),
    [busy, setBusy] = useState(false),
    [manual, setManual] = useState(false),
    [qs, setQs] = useState([]),
    [selected, setSelected] = useState([]);
  useEffect(() => {
    if (manual)
      api("questions", { category: cat })
        .then(setQs)
        .catch((e) => notify(e.message));
    setSelected([]);
  }, [manual, cat]);
  return (
    <Modal
      title={modes[mode].name + " oluştur"}
      onClose={onClose}
      wide={manual}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            onDone(
              await api("create", {
                mode,
                title,
                category: cat,
                seconds: Number(seconds),
                prompt,
                questionIds: manual ? selected : [],
              }),
            );
          } catch (e) {
            notify(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Etkinlik adı">
          <input
            autoFocus
            required
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        {mode === "quiz" && (
          <>
            <div className="form-grid">
              <Field label="Konu">
                <select value={cat} onChange={(e) => setCat(e.target.value)}>
                  {categories.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Soru başına süre">
                <select
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                >
                  {[10, 15, 20, 30, 45, 60, 90].map((n) => (
                    <option value={n} key={n}>
                      {n} saniye
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <label className="check-row">
              <input
                type="checkbox"
                checked={manual}
                onChange={(e) => setManual(e.target.checked)}
              />{" "}
              Soruları kendim seçmek istiyorum
            </label>
            {manual ? (
              <>
                <p className="muted">{selected.length}/10 soru seçildi</p>
                <div className="question-pick">
                  {qs.map((q) => (
                    <label key={q.id}>
                      <input
                        type="checkbox"
                        checked={selected.includes(q.id)}
                        disabled={
                          selected.length === 10 && !selected.includes(q.id)
                        }
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, q.id]
                              : selected.filter((id) => id !== q.id),
                          )
                        }
                      />
                      {q.text}
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <div className="info-box">
                <Sparkles size={20} />
                <span>
                  Havuzdan 10 soru seçilir. Kullanılmamış sorulara öncelik
                  verilir; havuz tamamlanınca en eski sorular yeniden gelir.
                </span>
              </div>
            )}
          </>
        )}
        {mode === "family" && (
          <>
            <div className="info-box">
              <Heart size={24} />
              <span>
                50 soruluk havuzdan 10 soru seçilir. Herkes adını ve ailedeki
                rolünü yazar, o oyun için seçilen aynı soruları kendisi için
                cevaplar. Herkes hazır olunca dört şıklı aile yarışması başlar.
                En az 2 kişiyle oynanır.
              </span>
            </div>
            <Field label="Soru başına süre">
              <select
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
              >
                {[15, 30, 45, 60, 90].map((n) => (
                  <option key={n} value={n}>
                    {n} saniye
                  </option>
                ))}
              </select>
            </Field>
            <p className="muted">
              Her aile üyesi için 10 soru sorulur. Doğru cevap 100 puan; kendi
              sorunu cevaplayamazsın.
            </p>
          </>
        )}
        {mode === "cloud" && (
          <Field label="Katılımcılara sorun">
            <textarea
              required
              maxLength={200}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </Field>
        )}
        {mode === "raffle" && (
          <div className="info-box">
            <Ticket size={22} />
            <span>
              Etkinliği oluşturduktan sonra isimleri ekleyebilir, Excel
              yükleyebilir veya QR ile katılım alabilirsin.
            </span>
          </div>
        )}
        <Button
          className="full"
          disabled={busy || (manual && selected.length !== 10)}
        >
          {busy ? "Hazırlanıyor…" : "Etkinliği oluştur"}{" "}
          <ArrowRight size={18} />
        </Button>
      </form>
    </Modal>
  );
}
function QR({ pin }) {
  const [src, setSrc] = useState("");
  const url = location.origin + "/#join/" + pin;
  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 240,
      margin: 2,
      color: { dark: "#26203f", light: "#ffffff" },
    }).then(setSrc);
  }, [url]);
  return (
    <div className="qr">
      <img src={src || undefined} alt="Etkinliğe katılmak için QR kod" />
      <span>Telefonunun kamerasıyla okut</span>
    </div>
  );
}
function Room({ kind, pin, admin, onLogin, onBack, notify }) {
  const [room, setRoom] = useState(null),
    [error, setError] = useState(""),
    [token, setToken] = useState(
      () => localStorage.getItem("arena:" + pin) || "",
    ),
    [name, setName] = useState(""),
    [role, setRole] = useState(""),
    [busy, setBusy] = useState(false),
    [tick, setTick] = useState(Date.now()),
    [qr, setQr] = useState(false),
    [sound, setSound] = useState(false);
  const host = kind === "host" && admin,
    screen = kind === "screen",
    offset = useRef(0),
    lastTick = useRef(null),
    audioCtx = useRef(null);
  const load = async () => {
    try {
      const r = await api("room", { pin }, token);
      offset.current = r.serverTime - Date.now() / 1000;
      setRoom(r);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    let dead = false;
    async function poll() {
      let delay = 1400;
      try {
        const r = await api("room", { pin }, token);
        if (
          ["quiz", "family"].includes(r.mode) &&
          (r.phase === "countdown" ||
            r.phase === "reveal" ||
            (r.phase === "question" && r.deadline - r.serverTime < 5))
        )
          delay = 300;
        if (!dead) {
          offset.current = r.serverTime - Date.now() / 1000;
          setRoom(r);
          setError("");
        }
      } catch (e) {
        if (!dead) setError(e.message);
      }
      if (!dead) timeout = setTimeout(poll, delay);
    }
    let timeout;
    poll();
    const t = setInterval(() => setTick(Date.now()), 200);
    return () => {
      dead = true;
      clearTimeout(timeout);
      clearInterval(t);
    };
  }, [pin, token]);
  const now = tick / 1000 + offset.current;
  const left = Math.max(0, Math.ceil((room?.deadline || 0) - now));
  const transition = quizTransition(room, now);
  const isTransitioning = !!transition;
  useEffect(() => {
    if (!isTransitioning) return;
    setQr(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isTransitioning]);
  useEffect(() => {
    if (
      sound &&
      room?.phase === "question" &&
      left > 0 &&
      left <= 5 &&
      lastTick.current !== left
    ) {
      lastTick.current = left;
      const ctx = audioCtx.current;
      if (ctx) {
        const o = ctx.createOscillator(),
          g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = left === 1 ? 880 : 600;
        g.gain.value = 0.08;
        o.start();
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        o.stop(ctx.currentTime + 0.13);
      }
    }
  }, [left, sound, room?.phase]);
  async function action(a, data = {}) {
    setBusy(true);
    try {
      const r = await api(a, { pin, ...data }, token);
      setRoom(r);
      offset.current = r.serverTime - Date.now() / 1000;
      return true;
    } catch (e) {
      notify(e.message);
      await load();
      return false;
    } finally {
      setBusy(false);
    }
  }
  const closed = room && ["finished", "closed"].includes(room.phase);
  const join = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api("join", {
        pin,
        name,
        ...(room.mode === "family" ? { role } : {}),
      });
      localStorage.setItem("arena:" + pin, r.token);
      setToken(r.token);
      setRoom(r.room);
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (!room)
    return (
      <div className="center-page">
        <span className="brand-icon">b✦</span>
        <h2>{error || "Etkinlik hazırlanıyor…"}</h2>
        <Button secondary onClick={onBack}>
          Stüdyoya dön
        </Button>
      </div>
    );
  if (kind === "host" && !admin)
    return (
      <div className="center-page">
        <ShieldCheck size={48} />
        <h1>Sunucu ekranı</h1>
        <p>Bu etkinliği yönetmek için giriş yap.</p>
        <Button onClick={onLogin}>Yönetici girişi</Button>
        <Button secondary onClick={onBack}>
          Geri dön
        </Button>
      </div>
    );
  if (
    kind === "join" &&
    !room.me &&
    !closed &&
    room.mode === "family" &&
    room.phase !== "lobby"
  )
    return (
      <div className="center-page">
        <Heart size={48} />
        <h1>Bu aile yarışı başladı.</h1>
        <p>Bir sonraki oyunda aramıza katılabilirsin.</p>
        <Button secondary onClick={onBack}>
          Stüdyoya dön
        </Button>
      </div>
    );
  if (kind === "join" && !room.me && !closed)
    return (
      <div className="join-page">
        <a href="#" className="join-brand">
          ✦ bilgi arena
        </a>
        <div className="join-card">
          <div className={"big-mode " + modes[room.mode].color}>
            {React.createElement(modes[room.mode].icon, { size: 35 })}
          </div>
          <span className="eyebrow">
            {modes[room.mode].name.toLocaleUpperCase("tr")}
          </span>
          <h1>{room.title}</h1>
          <p>Sen de oyuna dahil ol!</p>
          <div className="pin-chip">
            Oyun kodu <b>{pin}</b>
          </div>
          <form onSubmit={join}>
            <Field label="Oyunda görünecek ismin">
              <input
                autoFocus
                required
                minLength={2}
                maxLength={32}
                placeholder="Bir isim ya da takma ad"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            {room.mode === "family" && (
              <Field label="Ailedeki rolün">
                <input
                  required
                  maxLength={24}
                  list="family-roles"
                  placeholder="Anne, baba, çocuk, teyze…"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
                <datalist id="family-roles">
                  {[
                    "Anne",
                    "Baba",
                    "Çocuk",
                    "Hala",
                    "Teyze",
                    "Dede",
                    "Nine",
                    "Amca",
                    "Dayı",
                    "Kuzen",
                    "Kardeş",
                  ].map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </Field>
            )}
            <Button className="full" disabled={busy}>
              {busy ? "Katılıyorsun…" : "Ben de varım!"}{" "}
              <ArrowRight size={18} />
            </Button>
          </form>
          <small>
            İsmin etkinlik ekranında görünür. Takma ad kullanabilirsin.
          </small>
          {error && <p role="alert">{error}</p>}
        </div>
        <span className="join-footer">
          Uygulama indirmeden de oyuna katılabilirsin.
        </span>
        <PwaInstall className="pwa-join-install" />
      </div>
    );
  return (
    <div
      className={"event-page " + (host || screen ? "presenter" : "participant")}
    >
      <header className="event-header">
        <button className="text-btn" onClick={onBack}>
          <ChevronLeft size={19} /> Stüdyo
        </button>
        <a href="#" className="event-brand">
          ✦ bilgi arena
        </a>
        <div className="event-tools">
          <span className="pin-chip">
            KOD <b>{pin}</b>
          </span>
          {(host || screen) && (
            <>
              <button
                className="icon-btn"
                aria-label="QR kodunu göster"
                onClick={() => setQr(true)}
              >
                <Users size={20} />
              </button>
              <button
                className="icon-btn"
                aria-label="Tam ekran"
                onClick={() => {
                  if (document.fullscreenElement) document.exitFullscreen?.();
                  else document.documentElement.requestFullscreen?.();
                }}
              >
                <Maximize size={20} />
              </button>
              <button
                className="icon-btn"
                aria-label={sound ? "Sesi kapat" : "Sesi aç"}
                onClick={() => {
                  if (!sound) {
                    audioCtx.current ??= new AudioContext();
                    audioCtx.current.resume();
                  }
                  setSound(!sound);
                }}
              >
                {sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
            </>
          )}
        </div>
      </header>
      {error && (
        <div className="notice danger">Bağlantı bekleniyor: {error}</div>
      )}
      <div className="event-title">
        <span className="eyebrow">
          <Radio size={15} /> {modes[room.mode].name}
        </span>
        <h1>{room.title}</h1>
        <span>
          <Users size={16} />{" "}
          {room.mode === "raffle" ? room.entryCount : room.playerCount}{" "}
          katılımcı{" "}
          {room.me && (
            <>
              {" "}
              · Merhaba, <b>{room.me.name}</b>
            </>
          )}
        </span>
      </div>
      {room.phase === "closed" ? (
        <div className="center-card">
          <CheckCircle2 size={55} />
          <h2>Güzel bir etkinlikti!</h2>
          <p>Katıldığın için teşekkürler.</p>
        </div>
      ) : transition ? (
        <section
          className="question-countdown fullscreen-countdown"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="countdown-orbit orbit-one" aria-hidden="true" />
          <div className="countdown-orbit orbit-two" aria-hidden="true" />
          <span className="countdown-spark spark-one" aria-hidden="true">
            ✦
          </span>
          <span className="countdown-spark spark-two" aria-hidden="true">
            ✧
          </span>
          <p>SIRADAKİ SORU GELİYOR</p>
          {transition.number > 0 ? (
            <strong key={transition.number}>{transition.number}</strong>
          ) : (
            <strong
              className="countdown-loading"
              aria-label="Yeni soru yükleniyor"
            >
              ✦
            </strong>
          )}
          <span>
            Soru {transition.next} / {room.total}
          </span>
          <small>
            {transition.number
              ? "Hazır ol, yeni soruya otomatik geçiyoruz."
              : "Yeni soru yükleniyor…"}
          </small>
        </section>
      ) : room.mode === "family" ? (
        <FamilyRoom
          room={room}
          host={host}
          screen={screen}
          action={action}
          busy={busy}
          left={left}
          QR={QR}
        />
      ) : room.mode === "quiz" ? (
        <>
          {room.phase === "lobby" ? (
            <div className="lobby-layout">
              <section className="lobby-main">
                <div className="big-emoji">{catById(room.category).emoji}</div>
                <h2>
                  {host || screen
                    ? "Herkes burada mı?"
                    : "Yerini aldın. Hazır ol!"}
                </h2>
                <p>
                  {host || screen
                    ? "QR’ı okut, ismini yaz, heyecana katıl."
                    : "Sunucu yarışmayı başlattığında ilk soru burada belirecek."}
                </p>
                <div className="lobby-meta">
                  <span>
                    <LibraryBig size={18} /> 10 soru
                  </span>
                  <span>
                    <Clock size={18} /> {room.seconds} saniye
                  </span>
                </div>
                {(host || screen) && (
                  <div className="lobby-pin">
                    {pin.split("").map((c, i) => (
                      <span key={i}>{c}</span>
                    ))}
                  </div>
                )}
                {host && (
                  <Button
                    disabled={busy || !room.playerCount}
                    onClick={() =>
                      action("advance", {
                        expectedIndex: room.index,
                        expectedPhase: room.phase,
                      })
                    }
                  >
                    <Play size={18} /> Yarışmayı başlat
                  </Button>
                )}
                <div className="player-chips">
                  {room.players.map((p, i) => (
                    <span key={p.name}>
                      <i
                        style={{
                          background: [
                            "#e6dcff",
                            "#dcf0da",
                            "#ffead1",
                            "#ffe0e5",
                          ][i % 4],
                        }}
                      >
                        {["🦊", "🐼", "🐸", "🐯", "🐨"][i % 5]}
                      </i>
                      {p.name}
                    </span>
                  ))}
                </div>
                {!room.playerCount && (
                  <span className="muted">İlk katılımcını bekliyorsun…</span>
                )}
              </section>
              {(host || screen) && (
                <section className="lobby-qr">
                  <QR pin={pin} />
                  <h3>Birlikte daha eğlenceli.</h3>
                  <p>
                    QR koduyla veya ana sayfada
                    <br />
                    oyun kodunu yazarak katıl.
                  </p>
                  <Button
                    secondary
                    onClick={() => {
                      navigator.clipboard
                        .writeText(location.origin + "/#join/" + pin)
                        .then(() => notify("Katılım bağlantısı kopyalandı."))
                        .catch(() =>
                          notify(
                            "Bağlantı: " + location.origin + "/#join/" + pin,
                          ),
                        );
                    }}
                  >
                    <Copy size={16} /> Bağlantıyı kopyala
                  </Button>
                </section>
              )}
            </div>
          ) : room.phase === "finished" ? (
            <Results room={room} host={host} />
          ) : (
            <div className="quiz-stage">
              <div className="quiz-progress">
                <span>
                  SORU <b>{room.index + 1}</b> / {room.total}
                </span>
                <div className={"timer " + (left < 6 ? "urgent" : "")}>
                  {room.phase === "question" ? left : <Check size={27} />}
                </div>
                <span>
                  {room.answeredCount} / {room.playerCount} cevap
                </span>
              </div>
              <div className="time-track">
                <i
                  style={{
                    width:
                      (room.phase === "question"
                        ? (left / room.seconds) * 100
                        : 0) + "%",
                  }}
                />
              </div>
              <h2>{room.question?.text}</h2>
              <div
                className={`answer-grid ${room.question?.options.every((option) => option.startsWith("flag:")) ? "flag-answers" : ""}`}
              >
                {room.question?.options.map((o, i) => (
                  <button
                    key={i}
                    className={
                      "answer answer-" +
                      i +
                      (room.myAnswer?.choice === i ? " selected" : "") +
                      (room.phase === "reveal"
                        ? room.question.correct === i
                          ? " correct"
                          : " dim"
                        : "")
                    }
                    disabled={
                      host ||
                      screen ||
                      busy ||
                      !!room.myAnswer ||
                      room.phase !== "question" ||
                      left === 0
                    }
                    onClick={() =>
                      action("answer", {
                        choice: i,
                        questionId: room.question.id,
                      })
                    }
                  >
                    <span className="answer-shape">
                      {["▲", "◆", "●", "■"][i]}
                    </span>
                    <b>
                      <OptionContent value={o} />
                    </b>
                    {room.phase === "reveal" && room.question.correct === i && (
                      <CheckCircle2 size={24} />
                    )}
                  </button>
                ))}
              </div>
              {room.phase === "question" && room.myAnswer && (
                <div className="answer-feedback">
                  <CheckCircle2 size={21} /> Cevabın alındı. Sonuç birazdan!
                </div>
              )}
              {room.phase === "reveal" && (
                <div className="reveal-note">
                  {room.myAnswer && (
                    <strong>
                      {room.myAnswer.points > 0
                        ? "Harika! +" + room.myAnswer.points + " puan"
                        : "Bu sefer olmadı. Sıradaki soru senin!"}
                    </strong>
                  )}
                  {room.category === "enler" ? (
                    <details
                      className="question-details"
                      key={room.question.id}
                    >
                      <summary>Detayı gör</summary>
                      <p>{room.question.explanation}</p>
                    </details>
                  ) : (
                    <p>{room.question?.explanation}</p>
                  )}
                  <div className="mini-ranking">
                    {room.players.slice(0, 3).map((p, i) => (
                      <span key={p.name}>
                        {["🥇", "🥈", "🥉"][i]} {p.name} <b>{p.score}</b>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="auto-question-note" role="status">
                {room.phase === "reveal"
                  ? room.index === room.total - 1
                    ? "Sonuçlar birazdan otomatik açılacak."
                    : "Doğru cevap gösteriliyor. Ardından 3–2–1 ile sıradaki soru!"
                  : "Süre bitince cevaplar gösterilecek ve yeni soruya otomatik geçilecek."}
              </p>
              {host && room.phase === "question" && (
                <Button
                  className="next-btn"
                  disabled={busy}
                  onClick={() =>
                    action("advance", {
                      expectedIndex: room.index,
                      expectedPhase: room.phase,
                    })
                  }
                >
                  {room.phase === "question"
                    ? "Cevapları göster"
                    : room.index === 9
                      ? "Sonuçları göster"
                      : "Sıradaki soru"}{" "}
                  <ArrowRight size={18} />
                </Button>
              )}
            </div>
          )}
        </>
      ) : room.mode === "cloud" ? (
        <CloudRoom
          room={room}
          host={host}
          screen={screen}
          action={action}
          busy={busy}
          notify={notify}
        />
      ) : (
        <RaffleRoom
          room={room}
          host={host}
          screen={screen}
          now={now}
          action={action}
          busy={busy}
          notify={notify}
        />
      )}
      {host && room.phase !== "closed" && (
        <div className="host-bottom">
          <a
            className="text-btn"
            href={"#screen/" + pin}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={15} /> Seyirci ekranını aç
          </a>
          <Button secondary onClick={() => setQr(true)}>
            QR ile davet et
          </Button>
          <button
            className="text-btn muted"
            onClick={() => {
              if (confirm("Etkinlik kapatılsın mı? Yeni cevap alınamayacak."))
                action("close");
            }}
          >
            Etkinliği kapat
          </button>
        </div>
      )}
      {qr && (
        <Modal title="Herkes oyuna dahil!" onClose={() => setQr(false)}>
          <div className="qr-dialog">
            <QR pin={pin} />
            <h2>{pin}</h2>
            <p>{location.origin}</p>
            <Button
              secondary
              onClick={() =>
                navigator.clipboard
                  .writeText(location.origin + "/#join/" + pin)
                  .then(() => notify("Bağlantı kopyalandı."))
                  .catch(() =>
                    notify("Kopyalanamadı; adresi elle paylaşabilirsiniz."),
                  )
              }
            >
              <Copy size={16} /> Katılım bağlantısını kopyala
            </Button>
          </div>
        </Modal>
      )}
      {kind === "join" &&
        !isTransitioning &&
        ["quiz", "family"].includes(room.mode) &&
        room.phase === "reveal" &&
        room.me &&
        room.myAnswer &&
        Number.isInteger(room.question?.correct) && (
          <AnswerResultPopup
            key={room.question.id}
            correct={room.myAnswer.choice === room.question.correct}
            points={room.myAnswer.points}
            correctAnswer={
              <OptionContent
                value={room.question.options[room.question.correct]}
                showName
              />
            }
          />
        )}
    </div>
  );
}
function AnswerResultPopup({ correct, points, correctAnswer }) {
  const ref = useRef();
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, [open]);
  if (!open) return null;
  return (
    <dialog
      ref={ref}
      className={`answer-result-popup ${correct ? "result-correct" : "result-wrong"}`}
      aria-labelledby="answer-result-title"
      aria-describedby="answer-result-description"
      onCancel={(e) => {
        e.preventDefault();
        setOpen(false);
      }}
    >
      <button
        className="result-close"
        aria-label="Sonucu kapat"
        onClick={() => setOpen(false)}
      >
        <X size={22} />
      </button>
      <div className="result-symbol" aria-hidden="true">
        {correct ? (
          <Check size={60} strokeWidth={3} />
        ) : (
          <X size={60} strokeWidth={3} />
        )}
      </div>
      <span className="result-eyebrow">
        {correct ? "HARİKA CEVAP!" : "BU KEZ OLMADI"}
      </span>
      <h2 id="answer-result-title">
        {correct ? "Tebrikler, doğru bildiniz!" : "Yanlış bildiniz"}
      </h2>
      <p id="answer-result-description">
        {correct
          ? "Bilgine sağlık! Böyle devam et."
          : "Bir sonraki soruda tekrar dene!"}
      </p>
      {correct ? (
        <div className="result-points">
          +{points} <span>puan</span>
        </div>
      ) : (
        <div className="result-answer">
          <span>Doğru cevap</span>
          <strong>{correctAnswer}</strong>
        </div>
      )}
      <button
        autoFocus
        className="result-confirm"
        onClick={() => setOpen(false)}
      >
        Tamam <ArrowRight size={19} />
      </button>
    </dialog>
  );
}
function Results({ room, host }) {
  return (
    <div className="results">
      <div className="big-emoji">🏆</div>
      <span className="eyebrow">ALKIŞLAR HERKESE!</span>
      <h2>
        {room.players[0]?.name || "Yarışma"}
        {room.players.length ? " zirvede!" : " tamamlandı!"}
      </h2>
      <p>Merak kazandı, güzel anılar birikti.</p>
      <div className="leaderboard">
        {room.players.map((p, i) => (
          <div key={p.name}>
            <span className="rank">
              {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
            </span>
            <b>{p.name}</b>
            <strong>
              {p.score.toLocaleString("tr")} <small>puan</small>
            </strong>
          </div>
        ))}
      </div>
      {host && (
        <Button
          secondary
          onClick={() =>
            downloadCSV(
              room.players.map((p, i) => [i + 1, p.name, p.score]),
              ["Sıra", "İsim", "Puan"],
              "yarışma-sonuçları.csv",
            )
          }
        >
          <Download size={17} /> Sonuçları indir
        </Button>
      )}
    </div>
  );
}
function downloadCSV(rows, head, file) {
  const safe = (v) => {
    let s = String(v);
    if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  const blob = new Blob(
    ["\uFEFF" + [head, ...rows].map((r) => r.map(safe).join(";")).join("\r\n")],
    { type: "text/csv;charset=utf-8;" },
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = file;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function WordCloud({ words }) {
  return (
    <div className={`word-cloud ${words.length > 60 ? "cloud-dense" : ""}`}>
      {words.slice(0, 120).map((w) => {
        const seed = Array.from(w.text).reduce(
          (n, c) => (n * 31 + c.codePointAt(0)) >>> 0,
          0,
        );
        const metrics = bubbleMetrics(w.count);
        return (
          <div
            className={`word-orbit bubble-${seed % 6}`}
            key={w.text}
            style={{
              "--size": metrics.size + "px",
              "--font":
                metrics.fontSize * (w.text.length > 14 ? 0.8 : 1) + "px",
              "--float-time": 5 + (seed % 5) + "s",
              "--float-delay": -(seed % 70) / 10 + "s",
              "--depth": 12 + (seed % 36) + "px",
              "--sway": (seed % 2 ? 1 : -1) * 7 + "px",
            }}
          >
            <div className="word-bubble">
              <span className="bubble-word">{w.text}</span>
              <b className="bubble-count" key={w.count}>
                {w.count}
              </b>
              <i
                className="bubble-ripple"
                key={`pulse-${w.count}`}
                aria-hidden="true"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
function CloudAtmosphere() {
  return (
    <div className="cloud-atmosphere" aria-hidden="true">
      <i className="cloud-aurora aurora-one" />
      <i className="cloud-aurora aurora-two" />
      {Array.from({ length: 22 }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 47 + 11) % 100}%`,
            top: `${(i * 31 + 9) % 100}%`,
            "--particle-delay": `${-(i % 9)}s`,
            "--particle-size": `${2 + (i % 3)}px`,
          }}
        />
      ))}
    </div>
  );
}
function CloudRoom({ room, host, screen, action, busy, notify }) {
  const [words, setWords] = useState(""),
    [prompt, setPrompt] = useState(room.prompt);
  useEffect(() => {
    setWords((room.myWords || []).join(", "));
    setPrompt(room.prompt);
  }, [room.promptVersion]);
  return (
    <div className={`cloud-room ${screen ? "cloud-screen" : ""}`}>
      <h2>{room.prompt}</h2>
      <p className="muted">
        {room.responseCount} kişi cevapladı · Aynı fikirler birlikte büyür.
      </p>
      {!host && !screen && room.me && (
        <form
          className="word-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const values = words
              .split(",")
              .map((w) => w.trim())
              .filter(Boolean);
            if (values.length > 3) {
              notify("Virgülle ayırarak en fazla 3 kelime yaz.");
              return;
            }
            if (
              await action("words", {
                words: values,
                promptVersion: room.promptVersion,
              })
            )
              notify("Kelimelerin buluta eklendi!");
          }}
        >
          <Field label="En fazla 3 kelime, virgülle ayır">
            <input
              maxLength={95}
              placeholder="ör. heyecan, merak, mutluluk"
              value={words}
              onChange={(e) => setWords(e.target.value)}
              required
            />
          </Field>
          <Button disabled={busy}>
            {room.myWords?.length ? "Cevabımı güncelle" : "Buluta ekle"}{" "}
            <Cloud size={17} />
          </Button>
        </form>
      )}
      <div
        className="cloud-canvas"
        onPointerMove={(e) => {
          if (
            e.pointerType !== "mouse" ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
          )
            return;
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty(
            "--look-x",
            `${((e.clientX - rect.left) / rect.width - 0.5) * 6}deg`,
          );
          e.currentTarget.style.setProperty(
            "--look-y",
            `${-((e.clientY - rect.top) / rect.height - 0.5) * 4}deg`,
          );
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.setProperty("--look-x", "0deg");
          e.currentTarget.style.setProperty("--look-y", "0deg");
        }}
      >
        <CloudAtmosphere />
        <div className="cloud-live-badge">
          <i /> FİKİRLER CANLANIYOR
        </div>
        {room.words.length ? (
          <WordCloud words={room.words} />
        ) : (
          <div className="empty-cloud">
            <Cloud size={64} />
            <h3>İlk kelimeyi kim söyleyecek?</h3>
            <p>Katılımcıların cevapları burada canlı büyüyecek.</p>
          </div>
        )}
        <div className="cloud-stage-footer">
          <Sparkles size={15} />
          <span>
            {room.words.length} farklı kelime · Her yeni cevapla biraz daha
            büyük
          </span>
        </div>
      </div>
      {room.words.length > 120 && (
        <p className="muted">
          En sık yazılan 120 kelime gösteriliyor. Tam listeyi indirebilirsiniz.
        </p>
      )}
      {host && (
        <div className="cloud-controls">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                confirm(
                  "Yeni soru önceki kelime bulutunu temizleyecek. Devam edilsin mi?",
                )
              )
                await action("prompt", { prompt });
            }}
          >
            <Field label="Yeni bir soru sor">
              <input
                value={prompt}
                minLength={3}
                maxLength={200}
                required
                onChange={(e) => setPrompt(e.target.value)}
              />
            </Field>
            <Button secondary disabled={busy}>
              Yeni soruya geç
            </Button>
          </form>
          <Button
            secondary
            disabled={!room.words.length}
            onClick={() =>
              downloadCSV(
                room.words.map((w) => [w.text, w.count]),
                ["Kelime", "Kişi sayısı"],
                "kelime-bulutu.csv",
              )
            }
          >
            <Download size={16} /> Cevapları indir
          </Button>
        </div>
      )}
    </div>
  );
}
function RaffleWheel({ room, now, preview = false, onSettled }) {
  const canvas = useRef();
  const rotor = useRef();
  const latest = useRef();
  const finish = useRef(onSettled);
  finish.current = onSettled;
  const draw = room.draw;
  const entries = preview
    ? ["Deniz", "Ece", "Mert", "Ada", "Can", "Elif", "Arda", "Selin"].map(
        (name, i) => ({ id: String(i), name }),
      )
    : room.wheelEntries || [];
  const signature = JSON.stringify(entries);
  latest.current = {
    draw,
    entries,
    time: now ?? room.serverTime ?? Date.now() / 1000,
    clock: performance.now(),
  };
  const [landed, setLanded] = useState(null);
  const spinning = draw && landed !== draw.id;
  const winner = landed === draw?.id ? draw?.winner : null;

  useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    const size = 1200,
      center = size / 2,
      radius = 584;
    const pool = entries.length
      ? entries
      : Array.from({ length: 8 }, () => ({ name: "" }));
    const colors = [
      "#8938ce",
      "#ec437e",
      "#ee892a",
      "#159d9a",
      "#496ad6",
      "#c237ac",
      "#d95b35",
      "#207d9f",
    ];
    const step = (Math.PI * 2) / pool.length;
    ctx.clearRect(0, 0, size, size);
    pool.forEach((entry, i) => {
      const angle = -Math.PI / 2 + i * step;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle - step / 2, angle + step / 2);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      if (pool.length < 120) {
        ctx.strokeStyle = "#ffffff55";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      if (entry.name && i % Math.max(1, Math.ceil(pool.length / 48)) === 0) {
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(angle);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.font = `800 ${pool.length <= 12 ? 37 : pool.length <= 24 ? 27 : 19}px system-ui`;
        ctx.fillStyle = "white";
        ctx.shadowColor = "#16032988";
        ctx.shadowBlur = 3;
        const chars = Array.from(entry.name);
        ctx.fillText(
          chars.length > 19 ? chars.slice(0, 18).join("") + "…" : entry.name,
          radius - 40,
          0,
          340,
        );
        ctx.restore();
      }
    });
    const sheen = ctx.createRadialGradient(
      center - 180,
      center - 220,
      50,
      center,
      center,
      radius,
    );
    sheen.addColorStop(0, "#ffffff28");
    sheen.addColorStop(0.65, "#ffffff00");
    sheen.addColorStop(1, "#17052250");
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = sheen;
    ctx.fill();
  }, [signature]);

  useEffect(() => {
    let frame,
      angle = 0,
      landing = null,
      stopped = false;
    const id = draw?.id;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const tick = (stamp) => {
      const current = latest.current;
      const time = current.time + (stamp - current.clock) / 1000;
      if (!id) {
        rotor.current.style.transform = "rotate(0deg)";
        return;
      }
      const index = current.entries.findIndex(
        (e) => e.id === current.draw?.winner?.id,
      );
      if (index >= 0 && !landing) {
        const target = winnerRotation(index, current.entries.length, angle);
        if (
          reducedMotion ||
          time >= (current.draw.settleAt ?? current.draw.revealAt)
        ) {
          angle = target;
          stopped = true;
        } else landing = { from: angle, target, start: stamp };
      }
      if (landing) {
        const progress = Math.min(1, (stamp - landing.start) / 4000);
        angle =
          landing.from + (landing.target - landing.from) * wheelEase(progress);
        stopped = progress === 1;
      } else if (!stopped)
        angle = reducedMotion
          ? 0
          : Math.max(0, time - current.draw.startedAt) * 720;
      rotor.current.style.transform = `rotate(${angle}deg)`;
      if (stopped) {
        setLanded(id);
        finish.current?.(id);
      } else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [draw?.id, signature]);

  return (
    <div
      className={`fortune-wheel ${spinning ? "is-spinning" : ""} ${winner ? "has-winner" : ""}`}
    >
      <div className="wheel-heading">
        <span>✦ BÜYÜK HEYECAN ✦</span>
        <h2>ŞANS ÇARKI</h2>
      </div>
      <div className="wheel-frame">
        <div className="wheel-aura" />
        <div className="wheel-ring">
          {Array.from({ length: 48 }, (_, i) => (
            <i
              key={i}
              className="wheel-bulb"
              style={{
                left: `${50 + 48 * Math.sin((i * Math.PI) / 24)}%`,
                top: `${50 - 48 * Math.cos((i * Math.PI) / 24)}%`,
                animationDelay: `${(i % 3) * -0.35}s`,
              }}
            />
          ))}
          <div className="wheel-rotor" ref={rotor}>
            <canvas
              ref={canvas}
              width="1200"
              height="1200"
              role="img"
              aria-label={`${entries.length} eşit dilimli şans çarkı${winner ? `. Kazanan: ${winner.name}` : ""}`}
            />
          </div>
          <div className="wheel-hub">
            <span>✦</span>
            <b>ŞANS</b>
            <small>SENDE</small>
          </div>
        </div>
        <div className="wheel-pointer">
          <svg viewBox="0 0 60 80" aria-hidden="true">
            <path
              d="M4 5 Q30 -4 56 5 L46 39 L30 77 L14 39Z"
              fill="#ffdb77"
              stroke="#fff0b6"
              strokeWidth="3"
            />
            <path
              d="M30 9V59"
              stroke="#b56b1c"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {winner && (
          <div className="wheel-confetti" key={draw.id} aria-hidden="true">
            {Array.from({ length: 36 }, (_, i) => (
              <i
                key={i}
                style={{
                  "--x": `${(i * 37) % 100}%`,
                  "--turn": `${i * 43}deg`,
                  "--delay": `${(i % 7) * 0.09}s`,
                  background: ["#ffda76", "#fa77ba", "#75e7da", "#b69bff"][
                    i % 4
                  ],
                }}
              />
            ))}
          </div>
        )}
      </div>
      <div className="wheel-caption" role="status">
        {preview
          ? "Sıradaki şanslı isim kim?"
          : winner
            ? "✦ Şanslı isim belli oldu! ✦"
            : spinning
              ? draw.winner
                ? "Yavaşlıyor… İşte o an!"
                : "Çark dönüyor, heyecan büyüyor…"
              : entries.length
                ? "Herkes hazırsa, şansını döndür!"
                : "İsimleri ekle, heyecanı başlat."}
      </div>
    </div>
  );
}
async function readNames(file) {
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Dosya en fazla 5 MB olabilir.");
  if (file.name.toLowerCase().endsWith(".xlsx")) {
    const { readSheet } = await import("read-excel-file/browser");
    const rows = await readSheet(file);
    if (rows.length > 2001) throw new Error("En fazla 2.000 satır yükleyin.");
    const names = rows
      .map((row) => String(row[0] ?? "").trim())
      .filter(Boolean);
    return stripHeader(names);
  }
  if (file.name.toLowerCase().endsWith(".csv")) {
    const text = await file.text();
    return stripHeader(
      text
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/)
        .map((l) => {
          const m = l.match(/^"((?:[^"]|"")*)"/);
          return (m ? m[1].replaceAll('""', '"') : l.split(/[;,\t]/)[0]).trim();
        })
        .filter(Boolean),
    );
  }
  throw new Error(".xlsx veya .csv dosyası seçin.");
}
function RaffleRoom({ room, host, screen, now, action, busy, notify }) {
  const [names, setNames] = useState(""),
    [imported, setImported] = useState(null),
    [uploading, setUploading] = useState(false);
  const input = useRef();
  const stage = useRef();
  const [settledDraw, setSettledDraw] = useState(null);
  const drawing =
    room.draw &&
    (settledDraw !== room.draw.id ||
      now < (room.draw.settleAt ?? room.draw.revealAt));
  const winner = room.draw?.winner;
  return (
    <div className={`raffle-layout ${screen ? "raffle-screen" : ""}`}>
      <section className="raffle-stage" ref={stage}>
        <RaffleWheel room={room} now={now} onSettled={setSettledDraw} />
        {winner && !drawing && (
          <div className="winner-announcement" key={room.draw.id}>
            <span>🎉 TEBRİKLER!</span>
            <h2>{winner.name}</h2>
            <p>Bu turun şanslı ismi sensin.</p>
          </div>
        )}
        <div className="raffle-stats">
          <span>
            <b>{room.entryCount}</b> katılımcı
          </span>
          <span>
            <b>{room.remainingCount}</b> kişi kaldı
          </span>
          <span>
            <b>{room.winners.length}</b> kazanan
          </span>
        </div>
        {host && (
          <Button
            disabled={busy || drawing || room.remainingCount === 0}
            onClick={async () => {
              if (await action("draw"))
                stage.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
            }}
          >
            <Sparkles size={20} />
            {drawing ? "Heyecan devam ediyor…" : "Çarkı çevir!"}
          </Button>
        )}
      </section>
      {host ? (
        <aside className="raffle-panel">
          <h3>Şans havuzu</h3>
          <p>
            Her satıra bir isim yaz veya bir liste yükle.
            <br />
            Aynı isimler bir kez eklenir.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await action("entries", {
                  names: names
                    .split(/\r?\n/)
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              )
                setNames("");
            }}
          >
            <Field label="Katılımcı isimleri">
              <textarea
                placeholder={"Ayşe Yılmaz\nDeniz Kaya\nEce Demir"}
                value={names}
                onChange={(e) => setNames(e.target.value)}
                rows={5}
                required
              />
            </Field>
            <Button secondary className="full" disabled={busy || drawing}>
              <Plus size={17} /> Havuza ekle
            </Button>
          </form>
          <div className="or-divider">veya</div>
          <input
            ref={input}
            className="sr-only"
            aria-label="Katılımcı Excel dosyası"
            type="file"
            accept=".xlsx,.csv"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              setUploading(true);
              try {
                setImported(await readNames(file));
              } catch (err) {
                notify(err.message);
              } finally {
                setUploading(false);
                e.target.value = "";
              }
            }}
          />
          <button
            className="upload-box"
            disabled={uploading || drawing}
            onClick={() => input.current.click()}
          >
            <Upload size={26} />
            <b>{uploading ? "Liste okunuyor…" : "Excel listesini yükle"}</b>
            <span>.xlsx veya .csv · İlk sütun isimler · En fazla 5 MB</span>
          </button>
          <button
            className="text-btn template-btn"
            onClick={() =>
              downloadCSV(
                [["Örnek Katılımcı"]],
                ["İsim"],
                "katılımcı-şablonu.csv",
              )
            }
          >
            <Download size={14} /> Örnek şablonu indir
          </button>
          <div className="entries-list">
            {room.entries?.map((e) => (
              <div key={e.id}>
                <span>{e.name}</span>
                {room.winners.some((w) => w.winner.id === e.id) && (
                  <span>🏆</span>
                )}
              </div>
            ))}
          </div>
        </aside>
      ) : (
        <div className="raffle-audience">
          <Ticket size={24} />
          <h3>
            {screen ? "Heyecanı birlikte paylaşalım." : "Şans havuzundasın!"}
          </h3>
          <p>
            {screen
              ? "QR koduyla herkes katılabilir."
              : `${room.me?.name || ""}, sunucu çekilişi başlattığında çark dönmeye başlayacak.`}
          </p>
        </div>
      )}
      {room.winners.length > 0 && (
        <div className="winners-history">
          <h3>Şanslı isimler</h3>
          {room.winners
            .filter((w) => w.id !== room.draw?.id || !drawing)
            .map((w, i) => (
              <div key={w.id}>
                <span>{i + 1}.</span>
                <b>{w.winner.name}</b>
                <Ticket size={18} />
              </div>
            ))}
          {host && (
            <Button
              secondary
              onClick={() =>
                downloadCSV(
                  room.winners.map((w, i) => [i + 1, w.winner.name]),
                  ["Sıra", "Kazanan"],
                  "çekiliş-sonuçları.csv",
                )
              }
            >
              <Download size={15} /> Kazananları indir
            </Button>
          )}
        </div>
      )}
      {imported && (
        <Modal
          title="Katılımcı listesini kontrol et"
          onClose={() => setImported(null)}
        >
          <p>
            {imported.length} isim okundu. Mevcut ve tekrarlanan isimler yeniden
            eklenmez.
          </p>
          <div className="import-preview">
            {imported.slice(0, 50).map((n, i) => (
              <div key={i}>
                {i + 1}. {n}
              </div>
            ))}
            {imported.length > 50 && (
              <p>ve {imported.length - 50} kişi daha…</p>
            )}
          </div>
          <Button
            className="full"
            disabled={busy || drawing}
            onClick={async () => {
              if (await action("entries", { names: imported }))
                setImported(null);
            }}
          >
            İsimleri havuza ekle <Plus size={17} />
          </Button>
        </Modal>
      )}
    </div>
  );
}
function Library({ admin, notify, refresh }) {
  const [cat, setCat] = useState("cografya"),
    [qs, setQs] = useState([]),
    [query, setQuery] = useState(""),
    [add, setAdd] = useState(false),
    [form, setForm] = useState({
      text: "",
      options: ["", "", "", ""],
      correct: 0,
      explanation: "",
    }),
    [busy, setBusy] = useState(false);
  const load = () =>
    api("questions", { category: cat })
      .then(setQs)
      .catch((e) => notify(e.message));
  useEffect(() => {
    if (admin) load();
  }, [cat, admin]);
  if (!admin)
    return (
      <div className="empty">Soru kütüphanesi için yönetici girişi yapın.</div>
    );
  return (
    <>
      <section className="page-heading">
        <div className="eyebrow">MERAKIN KÜTÜPHANESİ</div>
        <h1>Her soru, yeni bir keşif.</h1>
        <p>Hazır soruları incele veya kendi sorularını havuza ekle.</p>
      </section>
      <div className="library-toolbar">
        <select
          aria-label="Soru kategorisi"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
        <div className="search">
          <Search size={17} />
          <input
            placeholder="Sorularda ara..."
            aria-label="Sorularda ara"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setAdd(true)}>
          <Plus size={18} /> Soru ekle
        </Button>
      </div>
      <p className="muted">Bu konuda {qs.length} soru</p>
      <div className="library-list">
        {qs
          .filter((q) =>
            q.text
              .toLocaleLowerCase("tr")
              .includes(query.toLocaleLowerCase("tr")),
          )
          .map((q, i) => (
            <details key={q.id}>
              <summary>
                <span>{i + 1}</span>
                {q.text}
                <small>
                  {q.id.startsWith("custom-") ? "Kendi sorun" : "Hazır soru"}
                </small>
              </summary>
              <div className="library-options">
                {q.options.map((o, j) => (
                  <div
                    key={j}
                    className={j === q.correct ? "right-option" : ""}
                  >
                    {String.fromCharCode(65 + j)}.{" "}
                    <OptionContent value={o} showName />{" "}
                    {j === q.correct && <Check size={16} />}
                  </div>
                ))}
              </div>
              <p>{q.explanation}</p>
              {q.id.startsWith("custom-") && (
                <button
                  className="text-btn"
                  onClick={async () => {
                    if (confirm("Bu özel soru silinsin mi?")) {
                      try {
                        await api("question_delete", { id: q.id });
                        load();
                        refresh();
                      } catch (e) {
                        notify(e.message);
                      }
                    }
                  }}
                >
                  Soruyu sil
                </button>
              )}
            </details>
          ))}
      </div>
      {add && (
        <Modal title="Kendi sorunu ekle" onClose={() => setAdd(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await api("question_save", { ...form, category: cat });
                setAdd(false);
                setForm({
                  text: "",
                  options: ["", "", "", ""],
                  correct: 0,
                  explanation: "",
                });
                load();
                refresh();
                notify("Sorun havuza eklendi.");
              } catch (e) {
                notify(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field label="Soru">
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                required
                minLength={5}
                maxLength={500}
              />
            </Field>
            {form.options.map((o, i) => (
              <Field label={String.fromCharCode(65 + i) + " seçeneği"} key={i}>
                <input
                  value={o}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      options: form.options.map((x, j) =>
                        i === j ? e.target.value : x,
                      ),
                    })
                  }
                  required
                  maxLength={180}
                />
              </Field>
            ))}
            <Field label="Doğru cevap">
              <select
                value={form.correct}
                onChange={(e) =>
                  setForm({ ...form, correct: Number(e.target.value) })
                }
              >
                {form.options.map((_, i) => (
                  <option value={i} key={i}>
                    {String.fromCharCode(65 + i)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Cevap açıklaması (isteğe bağlı)">
              <textarea
                value={form.explanation}
                onChange={(e) =>
                  setForm({ ...form, explanation: e.target.value })
                }
                maxLength={600}
              />
            </Field>
            <Button className="full" disabled={busy}>
              Havuza ekle <Plus size={18} />
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
function Setup({ notify, onDone }) {
  const [form, setForm] = useState({
      key: "",
      database: "",
      user: "",
      password: "",
      adminPassword: "",
    }),
    [busy, setBusy] = useState(false);
  return (
    <div className="setup-page">
      <div className="setup-card">
        <span className="brand-icon">b✦</span>
        <h1>Stüdyonu bağlayalım.</h1>
        <p>
          Hostinger MySQL bilgilerini ve yönetici şifreni yalnızca bu güvenli
          kurulum formuna gir. Kurulum tamamlanınca bu ekran kilitlenir.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              const r = await fetch("/api/setup.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
              });
              const data = await r.json();
              if (!r.ok) throw new Error(data.error);
              notify(
                "Kurulum tamamlandı. Yönetici şifrenle giriş yapabilirsin.",
              );
              onDone();
            } catch (e) {
              notify(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {[
            ["key", "Kurulum anahtarı", "password"],
            ["database", "MySQL veritabanı adı", "text"],
            ["user", "MySQL kullanıcı adı", "text"],
            ["password", "MySQL şifresi", "password"],
            ["adminPassword", "Yeni yönetici şifresi", "password"],
          ].map(([key, label, type]) => (
            <Field label={label} key={key}>
              <input
                type={type}
                required
                autoComplete={key === "adminPassword" ? "new-password" : "off"}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </Field>
          ))}
          <Button className="full" disabled={busy}>
            {busy ? "Bağlanıyor…" : "Kurulumu tamamla"} <Check size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}
setupPwa();
createRoot(document.getElementById("root")).render(<App />);
