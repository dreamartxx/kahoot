import React, { useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";
import { characterById } from "./characters";
import "./game-art.css";

export default function GameArt({ mode = "quiz", glyph, active = true }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [awake, setAwake] = useState(!document.hidden);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.5 },
    );
    observer.observe(ref.current);
    const change = () => setAwake(!document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", change);
    };
  }, []);
  const character =
    mode === "tournament"
      ? "knight"
      : mode === "family"
        ? "cat"
        : ["solo", "estimate"].includes(mode)
          ? "astronaut"
          : mode === "binary"
            ? "scientist"
            : "wizard";
  return (
    <span
      ref={ref}
      className={`game-art scene-${mode} ${active && visible && awake ? "is-moving" : ""}`}
      aria-hidden="true"
    >
      <span className="scene-shadow" />
      {mode === "family" ? (
        <>
          <img
            className="scene-friend"
            src={characterById("fox").image}
            alt=""
          />
          <b className="scene-heart">♥</b>
        </>
      ) : mode === "raffle" ? (
        <span className="scene-wheel">
          <i>★</i>
        </span>
      ) : mode === "cloud" ? (
        <>
          <span className="scene-word">
            neşe<small>12</small>
          </span>
          <span className="scene-word word-two">
            aile<small>8</small>
          </span>
        </>
      ) : mode === "tournament" ? (
        <span className="scene-cup">
          <Trophy size={90} />
        </span>
      ) : (
        <span
          className={`scene-orb ${["solo", "estimate"].includes(mode) ? "scene-target" : ""}`}
        >
          {glyph ||
            (mode === "binary"
              ? "?!"
              : mode === "mixed"
                ? "✦"
                : ["solo", "estimate"].includes(mode)
                  ? "↗"
                  : "?")}
        </span>
      )}
      {!["raffle", "cloud"].includes(mode) && (
        <img
          className="scene-character"
          src={characterById(character).image}
          alt=""
        />
      )}
      <i className="scene-star star-a">✦</i>
      <i className="scene-star star-b">✧</i>
    </span>
  );
}
