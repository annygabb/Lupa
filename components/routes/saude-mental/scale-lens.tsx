"use client";

/**
 * "O alcance de uma escala": o PHQ-9 no centro, o que ele não mede ao redor. Cada dimensão é um
 * botão (toque/teclado, sem depender de hover) que explica por que fica dentro ou fora da lente.
 * Os textos reaproveitam os limites já documentados em evidence.ts e reviewed-metrics.ts (M05).
 */
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "@/components/atlas/motion";

gsap.registerPlugin(ScrollTrigger);

const dims = [
  { key: "sintomas", label: "Sintomas depressivos", inside: true,
    text: "É o que o PHQ-9 registra: um questionário de sintomas depressivos. No SURMOUNT, a medida foi a mudança para uma categoria mais grave." },
  { key: "diagnostico", label: "Diagnóstico de depressão", inside: false,
    text: "Mudar de categoria em um questionário de sintomas não equivale a receber diagnóstico de depressão causada pelo tratamento." },
  { key: "causa", label: "Causa psiquiátrica", inside: false,
    text: "O percentual não mede causalidade de transtornos psiquiátricos. Não é incidência de depressão causada pelo remédio." },
  { key: "estetica", label: "Pressão estética", inside: false,
    text: "Pressão estética, estigma, alimentação emocional e transtornos alimentares não são medidos por uma única escala." },
  { key: "estigma", label: "Estigma", inside: false,
    text: "O estigma em relação ao peso exige outra investigação: não aparece numa escala de sintomas depressivos." },
  { key: "emocional", label: "Alimentação emocional", inside: false,
    text: "Um estudo brasileiro sobre percepção do peso e alimentação emocional pode explicar contexto social, mas não provar efeito de uma caneta." },
  { key: "alimentares", label: "Transtornos alimentares", inside: false,
    text: "Transtornos alimentares pedem instrumentos e estudos próprios; não são medidos por uma única escala de sintomas." },
  { key: "brasil", label: "Prevalência no Brasil", inside: false,
    text: "O resultado internacional não informa quantas pessoas no Brasil ou nos EUA terão ansiedade ou depressão." },
] as const;

const outside = dims.filter(d => !d.inside);
const left = outside.slice(0, 4);
const right = outside.slice(4);

export function ScaleLens() {
  const [sel, setSel] = useState<string>("sintomas");
  const root = useRef<HTMLDivElement>(null);
  const current = dims.find(d => d.key === sel)!;

  useEffect(() => {
    const el = root.current;
    if (!el || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 75%", once: true } });
      tl.from(".sm-lens__ring", { scale: 0.6, opacity: 0, duration: 0.9, ease: "power3.out" })
        .from(".sm-lens__col--l .sm-dim", { x: 120, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.07 }, 0.3)
        .from(".sm-lens__col--r .sm-dim", { x: -120, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.07 }, 0.3);
    }, el);
    return () => ctx.revert();
  }, []);

  const chip = (d: (typeof dims)[number], i: number) => (
    <button key={d.key} type="button" className="sm-dim" aria-pressed={sel === d.key} onClick={() => setSel(d.key)}
      style={{ ["--o" as string]: `${[0, 1, 1, 0][i] ?? 0}` }}>
      <span className="sm-dim__x" aria-hidden="true">×</span>{d.label}
    </button>
  );

  return (
    <div ref={root} className="sm-lens">
      <div className="sm-lens__stage" role="group" aria-label="Dimensões dentro e fora do alcance do PHQ-9">
        <div className="sm-lens__col sm-lens__col--l">{left.map(chip)}</div>
        <div className="sm-lens__center">
          <span className="sm-lens__ring" aria-hidden="true"/>
          <button type="button" className="sm-lens__core" aria-pressed={sel === "sintomas"} onClick={() => setSel("sintomas")}>
            <span className="sm-lens__k at-mono">PHQ-9</span>
            <span className="sm-lens__t">Sintomas depressivos</span>
            <span className="sm-lens__s at-mono">categoria</span>
          </button>
        </div>
        <div className="sm-lens__col sm-lens__col--r">{right.map(chip)}</div>
      </div>
      <div className={"sm-lens__panel" + (current.inside ? " is-inside" : "")} aria-live="polite">
        <p className="sm-lens__verdict at-mono">{current.inside ? "Dentro do alcance do PHQ-9" : "Fora do alcance desta escala"}</p>
        <p className="sm-lens__name">{current.label}</p>
        <p className="sm-lens__text">{current.text}</p>
      </div>
    </div>
  );
}
