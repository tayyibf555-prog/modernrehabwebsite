"use client";

import { useEffect, useRef, useState } from "react";

const PHRASES = [
  "stubborn back pain",
  "10 years of sciatica",
  "the hip that won't heal",
  "the surgery you were dreading",
  "whatever's stopped you",
];

const HOLD_MS = 3600;
const STEP_MS = 38;

export default function KineticH1() {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(PHRASES[0]);
  const [phase, setPhase] = useState<"hold" | "erase" | "type">("hold");
  const reducedMotion = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion.current) return;

    const tick = () => {
      if (phase === "hold") {
        timer.current = setTimeout(() => setPhase("erase"), HOLD_MS);
      } else if (phase === "erase") {
        if (shown.length > 0) {
          timer.current = setTimeout(() => setShown(shown.slice(0, -1)), STEP_MS);
        } else {
          const next = (idx + 1) % PHRASES.length;
          setIdx(next);
          setPhase("type");
        }
      } else if (phase === "type") {
        const target = PHRASES[idx];
        if (shown.length < target.length) {
          timer.current = setTimeout(() => setShown(target.slice(0, shown.length + 1)), STEP_MS);
        } else {
          setPhase("hold");
        }
      }
    };
    tick();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [phase, shown, idx]);

  return (
    <h1 className="hero-h1">
      <span className="bracket-line">Modern rehab for</span>
      <span className="bracket-line bracket-clause">
        <span className="bracket-text" aria-live="polite">
          {shown}
          <span className="caret" aria-hidden="true">▏</span>
        </span>
      </span>
    </h1>
  );
}
