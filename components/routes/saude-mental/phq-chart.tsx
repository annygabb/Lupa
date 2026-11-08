"use client";

/**
 * Barras do resultado PHQ-9 (SURMOUNT-1/2/3, análise pós-hoc · M05). Escala 0–30% em 100% da
 * largura, rótulos em coluna mono, N/unidade/período/fonte visíveis e tabela equivalente.
 */
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "@/components/atlas/motion";
import type { ClinicalPlot } from "@/features/insights/evidence";

gsap.registerPlugin(ScrollTrigger);

const DOMAIN = 30;
const pct = (v: number, d = 1) => v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }) + "%";

export function PhqChart({ plot, totalN }: { plot: ClinicalPlot; totalN: number }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;
    const bars = el.querySelectorAll<HTMLElement>(".sm-bars__bar");
    const values = el.querySelectorAll<HTMLElement>(".sm-bars__value");
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", once: true } });
    tl.from(bars, { scaleX: 0, duration: 1.2, ease: "power3.out", stagger: 0.12 })
      .from(values, { opacity: 0, x: -8, duration: 0.5, stagger: 0.12 }, 0.5);
    return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set([bars, values], { clearProps: "transform,opacity" }); };
  }, []);

  const nText = "N por braço não informado no resumo";

  return (
    <figure ref={ref} className="sm-bars">
      <figcaption className="sm-bars__cap">
        <span className="sm-bars__title">{plot.title}</span>
        <span className="sm-bars__axis at-mono">{plot.axisLabel}</span>
      </figcaption>
      <div className="sm-bars__plot" role="img"
        aria-label={plot.arms.map(a => `${a.label}: ${pct(a.value)} dos participantes (${nText})`).join("; ")}>
        {plot.arms.map((a, i) => {
          const w = Math.min(100, a.value / DOMAIN * 100);
          return (
            <div key={a.label} className="sm-bars__row">
              <span className="sm-bars__label at-mono">{a.label}<small>{a.n !== null ? `n=${a.n.toLocaleString("pt-BR")}` : nText}</small></span>
              <span className="sm-bars__track">
                <span className={"sm-bars__bar" + (i === 0 ? " is-primary" : "")} style={{ width: `${w}%` }}/>
                <span className="sm-bars__value" style={{ ["--w" as string]: `${w}%` }}>{pct(a.value)}</span>
              </span>
            </div>
          );
        })}
        <div className="sm-bars__row sm-bars__row--axis">
          <span/>
          <span className="sm-bars__ticks at-mono">
            {[0, 10, 20, 30].map((t, i) => <span key={t} style={{ left: `${(i / 3) * 100}%` }}>{t}%</span>)}
          </span>
        </div>
      </div>
      <dl className="sm-bars__facts at-mono">
        <div><dt>N total</dt><dd>{totalN.toLocaleString("pt-BR")} adultos (três estudos)</dd></div>
        <div><dt>Unidade</dt><dd>{plot.unit}</dd></div>
        <div><dt>Período</dt><dd>{plot.period}</dd></div>
        <div><dt>Desenho</dt><dd>{plot.design}</dd></div>
      </dl>
      <a className="sm-bars__source" href={`https://pubmed.ncbi.nlm.nih.gov/${plot.pmid}/`} target="_blank" rel="noopener noreferrer">
        Ler fonte no PubMed · PMID {plot.pmid} <span aria-hidden="true">↗</span>
      </a>
      <details className="sm-bars__table">
        <summary>Ver valores em tabela</summary>
        <table className="at-table">
          <caption className="sr-only">{plot.title}</caption>
          <thead><tr><th scope="col">Grupo</th><th scope="col">Resultado</th><th scope="col">N do braço</th></tr></thead>
          <tbody>
            {plot.arms.map(a => (
              <tr key={a.label}><th scope="row">{a.label}</th><td>{pct(a.value)} ({plot.unit})</td><td>{a.n ?? "Não informado no resumo"}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
