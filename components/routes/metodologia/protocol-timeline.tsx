"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "@/components/atlas/motion";
import { steps } from "./data";

gsap.registerPlugin(ScrollTrigger);
const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Protocolo como caule que cresce ao rolar (Draw SVG Stroke On Scroll): o traço liga as cinco
 * etapas e cada nó "acende" quando a leitura chega a ele. Sem movimento: tudo desenhado.
 */
export function ProtocolTimeline() {
  const root = useRef<HTMLOListElement>(null);
  const [geo, setGeo] = useState<{ h: number; ys: number[] }>({ h: 1000, ys: [] });

  useIso(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const top = el.getBoundingClientRect().top;
      const ys = Array.from(el.querySelectorAll<HTMLElement>(".mt-step__node")).map(n => {
        const r = n.getBoundingClientRect();
        return Math.round(r.top - top + r.height / 2);
      });
      setGeo({ h: Math.round(el.offsetHeight), ys });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const d = buildStem(geo.h, geo.ys);

  useEffect(() => {
    const el = root.current;
    if (!el || !motionAllowed() || !geo.ys.length) return;
    const path = el.querySelector<SVGPathElement>(".mt-stem__line");
    if (!path) return;
    const len = path.getTotalLength();
    const ctx = gsap.context(() => {
      gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, {
        strokeDashoffset: 0, ease: "none",
        scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 65%", scrub: .6 },
      });
      gsap.utils.toArray<HTMLElement>(".mt-step").forEach(step => {
        ScrollTrigger.create({ trigger: step, start: "top 68%", onEnter: () => step.classList.add("is-lit"), onLeaveBack: () => step.classList.remove("is-lit") });
        gsap.from(step.querySelector(".mt-step__card"), { x: 40, opacity: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: step, start: "top 82%", once: true } });
      });
    }, el);
    el.classList.add("is-animated");
    return () => { ctx.revert(); el.classList.remove("is-animated"); el.querySelectorAll(".mt-step").forEach(s => s.classList.remove("is-lit")); };
  }, [geo]);

  return (
    <ol ref={root} className="mt-timeline">
      <svg className="mt-stem" width="80" height={geo.h} viewBox={`0 0 80 ${geo.h}`} aria-hidden="true">
        <path d={d} className="mt-stem__ghost" fill="none"/>
        <path d={d} className="mt-stem__line" fill="none"/>
        {geo.ys.map((y, i) => (
          <path key={i} className="mt-stem__leaf" d={i % 2 ? `M40 ${y} q 22 -26 36 -14 q -16 20 -36 14` : `M40 ${y} q -22 -26 -36 -14 q 16 20 36 14`}/>
        ))}
      </svg>
      {steps.map(s => (
        <li key={s.number} className="mt-step">
          <span className="mt-step__node" aria-hidden="true">{s.number}</span>
          <article className="mt-step__card">
            <p className="mt-step__n">Etapa {s.number}</p>
            <h3>{s.title}</h3>
            <p>{s.description}</p>
            <ul className="mt-step__checks" aria-label="O que é conferido">
              {s.checks.map(c => <li key={c}>{c}</li>)}
            </ul>
          </article>
        </li>
      ))}
    </ol>
  );
}

function buildStem(h: number, ys: number[]) {
  if (!ys.length) return `M40 0 L40 ${h}`;
  let d = `M40 0 L40 ${ys[0]}`;
  for (let i = 1; i < ys.length; i++) {
    const a = ys[i - 1], b = ys[i], mid = (a + b) / 2, sway = i % 2 ? 18 : -18;
    d += ` C ${40 + sway} ${a + (mid - a) * .6}, ${40 + sway} ${b - (b - mid) * .6}, 40 ${b}`;
  }
  return d + ` L40 ${h}`;
}
