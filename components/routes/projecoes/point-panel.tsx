"use client";

import { TweenNumber } from "./tween-number";
import type { PointReading } from "./data";

/** Ficha do ponto selecionado: valor, o que mede, população e onde a leitura para. */
export function PointPanel({ data }: { data: PointReading }) {
  const raw = data.value.replace(/%/g, "");
  const numeric = Number(raw.replace(/\./g, "").replace(",", "."));
  const decimals = raw.includes(",") ? raw.split(",")[1].length : 0;
  const isHypothesis = /hipótese/.test(data.kind);
  return (
    <aside className={"px-panel" + (isHypothesis ? " is-hypothesis" : "")} aria-label="Entenda o ponto selecionado" aria-live="polite">
      <div className="px-panel__pin" aria-hidden="true"/>
      <p className="px-panel__top">
        <span className="px-panel__kind">{data.kind}</span>
        <span className="px-panel__period">{data.period}</span>
      </p>
      <p className="metric-detail-value px-panel__value">
        {Number.isFinite(numeric)
          ? <TweenNumber value={numeric} decimals={decimals} suffix={data.value.includes("%") ? "%" : ""}/>
          : data.value}
      </p>
      <h4 className="px-panel__label">{data.label}</h4>
      <p className="px-panel__meaning">{data.meaning}</p>
      <details className="px-panel__more">
        <summary>População, limites e premissas</summary>
        <dl>
          <div><dt>População</dt><dd>{data.population}</dd></div>
          <div><dt>Limite da leitura</dt><dd>{data.limitation}</dd></div>
          {data.assumptions && <div><dt>Premissas do cálculo</dt><dd>{data.assumptions}</dd></div>}
        </dl>
      </details>
      {data.pmid && (
        <a className="at-link px-panel__src" href={`https://pubmed.ncbi.nlm.nih.gov/${data.pmid}/`} target="_blank" rel="noopener noreferrer">
          Fonte no PubMed · PMID {data.pmid} <span aria-hidden="true">↗</span>
        </a>
      )}
    </aside>
  );
}
