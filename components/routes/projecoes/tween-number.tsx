"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motionAllowed } from "@/components/atlas/motion";

/**
 * Número que desliza do valor anterior ao novo quando a seleção muda.
 * O valor final fica sempre no DOM (sr-only); a camada animada é aria-hidden.
 */
export function TweenNumber({ value, decimals = 0, suffix = "", className }: {
  value: number; decimals?: number; suffix?: string; className?: string;
}) {
  const visual = useRef<HTMLSpanElement>(null);
  const last = useRef(value);
  const fmt = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
  const final = fmt(value);

  useEffect(() => {
    const el = visual.current;
    const from = last.current;
    last.current = value;
    if (!el || from === value || !motionAllowed()) { if (el) el.textContent = final; return; }
    const obj = { n: from };
    const format = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    const tween = gsap.to(obj, {
      n: value, duration: .75, ease: "power3.out",
      onUpdate: () => { el.textContent = format(obj.n); },
      onComplete: () => { el.textContent = final; },
    });
    return () => { tween.kill(); el.textContent = final; };
  }, [value, decimals, suffix, final]);

  return (
    <span className={className}>
      <span className="sr-only">{final}</span>
      <span ref={visual} aria-hidden="true">{final}</span>
    </span>
  );
}
