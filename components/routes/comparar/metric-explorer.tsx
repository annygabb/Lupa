"use client";

/**
 * Painel dos cinco indicadores conferidos (M01–M05). Cada um é lido só dentro da própria
 * publicação: régua de resultados, tabela equivalente, como ler, quem foi estudado,
 * onde a conclusão para e a fonte original.
 */
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { LimitNote, Specimen } from "@/components/atlas/ui";
import { motionAllowed } from "@/components/atlas/motion";
import { formatMetricValue, getReviewedMetric, reviewedMetrics } from "@/features/comparison/reviewed-metrics";
import { formatReviewDate, groupForMetric, metricGroups } from "./data";
import { MetricRuler } from "./metric-ruler";

export function MetricExplorer() {
  const [metricId, setMetricId] = useState("M03");
  const metric = getReviewedMetric(metricId);
  const plate = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = plate.current;
    if (!el || !motionAllowed()) return;
    const items = el.querySelectorAll(".cp-metric__head > *, .cp-metric__specs > *");
    const tween = gsap.from(items, { y: 22, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.05 });
    return () => { tween.kill(); gsap.set(items, { clearProps: "transform,opacity" }); };
  }, [metricId]);

  if (!metric) throw new Error("Indicador não disponível");
  const group = groupForMetric(metric);
  const proportion = metric.measurementKind === "outcome_proportion";

  return (
    <div className="cp-explorer">
      <div className="cp-explorer__rail">
        <div className="cp-explorer__rail-head">
          <p className="cp-explorer__ask">Selecione um tema de análise</p>
          <span className="at-mono">{reviewedMetrics.length} indicadores</span>
        </div>

        <div className="cp-explorer__desk">
          <div className="cp-themes" role="group" aria-label="Categorias dos indicadores">
            {metricGroups.map((g, i) => (
              <button key={g.key} type="button" className="cp-theme" aria-pressed={g.key === group.key} onClick={() => setMetricId(g.items[0])}>
                <span className="cp-theme__n at-mono" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                {g.label}
              </button>
            ))}
          </div>
          <div className="cp-subs" role="group" aria-label="Indicadores do tema selecionado">
            {group.items.map(id => {
              const item = getReviewedMetric(id);
              if (!item) return null;
              return (
                <button key={id} type="button" className="at-chip cp-sub" aria-pressed={id === metric.id} onClick={() => setMetricId(id)}>
                  <span className="at-mono" aria-hidden="true">{id}</span>{item.title}
                </button>
              );
            })}
          </div>
        </div>

        <div className="cp-explorer__mobile at-field">
          <label htmlFor="reviewed-metric" className="at-label">Indicador</label>
          <select id="reviewed-metric" className="at-select" value={metric.id} onChange={e => setMetricId(e.target.value)}>
            {metricGroups.map(g => (
              <optgroup key={g.key} label={g.label}>
                {g.items.map(id => {
                  const item = getReviewedMetric(id);
                  return item ? <option key={id} value={id}>{id} · {item.title}</option> : null;
                })}
              </optgroup>
            ))}
          </select>
        </div>

        <p className="cp-explorer__note"><strong>{group.label}:</strong> {group.detail}. Cada gráfico mostra apenas os grupos internos do próprio estudo.</p>
      </div>

      <p className="sr-only" aria-live="polite">Indicador {metric.id} exibido: {metric.title}.</p>
      <div ref={plate} className="cp-metric">
        <header className="cp-metric__head">
          <p className="cp-metric__kicker at-mono">Análise do estudo · {metric.id} · {metric.studyLabel}</p>
          <h3 className="cp-metric__title">{metric.title}</h3>
          <p className="cp-metric__desc">{metric.description}</p>
          <p className="cp-metric__badge at-mono"><span aria-hidden="true">✓</span> Fonte primária conferida</p>
        </header>

        <div className="cp-metric__specs">
          <Specimen id={metric.evidenceId} href={"/evidencias/" + metric.evidenceId} label="N total analisado"
            value={metric.analyzedN.toLocaleString("pt-BR")}
            note={metric.denominatorStatus === "by_arm_reported" ? "N por grupo conferido" : "Só o N total foi informado"}/>
          <Specimen id="Período" label="Janela de seguimento" value={metric.followupWeeks + " semanas"} note={metric.timeWindow}/>
          <Specimen id="Unidade" label="Medida em %" value={proportion ? "Proporção" : "Mudança relativa"}
            note={proportion ? "Percentual de cada grupo (0–100%)" : "Em relação ao basal do próprio grupo"}/>
        </div>

        <figure className="cp-chart">
          <figcaption className="cp-chart__cap">
            <span className="cp-chart__title">Leitura dos resultados</span>
            <span className="at-mono">{metric.design}</span>
          </figcaption>
          <MetricRuler key={metric.id} metric={metric}/>
          <p className="cp-chart__foot">
            {proportion
              ? "Cada barra mostra uma proporção reportada no estudo. Não é uma estimativa para toda a população."
              : "À esquerda do zero: redução; à direita: aumento. Valores relativos ao próprio basal de cada grupo."}
          </p>
        </figure>

        <section className="cp-table" aria-labelledby="cp-table-title">
          <div className="cp-table__head">
            <h4 id="cp-table-title">Tabela de dados</h4>
            <p className="at-mono">Base observada: resultado, n e IC 95%</p>
          </div>
          <div className="cp-table__scroll" tabIndex={0} role="region" aria-labelledby="cp-table-title">
            <table className="at-table">
              <caption className="sr-only">Resultados numéricos conferidos do indicador {metric.id}: {metric.title}</caption>
              <thead>
                <tr><th scope="col">Grupo</th><th scope="col">N do grupo</th><th scope="col">Resultado</th><th scope="col">IC 95%</th></tr>
              </thead>
              <tbody>
                {metric.arms.map(arm => (
                  <tr key={arm.key}>
                    <th scope="row">{arm.label}</th>
                    <td>{arm.sampleN === null ? "Não conferido" : arm.sampleN.toLocaleString("pt-BR")}</td>
                    <td className="cp-table__val">{formatMetricValue(arm.value, metric.unit)}</td>
                    <td>{arm.ciLower === null || arm.ciUpper === null ? "Não extraído" : formatMetricValue(arm.ciLower, "%") + " a " + formatMetricValue(arm.ciUpper, "%")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {metric.denominatorStatus === "only_total_reported" && (
            <p className="cp-table__note">N por braço não conferido no resumo; o N total analisado foi {metric.analyzedN.toLocaleString("pt-BR")}.</p>
          )}
        </section>

        <div className="cp-metric__reading">
          <div>
            <h4>Como ler este dado</h4>
            <p>{metric.estimator}</p>
          </div>
          <div>
            <h4>Quem foi estudado</h4>
            <p>{metric.population}</p>
          </div>
        </div>

        <LimitNote><p>{metric.limitations}</p></LimitNote>

        <footer className="cp-metric__source">
          <div>
            <h4>Fonte e rastreabilidade</h4>
            <p>{metric.sourceLocator}. Conferência documental em {formatReviewDate(metric.reviewedOn)}. Sem liberação para projeções populacionais.</p>
          </div>
          <a className="at-btn at-btn--solid cp-metric__src" href={metric.sourceUrl} target="_blank" rel="noopener noreferrer">
            Abrir fonte original <span aria-hidden="true">↗</span>
          </a>
        </footer>
      </div>
    </div>
  );
}
