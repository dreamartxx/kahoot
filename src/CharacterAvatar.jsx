import React, { useState } from "react";
import { characters, characterById } from "./characters";
import "./characters.css";

export function CharacterAvatar({ id, className = "", decorative = true }) {
  const character = characterById(id);
  return (
    <span
      className={`character-avatar ${className}`}
      style={{ "--character-color": character.color }}
    >
      <img
        src={character.image}
        alt={decorative ? "" : character.name}
        draggable="false"
        width="192"
        height="192"
      />
    </span>
  );
}

export function CharacterPicker({ value, onChange }) {
  const [theme, setTheme] = useState("Tümü");
  const selected = characterById(value);
  return (
    <fieldset className="character-picker">
      <legend>Karakterini seç</legend>
      <div
        className="character-selected"
        style={{ "--character-color": selected.color }}
      >
        <CharacterAvatar id={value} />
        <div>
          <span>SAHNE SENİN!</span>
          <strong>{selected.name}</strong>
          <small>20 karakterden biri senin olsun.</small>
        </div>
      </div>
      <div className="character-themes" aria-label="Karakter temaları">
        {["Tümü", ...new Set(characters.map((c) => c.theme))].map((t) => (
          <button
            type="button"
            key={t}
            aria-pressed={theme === t}
            onClick={() => setTheme(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="character-options" role="group" aria-label="Karakterler">
        {characters
          .filter((c) => theme === "Tümü" || c.theme === theme)
          .map((c) => (
            <button
              type="button"
              className={value === c.id ? "is-selected" : ""}
              aria-pressed={value === c.id}
              aria-label={`${c.name} karakterini seç`}
              key={c.id}
              onClick={() => onChange(c.id)}
              style={{ "--character-color": c.color }}
            >
              <CharacterAvatar id={c.id} />
              <span>{c.name}</span>
              {value === c.id && (
                <b className="character-check" aria-hidden="true">
                  ✓
                </b>
              )}
            </button>
          ))}
      </div>
    </fieldset>
  );
}
