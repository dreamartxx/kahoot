import React, { useEffect, useRef, useState } from "react";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { getBrowserVerification, onBrowserVerification } from "./api";

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
        Oyuna devam etmek için sayfayı yenile. Tarayıcı kontrolü tamamlandığında
        aynı oyun ekranı yeniden açılacak.
      </p>
      <button className="btn full" onClick={() => location.reload()}>
        <RefreshCw size={18} aria-hidden="true" /> Sayfayı yenile
      </button>
    </dialog>
  );
}
