import React, { useEffect, useRef, useState } from "react";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { getBrowserVerification, onBrowserVerification } from "./api";
import { nativeApp, publicOrigin } from "./native";

export default function BrowserVerification() {
  const [error, setError] = useState(getBrowserVerification);
  const dialog = useRef(null);
  useEffect(() => onBrowserVerification(setError), []);
  useEffect(() => {
    if (error && dialog.current && !dialog.current.open)
      dialog.current.showModal();
  }, [error]);
  if (!error) return null;
  return (
    <dialog
      ref={dialog}
      aria-labelledby="browser-verification-title"
      onCancel={(e) => e.preventDefault()}
    >
      <div className="modal-head">
        <h2 id="browser-verification-title">
          <ShieldCheck aria-hidden="true" /> Kısa bir doğrulama gerekiyor
        </h2>
      </div>
      <p>
        {nativeApp ? (
          "Sunucu bağlantı koruması uygulamadan gelen isteği durdurdu. Bir süre sonra yeniden deneyebilir veya web sitesinden devam edebilirsin."
        ) : (
          <>
            Oyuna devam etmek için sayfayı yenile. Tarayıcı kontrolü
            tamamlandığında aynı oyun ekranı yeniden açılacak.
          </>
        )}
      </p>
      <button className="btn full" onClick={() => location.reload()}>
        <RefreshCw size={18} aria-hidden="true" /> Sayfayı yenile
      </button>
      {nativeApp && (
        <button
          className="btn secondary full"
          onClick={async () => {
            const { Browser } = await import("@capacitor/browser");
            await Browser.open({ url: publicOrigin });
          }}
        >
          Web sitesini aç
        </button>
      )}
    </dialog>
  );
}
