// Segment centers start at twelve o'clock. The pointer stays fixed there.
export function winnerRotation(index, count, from = 0, minimumTravel = 720) {
  const target =
    (((360 - (index * 360) / Math.max(1, count)) % 360) + 360) % 360;
  const base = from + minimumTravel;
  return base + ((target - (base % 360) + 360) % 360);
}

// Integral of smoothstep: acceleration joins the coast without a speed jump.
const integral = (t) => t ** 3 - t ** 4 / 2;
export function wheelSpin(elapsed, revealDelay = 11) {
  const t = Math.max(0, elapsed);
  const boost = Math.min(1.5, Math.max(0.1, revealDelay / 2));
  const coast = Math.max(0.1, revealDelay - boost);
  if (t < boost) {
    const p = t / boost;
    return {
      angle: 720 * boost * integral(p),
      speed: 720 * p * p * (3 - 2 * p),
    };
  }
  const p = Math.min(1, (t - boost) / coast);
  return {
    angle:
      360 * boost +
      720 * coast * p -
      360 * coast * integral(p) +
      360 * Math.max(0, t - boost - coast),
    speed: 720 - 360 * p * p * (3 - 2 * p),
  };
}

export function wheelLanding(index, count, from, speed, remaining) {
  // This distance interval guarantees a continuously decreasing velocity.
  // Keep enough time for every possible winner, including a delayed response.
  const duration = Math.max(1080 / speed, remaining);
  const target = winnerRotation(index, count, from, (speed * duration) / 3);
  return {
    from,
    target,
    duration,
    slope: (speed * duration) / (target - from),
  };
}

export function wheelEase(progress, slope = 3) {
  const t = Math.max(0, Math.min(1, progress));
  return (slope - 2) * t ** 3 + (3 - 2 * slope) * t ** 2 + slope * t;
}
