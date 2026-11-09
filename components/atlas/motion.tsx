"use client";

/**
 * Primitivas de movimento do atlas. Todas respeitam prefers-reduced-motion e o
 * controle "Movimento" (html[data-motion=off]); sem JS o conteúdo fica visível.
 */
import { useEffect, useId, useRef, type ElementType, type ReactNode, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function motionAllowed() {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    && document.documentElement.dataset.motion !== "off";
}

/** Título em linhas que sobem de uma máscara ao entrar na tela (técnica de split por linhas). */
export function SplitTitle({ as = "h2", lines, className, id, delay = 0, immediate = false }: {
  as?: ElementType; lines: ReactNode[]; className?: string; id?: string; delay?: number; immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;
    const spans = el.querySelectorAll<HTMLElement>(".at-split__in");
    const tween = gsap.from(spans, {
      yPercent: 112, rotate: 2, duration: 1.05, ease: "power4.out", stagger: 0.08, delay,
      scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%", once: true },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); gsap.set(spans, { clearProps: "all" }); };
  }, [delay, immediate]);
  const Tag = as;
  return (
    <Tag ref={ref} id={id} className={"at-split " + (className ?? "")}>
      {lines.map((line, i) => (
        <span key={i} className="at-split__line"><span className="at-split__in">{line}</span>{i < lines.length - 1 ? " " : ""}</span>
      ))}
    </Tag>
  );
}

/** Revela filhos com deslocamento e opacidade, em lote, ao rolar. */
export function Reveal({ children, className, as = "div", y = 34, stagger = 0.08, style }: {
  children: ReactNode; className?: string; as?: ElementType; y?: number; stagger?: number; style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;
    const items = (el.children.length > 1 ? Array.from(el.children) : [el]) as HTMLElement[];
    // Transições CSS de transform brigam com o GSAP: desligadas só durante a entrada.
    const clear = "opacity,transform,translate,rotate,scale,transition";
    const tween = gsap.from(items, {
      y, opacity: 0, duration: 0.9, ease: "power3.out", stagger,
      onStart: () => { items.forEach(item => { item.style.transition = "none"; }); },
      onComplete: () => { gsap.set(items, { clearProps: clear }); },
      scrollTrigger: { trigger: el, start: "top 86%", once: true },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); gsap.set(items, { clearProps: clear }); };
  }, [y, stagger]);
  const Tag = as;
  return <Tag ref={ref} className={className} style={style}>{children}</Tag>;
}

/** Desloca o elemento conforme a rolagem; depth 0 = parado, 1 = rápido. */
export function Parallax({ children, depth = 0.3, className, rotate = 0, style }: {
  children?: ReactNode; depth?: number; className?: string; rotate?: number; style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;
    const tween = gsap.fromTo(el, { yPercent: 40 * depth, rotate: -rotate }, {
      yPercent: -40 * depth, rotate, ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [depth, rotate]);
  return <div ref={ref} className={className} style={style}>{children}</div>;
}

/** Recorte botânico (WebP com transparência) flutuando em camada própria. */
export function Cutout({ name, white = false, depth = 0.4, rotate = 6, className, style, width = 220 }: {
  name: string; white?: boolean; depth?: number; rotate?: number; className?: string; style?: CSSProperties; width?: number;
}) {
  return (
    <Parallax depth={depth} rotate={rotate} className={"at-cutout " + (className ?? "")} style={{ width, ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/assets/images/recortes/${name}${white ? "-branco" : ""}.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async"/>
    </Parallax>
  );
}

/** Botão/link magnético discreto (técnica Moxen "Imán"); desligado em toque. */
export function Magnetic({ children, strength = 0.32 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(hover: none)").matches || !motionAllowed()) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.45)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.45)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => { xTo(0); yTo(0); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, [strength]);
  return <span ref={ref} className="at-magnetic">{children}</span>;
}

/** Traço SVG desenhado conforme a rolagem (técnica Codegrid "Draw SVG Stroke On Scroll"). */
export function DrawPath({ d, viewBox, className, dashed = false, strokeWidth = 2 }: {
  d: string; viewBox: string; className?: string; dashed?: boolean; strokeWidth?: number;
}) {
  const ref = useRef<SVGPathElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const path = ref.current;
    if (!path || !motionAllowed()) return;
    const len = path.getTotalLength();
    const mask = svg.current?.querySelector<SVGPathElement>(".at-draw__mask");
    const target = dashed && mask ? mask : path;
    target.style.strokeDasharray = `${len}`;
    target.style.strokeDashoffset = `${len}`;
    const tween = gsap.to(target, {
      strokeDashoffset: 0, ease: "none",
      scrollTrigger: { trigger: svg.current, start: "top 85%", end: "bottom 40%", scrub: 0.6 },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); target.style.strokeDasharray = ""; target.style.strokeDashoffset = ""; };
  }, [dashed]);
  const id = "m" + useId().replace(/:/g, "");
  return (
    <svg ref={svg} className={"at-draw " + (className ?? "")} viewBox={viewBox} aria-hidden="true">
      {dashed && (
        <defs><mask id={id}><path className="at-draw__mask" d={d} fill="none" stroke="#fff" strokeWidth={strokeWidth + 4}/></mask></defs>
      )}
      <path ref={ref} d={d} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={dashed ? "7 9" : undefined} mask={dashed ? `url(#${id})` : undefined}/>
    </svg>
  );
}

/** Número que conta até o valor final; o valor real está sempre no DOM para leitores de tela. */
export function CountUp({ value, decimals = 0, suffix = "", className }: { value: number; decimals?: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;
    const obj = { n: 0 };
    const tween = gsap.to(obj, {
      n: value, duration: 1.6, ease: "power2.out",
      onUpdate: () => { el.textContent = fmt(obj.n); },
      onComplete: () => { el.textContent = fmt(value); },
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); el.textContent = fmt(value); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span className={className}><span className="sr-only">{fmt(value)}</span><span ref={ref} aria-hidden="true">{fmt(value)}</span></span>;
}
