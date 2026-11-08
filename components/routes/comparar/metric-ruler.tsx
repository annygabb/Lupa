"use client";

/**
 * Régua de resultados de UM indicador conferido: barras horizontais internas a uma
 * única publicação, com escala ocupando toda a largura, zero marcado e IC 95% quando
 * publicado. As barras crescem a partir do zero ao entrar na tela e a cada troca.
 */
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motionAllowed } from "@/components/atlas/motion";
import { formatMetricValue, type ReviewedMetric } from "@/features/comparison/reviewed-metrics";

function domainFor(metric: ReviewedMetric) {
  if (metric.measurementKind === "outcome_proportion") return { min: 0, max: 100, step: 25 };
  const values = metric.arms.flatMap(a => [a.value, a.ciLower ?? a.value, a.ciUpper ?? a.value]);
  const lo = Math.min(0, ...values), hi = Math.max(0, ...values);
  const step = hi - lo > 30 ? 10 : 5;
  // Arredonda para fora, sempre com folga para o rótulo do extremo.
  const min = lo < 0 ? Math.floor(lo / step) * step - (lo % step === 0 ? step : 0) : 0;
  const max = hi > 0 ? Math.ceil(hi / step) * step + (hi % step === 0 ? step : 0) : 0;
  return { min, max, step };
}

const fmtTick = (v: number, proportion: boolean) =>
  (v > 0 && !proportion ? "+" : v < 0 ? "-" : "") + Math.abs(v).toLocaleString("pt-BR") + "%";

export function MetricRuler({ metric }: { metric: ReviewedMetric }) {
  const root = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const proportion = metric.measurementKind === "outcome_proportion";
  const { min, max, step } = domainFor(metric);
  const pos = (v: number) => ((v - min) / (max - min)) * 100;
  const ticks: number[] = [];
  for (let v = min; v <= max + 1e-9; v += step) ticks.push(Math.round(v));

  useEffect(() => {
    const el = root.current;
    if (!el || !motionAllowed()) return;
    const bars = el.querySelectorAll(".cp-ruler__bar");
    const marks = el.querySelectorAll(".cp-ruler__ci, .cp-ruler__value");
    const initial = first.current;
    first.current = false;
    const tl = gsap.timeline({ scrollTrigger: initial ? { trigger: el, start: "top 82%", once: true } : undefined });
    tl.from(bars, { scaleX: 0, duration: 1.1, ease: "power4.out", stagger: 0.16 })
      .from(marks, { opacity: 0, y: 8, duration: 0.45, ease: "power2.out", stagger: 0.08 }, "-=0.6");
    return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set([...bars, ...marks], { clearProps: "transform,opacity" }); };
  }, [metric.id]);

  return (
    <div ref={root} className="cp-ruler" aria-hidden="true">
      <div className="cp-ruler__rows">
        {metric.arms.map((arm, i) => {
          const zero = pos(0), end = pos(arm.value);
          const left = Math.min(zero, end), width = Math.max(0.6, Math.abs(end - zero));
          const neg = arm.value < 0;
          return (
            <div key={arm.key} className={`cp-ruler__row cp-ruler__row--${i === 0 ? "a" : "b"}`}>
              <div className="cp-ruler__label">
                <span className="cp-ruler__group at-mono">Grupo {i + 1} · {arm.sampleN === null ? "n não conferido" : "n=" + arm.sampleN.toLocaleString("pt-BR")}</span>
                <span className="cp-ruler__arm">{arm.label}</span>
                <strong className="cp-ruler__value">{formatMetricValue(arm.value, metric.unit)}</strong>
                {arm.ciLower !== null && arm.ciUpper !== null && (
                  <span className="cp-ruler__ci-text at-mono">IC 95%: {formatMetricValue(arm.ciLower, "%")} a {formatMetricValue(arm.ciUpper, "%")}</span>
                )}
              </div>
              <div className="cp-ruler__track">
                {ticks.map(t => <span key={t} className="cp-ruler__grid" style={{ left: pos(t) + "%" }}/>)}
                <span className="cp-ruler__bar" style={{ left: left + "%", width: width + "%", transformOrigin: neg ? "right center" : "left center" }}/>
                {arm.ciLower !== null && arm.ciUpper !== null && (
                  <span className="cp-ruler__ci" style={{ left: pos(arm.ciLower) + "%", width: (pos(arm.ciUpper) - pos(arm.ciLower)) + "%" }}/>
                )}
                <span className="cp-ruler__zero" style={{ left: zero + "%" }}/>
              </div>
            </div>
          );
        })}
      </div>
      <div className="cp-ruler__axis">
        <span className="cp-ruler__axis-label at-mono">{proportion ? "Escala 0–100%" : "Eixo: 0% = basal do próprio grupo"}</span>
        <div className="cp-ruler__ticks">
          {ticks.map((t, i) => (
            <span key={t} className={"at-mono" + (t === 0 ? " is-zero" : "") + (i === 0 ? " is-first" : i === ticks.length - 1 ? " is-last" : "")}
              style={{ left: pos(t) + "%" }}>{fmtTick(t, proportion)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
