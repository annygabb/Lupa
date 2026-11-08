"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HERO_IMG = "/assets/images/cianotipia/lupa-caneta-2.webp";

/** Etiquetas de herbário: cada uma é um dado real do acervo, com o estudo de origem. */
const tags = [
  { id: "E04", href: "/evidencias/E04", line1: "SURMOUNT-1 · DXA", line2: "Massa magra −10,9%", line3: "tirzepatida · n=124 · 72 sem", pos: "a", depth: 0.55 },
  { id: "E16", href: "/evidencias/E16", line1: "SURMOUNT-4 · retirada", line2: "Peso +14,0% ao parar", line3: "n=335 por braço · 52 sem", pos: "b", depth: 0.9 },
  { id: "P15", href: "/evidencias/P15", line1: "Vesícula · 76 ensaios", line2: "RR 1,37 (1,23–1,52)", line3: "risco relativo, não absoluto", pos: "c", depth: 0.35 },
];

export function AtlasHero() {
  const root = useRef<HTMLElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.from(".at-hero__line > span", { yPercent: 115, rotate: 2.5, duration: 1.1, ease: "power4.out", stagger: 0.09, delay: 0.1 });
        gsap.from(".at-hero__plate", { clipPath: "inset(12% 12% 12% 12% round 6px)", scale: 1.08, opacity: 0, duration: 1.4, ease: "power3.out", delay: 0.25 });
        gsap.from(".at-tag", { y: 40, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.12, delay: 0.75 });
        gsap.from(".at-hero__lead > *", { y: 18, opacity: 0, duration: 0.8, ease: "power2.out", stagger: 0.08, delay: 0.6 });
        // Parallax em camadas: cada etiqueta tem sua profundidade.
        gsap.utils.toArray<HTMLElement>(".at-tag").forEach(tag => {
          const depth = Number(tag.dataset.depth || 0.5);
          gsap.to(tag, { yPercent: -60 * depth, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
        });
        gsap.to(".at-hero__plate-wrap", { yPercent: 12, rotate: -1, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
        gsap.to(".at-hero__title", { yPercent: -10, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      }
    }, el);
    return () => ctx.revert();
  }, []);

  // Lupa sobre a prancha: amplia 2,2x o ponto sob o cursor.
  useEffect(() => {
    const p = plate.current, l = lens.current;
    if (!p || !l || window.matchMedia("(hover: none)").matches) return;
    const zoom = 2.2;
    const xTo = gsap.quickTo(l, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(l, "y", { duration: 0.35, ease: "power3" });
    const move = (e: PointerEvent) => {
      const r = p.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const size = l.offsetWidth;
      xTo(x - size / 2); yTo(y - size / 2);
      l.style.backgroundSize = `${r.width * zoom}px ${r.height * zoom}px`;
      l.style.backgroundPosition = `${-(x * zoom - size / 2)}px ${-(y * zoom - size / 2)}px`;
    };
    const enter = () => gsap.to(l, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.6)" });
    const leave = () => gsap.to(l, { scale: 0.4, opacity: 0, duration: 0.25 });
    p.addEventListener("pointermove", move);
    p.addEventListener("pointerenter", enter);
    p.addEventListener("pointerleave", leave);
    return () => { p.removeEventListener("pointermove", move); p.removeEventListener("pointerenter", enter); p.removeEventListener("pointerleave", leave); };
  }, []);

  return (
    <section ref={root} className="at-hero" data-chapter="Canetas para emagrecer" aria-labelledby="hero-title">
      <div className="at-hero__meta at-mono" aria-hidden="true">
        <span>Prancha 00</span><span>Atlas de evidências</span><span>Semaglutida · Tirzepatida</span><span>Brasil · 2026</span>
      </div>

      <h1 id="hero-title" className="at-hero__title">
        <span className="at-hero__line"><span>Canetas para</span></span>
        <span className="at-hero__line"><span>emagrecer.</span></span>
        <span className="at-hero__line at-hero__line--blue"><span>O que muda</span></span>
        <span className="at-hero__line at-hero__line--blue"><span>além do peso?</span></span>
      </h1>

      <div className="at-hero__stage">
        <div className="at-hero__plate-wrap">
          <div ref={plate} className="at-hero__plate">
            <Image src={HERO_IMG} alt="Cianotipia de uma lupa cujo cabo é uma caneta injetora graduada, entre folhas de samambaia e comprimidos" fill priority sizes="(max-width: 900px) 90vw, 46vw"/>
            <div ref={lens} className="at-hero__lens" aria-hidden="true" style={{ backgroundImage: `url(${HERO_IMG})` }}/>
          </div>
          <p className="at-hero__caption at-mono">Fig. 1 — A lupa e a caneta. Cianotipia digital.</p>
        </div>
        {tags.map(t => (
          <Link key={t.id} href={t.href} className={`at-tag at-tag--${t.pos}`} data-depth={t.depth}>
            <span className="at-tag__id">{t.id}</span>
            <span className="at-tag__l1">{t.line1}</span>
            <strong>{t.line2}</strong>
            <span className="at-tag__l3">{t.line3}</span>
          </Link>
        ))}
      </div>

      <div className="at-hero__lead">
        <p>Pesquisas sobre <strong>semaglutida</strong> e <strong>tirzepatida</strong>, explicadas para entender benefícios, riscos e o que ainda não sabemos. Para profissionais de saúde, estudantes e pessoas que querem compreender o tratamento.</p>
        <div className="at-hero__actions">
          <a className="at-btn at-btn--solid" href="#lupa">Passe a lupa nas manchetes <span aria-hidden="true">↓</span></a>
          <Link className="at-btn at-btn--line" href="/evidencias">Consultar os 50 estudos</Link>
        </div>
      </div>
    </section>
  );
}
