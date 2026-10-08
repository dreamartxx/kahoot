import { createPortal } from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import {
  Download,
  Smartphone,
  X,
  WifiOff,
  RefreshCw,
  Share,
} from "lucide-react";
import { getInstallPrompt, isStandalone, promptInstall } from "./pwa";

export function PwaInstall({ className = "" }) {
  const [installed, setInstalled] = useState(isStandalone);
  const [available, setAvailable] = useState(() => !!getInstallPrompt());
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const dialog = useRef();
  const ios =
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const android = /Android/.test(navigator.userAgent);
  useEffect(() => {
    const ready = () => setAvailable(true);
    const done = () => {
      setInstalled(true);
      setOpen(false);
    };
    window.addEventListener("arena:pwa-installable", ready);
    window.addEventListener("arena:pwa-installed", done);
    return () => {
      window.removeEventListener("arena:pwa-installable", ready);
      window.removeEventListener("arena:pwa-installed", done);
    };
  }, []);
  useEffect(() => {
    if (!open || !dialog.current) return;
    const el = dialog.current;
    el.showModal();
    return () => el.close();
  }, [open]);
  if (installed) return null;
  return (
    <>
      <button
        className={`pwa-install-button ${className}`}
        onClick={() => setOpen(true)}
      >
        <Smartphone size={19} /> Uygulamayı yükle
      </button>
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            className="pwa-install-dialog"
            aria-labelledby="pwa-title"
            onCancel={() => setOpen(false)}
          >
            <div className="modal-head">
              <h2 id="pwa-title">Bilgi Arena hep yanında.</h2>
              <button
                className="icon-btn"
                aria-label="Kapat"
                onClick={() => setOpen(false)}
              >
                <X />
              </button>
            </div>
            <div className="pwa-install-intro">
              <img
                src="/icons/icon-192.png"
                alt="Bilgi Arena uygulama simgesi"
                width="76"
                height="76"
              />
              <p>
                Ana ekranına ekle; aile oyunları ve yarışmalar bir dokunuş
                uzağında olsun.
              </p>
            </div>
            {available ? (
              <button
                className="btn full"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    if (await promptInstall()) {
                      setInstalled(true);
                      setOpen(false);
                    }
                  } catch {
                  } finally {
                    setAvailable(!!getInstallPrompt());
                    setBusy(false);
                  }
                }}
              >
                <Download size={18} />
                {busy ? "Yükleme açılıyor…" : "Bilgi Arena’yı yükle"}
              </button>
            ) : (
              <ol className="pwa-install-steps">
                {ios ? (
                  <>
                    <li>
                      Safari’de <b>Paylaş</b> <Share size={15} /> menüsünü aç.
                    </li>
                    <li>
                      <b>Ana Ekrana Ekle</b> seçeneğine dokun.
                    </li>
                    <li>
                      Varsa <b>Web Uygulaması Olarak Aç</b> seçeneğini açık
                      bırak ve <b>Ekle</b> de.
                    </li>
                  </>
                ) : android ? (
                  <>
                    <li>
                      Chrome’da sağ üstteki <b>⋮</b> menüsünü aç.
                    </li>
                    <li>
                      <b>Uygulamayı yükle</b> veya <b>Ana ekrana ekle</b>{" "}
                      seçeneğini seç.
                    </li>
                    <li>
                      <b>Yükle</b> diyerek tamamla.
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      Chrome veya Edge’de adres çubuğundaki{" "}
                      <b>yükleme simgesini</b> ya da tarayıcı menüsündeki
                      uygulama yükleme seçeneğini aç.
                    </li>
                    <li>
                      Safari’de <b>Dosya → Dock’a Ekle</b> seçeneğini
                      kullanabilirsin.
                    </li>
                  </>
                )}
              </ol>
            )}
            <p className="pwa-install-note">
              Ücretsizdir. Canlı oyunlar için internet bağlantısı gerekir.
            </p>
          </dialog>,
          document.body,
        )}
    </>
  );
}
export function PwaNotices() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [update, setUpdate] = useState(false);
  useEffect(() => {
    const online = () => setOffline(false),
      disconnected = () => setOffline(true),
      ready = () => setUpdate(true);
    window.addEventListener("online", online);
    window.addEventListener("offline", disconnected);
    window.addEventListener("arena:pwa-update", ready);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", disconnected);
      window.removeEventListener("arena:pwa-update", ready);
    };
  }, []);
  if (offline)
    return (
      <div className="pwa-notice" role="status">
        <WifiOff size={18} />
        <span>
          Bağlantı yok. Canlı oyun için internet bağlantısı gerekiyor.
        </span>
      </div>
    );
  if (update)
    return (
      <div className="pwa-notice" role="status">
        <RefreshCw size={18} />
        <span>Yeni sürüm hazır.</span>
        <button onClick={() => location.reload()}>Güncelle</button>
        <button
          aria-label="Güncellemeyi sonra yap"
          onClick={() => setUpdate(false)}
        >
          <X size={16} />
        </button>
      </div>
    );
  return null;
}
