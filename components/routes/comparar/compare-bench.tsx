"use client";

/**
 * Bancada de comparação: duas fichas de herbário sobre a balança.
 * Inverter faz as fichas cruzarem de lado (FLIP com arco); escolher estudos
 * reavalia a compatibilidade com features/comparison — nada é combinado numericamente.
 */
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { motionAllowed } from "@/components/atlas/motion";
import { assessStudyComparison } from "@/features/comparison/compatibility";
import { getUnifiedEvidence } from "@/features/evidence/unified-catalog";
import { BalanceBeam } from "./balance-beam";
import { HerbariumSheet } from "./herbarium-sheet";
import { VerdictPanel } from "./verdict-panel";

type Rects = { a: DOMRect; b: DOMRect } | null;

export function CompareBench() {
  const [leftId, setLeftId] = useState("E04");
  const [rightId, setRightId] = useState("E12");
  const [pulse, setPulse] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const sheetA = useRef<HTMLElement>(null);
  const sheetB = useRef<HTMLElement>(null);
  const before = useRef<Rects>(null);

  const left = getUnifiedEvidence(leftId);
  const right = getUnifiedEvidence(rightId);
  if (!left || !right) throw new Error("Referência não disponível");
  const assessment = useMemo(() => assessStudyComparison(left, right), [left, right]);
  const same = !assessment.canShowSideBySide;

  const swap = () => {
    if (sheetA.current && sheetB.current && motionAllowed()) {
      before.current = { a: sheetA.current.getBoundingClientRect(), b: sheetB.current.getBoundingClientRect() };
    }
    setLeftId(rightId);
    setRightId(leftId);
    setPulse(p => p + 1);
    setSwaps(s => s + 1);
  };

  // FLIP: cada ficha começa onde estava a outra e atravessa a bancada em arco.
  useLayoutEffect(() => {
    const r = before.current;
    const a = sheetA.current, b = sheetB.current;
    before.current = null;
    if (!r || !a || !b) return;
    const dx = r.b.left - r.a.left, dy = r.b.top - r.a.top;
    const horizontal = Math.abs(dx) > Math.abs(dy);
    const arc = (dir: number) => (horizontal ? { yPercent: 5 * dir } : { xPercent: 7 * dir });
    const reset = () => gsap.set([a, b], { clearProps: "transform,zIndex" });
    const tl = gsap.timeline({ defaults: { duration: 0.95, ease: "power3.inOut" }, onComplete: reset });
    const half = { duration: 0.475, ease: "sine.inOut", yoyo: true, repeat: 1 };
    tl.set(a, { zIndex: 3 }).set(b, { zIndex: 2 })
      .fromTo(a, { x: dx, y: dy }, { x: 0, y: 0 }, 0)
      .fromTo(b, { x: -dx, y: -dy }, { x: 0, y: 0 }, 0)
      .to(a, { ...arc(-1), rotation: -4, scale: 1.03, ...half }, 0)
      .to(b, { ...arc(1), rotation: 3, scale: 0.96, ...half }, 0);
    return () => { tl.kill(); reset(); };
  }, [swaps]);

  const pick = (side: "a" | "b") => (id: string) => {
    if (side === "a") setLeftId(id); else setRightId(id);
    setPulse(p => p + 1);
  };

  return (
    <div className="cp-bench">
      <BalanceBeam leftId={left.id} rightId={right.id} same={same} pulse={pulse}/>
      <p className="cp-bench__caption">
        <span className="at-mono">A balança não pende.</span>{" "}
        Os dois pratos ficam no mesmo nível: o Comparador mostra cada estudo no próprio contexto e não pesa um contra o outro.
      </p>

      <div className="cp-bench__sheets">
        <HerbariumSheet ref={sheetA} record={left} side="a" selectId="compare-left" onSelect={pick("a")}/>
        <div className="cp-swap">
          <span className="cp-swap__wire" aria-hidden="true"/>
          <button type="button" className="cp-swap__btn" onClick={swap}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="cp-swap__icon">
              <path d="M4 8h14l-4-4M20 16H6l4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Trocar posições dos estudos</span>
          </button>
        </div>
        <HerbariumSheet ref={sheetB} record={right} side="b" selectId="compare-right" onSelect={pick("b")}/>
      </div>

      <VerdictPanel assessment={assessment} pairKey={left.id + "|" + right.id}/>
    </div>
  );
}
