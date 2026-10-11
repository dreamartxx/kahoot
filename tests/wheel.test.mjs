import { test } from "node:test";
import assert from "node:assert/strict";
import {
  winnerRotation,
  wheelEase,
  wheelSpin,
  wheelLanding,
} from "../src/wheel-utils.js";

test("wheel lands on the server winner for small and large participant pools", () => {
  for (const count of [1, 2, 3, 8, 37, 2000]) {
    for (let index = 0; index < count; index++) {
      for (const from of [0, 1943.7, 8952]) {
        const rotation = winnerRotation(index, count, from);
        const pointerOffset =
          (((rotation + (index * 360) / count) % 360) + 360) % 360;
        assert(Math.min(pointerOffset, 360 - pointerOffset) < 0.000001);
        assert(rotation - from >= 720);
      }
    }
  }
  assert.equal(wheelEase(0), 0);
  assert.equal(wheelEase(1), 1);
  assert(wheelEase(0.5) > 0.5);
});

test("wheel accelerates once, then slows continuously without frame-rate dependence", () => {
  assert.deepEqual(wheelSpin(0), { angle: 0, speed: 0 });
  let previous = wheelSpin(0);
  for (let frame = 1; frame <= 15 * 120; frame++) {
    const time = frame / 120;
    const next = wheelSpin(time);
    assert(next.angle >= previous.angle);
    if (time <= 1.5) assert(next.speed >= previous.speed);
    else assert(next.speed <= previous.speed + 1e-9);
    previous = next;
  }
  for (const time of [0.5, 1.5, 5, 11, 13]) {
    const delta = 0.00001;
    const velocity =
      (wheelSpin(time + delta).angle - wheelSpin(time - delta).angle) /
      (2 * delta);
    assert(Math.abs(velocity - wheelSpin(time).speed) < 0.001);
  }
});

test("every winner lands with matching initial speed, no second acceleration and zero final speed", () => {
  for (const count of [1, 2, 8, 37, 2000]) {
    for (let index = 0; index < count; index++) {
      // Normal polling, slow polling and background-tab/network delays.
      for (const time of [11, 11.8, 14.5, 18]) {
        const spin = wheelSpin(time);
        const landing = wheelLanding(
          index,
          count,
          spin.angle,
          spin.speed,
          17 - time,
        );
        const distance = landing.target - landing.from;
        const offset =
          (((landing.target + (index * 360) / count) % 360) + 360) % 360;
        assert(Math.min(offset, 360 - offset) < 1e-6);
        assert(
          Math.abs((distance * landing.slope) / landing.duration - spin.speed) <
            1e-6,
        );
        let previousVelocity = spin.speed;
        let previousAngle = landing.from;
        for (let frame = 1; frame <= 60; frame++) {
          const p = frame / 60;
          const velocity =
            (distance / landing.duration) *
            (3 * (landing.slope - 2) * p * p +
              2 * (3 - 2 * landing.slope) * p +
              landing.slope);
          const angle = landing.from + distance * wheelEase(p, landing.slope);
          assert(velocity >= -1e-9 && velocity <= previousVelocity + 1e-9);
          assert(angle >= previousAngle - 1e-9);
          previousVelocity = velocity;
          previousAngle = angle;
        }
        assert(Math.abs(previousVelocity) < 1e-9);
        assert(Math.abs(previousAngle - landing.target) < 1e-9);
      }
    }
  }
});
