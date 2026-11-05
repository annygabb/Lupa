import Link from "next/link";
import { ArrowUpRight, BookOpen, ChevronRight, ShieldAlert } from "lucide-react";
import type { UnifiedEvidenceRecord } from "@/features/evidence/unified-catalog";
import {
  buildEvidenceHref, designNames, priorityName, shortDescription,
  sourceKindName, topicNames, yearName,
} from "@/lib/evidence-presentation";

export function EvidenceCard({record}:{record:UnifiedEvidenceRecord}) {
  const official=record.sourceKind==="regulatory";
  return (
    <article className="lupa-dashboard-card lupa-dash-hover group relative flex h-full min-w-0 flex-col overflow-hidden">
      <div className={"h-1 w-full "+(official?"bg-[#0fae9e]":"bg-[#416dfb]")} aria-hidden="true"/>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-[12px] font-bold text-[#54708e]">
            <span className={"flex size-9 items-center justify-center rounded-xl "+
              (official?"bg-[#e6f9f3] text-[#0d9488]":"bg-[#edf2ff] text-[#315ff4]")}>
              <BookOpen size={17} aria-hidden="true"/>
            </span>
            {sourceKindName(record.sourceKind)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e6ebf2] bg-[#f9fafc] px-2.5 py-1.5 text-[11px] font-semibold text-[#6b7a8c]">
            <span className="size-1.5 rounded-full bg-[#c99a53]"/> Em curadoria
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#7b8da3]">
          <span className={"rounded-lg px-2.5 py-1.5 text-[12px] font-extrabold "+
            (official?"bg-[#e6f9f3] text-[#0c8379]":"bg-[#e9efff] text-[#315fd8]")}>{record.id}</span>
          <span>{yearName(record.year)}</span><span aria-hidden="true">·</span>
          <span>{designNames[record.design]}</span>
        </div>

        <h3 className="mt-4 text-[20px] font-extrabold leading-[1.28] tracking-[-.03em] text-[#1b2e4b]">
          <Link href={buildEvidenceHref(record.id)}
            className="rounded-sm underline-offset-4 group-hover:text-[#315bd7] hover:underline">
            {record.title}
          </Link>
        </h3>

        <p className="mt-4 flex-1 text-[13px] leading-6 text-[#586e87]">
          {shortDescription(record.resultsSummary,220)}
        </p>

        <div className="mt-5 flex gap-2.5 rounded-2xl border border-[#e9edf4] bg-[#f8fafc] p-3.5">
          <ShieldAlert size={16} className="mt-0.5 shrink-0 text-[#b17d41]" aria-hidden="true"/>
          <p className="text-[12px] leading-5 text-[#66758b]">
            <strong className="font-extrabold text-[#3d4e64]">Limitação: </strong>
            {shortDescription(record.limitations,150)}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5" aria-label="Temas associados">
          {record.topics.slice(0,2).map(topic=>(
            <span key={topic} className="rounded-lg bg-[#edf5ff] px-2.5 py-1.5 text-[11px] font-bold text-[#3b65b2]">
              {topicNames[topic]}
            </span>
          ))}
          {record.topics.length>2&&(
            <span className="rounded-lg bg-[#f1f4f8] px-2.5 py-1.5 text-[11px] font-bold text-[#74869c]">
              +{record.topics.length-2}
            </span>
          )}
        </div>
        <p className="mt-4 text-[11px] font-medium text-[#8796a8]">
          {priorityName(record.priority)} · {record.sourceIds.length} referência(s) de origem
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e9edf4] pt-5">
          <Link href={buildEvidenceHref(record.id)}
            className="inline-flex min-h-11 items-center gap-1 text-[13px] font-extrabold text-[#315fd8] hover:underline">
            Ver ficha <ChevronRight size={17} aria-hidden="true"/>
          </Link>
          <a href={record.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg text-[12px] font-semibold text-[#62788f] hover:text-[#315bd7] hover:underline"
            aria-label={"Abrir fonte de "+record.id+" em nova aba"}>
            Fonte original <ArrowUpRight size={16} aria-hidden="true"/>
          </a>
        </div>
      </div>
    </article>
  );
}
