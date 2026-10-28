import React from "react";
import { UserRound, Users } from "lucide-react";
import "./play-modes.css";
export default function PlayModePicker({ value, onChange }) {
  return (
    <fieldset className="play-mode-picker">
      <legend>Nasıl oynamak istersin?</legend>
      <div>
        {[
          ["solo", "Tek başıma", "Kendi bilgini keşfet", UserRound],
          ["multi", "Birlikte", "Kodu paylaş, birlikte yarış", Users],
        ].map(([id, title, description, Icon]) => (
          <button
            type="button"
            key={id}
            aria-pressed={value === id}
            onClick={() => onChange(id)}
          >
            <Icon size={21} />
            <span>
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
