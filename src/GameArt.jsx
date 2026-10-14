import React, { useEffect, useRef, useState } from "react";
import { artFor } from "./art-assets";
import "./game-art.css";

export default function GameArt({ mode = "quiz", category, active = true }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [awake, setAwake] = useState(!document.hidden);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(ref.current);
    const change = () => setAwake(!document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", change);
    };
  }, []);
  return (
    <span
      ref={ref}
      className={`game-art premium-render scene-${mode} ${active && visible && awake ? "is-moving" : ""}`}
      aria-hidden="true"
    >
      <img
        src={artFor(category || mode)}
        alt=""
        loading="lazy"
        decoding="async"
        width="900"
        height="600"
      />
    </span>
  );
}
