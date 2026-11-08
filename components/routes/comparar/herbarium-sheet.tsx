/**
 * Ficha de herbário de um estudo: seletor, desenho, amostra, resultados em lista,
 * limitação completa (nunca truncada) e links para a ficha e a fonte original.
 */
import Link from "next/link";
import { forwardRef } from "react";
import type { UnifiedEvidenceRecord } from "@/features/evidence/unified-catalog";
import { reviewedMetricsForEvidence } from "@/features/comparison/reviewed-metrics";
import { designNames, drugNames, sourceKindName, topicNames } from "@/lib/evidence-presentation";
import { compareReferences, readableFamily, splitResults } from "./data";

type Props = {
  record: UnifiedEvidenceRecord;
  side: "a" | "b";
  selectId: string;
  onSelect: (id: string) => void;
};

export const HerbariumSheet = forwardRef<HTMLElement, Props>(function HerbariumSheet({ record, side, selectId, onSelect }, ref) {
  const letter = side === "a" ? "A" : "B";
  const results = splitResults(record.resultsSummary);
  const family = readableFamily(record);
  const metrics = reviewedMetricsForEvidence(record.id);
  const drugs = record.drugs.filter(d => d !== "not_applicable");
  const titleId = `cp-sheet-${side}-title`;

  return (
    <article ref={ref} className={`cp-sheet cp-sheet--${side}`} aria-labelledby={titleId}>
      <span className="cp-sheet__tape" aria-hidden="true"/>
      <span className="cp-sheet__tape cp-sheet__tape--r" aria-hidden="true"/>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cp-sheet__leaf" src={`/assets/images/recortes/${side === "a" ? "samambaia-alta" : "ginkgo"}.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async"/>

      <div className="cp-sheet__pick">
        <label htmlFor={selectId} className="cp-sheet__label">
          <span className="cp-sheet__letter" aria-hidden="true">{letter}</span>
          Referência {letter}
        </label>
        <select id={selectId} className="at-select cp-select" value={record.id} onChange={e => onSelect(e.target.value)}>
          {compareReferences.map(item => <option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}
        </select>
      </div>

      <div className="cp-sheet__body">
        <p className="cp-sheet__meta at-mono">
          <span className="cp-sheet__id">{record.id}</span>
          <span>{record.year ?? "Ano não informado"}</span>
          <span>{sourceKindName(record.sourceKind)}</span>
        </p>
        <h3 id={titleId} className="cp-sheet__title">{record.title}</h3>

        <dl className="cp-sheet__facts">
          <div>
            <dt className="at-mono">Desenho</dt>
            <dd>{designNames[record.design]}</dd>
          </div>
          <div>
            <dt className="at-mono">Amostra</dt>
            <dd>{record.populationSummary || "Não detalhada na ficha"}</dd>
          </div>
          {family && (
            <div>
              <dt className="at-mono">Família de estudos</dt>
              <dd>{family}</dd>
            </div>
          )}
        </dl>

        <div className="cp-sheet__block">
          <p className="cp-sheet__k at-mono">Leitura do resultado</p>
          {results.length > 1 ? (
            <ul className="cp-sheet__results">{results.map(r => <li key={r}>{r}</li>)}</ul>
          ) : (
            <p className="cp-sheet__text">{results[0] ?? "Resumo quantitativo não disponível"}</p>
          )}
        </div>

        <div className="cp-sheet__limit">
          <p className="cp-sheet__k at-mono">Principal limitação</p>
          <p className="cp-sheet__text">{record.limitations || "Limitação não registrada nesta ficha; consulte a fonte original."}</p>
        </div>

        {(record.topics.length > 0 || drugs.length > 0) && (
          <ul className="cp-sheet__chips" aria-label={`Temas e tratamentos da referência ${letter}`}>
            {record.topics.map(t => <li key={t}>{topicNames[t]}</li>)}
            {drugs.map(d => <li key={d} className="is-drug">{drugNames[d]}</li>)}
          </ul>
        )}

        <p className="cp-sheet__metrics">
          <span className="at-mono">Indicadores conferidos</span>{" "}
          {metrics.length
            ? <a className="at-link" href="#indicadores">{metrics.map(m => m.id).join(" · ")} no painel de indicadores</a>
            : "Nenhum indicador numérico conferido para esta ficha."}
        </p>
      </div>

      <div className="cp-sheet__links">
        <Link className="at-btn at-btn--line cp-sheet__btn" href={"/evidencias/" + record.id}>Abrir ficha completa</Link>
        <a className="at-link cp-sheet__src" href={record.url} target="_blank" rel="noopener noreferrer">
          Fonte original <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
});
