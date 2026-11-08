"use client";

/**
 * Barras de evidência da prancha 03: escala em 100% da largura, rótulos em coluna mono,
 * N/unidade/período/fonte sempre visíveis e tabela equivalente. As barras crescem ao entrar
 * na tela (apenas com movimento permitido); sem JS, ficam no tamanho final.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "@/components/atlas/motion";
import { pct } from "./data";

gsap.registerPlugin(ScrollTrigger);

export type BarRow = { label: string; value: number; n: number | null; nNote?: string };
export type BarGroup = { label?: string; rows: readonly BarRow[] };

export function EvidenceBars({ title, groups, domain, axisLabel, unit, period, design, source, children }: {
  title: string; groups: readonly BarGroup[]; domain: number; axisLabel: string; unit: string;
  period: string; design: string; source: { href: string; label: string }; children?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const negative = groups.every(g => g.rows.every(r => r.value <= 0));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => t * domain * (negative ? -1 : 1));
  const all = groups.flatMap(g => g.rows.map(r => ({ ...r, group: g.label })));
  const nText = (r: BarRow) => r.n !== null ? `n=${r.n.toLocaleString("pt-BR")}` : (r.nNote ?? "n do grupo não informado");

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;
    const bars = el.querySelectorAll<HTMLElement>(".mu-bars__bar");
    const values = el.querySelectorAll<HTMLElement>(".mu-bars__value");
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 82%", once: true } });
    tl.from(bars, { scaleX: 0, duration: 1.1, ease: "power3.out", stagger: 0.09 })
      .from(values, { opacity: 0, x: -8, duration: 0.5, stagger: 0.09 }, 0.45);
    return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set([bars, values], { clearProps: "transform,opacity" }); };
  }, []);

  return (
    <figure ref={ref} className="mu-bars">
      <figcaption className="mu-bars__cap">
        <span className="mu-bars__title">{title}</span>
        <span className="mu-bars__axis-label at-mono">{axisLabel}</span>
      </figcaption>

      <div className="mu-bars__plot" role="img"
        aria-label={all.map(r => `${r.group ? r.group + ", " : ""}${r.label} (${nText(r)}): ${pct(r.value)}`).join("; ")}>
        {groups.map((g, gi) => (
          <div key={g.label ?? gi} className="mu-bars__group">
            {g.label && <p className="mu-bars__group-label at-mono">{g.label}</p>}
            {g.rows.map((r, ri) => {
              const w = Math.min(100, Math.abs(r.value) / domain * 100);
              return (
                <div key={r.label} className="mu-bars__row">
                  <span className="mu-bars__label at-mono">{r.label}<small>{nText(r)}</small></span>
                  <span className="mu-bars__track">
                    <span className={"mu-bars__bar" + (ri === 0 ? " is-primary" : "")} style={{ width: `${w}%` }}/>
                    <span className={"mu-bars__value" + (w > 76 ? (ri === 0 ? " is-inside is-on-dark" : " is-inside") : "")}
                      style={{ ["--w" as string]: `${w}%` }}>{pct(r.value)}</span>
                  </span>
                </div>
              );
            })}
          </div>
        ))}
        <div className="mu-bars__row mu-bars__row--axis">
          <span/>
          <span className="mu-bars__ticks at-mono">
            {ticks.map((t, i) => <span key={i} style={{ left: `${i * 25}%` }}>{pct(t, 0)}</span>)}
          </span>
        </div>
      </div>

      <dl className="mu-bars__facts at-mono">
        <div><dt>Unidade</dt><dd>{unit}</dd></div>
        <div><dt>Período</dt><dd>{period}</dd></div>
        <div><dt>Desenho</dt><dd>{design}</dd></div>
        <div><dt>Fonte</dt><dd><a className="at-link" href={source.href} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></dd></div>
      </dl>

      {children}

      <details className="mu-bars__table">
        <summary>Ver valores em tabela</summary>
        <div className="mu-bars__scroll">
          <table className="at-table">
            <caption className="sr-only">{title}</caption>
            <thead><tr>{groups.some(g => g.label) && <th scope="col">Medida</th>}<th scope="col">Grupo</th><th scope="col">Resultado</th><th scope="col">N do grupo</th></tr></thead>
            <tbody>
              {all.map(r => (
                <tr key={(r.group ?? "") + r.label}>
                  {groups.some(g => g.label) && <td>{r.group}</td>}
                  <th scope="row">{r.label}</th><td>{pct(r.value)} ({unit})</td><td>{r.n !== null ? r.n.toLocaleString("pt-BR") : (r.nNote ?? "Não informado")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
