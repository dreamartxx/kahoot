import React, { useEffect, useId, useRef, useState } from "react";
import "./game-art.css";

// Vector objects stay crisp on every screen without downloading avatar artwork.
export default function GameArt({ mode = "quiz", glyph, active = true }) {
  const ref = useRef(null),
    uid = useId().replace(/:/g, "");
  const [visible, setVisible] = useState(false),
    [awake, setAwake] = useState(!document.hidden);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(ref.current);
    const change = () => setAwake(!document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", change);
    };
  }, []);
  const fill = (name) => `url(#${uid}-${name})`;
  const star = "M0 -13 3 -4 13 0 3 4 0 13 -3 4 -13 0 -3 -4Z";
  const tile = (x, y, symbol, color, angle = 0) => (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect
        x="-39"
        y="-43"
        width="78"
        height="88"
        rx="21"
        fill="#21103e"
        opacity=".5"
        transform="translate(4 8)"
      />
      <rect
        x="-39"
        y="-43"
        width="78"
        height="88"
        rx="21"
        fill={fill(color)}
        stroke="#ffffff70"
      />
      <path
        d="M-28 -18V-23Q-28 -33 -18 -33H8"
        fill="none"
        stroke="#ffffff90"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <text
        y="18"
        textAnchor="middle"
        fill="#fff5cf"
        fontSize="54"
        fontWeight="900"
        fontFamily="Manrope, sans-serif"
      >
        {symbol}
      </text>
    </g>
  );
  return (
    <span
      ref={ref}
      className={`game-art premium-object scene-${mode} ${active && visible && awake ? "is-moving" : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 240 180" focusable="false">
        <defs>
          {[
            ["violet", "#c5a7ff", "#7b43db", "#3c1879"],
            ["gold", "#fff3bc", "#f5bf50", "#a26617"],
            ["rose", "#ffd4e8", "#ee7dad", "#a8306d"],
            ["mint", "#cdfff2", "#5bcdb5", "#197e78"],
            ["blue", "#cdeaff", "#6d9ced", "#3c4eaa"],
          ].map(([name, light, mid, dark]) => (
            <linearGradient
              key={name}
              id={`${uid}-${name}`}
              x1="0"
              y1="0"
              x2=".85"
              y2="1"
            >
              <stop stopColor={light} />
              <stop offset=".46" stopColor={mid} />
              <stop offset="1" stopColor={dark} />
            </linearGradient>
          ))}
          <radialGradient id={`${uid}-glow`}>
            <stop stopColor="#e5caff" stopOpacity=".55" />
            <stop offset="1" stopColor="#b18bfc" stopOpacity="0" />
          </radialGradient>
          <filter
            id={`${uid}-shadow`}
            x="-40%"
            y="-40%"
            width="190%"
            height="200%"
          >
            <feDropShadow
              dx="0"
              dy="9"
              stdDeviation="6"
              floodColor="#170a33"
              floodOpacity=".28"
            />
          </filter>
        </defs>
        <ellipse cx="120" cy="95" rx="112" ry="75" fill={fill("glow")} />
        <ellipse
          cx="123"
          cy="161"
          rx="69"
          ry="9"
          fill="#160a35"
          opacity=".17"
        />
        <ellipse
          cx="120"
          cy="139"
          rx="98"
          ry="24"
          fill="none"
          stroke="#d1b6f9"
          strokeOpacity=".35"
          transform="rotate(-12 120 139)"
        />
        <g className="object-float" filter={fill("shadow")}>
          {mode === "tournament" ? (
            <>
              <path
                d="M84 53H61V69Q61 98 96 99M156 53H179V69Q179 98 144 99"
                fill="none"
                stroke="#9d6316"
                strokeWidth="13"
              />
              <path
                d="M84 48H60V63Q60 91 96 93M156 48H180V63Q180 91 144 93"
                fill="none"
                stroke={fill("gold")}
                strokeWidth="11"
              />
              <path d="M113 105H129V139H113Z" fill={fill("gold")} />
              <path d="M94 134H148L158 149H84Z" fill={fill("gold")} />
              <rect
                x="81"
                y="148"
                width="80"
                height="10"
                rx="4"
                fill="#965b23"
              />
              <path
                d="M78 35H162L155 86Q152 114 120 117Q88 114 85 86Z"
                fill={fill("gold")}
                stroke="#fff0b8"
              />
              <path
                d="M92 48 97 82Q100 99 109 100"
                fill="none"
                stroke="#fff5cb"
                strokeWidth="7"
                strokeLinecap="round"
                opacity=".75"
              />
              <path
                d={star}
                transform="translate(124 73) scale(1.5)"
                fill="#fff6d4"
                stroke="#b17829"
                strokeWidth=".5"
              />
              <ellipse
                cx="120"
                cy="35"
                rx="42"
                ry="7"
                fill="#d99c35"
                stroke="#fff0ad"
                strokeWidth="3"
              />
            </>
          ) : mode === "solo" ? (
            <>
              <g transform="translate(115 91) rotate(-13) skewY(5)">
                <circle cx="6" cy="8" r="62" fill="#954769" />
                <circle
                  r="62"
                  fill={fill("gold")}
                  stroke="#fff4bf"
                  strokeWidth="2"
                />
                <circle r="50" fill={fill("rose")} />
                <circle r="37" fill={fill("gold")} />
                <circle r="25" fill={fill("rose")} />
                <circle r="12" fill={fill("gold")} />
                <path
                  d="M-49 -14A52 52 0 0 1 -17 -48"
                  fill="none"
                  stroke="#fff"
                  opacity=".6"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </g>
              <path
                d="M116 89 182 27"
                stroke="#2c245f"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <path
                d="M115 85 181 23"
                stroke={fill("blue")}
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M160 23 184 15 180 39 168 36Z"
                fill={fill("mint")}
                stroke="#d3fff6"
              />
              <path d="m115 85 4-18 14 16Z" fill={fill("gold")} />
            </>
          ) : mode === "family" ? (
            <>
              <g transform="translate(41 39) rotate(-13 65 58)">
                <path
                  d="M60 101C40 84 3 61 3 30C3 3 37-5 60 20C83-5 117 3 117 30C117 61 80 84 60 101Z"
                  transform="translate(4 7)"
                  fill="#8e275b"
                />
                <path
                  d="M60 101C40 84 3 61 3 30C3 3 37-5 60 20C83-5 117 3 117 30C117 61 80 84 60 101Z"
                  fill={fill("rose")}
                  stroke="#ffd6e5"
                />
                <path
                  d="M16 32Q18 14 38 18"
                  fill="none"
                  stroke="#ffe9f5"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </g>
              <g transform="translate(119 79) rotate(14)">
                <path
                  d="M34 63C20 50 0 37 0 19C0 0 22-5 34 10C48-5 69 0 69 19C69 37 48 50 34 63Z"
                  transform="translate(3 5)"
                  fill="#96732d"
                />
                <path
                  d="M34 63C20 50 0 37 0 19C0 0 22-5 34 10C48-5 69 0 69 19C69 37 48 50 34 63Z"
                  fill={fill("gold")}
                  stroke="#fff2b6"
                />
              </g>
              <path
                d="M92 116Q123 153 153 124"
                fill="none"
                stroke="#fff3cc"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </>
          ) : mode === "raffle" ? (
            <>
              <path d="M106 132H134L146 157H94Z" fill={fill("gold")} />
              <g className="object-wheel">
                <circle
                  cx="120"
                  cy="87"
                  r="64"
                  fill="#9d6527"
                  transform="translate(4 7)"
                />
                <circle
                  cx="120"
                  cy="87"
                  r="64"
                  fill={fill("gold")}
                  stroke="#fff1c0"
                  strokeWidth="2"
                />
                {Array.from({ length: 8 }, (_, i) => (
                  <path
                    key={i}
                    d="M120 87 120 32A55 55 0 0 1 158.89 48.11Z"
                    transform={`rotate(${i * 45} 120 87)`}
                    fill={fill(["violet", "rose", "mint", "blue"][i % 4])}
                    stroke="#ffefbe"
                    strokeWidth="1.3"
                  />
                ))}
                {Array.from({ length: 12 }, (_, i) => (
                  <circle
                    key={i}
                    cx="120"
                    cy="28"
                    r="2"
                    transform={`rotate(${i * 30} 120 87)`}
                    fill="#fff7dc"
                  />
                ))}
                <circle
                  cx="120"
                  cy="87"
                  r="18"
                  fill={fill("gold")}
                  stroke="#fff7c8"
                  strokeWidth="2"
                />
                <path
                  d={star}
                  transform="translate(120 87) scale(.8)"
                  fill="#9d642a"
                />
              </g>
              <path
                d="M111 15H130L120 39Z"
                fill={fill("gold")}
                stroke="#fff1bd"
                strokeWidth="2"
              />
            </>
          ) : mode === "cloud" ? (
            <>
              <g transform="rotate(-10 104 68)">
                <rect
                  x="29"
                  y="31"
                  width="148"
                  height="70"
                  rx="30"
                  fill="#484184"
                  transform="translate(3 7)"
                />
                <rect
                  x="29"
                  y="31"
                  width="148"
                  height="70"
                  rx="30"
                  fill={fill("violet")}
                  stroke="#e3d4ff"
                />
                <path d="M52 96 49 113 79 99" fill={fill("violet")} />
                <text
                  x="91"
                  y="76"
                  textAnchor="middle"
                  fontSize="27"
                  fill="#fff"
                  fontWeight="800"
                >
                  neşe
                </text>
                <circle cx="150" cy="56" r="15" fill="#fff2" />
                <text
                  x="150"
                  y="61"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#fff"
                  fontWeight="800"
                >
                  24
                </text>
                <path
                  d="M43 57Q46 42 65 42H101"
                  fill="none"
                  stroke="#ffffff80"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
              <g transform="rotate(8 148 123)">
                <rect
                  x="89"
                  y="96"
                  width="123"
                  height="53"
                  rx="24"
                  fill="#1b716d"
                  transform="translate(2 5)"
                />
                <rect
                  x="89"
                  y="96"
                  width="123"
                  height="53"
                  rx="24"
                  fill={fill("mint")}
                  stroke="#dcfff8"
                />
                <text
                  x="137"
                  y="130"
                  textAnchor="middle"
                  fontSize="21"
                  fill="#174e50"
                  fontWeight="800"
                >
                  hayal
                </text>
                <text
                  x="191"
                  y="128"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#174e50"
                  fontWeight="800"
                >
                  12
                </text>
              </g>
              <circle
                cx="48"
                cy="128"
                r="16"
                fill={fill("gold")}
                stroke="#fff2c2"
              />
            </>
          ) : mode === "binary" ? (
            <>
              {tile(83, 91, "✓", "mint", -14)}
              {tile(157, 94, "×", "rose", 14)}
            </>
          ) : mode === "estimate" ? (
            <>
              <g transform="rotate(-9 120 90)">
                <rect
                  x="35"
                  y="55"
                  width="173"
                  height="91"
                  rx="24"
                  fill="#665121"
                />
                <rect
                  x="32"
                  y="47"
                  width="173"
                  height="91"
                  rx="24"
                  fill={fill("gold")}
                  stroke="#fff3c8"
                />
                {["1", "2", "3"].map((n, i) => (
                  <g key={n}>
                    <rect
                      x={44 + i * 50}
                      y="62"
                      width="45"
                      height="58"
                      rx="10"
                      fill={fill("violet")}
                    />
                    <text
                      x={66 + i * 50}
                      y="103"
                      textAnchor="middle"
                      fontSize="37"
                      fontWeight="900"
                      fill="#fff4d0"
                    >
                      {n}
                    </text>
                  </g>
                ))}
              </g>
              <path
                d="M73 40Q117 5 167 35"
                fill="none"
                stroke="#fff0bd"
                strokeWidth="3"
                strokeDasharray="5 6"
              />
            </>
          ) : (
            <>
              <g opacity=".8">{tile(82, 93, "✦", "blue", -24)}</g>
              <g opacity=".9">{tile(159, 92, "✓", "rose", 19)}</g>
              {tile(
                121,
                80,
                glyph || (mode === "mixed" ? "✦" : "?"),
                "violet",
                -5,
              )}
            </>
          )}
        </g>
        <g className="object-spark">
          <path
            d={star}
            transform="translate(197 42) scale(.65)"
            fill={fill("gold")}
          />
          <path
            d={star}
            transform="translate(36 88) scale(.4)"
            fill={fill("gold")}
          />
          <circle cx="186" cy="153" r="3" fill="#e0b9ff" />
        </g>
      </svg>
    </span>
  );
}
