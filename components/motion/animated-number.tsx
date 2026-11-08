"use client";

import { useEffect, useRef } from "react";

type AnimatedNumberProps = {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
};

/** The source value stays available to assistive technology throughout the count. */
export function AnimatedNumber({ value, decimals = 0, suffix = "", className }: AnimatedNumberProps) {
  const visual = useRef<HTMLSpanElement>(null);
  const format = (n: number) => n.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + suffix;
  const finalText = format(value);

  useEffect(() => {
    const node = visual.current;
    if (!node) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const formatValue = (n: number) => n.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals, maximumFractionDigits: decimals,
    }) + suffix;
    let frame = 0;
    let played = false;
    const settle = () => {
      cancelAnimationFrame(frame);
      node.textContent = formatValue(value);
      node.dataset.counting = "false";
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || played) return;
      played = true;
      observer.disconnect();
      if (preference.matches) { settle(); return; }
      const started = performance.now();
      node.dataset.counting = "true";
      const tick = (now: number) => {
        const progress = Math.min(1, Math.max(0, (now - started) / 900));
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = formatValue(value * eased);
        if (progress < 1) frame = requestAnimationFrame(tick);
        else settle();
      };
      node.textContent = formatValue(0);
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.35 });
    observer.observe(node);
    const onPreference = () => { if (preference.matches) settle(); };
    preference.addEventListener("change", onPreference);
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame);
      preference.removeEventListener("change", onPreference);
    };
  }, [value, decimals, suffix]);

  return <span className={["animated-number", className].filter(Boolean).join(" ")} style={{ minWidth: `${finalText.length}ch` }} data-final-value={finalText}>
    <span className="sr-only">{finalText}</span>
    <span ref={visual} aria-hidden="true" data-counting="false">{finalText}</span>
  </span>;
}
