import Link from "next/link";
import { ArrowUpRight, BookOpen, ChevronDown, Fingerprint, Layers3, ShieldAlert } from "lucide-react";
import type { UnifiedEvidenceRecord } from "@/features/evidence/unified-catalog";
import {
  designNames, shortDescription, sourceKindName, topicNames, drugNames,
} from "@/lib/evidence-presentation";

export function StudioStudyCard({record,side}:{
  record:UnifiedEvidenceRecord;side:"a"|"b";
}) {
  const isA=side==="a";
  return (
    <article className="lupa-dashboard-card lupa-dash-hover relative flex min-w-0 flex-col overflow-hidden">
      <div className={"h-1 w-full "+(isA?"bg-[#416dfb]":"bg-[#0fae9e]")} aria-hidden="true"/>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={"relative flex size-12 items-center justify-center rounded-2xl "+
              (isA?"bg-[#e9efff] text-[#315fe7]":"bg-[#dcfaf4] text-[#0c8a7f]")}>
              <span className="text-xl font-extrabold">{isA?"A":"B"}</span>
              <span className={"absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-white "+
                (isA?"bg-[#426df3]":"bg-[#0fae9e]")}/>
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#52667d]">
                Referência {isA?"A":"B"}
              </p>
              <p className="mt-0.5 text-sm font-bold text-[#273c58]">
                {record.id} <span className="font-medium text-[#52657b]">/ {record.year??"sem ano"}</span>
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e7ecf3] bg-[#f8fafc] px-2.5 py-1.5 text-[11px] font-semibold text-[#526575]">
            <span className="size-1.5 rounded-full bg-[#d3a04f]"/> Em curadoria
          </span>
        </div>

        <h3 className="mt-6 min-h-[70px] text-[20px] font-extrabold leading-[1.24] tracking-[-.035em] text-[#172844] sm:text-[22px]">
          {record.title}
        </h3>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="lupa-editorial-card px-4 py-3.5">
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.1em] text-[#50627c]">
              <Layers3 size={13} aria-hidden="true"/> Desenho
            </div>
            <p className="mt-2 text-sm font-bold leading-5 text-[#253b56]">{designNames[record.design]}</p>
            <p className="mt-1 text-xs text-[#50667a]">{sourceKindName(record.sourceKind)}</p>
          </div>
          <div className="lupa-editorial-card px-4 py-3.5">
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.1em] text-[#50627c]">
              <Fingerprint size={13} aria-hidden="true"/> Amostra
            </div>
            <p className="mt-2 text-[13px] font-semibold leading-5 text-[#253b56]">
              {shortDescription(record.populationSummary,100)||"Não detalhada"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-[.105em] text-[#4c627e]">
            Leitura do resultado
          </p>
          <p className="mt-2 text-sm leading-6 text-[#435770]">
            {shortDescription(record.resultsSummary,210)||"Resumo quantitativo não disponível"}
          </p>
        </div>

        <div className="mt-5 flex gap-3 rounded-2xl border border-[#e7ebf3] bg-[#f8f9fc] p-4">
          <ShieldAlert className="mt-0.5 shrink-0 text-[#ae7439]" size={17} aria-hidden="true"/>
          <div>
            <p className="text-xs font-extrabold text-[#35475c]">Principal limitação</p>
            <p className="mt-1 text-[13px] leading-5 text-[#5e6c7c]">
              {shortDescription(record.limitations,145)}
            </p>
          </div>
        </div>

        <details className="group mt-3 rounded-xl border border-transparent open:border-[#e3eaf4] open:bg-[#fafcff]">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 text-[13px] font-semibold text-[#315fd7] marker:hidden hover:bg-[#f2f5ff]">
            <span>Ver todos os dados e limitações</span>
            <ChevronDown className="transition-transform group-open:rotate-180" size={16} aria-hidden="true"/>
          </summary>
          <div className="space-y-3 border-t border-[#e8edf5] px-4 py-4 text-[13px] leading-6 text-[#586b80]">
            <p><strong className="text-foreground">População:</strong> {record.populationSummary}</p>
            <p><strong className="text-foreground">Resultado:</strong> {record.resultsSummary}</p>
            <p><strong className="text-foreground">Limitações:</strong> {record.limitations}</p>
          </div>
        </details>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {record.topics.slice(0,3).map(x=>(
            <span key={x} className={"rounded-lg px-2.5 py-1.5 text-[11px] font-bold "+
              (isA?"bg-[#eaf0ff] text-[#3156ac]":"bg-[#e6f7f3] text-[#0a706b]")}>
              {topicNames[x]}
            </span>
          ))}
          {record.drugs.filter(x=>x!=="not_applicable").slice(0,2).map(x=>(
            <span key={x} className="rounded-lg bg-[#f2f4f7] px-2.5 py-1.5 text-[11px] font-semibold text-[#586b80]">
              {drugNames[x]}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#e9edf4] pt-5">
          <Link href={"/evidencias/"+record.id}
            className="lupa-premium-button lupa-premium-button-outline text-[#2b56a3]">
            <BookOpen size={16} aria-hidden="true"/> Abrir ficha completa
          </Link>
          <a href={record.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold text-[#536b85] hover:text-[#315ff4] hover:underline">
            Fonte original <ArrowUpRight size={16} aria-hidden="true"/>
          </a>
        </div>
      </div>
    </article>
  );
}
