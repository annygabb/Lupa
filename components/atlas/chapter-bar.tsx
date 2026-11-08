"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const KEY = "lupa-motion";
const subscribe = (cb: () => void) => {
  window.addEventListener("lupa:motion", cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener("lupa:motion", cb); window.removeEventListener("storage", cb); };
};
const getMotionOff = () => window.localStorage.getItem(KEY) === "off";
const getServerMotionOff = () => false;

function setMotion(off: boolean) {
  window.localStorage.setItem(KEY, off ? "off" : "on");
  document.documentElement.dataset.motion = off ? "off" : "on";
  window.dispatchEvent(new CustomEvent("lupa:motion", { detail: !off }));
}

/**
 * Barra fixa de leitura (padrão de The Shape of Intelligence / Compass Pathways):
 * capítulo atual, progresso e um controle para desligar o movimento.
 */
export function ChapterBar() {
  const [chapters, setChapters] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const motionOff = useSyncExternalStore(subscribe, getMotionOff, getServerMotionOff);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    const frame = requestAnimationFrame(() => setChapters(els.map(el => el.dataset.chapter || "")));
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setCurrent(els.indexOf(e.target as HTMLElement)); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    els.forEach(el => io.observe(el));
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(frame); io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  if (!chapters.length) return null;
  return (
    <div className="at-chapter" role="region" aria-label="Progresso da leitura">
      <span className="at-chapter__bar" style={{ transform: `scaleX(${progress})` }} aria-hidden="true"/>
      <span className="at-mono at-chapter__n">{String(current + 1).padStart(2, "0")}/{String(chapters.length).padStart(2, "0")}</span>
      <span className="at-chapter__label">{chapters[current]}</span>
      <button type="button" className="at-chapter__motion at-mono" aria-pressed={!motionOff} onClick={() => setMotion(!motionOff)}>
        Movimento {motionOff ? "desligado" : "ligado"}
      </button>
    </div>
  );
}
