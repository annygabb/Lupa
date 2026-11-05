import Link from "next/link";
import { ArrowUpRight, BookOpen, ChevronRight } from "lucide-react";
import type { UnifiedEvidenceRecord } from "@/features/evidence/unified-catalog";
import {
  buildEvidenceHref, designNames, priorityName, shortDescription,
  sourceKindName, topicNames, yearName,
} from "@/lib/evidence-presentation";

export function EvidenceCard({ record }: { record: UnifiedEvidenceRecord }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-white p-5 shadow-[0_8px_28px_rgba(18,49,61,0.035)] transition-colors hover:border-[#9bc8c7] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#48646e]">
          <BookOpen aria-hidden="true" size={14} />
          {sourceKindName(record.sourceKind)}
        </span>
        <span className="rounded-full border border-[#dee7e9] bg-[#f4f7f8] px-2.5 py-1 text-[11px] font-medium text-[#526b75]">
          Em curadoria
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="font-semibold text-primary">{record.id}</span>
        <span aria-hidden="true">•</span>
        <span>{yearName(record.year)}</span>
        <span aria-hidden="true">•</span>
        <span>{designNames[record.design]}</span>
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug tracking-[-0.015em] text-foreground">
        <Link href={buildEvidenceHref(record.id)} className="rounded-sm underline-offset-4 hover:text-primary hover:underline">
          {record.title}
        </Link>
      </h3>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {shortDescription(record.resultsSummary, 230)}
      </p>
      <p className="mt-3 border-l-2 border-[#b7d9d7] pl-3 text-xs leading-5 text-[#59707a]">
        <strong className="font-semibold text-foreground">Limitação: </strong>
        {shortDescription(record.limitations, 160)}
      </p>

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap gap-1.5" aria-label="Temas associados">
          {record.topics.slice(0, 2).map(topic => (
            <span key={topic} className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-[#17696d]">
              {topicNames[topic]}
            </span>
          ))}
          {record.topics.length > 2 && (
            <span className="rounded-md bg-[#f2f5f6] px-2 py-1 text-[11px] text-muted-foreground">
              +{record.topics.length - 2}
            </span>
          )}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          {priorityName(record.priority)} · {record.sourceIds.length} referência(s) de origem
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <Link href={buildEvidenceHref(record.id)} className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Ver ficha <ChevronRight aria-hidden="true" size={16}/>
          </Link>
          <a href={record.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            aria-label={"Abrir fonte de " + record.id + " em nova aba"}>
            Fonte original <ArrowUpRight aria-hidden="true" size={14}/>
          </a>
        </div>
      </div>
    </article>
  );
}
