"use client";

import { useRef } from "react";

/** Tilts its content toward the pointer, like a card held in the hand. */
export default function Tilt({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = el.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width - 0.5;
    const y = (e.clientY - box.top) / box.height - 0.5;
    el.style.setProperty("--tilt-x", `${(-y * 7).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(x * 9).toFixed(2)}deg`);
  };

  const reset = () => {
    ref.current?.style.setProperty("--tilt-x", "0deg");
    ref.current?.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div ref={ref} className={`tilt ${className ?? ""}`} onPointerMove={move} onPointerLeave={reset}>
      {children}
    </div>
  );
}
