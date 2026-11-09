/**
 * Ficha de herbário de uma referência (vista em grade) e linha de catálogo (vista em lista).
 * Sem estado: pode ser usada no servidor ou dentro do explorador (cliente).
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { UnifiedEvidenceRecord } from "@/features/evidence/unified-catalog";
import {
  buildEvidenceHref, designNames, shortDescription,
  sourceKindName, topicNames, yearName,
} from "@/lib/evidence-presentation";
import { buildCompareHref } from "@/features/comparison/params";
import { cutoutFor, splitSummary } from "./data";

const fallback = {
  population: "Metadados amostrais ainda não organizados no catálogo.",
  results: "O material não apresenta resultado quantitativo detalhado para esta referência.",
  limitations: "Limitações específicas ainda não revisadas; consulte a publicação original.",
};

function firstPart(text: string, limit: number, empty: string) {
  const first = splitSummary(text)[0];
  return first ? shortDescription(first, limit) : empty;
}

function SourceLink({ record, className }: { record: UnifiedEvidenceRecord; className: string }) {
  return (
    <a href={record.url} target="_blank" rel="noopener noreferrer" className={className}>
      Fonte original<span className="sr-only"> de {record.id} (abre em nova aba)</span>
      <ArrowUpRight size={15} aria-hidden="true"/>
    </a>
  );
}

/** Link discreto para abrir o Comparador com esta referência pré-selecionada em A. */
function CompareLink({ record, className }: { record: UnifiedEvidenceRecord; className: string }) {
  return (
    <Link href={buildCompareHref(record.id)} className={className}>
      Comparar<span className="sr-only"> {record.id} com outro estudo</span>
    </Link>
  );
}

export function SpecimenCard({ record, headingLevel = 3 }: { record: UnifiedEvidenceRecord; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const extra = record.topics.length - 2;
  return (
    <article className="ev-spec" data-kind={record.sourceKind}>
      <span className="ev-spec__tape" aria-hidden="true"/>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ev-spec__plant" src={cutoutFor(record.design)} alt="" aria-hidden="true" loading="lazy" decoding="async"/>
      <div className="ev-spec__head">
        <span className="ev-spec__id at-mono">{record.id}</span>
        <span className="ev-spec__kind at-mono">{sourceKindName(record.sourceKind)}</span>
      </div>
      <p className="ev-spec__meta at-mono">
        <span>{designNames[record.design]}</span>
        <span aria-hidden="true">·</span>
        <span>{yearName(record.year)}</span>
      </p>
      <Heading className="ev-spec__title">
        <Link href={buildEvidenceHref(record.id)} className="ev-spec__link">{record.title}</Link>
      </Heading>
      <dl className="ev-spec__fields">
        <div>
          <dt className="at-mono">População</dt>
          <dd>{firstPart(record.populationSummary, 120, fallback.population)}</dd>
        </div>
        <div>
          <dt className="at-mono">Resultado descrito</dt>
          <dd>{firstPart(record.resultsSummary, 150, fallback.results)}</dd>
        </div>
      </dl>
      <p className="ev-spec__limit">
        <strong>Limitação: </strong>{record.limitations || fallback.limitations}
      </p>
      <ul className="ev-spec__topics" aria-label="Temas associados">
        {record.topics.slice(0, 2).map(t => <li key={t}>{topicNames[t]}</li>)}
        {extra > 0 && <li className="is-more">+{extra}<span className="sr-only"> temas</span></li>}
      </ul>
      <div className="ev-spec__foot">
        <span className="at-mono">{record.sourceIds.length} referência(s) de origem</span>
        <span className="ev-spec__cta" aria-hidden="true">Ver ficha <i>→</i></span>
        <span className="ev-spec__acts">
          <CompareLink record={record} className="ev-spec__cmp"/>
          <SourceLink record={record} className="ev-spec__src"/>
        </span>
      </div>
    </article>
  );
}

export function SpecimenRow({ record }: { record: UnifiedEvidenceRecord }) {
  return (
    <article className="ev-row" data-kind={record.sourceKind}>
      <span className="ev-row__id at-mono">{record.id}</span>
      <div className="ev-row__main">
        <h3 className="ev-row__title">
          <Link href={buildEvidenceHref(record.id)} className="ev-row__link">{record.title}</Link>
        </h3>
        <p className="ev-row__meta at-mono">
          {designNames[record.design]} · {yearName(record.year)} · {record.topics.slice(0, 2).map(t => topicNames[t]).join(" · ")}
        </p>
      </div>
      <p className="ev-row__limit"><strong>Limitação: </strong>{record.limitations || fallback.limitations}</p>
      <div className="ev-row__acts">
        <SourceLink record={record} className="ev-row__src"/>
        <CompareLink record={record} className="ev-row__cmp"/>
      </div>
    </article>
  );
}
