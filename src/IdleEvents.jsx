import ScreenPages from "./ScreenPages";
import React, { useEffect, useRef, useState } from "react";
import { Clock3, X, ArrowRight } from "lucide-react";
import { api } from "./api";
import "./idle-events.css";

export default function IdleEvents({ onRooms }) {
  const [room, setRoom] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef(null);
  const request = useRef(0);
  async function refresh() {
    const id = ++request.current;
    try {
      const rooms = await api("rooms");
      if (id !== request.current) return;
      onRooms(rooms);
      setRoom(
        rooms
          .filter((r) => r.startWarning)
          .sort((a, b) => a.createdAt - b.createdAt)[0] || null,
      );
    } catch {
      /* Keep the last state during a temporary connection loss. */
    }
  }
  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 3000);
    const focus = () => {
      if (!document.hidden) refresh();
    };
    addEventListener("focus", focus);
    document.addEventListener("visibilitychange", focus);
    return () => {
      request.current++;
      clearInterval(timer);
      removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", focus);
    };
  }, []);
  useEffect(() => {
    setError("");
    if (room && !dialog.current.open) dialog.current.showModal();
  }, [room?.pin]);
  async function choose(action) {
    if (busy) return;
    setBusy(true);
    request.current++;
    try {
      await api(action, { pin: room.pin });
      setRoom(null);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
      await refresh();
    }
  }
  if (!room) return null;
  const remaining = Math.max(0, Math.ceil(room.startBy - room.serverTime));
  return (
    <dialog
      ref={dialog}
      className="idle-event-dialog"
      aria-labelledby="idle-event-title"
      onCancel={(e) => e.preventDefault()}
    >
      <ScreenPages dialog>
        <div className="idle-event-symbol">
          <Clock3 size={38} />
        </div>
        <span className="idle-event-eyebrow">OYUN SENİ BEKLİYOR</span>
        <h2 id="idle-event-title">İptal mi, devam mı?</h2>
        <p>
          <strong>{room.title}</strong> henüz başlamadı.
        </p>
        <p className="idle-event-note">
          Etkinlik oluşturulduktan sonra 3 dakika içinde başlatılmazsa otomatik
          iptal edilir. Devam etmek süreyi sıfırlamaz.
        </p>
        <div className="idle-event-time" role="timer">
          Başlatmak için {Math.floor(remaining / 60)}:
          {String(remaining % 60).padStart(2, "0")} kaldı
        </div>
        {error && <p role="alert">{error}</p>}
        <div className="idle-event-actions">
          <button
            className="btn secondary"
            disabled={busy}
            onClick={() => choose("idle_cancel")}
          >
            <X size={18} /> İptal et
          </button>
          <button
            className="btn"
            disabled={busy}
            onClick={async () => {
              const pin = room.pin;
              if (await choose("idle_continue")) location.hash = "host/" + pin;
            }}
          >
            Devam et <ArrowRight size={18} />
          </button>
        </div>
      </ScreenPages>
    </dialog>
  );
}
