import GoogleSignIn from "./GoogleSignIn";
import QuizLobby from "./QuizLobby";
import TournamentCompactLobby from "./TournamentCompactLobby";
import JoinGame from "./JoinGame";
import { roomHostControls } from "./room-access";
import GameArt from "./GameArt";
import LibraryBrowser from "./LibraryBrowser";
import ThemedSelect from "./ThemedSelect";
import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/manrope";
import { createRoot } from "react-dom/client";
import {
  LayoutGrid,
  UserRound,
  KeyRound,
  CalendarDays,
  Trophy,
  Crown,
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
import { roomPollDelay } from "./room-polling";
import BrowserVerification from "./BrowserVerification";
import { stripHeader } from "./import-utils";
import { bubbleMetrics } from "./cloud-utils";
import {
  winnerRotation,
  wheelEase,
  wheelSpin,
  wheelLanding,
} from "./wheel-utils";
import { flagAssets } from "./flag-assets";
import flagCountries from "../data/flag-countries.json";
import FamilyRoom from "./FamilyRoom";
import FamilyQuestionEditor from "./FamilyQuestionEditor";
import FamilyQuestionPicker from "./FamilyQuestionPicker";
import {
  TournamentIntro,
  TournamentLobby,
  TournamentBanner,
} from "./Tournament";
import { quizTransition } from "./quiz-transition";
import { PwaInstall, PwaNotices } from "./PwaInstall";
import { setupPwa } from "./pwa";
import "./style.css";
import "./tournament-create.css";
import "./host-player.css";
import Welcome from "./Welcome";
import Overview from "./Overview";
import ModuleTeasers from "./ModuleTeasers";
import ModuleGuide from "./ModuleGuide";
import {
  QuizFormats,
  EstimateRound,
  quizFormats,
  quizFormat,
} from "./QuizFormats";
import AnswerComparison from "./AnswerComparison";
import { CharacterAvatar } from "./CharacterAvatar";
import { characterById } from "./characters";
import ProfileOnboarding from "./ProfileOnboarding";
import Podium from "./Podium";
import { rankPlayers } from "./ranking";
const QuizCategoryPicker = lazy(() => import("./QuizCategoryPicker"));
import UserManagement from "./UserManagement";
import Profile from "./Profile";
import Solo from "./Solo";
import GameCreditNotice, { gameCreditMoment } from "./GameCreditNotice";
import IdleEvents from "./IdleEvents";
import "./mobile-shell.css";
import MobileHome from "./MobileHome";
import CloudViewport from "./CloudViewport";
import CompactRoomPanel from "./CompactRoomPanel";
import MobileModuleLanding from "./MobileModuleLanding";
import useCompactLayout from "./useCompactLayout";
import ScreenPages from "./ScreenPages";
import MobileQuizPicker from "./MobileQuizPicker";
import { setupNative, joinUrl, publicOrigin } from "./native";
import "./android-design.css";
import "./app-theme.css";
import "./mobile-navigation.css";
import "./screen-pages.css";
import "./mobile-module-screen.css";
import "./compact-room.css";
import "./solo-compact.css";
import "./choice-surfaces.css";
import "./countdown-scene.css";
import CountdownScene from "./CountdownScene";
import CancelGameButton from "./CancelGameButton";
import "./question-stage.css";
import "./premium-cards.css";
import "./desktop-studio.css";
import "./premium-renders.css";
import "./quiz-lobby.css";
import { setupAppearance } from "./appearance";
const modes = {
  solo: { name: "Kendini Dene", icon: Sparkles, color: "purple" },
  tournament: { name: "Turnuva", icon: Crown, color: "purple" },
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
function Modal({
  title,
  onClose,
  children,
  wide = false,
  singleScreen = false,
}) {
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
    <dialog
      ref={ref}
      className={singleScreen ? "tournament-create-dialog" : wide ? "wide" : ""}
      onCancel={onClose}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Kapat">
          <X />
        </button>
      </div>
      {singleScreen ? children : <ScreenPages dialog>{children}</ScreenPages>}
    </dialog>
  );
}
function App() {
  const compact = useCompactLayout();
  const [route, setRoute] = useState(location.hash.slice(1));
  const [tab, setTab] = useState("home");
  const [status, setStatus] = useState({ configured: true, admin: false });
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [counts, setCounts] = useState({});
  const [rooms, setRooms] = useState([]);
  const [homeGroup, setHomeGroup] = useState(0);
  const [showCompleted, setShowCompleted] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [joining, setJoining] = useState("");
  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 5000);
  };
  async function refresh() {
    try {
      let s = await api("status");
      setStatus(s);
      setAuthReady(true);
      setAuthError("");
      if (s.configured) {
        setCounts(await api("categories"));
        if (s.admin) setRooms(await api("rooms"));
        else setRooms([]);
      }
    } catch (e) {
      setAuthError(e.message);
      notify(e.message);
    }
  }
  useEffect(() => {
    refresh();
    const fn = () => setRoute(location.hash.slice(1));
    addEventListener("hashchange", fn);
    return () => removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    let stopped = false;
    async function checkSession() {
      try {
        const next = await api("status");
        if (stopped) return;
        setStatus((previous) => {
          if (previous.user?.id !== next.user?.id) {
            setRooms([]);
            setModal(null);
          }
          if (previous.admin && !next.admin) {
            setRooms([]);
            setModal(null);
            notify(
              "Oturumun kapandı. Başka bir cihazdan giriş yapılmış veya hesabın güncellenmiş olabilir.",
            );
          }
          return next;
        });
      } catch {
        /* A temporary network loss must not sign the user out. */
      }
    }
    const timer = setInterval(checkSession, 15000);
    const focus = () => {
      if (!document.hidden) checkSession();
    };
    addEventListener("focus", focus);
    document.addEventListener("visibilitychange", focus);
    return () => {
      stopped = true;
      clearInterval(timer);
      removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", focus);
    };
  }, []);
  async function changePreview(action, userId) {
    try {
      const next = await api(action, { userId });
      setStatus((s) => ({ ...s, ...next }));
      setRooms([]);
      setModal(null);
      setTab(action === "preview_stop" ? "users" : "home");
      go(action === "preview_stop" ? "studio/users" : "");
      window.scrollTo(0, 0);
      await refresh();
    } catch (e) {
      notify(e.message);
    }
  }
  useEffect(() => {
    const page = route.startsWith("studio/") ? route.slice(7) : "home";
    const allowed = [
      "home",
      "events",
      "concepts",
      "profile",
      "users",
      "library",
      ...Object.keys(modes),
    ];
    setTab(
      !allowed.includes(page)
        ? "home"
        : ["users", "library"].includes(page) && status.user?.role !== "owner"
          ? "profile"
          : page,
    );
  }, [route, status.user?.role]);
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
    if (["users", "library"].includes(id) && status.user?.role !== "owner")
      id = "profile";
    setTab(id);
    go(id === "home" ? "" : "studio/" + id);
    window.scrollTo(0, 0);
    if (id === "library" && !status.admin) setModal({ type: "login" });
  };
  const logout = async () => {
    try {
      await api("logout");
      setStatus((s) => ({ ...s, admin: false, user: null }));
      setRooms([]);
      setTab("home");
      go("");
    } catch (e) {
      notify(e.message);
    }
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0) + 400;
  const visibleRooms = rooms.filter(
    (room) =>
      (["home", "events"].includes(tab) || room.mode === tab) &&
      (showCompleted || !["finished", "closed"].includes(room.phase)),
  );
  let body;
  if (!authReady && route !== "setup")
    body = (
      <div className="center-page">
        <ShieldCheck size={40} />
        <h2>{authError || "Oturumun hazırlanıyor…"}</h2>
        {authError && <Button onClick={refresh}>Tekrar dene</Button>}
      </div>
    );
  else if (route === "setup")
    body = (
      <Setup
        notify={notify}
        onDone={() => {
          go("");
          refresh();
        }}
      />
    );
  else if (status.user?.needsProfileSetup && !status.preview)
    body = (
      <ProfileOnboarding
        key={status.user.id}
        user={status.user}
        onUpdate={(user) => setStatus((s) => ({ ...s, user }))}
        onLogout={logout}
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
        profile={status.user}
        notify={notify}
        onLogin={() => setModal({ type: "login" })}
        onBack={() => {
          go("");
          refresh();
        }}
      />
    );
  } else if (!status.admin)
    body = (
      <Welcome
        onLogin={() => setModal({ type: "login" })}
        onJoin={(pin) => go("join/" + pin)}
      />
    );
  else
    body = (
      <div className="shell">
        <aside className="sidebar">
          <a className="brand" href="#">
            <img
              className="brand-icon"
              src="/icons/icon-192.png?v=varmisin-v1"
              alt=""
            />
            <span>
              Var<span className="brand-light">mısın</span>
              <small>HERKES OYUNA DAHİL.</small>
            </span>
          </a>
          <div className="nav-label">STÜDYONUZ</div>
          <nav>
            {[
              ["home", "Genel bakış", LayoutGrid],
              ["events", "Etkinliklerim", CalendarDays],
              ["quiz", "Bilgi yarışması", Trophy],
              ["solo", "Kendini Dene", Sparkles],
              ["concepts", "Konseptler", Sparkles],
              ["tournament", "Turnuva", Crown],
              ["family", "Beni Tanıyor musun?", Heart],
              ["raffle", "Çarkıfelek", Ticket],
              ["cloud", "Kelime bulutu", Cloud],
              ...(status.user?.role === "owner"
                ? [["library", "Soru kütüphanesi", LibraryBig]]
                : []),
              ["profile", "Profil ve ayarlar", UserRound],
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
          <button
            className="sidebar-bottom profile-shortcut"
            onClick={() => nav("profile")}
          >
            <CharacterAvatar id={status.user?.avatar} />
            <div>
              <b>{status.user?.username}</b>
              <small>Profil ve kullanıcı ayarları</small>
            </div>
            <ChevronRight size={18} />
          </button>
        </aside>
        <header className="mobile-app-header">
          <button
            className="mobile-brand"
            onClick={() => nav("home")}
            aria-label="Ana sayfaya dön"
          >
            <img src="/icons/icon-192.png?v=varmisin-v1" alt="" />
            Var<b>mısın</b>
          </button>
          <button
            className="mobile-profile-button"
            onClick={() => nav("profile")}
            aria-label="Profil ve ayarlar"
          >
            <CharacterAvatar id={status.user?.avatar} />
          </button>
        </header>
        <main
          data-view={tab}
          className={`main ${tab === "home" ? "overview-main" : ""}`}
        >
          {tab !== "home" && (
            <header className="topbar">
              <div className="breadcrumb">
                Stüdyo <ChevronRight size={14} />
                <b>
                  {tab === "home"
                    ? "Genel bakış"
                    : tab === "profile"
                      ? "Profil ve ayarlar"
                      : tab === "events"
                        ? "Etkinliklerim"
                        : tab === "users"
                          ? "Kullanıcı yönetimi"
                          : tab === "library"
                            ? "Soru kütüphanesi"
                            : tab === "concepts"
                              ? "Konseptler"
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
                  onChange={(e) =>
                    setJoining(e.target.value.replace(/\D/g, ""))
                  }
                />
                <button type="submit">
                  Oyuna katıl <ArrowUpRight size={21} />
                </button>
              </form>
            </header>
          )}
          <div
            className={`content ${tab === "home" ? "overview-content" : ""} ${["quiz", "concepts"].includes(tab) ? "quiz-content" : ""}`}
          >
            {!status.configured && (
              <div className="notice">
                <Settings size={18} /> Sunucu bağlantısı kurulum bekliyor.{" "}
                <a href="#setup">Kurulumu aç</a>
              </div>
            )}
            {tab === "profile" ? (
              <Profile
                user={status.user}
                preview={Boolean(status.preview)}
                rooms={rooms}
                onPassword={() => setModal({ type: "password" })}
                onLogout={logout}
                onUsers={() => nav("users")}
                onLibrary={() => nav("library")}
                onHelp={() => setModal({ type: "how" })}
                onEvents={() => nav("events")}
                onUpdate={(user) => setStatus((s) => ({ ...s, user }))}
              />
            ) : tab === "solo" ? (
              <Solo
                key={`${status.user.id}-${Boolean(status.preview)}`}
                onBack={() => nav("home")}
              />
            ) : tab === "events" ? (
              <section className="my-events-intro">
                <span className="eyebrow">SENİN OYUN ALANIN</span>
                <h1>Etkinliklerim</h1>
                <p>Oyunlarına kaldığın yerden devam et.</p>
                <Button onClick={() => nav("home")}>
                  <Plus size={18} /> Yeni etkinlik oluştur
                </Button>
              </section>
            ) : tab === "users" && status.user?.role === "owner" ? (
              <UserManagement
                currentUser={status.user}
                onUpdate={refresh}
                onPreview={(id) => changePreview("preview_start", id)}
              />
            ) : tab === "library" && status.user?.role === "owner" ? (
              <Library admin={status.admin} notify={notify} refresh={refresh} />
            ) : tab === "home" ? (
              <>
                <MobileHome
                  initialGroup={homeGroup}
                  username={status.user?.username}
                  onBrowse={(collection) => {
                    nav(collection === "concepts" ? "concepts" : "quiz");
                  }}
                  activeRoom={rooms.find(
                    (r) => !["closed", "finished"].includes(r.phase),
                  )}
                  onResume={(pin) => go("host/" + pin)}
                  onChoose={(id) => {
                    setHomeGroup(
                      ["tournament", "solo"].includes(id)
                        ? 1
                        : ["raffle", "cloud"].includes(id)
                          ? 2
                          : 0,
                    );
                    nav(id);
                  }}
                  onJoin={(pin) => go("join/" + pin)}
                />
                <section className="mobile-home-intro">
                  <span>MERHABA, {status.user?.username}</span>
                  <h1>
                    Bugün ne oynuyoruz? <span>✦</span>
                  </h1>
                  <p>Bir oyun seç, birlikte güzel anlar biriktir.</p>
                  <button onClick={() => setModal({ type: "join" })}>
                    <KeyRound size={24} />
                    <span>
                      <strong>Oyun kodun mu var?</strong>
                      <small>Kodunu gir, hemen katıl</small>
                    </span>
                    <ArrowRight size={22} />
                  </button>
                </section>
                <div className="desktop-overview">
                  <Overview
                    onChoose={nav}
                    onJoin={(pin) => go("join/" + pin)}
                    username={status.user?.username}
                    activeRoom={rooms.find(
                      (r) => !["closed", "finished"].includes(r.phase),
                    )}
                    onResume={(pin) => go("host/" + pin)}
                  />
                </div>
              </>
            ) : compact &&
              ["tournament", "raffle", "cloud", "family"].includes(tab) ? (
              <MobileModuleLanding
                mode={tab}
                onCreate={() => create(tab)}
                onBack={() => nav("home")}
                activeRoom={rooms.find(
                  (r) =>
                    r.mode === tab && !["closed", "finished"].includes(r.phase),
                )}
                onResume={(pin) => go("host/" + pin)}
                onEvents={() => nav("events")}
              />
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
                        : tab === "tournament"
                          ? "Alanını seç. Şampiyonluğa oyna."
                          : tab === "concepts"
                            ? "Bildiğin oyuna yeni bir tat."
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
                        : tab === "tournament"
                          ? "Ortak alanlar, ortak heyecan. Büyük ödül için birlikte yarışın."
                          : tab === "concepts"
                            ? "Tahmin et, şaşır, birbirini yeniden keşfet."
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
                <ModuleGuide mode={tab} />
                {["quiz", "concepts"].includes(tab) && (
                  <MobileQuizPicker
                    key={tab}
                    collection={tab === "concepts" ? "concepts" : "topics"}
                    onFamily={() => nav("family")}
                    counts={counts}
                    onChoose={(id) => create("quiz", id)}
                  />
                )}
                {tab === "tournament" && (
                  <TournamentIntro onCreate={() => create("tournament")} />
                )}
                {tab === "concepts" && (
                  <QuizFormats onChoose={(id) => create("quiz", id)} />
                )}
                {tab === "quiz" && (
                  <Suspense
                    fallback={
                      <div className="empty">Konu kartları hazırlanıyor…</div>
                    }
                  >
                    <QuizCategoryPicker
                      counts={counts}
                      onChoose={(id) => create("quiz", id)}
                    />
                  </Suspense>
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
                    <div className="family-intro-art">
                      <GameArt mode="family" />
                      <ModuleTeasers mode="family" board />
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
                    <div className="desktop-module-art">
                      <GameArt mode="raffle" />
                    </div>
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
                    <div className="desktop-module-art">
                      <GameArt mode="cloud" />
                    </div>
                  </section>
                )}
                {["raffle", "cloud"].includes(tab) && (
                  <ModuleTeasers mode={tab} />
                )}
              </>
            )}
            {!["solo", "quiz"].includes(tab) &&
              (!compact || tab === "events") &&
              ["events", ...Object.keys(modes)].includes(tab) && (
                <section className="recent">
                  <div className="section-heading recent-heading">
                    <h2>{tab === "events" ? "Oyunların" : "Etkinliklerin"}</h2>
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
            {tab !== "home" && (
              <footer>
                <span>
                  Varmısın <span className="footer-dot">✦</span> Güzel anlar
                  birlikte başlar.
                </span>
                <span>
                  {total || categories.reduce((sum, c) => sum + c.count, 0)}{" "}
                  soru <i>·</i> {categories.length} konu <i>·</i> Sonsuz merak
                </span>
              </footer>
            )}
          </div>
        </main>
        <nav className="mobile-bottom-nav" aria-label="Mobil gezinme">
          {[
            ["home", "Oyna", LayoutGrid],
            ["concepts", "Konseptler", Sparkles],
            ["profile", "Profil", UserRound],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              className={
                (id === "home" &&
                  ![
                    "profile",
                    "users",
                    "events",
                    "library",
                    "concepts",
                    "family",
                  ].includes(tab)) ||
                (id === "concepts" && ["concepts", "family"].includes(tab)) ||
                (id === "profile" &&
                  ["profile", "users", "events", "library"].includes(tab))
                  ? "active"
                  : ""
              }
              aria-current={
                (id === "home" &&
                  ![
                    "profile",
                    "users",
                    "events",
                    "library",
                    "concepts",
                    "family",
                  ].includes(tab)) ||
                (id === "concepts" && ["concepts", "family"].includes(tab)) ||
                (id === "profile" &&
                  ["profile", "users", "events", "library"].includes(tab))
                  ? "page"
                  : undefined
              }
              onClick={() =>
                id === "join" ? setModal({ type: "join" }) : nav(id)
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  return (
    <>
      {status.preview && (
        <div className="preview-banner" role="status">
          <span>
            <b>{status.preview.username}</b> olarak test ediyorsun · Hesap
            bilgileri korunur, test skorları ayrı tutulur.
          </span>
          <button onClick={() => changePreview("preview_stop")}>
            Yöneticiye dön
          </button>
        </div>
      )}
      <ScreenPages
        manualScroll={tab === "profile" && !/^(host|join|screen)\//.test(route)}
        resetKey={`${route}:${tab}:${!!status.admin}`}
      >
        {body}
      </ScreenPages>
      <PwaNotices allowUpdate={!/^(host|join|screen)\//.test(route)} />
      {status.admin && (
        <IdleEvents
          key={`${status.user?.id}:${!!status.preview}`}
          onRooms={setRooms}
        />
      )}
      {toast && (
        <div role="status" className="toast">
          <AlertCircle size={18} />
          {toast}
        </div>
      )}
      {modal?.type === "login" && (
        <Login
          onClose={() => setModal(null)}
          onDone={(result) => {
            refresh();
            setStatus((s) => ({ ...s, admin: true, user: result.user }));
            setModal(modal.next || null);
          }}
          notify={notify}
        />
      )}{" "}
      {modal?.type === "join" && (
        <Modal title="Oyuna katıl" onClose={() => setModal(null)}>
          <form
            className="mobile-join-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (/^\d{6}$/.test(joining)) {
                setModal(null);
                go("join/" + joining);
              } else notify("6 haneli etkinlik kodunu girin.");
            }}
          >
            <p>Arkadaşlarının paylaştığı 6 haneli kodu yaz.</p>
            <Field label="Oyun kodu">
              <input
                autoFocus
                inputMode="numeric"
                autoComplete="off"
                enterKeyHint="go"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                placeholder="000000"
                value={joining}
                onChange={(e) => setJoining(e.target.value.replace(/\D/g, ""))}
              />
            </Field>
            <Button className="full">
              Oyuna katıl <ArrowRight size={20} />
            </Button>
          </form>
        </Modal>
      )}
      {modal?.type === "password" && (
        <ChangePassword onClose={() => setModal(null)} notify={notify} />
      )}
      {modal?.type === "create" && !status.user?.needsProfileSetup && (
        <Create
          mode={modal.mode}
          initialCat={modal.cat}
          canManageLibrary={status.user?.role === "owner"}
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
function Login({ onClose, onDone }) {
  const [username, setUsername] = useState(""),
    [pass, setPass] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal title="Stüdyona hoş geldin" onClose={onClose}>
      <p className="muted">
        Bir kez giriş yap, tüm etkinliklerini buradan yönet. Yeni cihazdan giriş
        yaptığında önceki cihazdaki oturumun kapanır. Yönetici hesabı bu
        sınırdan muaftır.
      </p>
      <GoogleSignIn onDone={onDone} />
      <details className="login-existing" open>
        <summary>Mevcut kullanıcı adı ve şifremle giriş</summary>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              onDone(await api("login", { username, password: pass }));
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field label="Kullanıcı adı">
            <input
              autoComplete="username"
              name="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Field>
          <Field label="Şifre">
            <input
              type="password"
              autoComplete="current-password"
              name="password"
              required
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </Field>
          {error && (
            <p className="account-error" role="alert">
              {error}
            </p>
          )}
          <Button disabled={busy} className="full">
            {busy ? "Giriş yapılıyor…" : "Stüdyoya gir"}
            <ArrowRight size={18} />
          </Button>
          <p className="login-note">
            <ShieldCheck size={16} /> Bu cihazda oturumun açık kalır. Her oyunda
            tekrar giriş yapman gerekmez.
          </p>
        </form>
      </details>
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
            notify(
              "Şifren değiştirildi. Hesabının diğer oturumları kapatıldı.",
            );
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
function Create({
  mode,
  initialCat,
  onClose,
  onDone,
  notify,
  canManageLibrary = false,
}) {
  const compact = useCompactLayout();
  const [cat, setCat] = useState(initialCat),
    [title, setTitle] = useState(
      mode === "quiz"
        ? (quizFormat(initialCat)?.name || catById(initialCat).name) +
            " Yarışması"
        : mode === "tournament"
          ? "Büyük Bilgi Turnuvası"
          : mode === "raffle"
            ? "Şanslı Anlar"
            : mode === "family"
              ? "Bizim Aile"
              : "Fikirler Buluşuyor",
    ),
    [seconds, setSeconds] = useState(
      mode === "family" ? 45 : ["quiz", "tournament"].includes(mode) ? 10 : 20,
    ),
    [questionCount, setQuestionCount] = useState(
      initialCat === "mixed" ? 20 : 10,
    ),
    [prompt, setPrompt] = useState("Bugünü tek kelimeyle anlat!"),
    [prize, setPrize] = useState(""),
    [busy, setBusy] = useState(false),
    [manual, setManual] = useState(false),
    [qs, setQs] = useState([]),
    [selected, setSelected] = useState([]),
    [customFamily, setCustomFamily] = useState(false),
    [manualFamily, setManualFamily] = useState(false),
    [familySelected, setFamilySelected] = useState([]),
    [familyQuestions, setFamilyQuestions] = useState([
      { text: "", examples: ["", "", ""] },
    ]);
  const format = mode === "quiz" ? quizFormat(cat) : null;
  const expertLimit = Math.floor(questionCount / 10);
  const selectedExpertCount = qs.filter(
    (q) => selected.includes(q.id) && q.difficulty !== "general",
  ).length;
  useEffect(() => {
    if (quizFormat(cat)) setManual(false);
    if (manual && canManageLibrary && !quizFormat(cat))
      api("questions", { category: cat })
        .then(setQs)
        .catch((e) => notify(e.message));
    setSelected([]);
  }, [manual, cat, canManageLibrary]);
  return (
    <Modal
      title={modes[mode].name + " oluştur"}
      onClose={onClose}
      wide={manual || customFamily || manualFamily}
      singleScreen={mode === "tournament"}
    >
      <form
        className={
          mode === "tournament"
            ? "module-create-form tournament-create-form"
            : compact && ["raffle", "cloud"].includes(mode)
              ? "module-create-form"
              : undefined
        }
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
                ...(mode === "quiz" ? { questionCount } : {}),
                prompt,
                ...(mode === "tournament" ? { prize } : {}),
                questionIds:
                  manual && canManageLibrary && !format ? selected : [],
                ...(mode === "family"
                  ? {
                      familyQuestions: customFamily ? familyQuestions : [],
                      familyQuestionIds: manualFamily ? familySelected : [],
                    }
                  : {}),
              }),
            );
          } catch (e) {
            notify(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {mode === "tournament" && (
          <div className="tournament-create-intro">
            <span className="tournament-create-emblem">
              <Crown size={30} />
            </span>
            <div>
              <strong>Büyük final burada başlar.</strong>
              <p>Ödülü belirle, sevdiklerini davet et.</p>
            </div>
          </div>
        )}
        <Field label="Etkinlik adı">
          <input
            autoFocus={mode !== "tournament"}
            required
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        {mode === "quiz" && (
          <>
            <div className="form-grid">
              <Field label="Oyun / konu">
                <ThemedSelect
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                >
                  {quizFormats.map((f) => (
                    <option value={f.id} key={f.id}>
                      {f.emoji} {f.name}
                    </option>
                  ))}
                  {categories.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </ThemedSelect>
              </Field>
              <Field label="Soru başına süre">
                <ThemedSelect
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                >
                  {[10, 15, 20].map((n) => (
                    <option value={n} key={n}>
                      {n} saniye
                    </option>
                  ))}
                </ThemedSelect>
              </Field>
            </div>
            <Field label="Soru sayısı">
              <ThemedSelect
                value={questionCount}
                onChange={(e) => {
                  setQuestionCount(Number(e.target.value));
                  setSelected([]);
                }}
              >
                {[10, 15, 20].map((n) => (
                  <option value={n} key={n}>
                    {n} soru
                  </option>
                ))}
              </ThemedSelect>
            </Field>
            {canManageLibrary && !format && (
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={manual}
                  onChange={(e) => setManual(e.target.checked)}
                />{" "}
                Soruları kendim seçmek istiyorum
              </label>
            )}
            {manual && canManageLibrary && !format ? (
              <>
                <p className="muted" aria-live="polite">
                  {selected.length}/{questionCount} soru seçildi ·{" "}
                  {selectedExpertCount}/{expertLimit} detay / uzmanlık sorusu.
                  En az {questionCount - expertLimit} genel bilgi sorusu seç.
                </p>
                <div className="question-pick">
                  {qs.map((q) => (
                    <label key={q.id}>
                      <input
                        type="checkbox"
                        checked={selected.includes(q.id)}
                        disabled={
                          !selected.includes(q.id) &&
                          (selected.length === questionCount ||
                            (q.difficulty !== "general" &&
                              selectedExpertCount >= expertLimit))
                        }
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, q.id]
                              : selected.filter((id) => id !== q.id),
                          )
                        }
                      />
                      <span>
                        {q.text}
                        <small
                          className={`question-level ${q.difficulty === "general" ? "general" : "expert"}`}
                        >
                          {q.difficulty === "general"
                            ? "Genel bilgi"
                            : "Detay / uzmanlık"}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <div className="info-box">
                <Sparkles size={20} />
                <span>
                  {format
                    ? `${questionCount} soruluk oyun · ${seconds} saniye/soru. ${format.rules}`
                    : `${questionCount - expertLimit} genel bilgi + en fazla ${expertLimit} detay / uzmanlık sorusu. Her düzeyde kullanılmamış sorulara öncelik verilir; o grup tamamlanınca en eski sorular yeniden gelir. Sorular karışık sırada gelir.`}
                </span>
              </div>
            )}
          </>
        )}
        {mode === "tournament" && (
          <>
            <Field label="Turnuva ödülü">
              <input
                required
                maxLength={200}
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
                placeholder="Örn. Şampiyona kitap hediyesi"
              />
            </Field>
            <fieldset className="tournament-time">
              <legend>Soru başına süre</legend>
              <div>
                {[10, 15, 20].map((n) => (
                  <label
                    key={n}
                    className={Number(seconds) === n ? "selected" : ""}
                  >
                    <input
                      type="radio"
                      name="tournament-seconds"
                      value={n}
                      checked={Number(seconds) === n}
                      onChange={() => setSeconds(n)}
                    />
                    <Clock size={16} />
                    <span>{n} sn</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="tournament-create-rules">
              <Users size={18} />
              <p>
                Herkes bir alan seçer; ortak alanlar tek turda birleşir. Oda
                açılınca 5 veya 10 soruya oy verilir.
              </p>
            </div>
          </>
        )}
        {mode === "family" && (
          <>
            <div className="info-box">
              <Heart size={24} />
              <span>
                Soruları kendin seç, rastgele oyna veya kendi sorularını ekle.
                Herkes adını ve ailedeki rolünü yazar, aynı 10 soruyu kendisi
                için cevaplar. Herkes hazır olunca dört şıklı aile yarışması
                başlar. En az 2 kişiyle oynanır.
              </span>
            </div>
            <Field label="Soru başına süre">
              <ThemedSelect
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
              >
                {[15, 30, 45, 60, 90].map((n) => (
                  <option key={n} value={n}>
                    {n} saniye
                  </option>
                ))}
              </ThemedSelect>
            </Field>
            <Field label="Hazır sorular nasıl seçilsin?">
              <ThemedSelect
                value={manualFamily ? "manual" : "random"}
                onChange={(e) => setManualFamily(e.target.value === "manual")}
              >
                <option value="random">Rastgele seçilsin</option>
                <option value="manual">Soruları ben seçeyim</option>
              </ThemedSelect>
            </Field>
            <label className="check-row">
              <input
                type="checkbox"
                checked={customFamily}
                onChange={(e) => setCustomFamily(e.target.checked)}
              />
              Kendi aile sorularımı eklemek istiyorum
            </label>
            {customFamily ? (
              <FamilyQuestionEditor
                questions={familyQuestions}
                onChange={setFamilyQuestions}
                manual={manualFamily}
              />
            ) : (
              !manualFamily && (
                <p className="muted">
                  50 soruluk havuzdan her oyun için 10 soru seçilir.
                </p>
              )
            )}
            {manualFamily && (
              <FamilyQuestionPicker
                selected={familySelected}
                onChange={setFamilySelected}
                count={10 - (customFamily ? familyQuestions.length : 0)}
              />
            )}
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
          disabled={
            busy ||
            (manual && selected.length !== questionCount) ||
            (manualFamily &&
              familySelected.length +
                (customFamily ? familyQuestions.length : 0) !==
                10)
          }
        >
          {busy
            ? "Hazırlanıyor…"
            : mode === "tournament"
              ? "Turnuva odasını oluştur"
              : "Etkinliği oluştur · ücretsiz"}{" "}
          <ArrowRight size={18} />
        </Button>
      </form>
    </Modal>
  );
}
function QR({ pin }) {
  const [src, setSrc] = useState("");
  const url = joinUrl(pin);
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
function Room({ kind, pin, admin, profile, onLogin, onBack, notify }) {
  const compact = useCompactLayout();
  const [room, setRoom] = useState(null),
    [error, setError] = useState(""),
    [token, setToken] = useState(
      () => localStorage.getItem("arena:" + pin) || "",
    ),
    [name, setName] = useState(profile?.username || ""),
    [role, setRole] = useState(""),
    [avatar] = useState(
      () =>
        characterById(
          profile?.avatar || localStorage.getItem("arena:character"),
        ).id,
    ),
    [busy, setBusy] = useState(false),
    [tick, setTick] = useState(Date.now()),
    [qr, setQr] = useState(false),
    [hostJoining, setHostJoining] = useState(false),
    [joinError, setJoinError] = useState(""),
    [needsPlayers, setNeedsPlayers] = useState(false),
    [sound, setSound] = useState(false);
  const host = roomHostControls(kind, admin, room),
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
    let dead = false,
      inFlight = false,
      finished = false,
      failures = 0;
    const controller = new AbortController();
    async function poll() {
      if (dead || inFlight || finished) return;
      inFlight = true;
      let delay;
      try {
        const r = await api("room", { pin }, token, {
          signal: controller.signal,
        });
        failures = 0;
        delay = roomPollDelay(r, { hidden: document.hidden });
        finished = delay === null;
        if (!dead) {
          offset.current = r.serverTime - Date.now() / 1000;
          setRoom(r);
          setError("");
        }
      } catch (e) {
        if (!dead) setError(e.message);
        if (e.code === "BROWSER_VERIFICATION") finished = true;
        delay = roomPollDelay(null, { failures: ++failures });
      }
      inFlight = false;
      if (!dead && !finished) timeout = setTimeout(poll, delay);
    }
    let timeout;
    const wake = () => {
      if (!document.hidden && !inFlight && !finished) {
        clearTimeout(timeout);
        poll();
      }
    };
    document.addEventListener("visibilitychange", wake);
    poll();
    const t = setInterval(() => setTick(Date.now()), 200);
    return () => {
      dead = true;
      controller.abort();
      document.removeEventListener("visibilitychange", wake);
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
    if (
      a === "advance" &&
      room?.mode === "quiz" &&
      room.phase === "lobby" &&
      room.playerCount < 2
    ) {
      setNeedsPlayers(true);
      return false;
    }
    setBusy(true);
    try {
      const r = await api(a, { pin, ...data }, token);
      setRoom(r);
      offset.current = r.serverTime - Date.now() / 1000;
      return true;
    } catch (e) {
      if (
        a === "advance" &&
        e.message.startsWith("Bilgi yarışması için en az 2")
      )
        setNeedsPlayers(true);
      else notify(e.message);
      await load();
      return false;
    } finally {
      setBusy(false);
    }
  }
  const closed = room && ["finished", "closed"].includes(room.phase);
  const quizLobby = room?.mode === "quiz" && room.phase === "lobby";
  const tournamentLobby =
    compact &&
    room?.mode === "tournament" &&
    ["lobby", "voting"].includes(room.phase);
  const join = async (e) => {
    e?.preventDefault();
    setBusy(true);
    setJoinError("");
    try {
      const r = await api("join", {
        pin,
        name,
        ...(profile ? { useProfile: true } : { autoAvatar: true }),
        ...(room.mode === "family" ? { role } : {}),
      });
      localStorage.setItem("arena:" + pin, r.token);
      localStorage.setItem("arena:character", r.room.me.avatar);
      setToken(r.token);
      setRoom(r.room);
      setHostJoining(false);
    } catch (e) {
      setJoinError(e.message);
      notify(e.message);
    } finally {
      setBusy(false);
    }
  };
  async function joinWithProfile() {
    if (busy) return;
    setBusy(true);
    try {
      const profileAvatar = characterById(
        profile?.avatar || localStorage.getItem("arena:character"),
      ).id;
      const r = await api("join", { pin, asHost: true, avatar: profileAvatar });
      localStorage.setItem("arena:" + pin, r.token);
      setToken(r.token);
      setRoom(r.room);
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!room)
    return (
      <div className="center-page">
        <img
          className="brand-icon"
          src="/icons/icon-192.png?v=varmisin-v1"
          alt="Varmısın"
        />
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
  if (kind === "host" && admin && !room.canManage)
    return (
      <div className="center-page">
        <ShieldCheck size={48} />
        <h1>Bu etkinlik başka bir hesaba ait.</h1>
        <Button onClick={onBack}>Stüdyoya dön</Button>
      </div>
    );
  if (
    kind === "join" &&
    !room.me &&
    !closed &&
    ["family", "tournament"].includes(room.mode) &&
    room.phase !== "lobby"
  )
    return (
      <div className="center-page">
        <Heart size={48} />
        <h1>
          {room.mode === "tournament"
            ? "Bu turnuva başladı."
            : "Bu aile yarışı başladı."}
        </h1>
        <p>Bir sonraki oyunda aramıza katılabilirsin.</p>
        <Button secondary onClick={onBack}>
          Stüdyoya dön
        </Button>
      </div>
    );
  if (kind === "join" && !room.me && !closed)
    return (
      <JoinGame
        room={room}
        pin={pin}
        modeName={modes[room.mode].name}
        name={name}
        onName={setName}
        profile={profile}
        role={role}
        onRole={setRole}
        busy={busy}
        error={joinError || error}
        onSubmit={join}
      />
    );
  return (
    <div
      className={"event-page " + (host || screen ? "presenter" : "participant")}
      data-compact-room={compact && ["raffle", "cloud"].includes(room.mode)}
      data-quiz-lobby={quizLobby}
      data-screen-fit={quizLobby || tournamentLobby || undefined}
      data-tournament-lobby={tournamentLobby || undefined}
      data-screen-key={`${room.phase}:${room.question?.id || room.index}`}
      data-playing={["question", "countdown", "reveal"].includes(room.phase)}
    >
      <header className="event-header" data-cancellable={host && !closed}>
        <button className="text-btn" onClick={onBack}>
          <ChevronLeft size={19} /> Stüdyo
        </button>
        <a href="#" className="event-brand">
          ✦ Varmısın
        </a>
        <div className="event-tools">
          {compact && ["raffle", "cloud"].includes(room.mode) && (
            <ModuleGuide mode={room.mode} compact />
          )}
          {host && !closed && (
            <CancelGameButton
              compact
              disabled={busy}
              onConfirm={() => action("close")}
            />
          )}
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
      {host &&
        !screen &&
        ["quiz", "family", "tournament"].includes(room.mode) &&
        gameCreditMoment(room) && (
          <GameCreditNotice
            key={`${pin}:${gameCreditMoment(room)}`}
            pin={pin}
            moment={gameCreditMoment(room)}
          />
        )}
      {!quizLobby && !tournamentLobby && (
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
                · <CharacterAvatar id={room.me.avatar} /> Merhaba,{" "}
                <b>{room.me.name}</b>
              </>
            )}
          </span>
        </div>
      )}
      {host &&
        !quizLobby &&
        !tournamentLobby &&
        ["lobby", "open"].includes(room.phase) && (
          <p className="credit-capacity-note">
            Katılım ücretsiz · En fazla {room.participantLimit || 10} canlı
            katılımcı
            {room.mode === "raffle" ? ` · ${room.raffleLimit || 50} isim` : ""}.
          </p>
        )}
      {!screen &&
        !quizLobby &&
        !tournamentLobby &&
        !(compact && ["raffle", "cloud"].includes(room.mode)) &&
        ["lobby", "open"].includes(room.phase) && (
          <div className="room-module-guide">
            <ModuleGuide
              mode={quizFormat(room.quizType) ? room.quizType : room.mode}
            />
          </div>
        )}
      {room.mode === "tournament" && !tournamentLobby && (
        <TournamentBanner room={room} />
      )}
      {host &&
        !quizLobby &&
        !tournamentLobby &&
        room.phase === "lobby" &&
        ["quiz", "family", "tournament"].includes(room.mode) && (
          <section
            className={`host-player-banner ${room.me ? "is-joined" : ""}`}
            aria-label="Kurucu olarak yarışmaya katıl"
          >
            {room.me ? (
              <CharacterAvatar id={room.me.avatar} />
            ) : (
              <Users size={28} />
            )}
            <div>
              <strong>
                {room.me
                  ? `${room.me.name}, sen de yarışmacısın!`
                  : "Sen de yarışmaya katıl!"}
              </strong>
              <p>
                {room.me
                  ? "Bu ekrandan hem yarışabilir hem oyunu yönetebilirsin."
                  : "İsmini ve karakterini seç. Oyunu yönetirken soruları sen de cevapla."}
              </p>
            </div>
            {!room.me && (
              <Button
                onClick={() =>
                  room.mode === "family"
                    ? setHostJoining(true)
                    : joinWithProfile()
                }
              >
                <Plus size={18} /> Ben de yarışacağım
              </Button>
            )}
          </section>
        )}
      {room.phase === "closed" ? (
        <div className="center-card">
          <CheckCircle2 size={55} />
          <h2>
            {room.closeReason
              ? "Etkinlik iptal edildi"
              : "Güzel bir etkinlikti!"}
          </h2>
          <p>
            {room.closeReason === "not_started"
              ? "3 dakika içinde başlatılmadığı için otomatik iptal edildi."
              : room.closeReason === "cancelled"
                ? "Kurucu bu etkinliği iptal etti."
                : "Katıldığın için teşekkürler."}
          </p>
        </div>
      ) : transition ? (
        <CountdownScene
          number={transition.number}
          next={transition.next}
          total={room.total}
          mode={room.mode}
        />
      ) : room.mode === "tournament" &&
        ["lobby", "voting"].includes(room.phase) ? (
        tournamentLobby ? (
          <TournamentCompactLobby
            room={room}
            host={host}
            screen={screen}
            busy={busy}
            now={now}
            action={action}
            onJoin={joinWithProfile}
            onQr={() => setQr(true)}
          />
        ) : (
          <TournamentLobby
            room={room}
            host={host}
            screen={screen}
            action={action}
            busy={busy}
            now={now}
            QR={QR}
          />
        )
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
      ) : ["quiz", "tournament"].includes(room.mode) ? (
        <>
          {room.phase === "lobby" ? (
            <QuizLobby
              room={room}
              pin={pin}
              host={host}
              screen={screen}
              busy={busy}
              QR={QR}
              guideMode={quizFormat(room.quizType) ? room.quizType : "quiz"}
              onJoin={joinWithProfile}
              onStart={() =>
                action("advance", {
                  expectedIndex: room.index,
                  expectedPhase: room.phase,
                })
              }
              onCopy={() =>
                navigator.clipboard
                  .writeText(joinUrl(pin))
                  .then(() => notify("Katılım bağlantısı kopyalandı."))
                  .catch(() => notify("Bağlantı: " + joinUrl(pin)))
              }
            />
          ) : room.phase === "finished" ? (
            <Results room={room} host={host} />
          ) : (
            <div className={`quiz-stage quiz-${room.quizType || "classic"}`}>
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
              {room.quizType === "mixed" && room.question?.category && (
                <span className="quiz-category-label">
                  {catById(room.question.category).emoji}{" "}
                  {catById(room.question.category).name}
                </span>
              )}
              <h2>{room.question?.text}</h2>
              {room.quizType === "estimate" && (
                <EstimateRound
                  key={room.question?.id}
                  room={room}
                  screen={screen}
                  busy={busy}
                  left={left}
                  action={action}
                />
              )}
              <AnswerComparison
                room={room}
                renderOption={(value) => (
                  <OptionContent value={value} showName />
                )}
              />
              {room.quizType !== "estimate" &&
                (room.phase !== "reveal" || !room.answerCards?.length) && (
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
                          !room.me ||
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
                          {room.quizType === "binary"
                            ? ["✓", "✕"][i]
                            : ["▲", "◆", "●", "■"][i]}
                        </span>
                        <b>
                          <OptionContent value={o} />
                        </b>
                        {room.phase === "reveal" &&
                          room.question.correct === i && (
                            <CheckCircle2 size={24} />
                          )}
                      </button>
                    ))}
                  </div>
                )}
              {room.quizType !== "estimate" &&
                room.phase === "question" &&
                room.myAnswer && (
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
                  {room.question?.source && (
                    <a
                      href={room.question.source}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Bilginin kaynağını gör ↗
                    </a>
                  )}
                  <div className="mini-ranking">
                    {room.players.slice(0, 3).map((p, i) => (
                      <span key={p.name}>
                        <CharacterAvatar id={p.avatar} />{" "}
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
      {host && !quizLobby && !tournamentLobby && room.phase !== "closed" && (
        <CompactRoomPanel
          enabled={compact && ["raffle", "cloud"].includes(room.mode)}
          title="Oda seçenekleri"
        >
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
            <CancelGameButton
              disabled={busy}
              completed={room.phase === "finished"}
              onConfirm={() => action("close")}
            />
          </div>
        </CompactRoomPanel>
      )}
      {qr && (
        <Modal title="Herkes oyuna dahil!" onClose={() => setQr(false)}>
          <div className="qr-dialog">
            <QR pin={pin} />
            <h2>{pin}</h2>
            <p>{publicOrigin}</p>
            <Button
              secondary
              onClick={() =>
                navigator.clipboard
                  .writeText(joinUrl(pin))
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
      {needsPlayers && (
        <Modal
          title="Birlikte yarışmak daha eğlenceli!"
          onClose={() => setNeedsPlayers(false)}
        >
          <div className="qr-dialog">
            <Users size={44} aria-hidden="true" />
            <p>
              Bilgi yarışması için en az <strong>2 yarışmacı</strong> gerekli.
              Birini davet et; tek başına oynamak istersen{" "}
              <strong>Kendini Dene</strong> seni bekliyor.
            </p>
            <Button className="full" onClick={() => setNeedsPlayers(false)}>
              Katılımcı bekle
            </Button>
            <Button
              secondary
              className="full"
              disabled={busy}
              onClick={async () => {
                if (await action("close")) location.hash = "studio/solo";
              }}
            >
              Bu odayı kapat, Kendini Dene’ye geç
            </Button>
          </div>
        </Modal>
      )}
      {hostJoining && host && !room.me && room.phase === "lobby" && (
        <Modal
          title="Sen de yarışmacı ol"
          onClose={() => setHostJoining(false)}
        >
          <p className="muted">
            Katıldıktan sonra oyunu aynı ekrandan yönetmeye devam edebilirsin.
          </p>
          <form onSubmit={join}>
            {room.mode === "family" && (
              <Field label="Ailedeki rolün">
                <input
                  required
                  maxLength={24}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Anne, baba, çocuk, teyze…"
                />
              </Field>
            )}
            <div className="join-game-identity">
              <CharacterAvatar id={profile?.avatar || avatar} />
              <strong>{profile?.username}</strong>
            </div>
            <Button className="full" disabled={busy}>
              {busy ? "Katılıyorsun…" : "Yarışmacı olarak katıl"}
              <ArrowRight size={18} />
            </Button>
          </form>
        </Modal>
      )}
      {(kind === "join" || host) &&
        !isTransitioning &&
        ["quiz", "family", "tournament"].includes(room.mode) &&
        room.phase === "reveal" &&
        room.me &&
        room.myAnswer &&
        room.quizType !== "estimate" &&
        Number.isInteger(room.question?.correct) && (
          <AnswerResultPopup
            key={room.question.id}
            room={room}
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
function AnswerResultPopup({ correct, points, correctAnswer, room }) {
  const compare = room.answerCards?.length > 1;
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
      className={`answer-result-popup ${correct ? "result-correct" : "result-wrong"}${compare ? " has-comparison" : ""}`}
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
      <ScreenPages dialog>
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
        {compare ? (
          <AnswerComparison
            room={room}
            compact
            renderOption={(value) => <OptionContent value={value} showName />}
          />
        ) : correct ? (
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
      </ScreenPages>
    </dialog>
  );
}
function Results({ room, host }) {
  const ranking = rankPlayers(room.players);
  return (
    <div className="results">
      <span className="eyebrow">
        {room.mode === "tournament"
          ? "TURNUVA TAMAMLANDI · TOPLAM PUANLAR"
          : "YARIŞMA TAMAMLANDI"}
      </span>
      <h2>
        {room.players[0]?.name || "Yarışma"}
        {room.players.length ? " zirvede!" : " tamamlandı!"}
      </h2>
      <Podium players={ranking} />
      <details className="ranking-details">
        <summary>Tüm sıralamayı gör · {ranking.length} yarışmacı</summary>
        <div className="leaderboard">
          {ranking.map((p) => (
            <div key={p.name}>
              <span className="rank">{p.rank}</span>
              <CharacterAvatar id={p.avatar} />
              <b>{p.name}</b>
              <strong>
                {p.score.toLocaleString("tr")} <small>puan</small>
              </strong>
            </div>
          ))}
        </div>
      </details>
      {host && (
        <Button
          secondary
          onClick={() =>
            downloadCSV(
              ranking.map((p) => [p.rank, p.name, p.score]),
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
  const compact = useCompactLayout();
  const [words, setWords] = useState(""),
    [prompt, setPrompt] = useState(room.prompt);
  useEffect(() => {
    setWords((room.myWords || []).join(", "));
    setPrompt(room.prompt);
  }, [room.promptVersion]);
  if (room.phase === "lobby")
    return (
      <div className="center-card">
        <h2>{room.prompt}</h2>
        <p>Katılımcılar gelince soruyu başlat. Oda oluşturmak ücretsiz.</p>
        <p>
          {room.playerCount} / {room.participantLimit || 10} kişi katıldı.
        </p>
        {host ? (
          <Button disabled={busy} onClick={() => action("cloud_start")}>
            Soruyu başlat
          </Button>
        ) : (
          <p>Sunucunun soruyu başlatması bekleniyor.</p>
        )}
      </div>
    );
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
          <CloudViewport enabled={compact}>
            <WordCloud words={room.words} />
          </CloudViewport>
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
        <CompactRoomPanel
          enabled={compact}
          title="Soru ve cevaplar"
          trigger="Yeni soru / Cevapları indir"
        >
          <div className="cloud-controls">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  confirm(
                    "Yeni soru önceki kelime bulutunu temizleyecek. Devam edilsin mi?",
                  )
                )
                  await action("prompt", {
                    prompt,
                    promptVersion: room.promptVersion,
                  });
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
        </CompactRoomPanel>
      )}
    </div>
  );
}
function RaffleWheel({ room, now, preview = false, onSettled }) {
  const canvas = useRef();
  const rotor = useRef();
  const rotation = useRef(0);
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
      angle = rotation.current,
      landing = null,
      stopped = false;
    const id = draw?.id;
    const origin = angle;
    // Polling updates the winner, but must not reset the animation clock.
    const clock = performance.now();
    const serverTime =
      latest.current.time + (clock - latest.current.clock) / 1000;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const tick = (stamp) => {
      const current = latest.current;
      const time = serverTime + (stamp - clock) / 1000;
      if (!id) {
        rotor.current.style.transform = "rotate(0deg)";
        return;
      }
      const index = current.entries.findIndex(
        (e) => e.id === current.draw?.winner?.id,
      );
      const motion = wheelSpin(
        time - current.draw.startedAt,
        current.draw.revealAt - current.draw.startedAt,
      );
      if (!landing && !reducedMotion) angle = origin + motion.angle;
      if (index >= 0 && !landing) {
        if (
          reducedMotion ||
          serverTime >= (current.draw.settleAt ?? current.draw.revealAt)
        ) {
          angle = winnerRotation(index, current.entries.length, angle);
          stopped = true;
        } else
          landing = {
            ...wheelLanding(
              index,
              current.entries.length,
              angle,
              motion.speed,
              (current.draw.settleAt ?? current.draw.revealAt) - time,
            ),
            start: stamp,
          };
      }
      if (landing) {
        const progress = Math.min(
          1,
          (stamp - landing.start) / (landing.duration * 1000),
        );
        angle =
          landing.from +
          (landing.target - landing.from) * wheelEase(progress, landing.slope);
        stopped = progress === 1;
      } else if (!stopped)
        angle = reducedMotion ? origin : origin + motion.angle;
      rotation.current = angle;
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
  const compact = useCompactLayout();
  const [name, setName] = useState(""),
    [imported, setImported] = useState(null),
    [uploading, setUploading] = useState(false);
  const input = useRef();
  const nameInput = useRef();
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
              if (
                await action("draw", { expectedDrawId: room.draw?.id ?? null })
              )
                stage.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
            }}
          >
            <Sparkles size={20} />
            {drawing ? "Çark dönüyor…" : "Çarkı çevir"}
          </Button>
        )}
      </section>
      {host ? (
        <CompactRoomPanel
          enabled={compact}
          title="Şans havuzu"
          trigger="İsim ekle / Excel"
        >
          <aside className="raffle-panel">
            <h3>Şans havuzu</h3>
            <p>
              Bir isim ekle, şansa bir yer aç!
              <br />
              Aynı isimler bir kez eklenir.
            </p>
            <form
              className="raffle-name-form"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!name.trim() || busy || drawing) return;
                if (await action("entries", { names: [name.trim()] })) {
                  setName("");
                  nameInput.current?.focus();
                }
              }}
            >
              <Field label="İsim yaz">
                <div className="raffle-name-input">
                  <Users size={20} aria-hidden="true" />
                  <input
                    ref={nameInput}
                    type="text"
                    placeholder="Örn. Ayşe Yılmaz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                    readOnly={busy || !!drawing}
                    required
                  />
                </div>
              </Field>
              <Button
                className="full raffle-name-add"
                disabled={busy || drawing || !name.trim()}
              >
                <Plus size={20} /> İsim ekle
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
        </CompactRoomPanel>
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
        <CompactRoomPanel
          enabled={compact}
          title="Şanslı isimler"
          trigger="Kazananlar"
        >
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
        </CompactRoomPanel>
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
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0),
    [add, setAdd] = useState(false),
    [form, setForm] = useState({
      text: "",
      options: ["", "", "", ""],
      correct: 0,
      explanation: "",
      difficulty: "general",
    }),
    [busy, setBusy] = useState(false);
  const load = () => setRevision((value) => value + 1);
  useEffect(() => {
    if (!admin) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setQs([]);
    api("questions", { category: cat })
      .then((data) => {
        if (!cancelled) setQs(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cat, admin, revision]);
  if (!admin)
    return (
      <div className="empty">Soru kütüphanesi için yönetici girişi yapın.</div>
    );
  return (
    <>
      <LibraryBrowser
        cat={cat}
        onCategory={setCat}
        questions={qs}
        loading={loading}
        error={error}
        onRetry={load}
        onAdd={() => setAdd(true)}
        renderOption={(value) => <OptionContent value={value} showName />}
        onDelete={async (q) => {
          if (!confirm("Bu özel soru silinsin mi?")) return;
          try {
            await api("question_delete", { id: q.id });
            load();
            refresh();
          } catch (e) {
            notify(e.message);
          }
        }}
      />
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
                  difficulty: "general",
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
              <ThemedSelect
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
              </ThemedSelect>
            </Field>
            <Field label="Soru düzeyi">
              <ThemedSelect
                value={form.difficulty}
                onChange={(e) =>
                  setForm({ ...form, difficulty: e.target.value })
                }
              >
                <option value="general">Genel bilgi · Kolay / orta</option>
                <option value="expert">
                  Detay / uzmanlık · 10 soruda en fazla 1
                </option>
              </ThemedSelect>
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
        <img
          className="brand-icon"
          src="/icons/icon-192.png?v=varmisin-v1"
          alt="Varmısın"
        />
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
setupAppearance();
setupNative().catch(() => console.warn("Mobil gezinme başlatılamadı."));
createRoot(document.getElementById("root")).render(
  <>
    <App />
    <BrowserVerification />
  </>,
);
