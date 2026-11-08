"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { motionAllowed } from "@/components/atlas/motion";
import { LimitNote } from "@/components/atlas/ui";
import type { ClinicalPlot } from "@/features/insights/evidence";

const one = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Resultado de um estudo internacional, na população original — redesenho de ClinicalChart para uma só prancha. */
export function EvidencePlate({ plot, linkMuscles = false }: { plot: ClinicalPlot; linkMuscles?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const min = Math.min(0, ...plot.arms.map(a => a.value));
  const max = Math.max(0, ...plot.arms.map(a => a.value));
  const low = min < 0 ? Math.floor(min / 5) * 5 : 0;
  const high = max > 0 ? Math.ceil(max / 5) * 5 : 0;
  const range = high - low || 1;
  const pos = (v: number) => ((v - low) / range) * 100;
  const signed = min < 0;

  useEffect(() => {
    const el = root.current;
    if (!el || !motionAllowed()) return;
    const bars = el.querySelectorAll(".px-bars__fill");
    const tween = gsap.from(bars, { scaleX: 0, duration: 1.1, ease: "power3.out", stagger: .14 });
    return () => { tween.kill(); gsap.set(bars, { clearProps: "transform" }); };
  }, [plot.id]);

  return (
    <div ref={root} className="px-plate">
      <div className="px-plate__head">
        <p className="px-plate__meta">{plot.design} · {plot.period}</p>
        <h3 className="px-plate__title">{plot.title}</h3>
        <p className="px-plate__q">{plot.question}</p>
      </div>
      <figure className="px-bars">
        <figcaption>{plot.axisLabel}</figcaption>
        <div className="px-bars__rows" role="img" aria-label={plot.arms.map(a => `${a.label}: ${one(a.value)} ${plot.unit}`).join("; ")}>
          {plot.arms.map((arm, i) => (
            <div className="px-bars__row" key={arm.label}>
              <p className="px-bars__label">{arm.label}{arm.n ? <span> · n = {arm.n.toLocaleString("pt-BR")}</span> : null}</p>
              <div className="px-bars__track">
                <span className="px-bars__zero" style={{ left: `${pos(0)}%` }}/>
                <span className={`px-bars__fill px-bars__fill--${i}`} style={{
                  left: `${pos(Math.min(0, arm.value))}%`, width: `${Math.abs(arm.value) / range * 100}%`,
                  transformOrigin: arm.value < 0 ? "right center" : "left center",
                }}/>
              </div>
              <strong className="px-bars__value">{arm.value > 0 && signed ? "+" : ""}{one(arm.value)}%</strong>
            </div>
          ))}
          <div className="px-bars__axis" aria-hidden="true"><span>{one(low)}%</span>{signed && high > 0 && <span>0%</span>}<span>{one(high)}%</span></div>
        </div>
        <details className="px-details">
          <summary>Ver valores em tabela</summary>
          <div className="px-table-wrap">
            <table className="at-table">
              <caption className="sr-only">{plot.title}</caption>
              <thead><tr><th scope="col">Grupo</th><th scope="col">Resultado</th><th scope="col">N do braço</th></tr></thead>
              <tbody>{plot.arms.map(a => <tr key={a.label}><th scope="row">{a.label}</th><td>{one(a.value)} {plot.unit}</td><td>{a.n ?? "Não informado no resumo"}</td></tr>)}</tbody>
            </table>
          </div>
        </details>
      </figure>
      <div className="px-plate__read">
        <div><h4>O que isso mostra</h4><p>{plot.finding}</p></div>
        <LimitNote><p>{plot.limitation}</p></LimitNote>
      </div>
      <details className="px-details">
        <summary>Quem foi estudado e de onde vem o número</summary>
        <p>{plot.population}</p>
        <p>{plot.locator}. Extração descritiva conferida em 07/11/2026; sem revisão clínica independente.</p>
      </details>
      <div className="px-plate__links">
        <a className="at-link" href={`https://pubmed.ncbi.nlm.nih.gov/${plot.pmid}/`} target="_blank" rel="noopener noreferrer">Ler fonte no PubMed · PMID {plot.pmid} <span aria-hidden="true">↗</span></a>
        {linkMuscles && <Link className="at-link" href="/musculos-uti">Investigar a ligação com músculos <span aria-hidden="true">→</span></Link>}
      </div>
    </div>
  );
}
