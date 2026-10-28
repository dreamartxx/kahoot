import React, { useEffect, useState } from "react";
import { Sun, Moon, Monitor, Bell, Palette } from "lucide-react";
import { themePreference, setThemePreference } from "./appearance";
import { getReminders, remindersAvailable } from "./reminders";
export function ThemePicker({ compact = false }) {
  const [theme, setTheme] = useState(themePreference);
  const [error, setError] = useState("");
  useEffect(() => {
    const update = () => setTheme(themePreference());
    window.addEventListener("arena:themechange", update);
    return () => window.removeEventListener("arena:themechange", update);
  }, []);
  return (
    <div className={compact ? "theme-picker compact-theme" : "theme-picker"}>
      <div className="theme-options" role="group" aria-label="Görünüm teması">
        {[
          ["light", "Açık", Sun],
          ["dark", "Koyu", Moon],
          ["system", "Sistem", Monitor],
        ].map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            aria-pressed={theme === value}
            aria-label={`${label} tema`}
            title={`${label} tema`}
            onClick={() => {
              try {
                setThemePreference(value);
                setError("");
              } catch {
                setError("Tema tercihi bu cihazda kaydedilemedi.");
              }
            }}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
export default function Preferences() {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState("");
  const [busy, setBusy] = useState(remindersAvailable);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      if (!remindersAvailable) return;
      try {
        const state = await (await getReminders()).status();
        if (mounted) {
          setEnabled(state.enabled);
          setPermission(state.permission);
        }
      } catch {
        if (mounted)
          setMessage("Bildirim ayarı okunamadı. Tekrar deneyebilirsin.");
      } finally {
        if (mounted) setBusy(false);
      }
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => {
      mounted = false;
      window.removeEventListener("focus", refresh);
    };
  }, []);
  async function toggle() {
    setBusy(true);
    setMessage("");
    try {
      const reminders = await getReminders();
      const active = await reminders.setEnabled(!enabled);
      const state = await reminders.status();
      setEnabled(state.enabled);
      setPermission(state.permission);
      setMessage(
        active
          ? "Hatırlatmalar açıldı. Yeniden oynadığında süre baştan başlar."
          : enabled
            ? "Hatırlatmalar kapatıldı."
            : "Bildirim izni verilmedi. Telefonun uygulama ayarlarından izin verebilirsin.",
      );
    } catch {
      setMessage("Bildirim ayarı tamamlanamadı. Lütfen yeniden dene.");
      setEnabled((await getReminders())?.enabled() || false);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="profile-card appearance-card"
      aria-label="Görünüm ve bildirimler"
    >
      <h2>
        <Palette size={21} /> Senin tarzın, senin oyunun
      </h2>
      <p>Açık, koyu veya telefonunun temasını seç.</p>
      <ThemePicker />
      <div className="reminder-setting">
        <div>
          <h3>
            <Bell size={19} /> Oyun hatırlatmaları
          </h3>
          <p>
            {remindersAvailable
              ? "Birkaç gün uğramazsan seni oyuna davet edelim. En fazla iki hatırlatma; yaklaşık 19.00’da."
              : "Android uygulamasında, izninle seni yeniden oyuna davet edebiliriz."}
          </p>
        </div>
        {remindersAvailable && (
          <button
            type="button"
            className="reminder-toggle"
            role="switch"
            aria-label="Oyun hatırlatmaları"
            aria-checked={enabled}
            disabled={busy}
            onClick={toggle}
          >
            <span />
            {busy ? "…" : enabled ? "Açık" : "Kapalı"}
          </button>
        )}
      </div>
      {enabled && permission === "denied" && (
        <p role="status">
          Telefonunda bildirim izni kapalı. Android Ayarlar → Uygulamalar →
          Varmısın → Bildirimler yolundan açabilirsin.
        </p>
      )}
      {message && (
        <p className="preference-message" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
