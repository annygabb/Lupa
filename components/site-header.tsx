"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { plates } from "@/components/atlas/plates";

function LupaMark() {
  return (
    <svg className="at-mark" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="17" cy="17" r="11.5" fill="none" stroke="currentColor" strokeWidth="3"/>
      <path d="M25.5 25.5 35 35" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M11.5 18.5c1.8-4.6 5.3-6.6 9.6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".55"/>
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const overlay = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Timeline do menu: painéis em cascata (técnica de overlay em camadas) + linhas que sobem.
  useEffect(() => {
    const root = overlay.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const panels = root.querySelectorAll(".at-menu__panel");
    const rows = root.querySelectorAll(".at-menu__row");
    gsap.set(root, { autoAlpha: 0 });
    tl.current = gsap.timeline({ paused: true })
      .set(root, { autoAlpha: 1 })
      .fromTo(panels, { scaleY: 0 }, { scaleY: 1, transformOrigin: "top", duration: reduce ? 0 : 0.6, stagger: reduce ? 0 : 0.08, ease: "power3.inOut" })
      .fromTo(rows, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: reduce ? 0 : 0.55, stagger: reduce ? 0 : 0.045, ease: "power3.out" }, reduce ? 0 : "-=0.25");
    return () => { tl.current?.kill(); };
  }, []);

  useEffect(() => {
    const t = tl.current;
    if (!t) return;
    const lenis = window.__lupaLenis;
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
      t.timeScale(1).play();
      window.setTimeout(() => overlay.current?.querySelector<HTMLAnchorElement>("a")?.focus(), 380);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") { setOpen(false); toggle.current?.focus(); }
        if (e.key === "Tab" && overlay.current) {
          const items = Array.from(overlay.current.querySelectorAll<HTMLElement>("a,button"));
          const first = items[0], last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
    lenis?.start();
    document.documentElement.style.overflow = "";
    t.timeScale(1.6).reverse();
  }, [open]);

  return (
    <header className={"at-header" + (scrolled ? " is-scrolled" : "") + (open ? " is-open" : "")}>
      <div className="at-header__bar">
        <Link href="/" className="at-brand">
          <LupaMark/><span>LUPA</span>{" "}<em>Saúde</em><span className="sr-only"> — página inicial</span>
        </Link>
        <nav className="at-header__quick" aria-label="Atalhos">
          <Link href="/evidencias" aria-current={pathname.startsWith("/evidencias") ? "page" : undefined}>Evidências</Link>
          <Link href="/comparar" aria-current={pathname.startsWith("/comparar") ? "page" : undefined}>Comparar</Link>
        </nav>
        <button ref={toggle} type="button" className="at-menu-toggle" aria-expanded={open} aria-controls="atlas-menu" onClick={() => setOpen(v => !v)}>
          <span className="at-menu-toggle__label">{open ? "Fechar" : "Índice"}</span>
          <span className="at-menu-toggle__icon" aria-hidden="true"><i/><i/></span>
        </button>
      </div>

      <div ref={overlay} id="atlas-menu" className="at-menu" role="dialog" aria-modal="true" aria-label="Índice de pranchas" hidden={false} inert={!open}>
        <div className="at-menu__panels" aria-hidden="true">
          <span className="at-menu__panel"/><span className="at-menu__panel"/><span className="at-menu__panel"/><span className="at-menu__panel"/>
        </div>
        <div className="at-menu__inner">
          <p className="at-kicker at-menu__kicker">Índice do atlas · 6 pranchas</p>
          <ul className="at-menu__list">
            <li className="at-menu__row-wrap">
              <Link className="at-menu__row" href="/" onClick={() => setOpen(false)} aria-current={pathname === "/" ? "page" : undefined}>
                <span className="at-menu__n">00</span><span className="at-menu__label">Início</span>
              </Link>
            </li>
            {plates.map(p => (
              <li key={p.href} className="at-menu__row-wrap">
                <Link className="at-menu__row" href={p.href} onClick={() => setOpen(false)} aria-current={pathname.startsWith(p.href) ? "page" : undefined}>
                  <span className="at-menu__n">{p.n}</span>
                  <span className="at-menu__label">{p.label}</span>
                  <span className="at-menu__thumb" aria-hidden="true"><Image src={p.image} alt="" width={160} height={160} sizes="80px"/></span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="at-menu__foot">Ferramenta de pesquisa. Não oferece diagnóstico, prescrição nem estimativa de risco individual.</p>
        </div>
      </div>
    </header>
  );
}
