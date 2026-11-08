"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window { __lupaLenis?: Lenis }
}

/**
 * Uma única instância de Lenis para o site inteiro, sincronizada com o ScrollTrigger.
 * Desligada com prefers-reduced-motion ou pelo controle "Movimento" (evento lupa:motion).
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    let lenis: Lenis | null = null;
    const tick = (time: number) => lenis?.raf(time * 1000);
    const start = () => {
      if (lenis) return;
      lenis = new Lenis({ lerp: 0.11, smoothWheel: true, anchors: { offset: -88 } });
      window.__lupaLenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    };
    const stop = () => {
      if (!lenis) return;
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenis = null;
      delete window.__lupaLenis;
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const off = window.localStorage.getItem("lupa-motion") === "off";
    document.documentElement.dataset.motion = reduce || off ? "off" : "on";
    if (!reduce && !off) start();
    const onToggle = (e: Event) => {
      const on = (e as CustomEvent<boolean>).detail;
      if (on && !reduce) start(); else stop();
    };
    window.addEventListener("lupa:motion", onToggle);
    return () => { window.removeEventListener("lupa:motion", onToggle); stop(); };
  }, []);

  useEffect(() => {
    window.__lupaLenis?.scrollTo(0, { immediate: true });
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
