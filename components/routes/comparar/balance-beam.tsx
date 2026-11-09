"use client";

/**
 * Balança de dois pratos desenhada em traço de cianotipia. Ela nunca pende:
 * o Comparador não pesa um estudo contra o outro. Ao trocar ou escolher estudos,
 * o travessão oscila e volta ao nível — o movimento reforça que nada foi calculado.
 */
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motionAllowed } from "@/components/atlas/motion";

export function BalanceBeam({ leftId, rightId, same, pulse }: { leftId: string; rightId: string; same: boolean; pulse: number }) {
  const svg = useRef<SVGSVGElement>(null);
  const first = useRef(true);

  // Traço desenhado ao entrar na tela.
  useEffect(() => {
    const el = svg.current;
    if (!el || !motionAllowed()) return;
    const paths = el.querySelectorAll<SVGGeometryElement>(".cp-beam__ink");
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
    const tween = gsap.to(paths, {
      strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: 0.05,
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); gsap.set(paths, { clearProps: "strokeDasharray,strokeDashoffset" }); };
  }, []);

  // Oscila e volta ao nível a cada troca de estudos.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = svg.current;
    if (!el || !motionAllowed()) return;
    const arm = el.querySelector(".cp-beam__arm");
    const dir = pulse % 2 ? 1 : -1;
    const tl = gsap.timeline();
    tl.fromTo(arm, { rotation: 7 * dir }, { rotation: 0, svgOrigin: "500 70", duration: 1.6, ease: "elastic.out(1, 0.32)" });
    return () => { tl.kill(); };
  }, [pulse]);

  return (
    <div className={"cp-beam" + (same ? " is-same" : "")}>
      <svg ref={svg} className="cp-beam__svg" viewBox="0 0 1000 300" aria-hidden="true" focusable="false">
        <g className="cp-beam__stand">
          <path className="cp-beam__ink" pathLength={1} d="M500 70 V262"/>
          <path className="cp-beam__ink" pathLength={1} d="M488 92 V258 M512 92 V258"/>
          <path className="cp-beam__ink" pathLength={1} d="M420 284 Q500 250 580 284 Z"/>
          <path className="cp-beam__ink" pathLength={1} d="M500 58 V34"/>
          <circle className="cp-beam__ink cp-beam__knob" pathLength={1} cx="500" cy="27" r="7"/>
        </g>
        <g className="cp-beam__arm">
          <path className="cp-beam__ink cp-beam__bar" pathLength={1} d="M150 70 Q500 58 850 70"/>
          <circle className="cp-beam__ink" pathLength={1} cx="500" cy="70" r="12"/>
          <path className="cp-beam__ink" pathLength={1} d="M150 70 L80 196 M150 70 L220 196"/>
          <path className="cp-beam__ink" pathLength={1} d="M850 70 L780 196 M850 70 L920 196"/>
          <path className="cp-beam__ink cp-beam__pan" pathLength={1} d="M66 196 Q150 252 234 196 Z"/>
          <path className="cp-beam__ink cp-beam__pan" pathLength={1} d="M766 196 Q850 252 934 196 Z"/>
        </g>
        {same && <g className="cp-beam__cross"><circle cx="500" cy="70" r="22"/><path d="M490 60 L510 80 M510 60 L490 80"/></g>}
      </svg>
      <p className="cp-beam__pan-label cp-beam__pan-label--a at-mono" aria-hidden="true"><span>A</span> {leftId}</p>
      <p className="cp-beam__pan-label cp-beam__pan-label--b at-mono" aria-hidden="true"><span>B</span> {rightId}</p>
    </div>
  );
}
