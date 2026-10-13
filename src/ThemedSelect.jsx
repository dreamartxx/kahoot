import React, { Children, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { normalizeQuizSearch } from "./quiz-search";

function textOf(children) {
  return Children.toArray(children)
    .map((child) =>
      typeof child === "object" ? textOf(child.props.children) : String(child),
    )
    .join("");
}
function ChoiceDialog({ options, value, label, onChoose, onClose }) {
  const ref = useRef(null),
    heading = useId();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(
    Math.max(
      0,
      Math.floor(options.findIndex((o) => o.value === String(value)) / 6),
    ),
  );
  const words = normalizeQuizSearch(query).split(" ").filter(Boolean);
  const filtered = options.filter((o) =>
    words.every((w) => normalizeQuizSearch(o.label).includes(w)),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * 6, current * 6 + 6);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    return () => previous?.focus?.();
  }, []);
  return createPortal(
    <dialog
      ref={ref}
      className="choice-dialog"
      aria-labelledby={heading}
      onCancel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <header>
        <div>
          <span className="choice-eyebrow">
            <Sparkles size={13} /> OYUN SENİN TARZIN
          </span>
          <h2 id={heading}>{label}</h2>
        </div>
        <button
          type="button"
          className="choice-close"
          autoFocus
          aria-label="Seçimi kapat"
          onClick={onClose}
        >
          <X size={21} />
        </button>
      </header>
      {options.length > 6 && (
        <label className="choice-search">
          <Search size={18} />
          <input
            aria-label={`${label} seçeneklerinde ara`}
            placeholder="Ara, hemen bul…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
          {query && (
            <button
              type="button"
              aria-label="Aramayı temizle"
              onClick={() => {
                setQuery("");
                setPage(0);
              }}
            >
              <X size={17} />
            </button>
          )}
        </label>
      )}
      <div
        className="choice-grid"
        aria-label="Seçenekler"
        onKeyDown={(e) => {
          if (
            ![
              "ArrowRight",
              "ArrowLeft",
              "ArrowDown",
              "ArrowUp",
              "Home",
              "End",
            ].includes(e.key)
          )
            return;
          const buttons = [
            ...e.currentTarget.querySelectorAll("button:not(:disabled)"),
          ];
          const index = buttons.indexOf(document.activeElement);
          const next =
            e.key === "Home"
              ? 0
              : e.key === "End"
                ? buttons.length - 1
                : index +
                  { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 2, ArrowUp: -2 }[
                    e.key
                  ];
          e.preventDefault();
          buttons[Math.max(0, Math.min(buttons.length - 1, next))]?.focus();
        }}
      >
        {visible.map((o) => (
          <button
            type="button"
            key={o.value}
            disabled={o.disabled}
            aria-pressed={o.value === String(value)}
            className="choice-card"
            onClick={() => onChoose(o.value)}
          >
            <span className="choice-gem" aria-hidden="true">
              {o.value === String(value) ? <Check size={20} /> : "✦"}
            </span>
            <b>{o.label}</b>
          </button>
        ))}
        {!filtered.length && (
          <p className="choice-empty">
            Eşleşen seçenek yok. Başka bir kelime dene.
          </p>
        )}
      </div>
      <footer>
        {pages > 1 ? (
          <nav aria-label="Seçenek sayfaları">
            <button
              type="button"
              aria-label="Önceki seçenekler"
              disabled={!current}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft size={19} />
            </button>
            <span>
              {current + 1} / {pages}
            </span>
            <button
              type="button"
              aria-label="Sonraki seçenekler"
              disabled={current === pages - 1}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight size={19} />
            </button>
          </nav>
        ) : (
          <span>Bir dokunuşla seç, oyuna devam et.</span>
        )}
        <small>{filtered.length} seçenek</small>
      </footer>
    </dialog>,
    document.body,
  );
}

/** Shares one accessible, themed choice surface without changing form values. */
export default function ThemedSelect({
  children,
  value,
  onChange,
  id,
  name,
  disabled,
  required,
  className = "",
  "aria-label": ariaLabel,
}) {
  const trigger = useRef(null),
    native = useRef(null),
    generatedId = useId();
  const [open, setOpen] = useState(false),
    [label, setLabel] = useState(ariaLabel || "Seçimini yap");
  const options = Children.toArray(children).map((o) => ({
    value: String(o.props.value ?? textOf(o.props.children)),
    label: textOf(o.props.children),
    disabled: !!o.props.disabled,
  }));
  const selected = options.find((o) => o.value === String(value)) || options[0];
  useEffect(() => {
    const outer = trigger.current?.closest("label");
    const linked =
      id &&
      [...document.querySelectorAll("label")].find((l) => l.htmlFor === id);
    setLabel(
      ariaLabel ||
        outer?.querySelector("span")?.textContent ||
        linked?.textContent ||
        "Seçimini yap",
    );
  }, [ariaLabel, id]);
  return (
    <span className={`themed-select ${className}`}>
      <select
        ref={native}
        className="choice-native"
        aria-hidden="true"
        tabIndex={-1}
        name={name}
        value={value}
        disabled={disabled}
        required={required}
        onChange={onChange}
        onInvalid={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        {children}
      </select>
      <button
        ref={trigger}
        id={id || generatedId}
        type="button"
        className="choice-trigger"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span>{selected?.label || "Bir seçenek seç…"}</span>
        <ChevronDown size={18} />
      </button>
      {open && (
        <ChoiceDialog
          options={options}
          value={value}
          label={label}
          onClose={() => setOpen(false)}
          onChoose={(next) => {
            onChange?.({
              target: { value: next, name, id },
              currentTarget: { value: next, name, id },
            });
            setOpen(false);
          }}
        />
      )}
    </span>
  );
}
