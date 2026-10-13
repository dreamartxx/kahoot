import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, X } from "lucide-react";
import ScreenPages from "./ScreenPages";
function Panel({ title, children, onClose }) {
  const ref = useRef(null),
    label = useId();
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    return () => previous?.focus?.();
  }, []);
  return createPortal(
    <dialog
      ref={ref}
      className="compact-room-panel"
      aria-labelledby={label}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <header>
        <h2 id={label}>{title}</h2>
        <button autoFocus aria-label="Paneli kapat" onClick={onClose}>
          <X size={20} />
        </button>
      </header>
      <ScreenPages dialog>{children}</ScreenPages>
    </dialog>,
    document.body,
  );
}
export default function CompactRoomPanel({
  enabled,
  title,
  trigger,
  children,
}) {
  const [open, setOpen] = useState(false);
  if (!enabled) return children;
  return (
    <>
      <button className="compact-room-trigger" onClick={() => setOpen(true)}>
        {trigger || title}
        <ChevronRight size={18} />
      </button>
      {open && (
        <Panel title={title} onClose={() => setOpen(false)}>
          {children}
        </Panel>
      )}
    </>
  );
}
