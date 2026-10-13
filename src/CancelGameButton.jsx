import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Flag } from "lucide-react";

function Confirmation({ solo, completed, onConfirm, onClose }) {
  const ref = useRef(null),
    title = useId(),
    description = useId();
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    return () => previous?.isConnected && previous.focus();
  }, []);
  async function confirm() {
    if (pending) return;
    setPending(true);
    try {
      const success = await onConfirm();
      if (success === false)
        setError("İşlem tamamlanamadı. Lütfen tekrar dene.");
      else onClose();
    } catch {
      setError("Bağlantı kurulamadı. Lütfen tekrar dene.");
    } finally {
      setPending(false);
    }
  }
  return createPortal(
    <dialog
      ref={ref}
      className="cancel-game-dialog"
      aria-labelledby={title}
      aria-describedby={description}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onClose();
      }}
    >
      <span className="cancel-game-symbol" aria-hidden="true">
        <Flag size={30} />
      </span>
      <h2 id={title}>
        {completed ? "Etkinlik kapatılsın mı?" : "Yarışma iptal edilsin mi?"}
      </h2>
      <p id={description}>
        {solo
          ? "Bu tur sona erecek ve skorun kaydedilmeyecek. Yeni bir yarışmaya istediğin zaman başlayabilirsin."
          : completed
            ? "Sonuç ekranı tüm katılımcılar için kapanacak."
            : "Yarışma herkes için sona erecek. Katılımcılar artık cevap veremeyecek."}
      </p>
      {error && <p role="alert">{error}</p>}
      <div className="cancel-game-actions">
        <button type="button" autoFocus disabled={pending} onClick={onClose}>
          {completed ? "Geri dön" : "Yarışmaya dön"}
        </button>
        <button
          type="button"
          className="cancel-game-confirm"
          disabled={pending}
          onClick={confirm}
        >
          {pending
            ? "Kapatılıyor…"
            : completed
              ? "Evet, kapat"
              : "Evet, iptal et"}
        </button>
      </div>
    </dialog>,
    document.body,
  );
}
export default function CancelGameButton({
  onConfirm,
  disabled,
  solo = false,
  completed = false,
  compact = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const label = completed ? "Etkinliği kapat" : "Yarışmayı iptal et";
  return (
    <>
      <button
        type="button"
        className={`cancel-game-trigger ${className}`}
        disabled={disabled}
        aria-label={label}
        onClick={() => setOpen(true)}
      >
        <X size={16} aria-hidden="true" />
        {compact ? "İptal" : label}
      </button>
      {open && (
        <Confirmation
          solo={solo}
          completed={completed}
          onConfirm={onConfirm}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
