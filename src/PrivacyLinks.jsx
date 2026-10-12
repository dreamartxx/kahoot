import React, { useState } from "react";
import "./privacy-links.css";
import { nativeApp, publicOrigin } from "./native";

export default function PrivacyLinks() {
  const [error, setError] = useState("");
  async function open(e) {
    if (!nativeApp) return;
    e.preventDefault();
    const url = e.currentTarget.href;
    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url });
      setError("");
    } catch {
      setError("Sayfa açılamadı. ailecekeglen.com.tr adresinden gizlilik ve destek sayfalarına ulaşabilirsin.");
    }
  }
  return (
    <div className="privacy-links">
      <nav aria-label="Gizlilik ve destek">
        <a href={`${publicOrigin}/privacy.html`} target="_blank" rel="noopener noreferrer" onClick={open}>Gizlilik</a>
        <span aria-hidden="true">·</span>
        <a href={`${publicOrigin}/delete-account.html`} target="_blank" rel="noopener noreferrer" onClick={open}>Hesap ve veri silme</a>
        <span aria-hidden="true">·</span>
        <a href="mailto:ailecekeglen@ailecekeglen.com.tr">Destek</a>
      </nav>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
