import { AlertCircle, ArrowUpRight, BookOpenCheck, Check, ChevronDown,
  CircleHelp, LockKeyhole, ShieldCheck, ShieldX } from "lucide-react";
import type { StudyComparisonAssessment } from "@/features/comparison/compatibility";
import {
  friendlyCompatibilityWarnings,
  getCompatibilityVerdict,
} from "@/features/comparison/compatibility-copy";

export function CompatibilityPanel({assessment}:{
  assessment:StudyComparisonAssessment;
}) {
  const verdict=getCompatibilityVerdict(assessment);
  const warnings=friendlyCompatibilityWarnings(assessment);
  const visible=warnings.slice(0,4);
  const moreCount=Math.max(0,warnings.length-visible.length);

  return (
    <section className="lupa-surface mt-5 overflow-hidden" aria-labelledby="compatibility-heading">
      <div className="relative border-b border-border bg-gradient-to-br from-[#f6fbfa] via-white to-[#f0f5ff] px-5 pb-6 pt-6 sm:px-7 sm:pt-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <span className={"flex size-11 shrink-0 items-center justify-center rounded-2xl "+
              (verdict.type==="contextual"?"bg-[#dcf4ef] text-[#0d766d]":"bg-[#fff0e0] text-[#96610a]")}>
              {verdict.type==="contextual"
                ? <ShieldCheck size={23} aria-hidden="true"/>
                : <AlertCircle size={23} aria-hidden="true"/>}
            </span>
            <div>
              <p className="lupa-section-kicker">Análise de compatibilidade</p>
              <h3 id="compatibility-heading"
                className="mt-1.5 text-xl font-bold tracking-[-0.025em] text-foreground sm:text-2xl">
                {verdict.title}
              </h3>
            </div>
          </div>
          <span className={"inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold "+
            (verdict.type==="contextual"
              ?"border-[#cce5df] bg-white text-[#0e726a]"
              :"border-[#edd9b7] bg-white text-[#8a5a15]")}>
            <span className={"size-1.5 rounded-full "+(verdict.type==="contextual"?"bg-[#118475]":"bg-[#ba7e2d]")}/>
            {verdict.statusLabel}
          </span>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#526575]">{verdict.subtitle}</p>
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Permissões da comparação">
          <div className="lupa-inner-surface flex items-center gap-3 p-4">
            <span className={"flex size-10 shrink-0 items-center justify-center rounded-xl "+
              (assessment.canShowSideBySide?"bg-[#e3f6f0] text-[#0f766e]":"bg-[#fff0e8] text-[#95571d]")}>
              {assessment.canShowSideBySide
                ? <Check size={20} aria-hidden="true"/>
                : <ShieldX size={20} aria-hidden="true"/>}
            </span>
            <div>
              <p className="text-xs font-semibold text-[#536675]">Lado a lado</p>
              <p className="mt-0.5 text-sm font-bold text-foreground">
                {assessment.canShowSideBySide?"Disponível":"Indisponível"}
              </p>
            </div>
          </div>
          <div className="lupa-inner-surface flex items-center gap-3 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff3df] text-[#946318]">
              <LockKeyhole size={19} aria-hidden="true"/>
            </span>
            <div>
              <p className="text-xs font-semibold text-[#536675]">Cálculo combinado</p>
              <p className="mt-0.5 text-sm font-bold text-foreground">Bloqueado</p>
            </div>
          </div>
          <div className="lupa-inner-surface flex items-center gap-3 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-[#245ed9]">
              <CircleHelp size={19} aria-hidden="true"/>
            </span>
            <div>
              <p className="text-xs font-semibold text-[#536675]">Projeções</p>
              <p className="mt-0.5 text-sm font-bold text-foreground">Indisponíveis</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#fff7e9] text-[#956019]">
            <AlertCircle size={16} aria-hidden="true"/>
          </span>
          <h4 className="text-sm font-bold text-foreground">Pontos de atenção</h4>
          <span className="ml-auto text-xs font-medium text-muted-foreground">
            {warnings.length} {warnings.length===1?"observação":"observações"}
          </span>
        </div>

        {visible.length>0 ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {visible.map(item=>(
              <div key={item.code} className="rounded-2xl border border-[#e7ebf0] bg-[#fbfcfe] px-4 py-4">
                <h5 className="flex items-start gap-2 text-sm font-semibold leading-5 text-foreground">
                  <span className="mt-0.5 size-2 shrink-0 rounded-full bg-[#e7a24a]"/>
                  {item.title}
                </h5>
                <p className="mt-1.5 pl-4 text-[13px] leading-5 text-muted-foreground">{item.summary}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-2xl bg-[#f7f9fc] px-4 py-3 text-sm text-muted-foreground">
            Nenhum conflito temático adicional foi identificado no catálogo. Isso não valida uma combinação numérica.
          </p>
        )}
        {moreCount>0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Mais {moreCount} {moreCount===1?"observação":"observações"} disponível(is) no detalhamento.
          </p>
        )}

        <details className="group mt-5 rounded-2xl border border-[#e5ebf1] bg-[#f8fafc]">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-[#315568] marker:hidden">
            <span className="flex items-center gap-2"><BookOpenCheck size={17} aria-hidden="true"/> Ver justificativas científicas completas</span>
            <ChevronDown size={18} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180"/>
          </summary>
          <div className="space-y-3 border-t border-[#e3eaf1] px-4 py-4">
            {assessment.warnings.map(item=>(
              <div key={item.code}>
                <h5 className="text-xs font-bold text-foreground">{item.label}</h5>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">{item.explanation}</p>
              </div>
            ))}
          </div>
        </details>

        <div className="mt-5 flex gap-3 rounded-2xl border border-[#cfdfe9] bg-[#f1f7fc] px-4 py-4">
          <ArrowUpRight size={18} className="mt-0.5 shrink-0 text-[#2563eb]" aria-hidden="true"/>
          <p className="text-sm leading-6 text-[#34556a]">
            <strong>Como usar esta análise:</strong>{" "}
            {assessment.canShowSideBySide
              ?"Use a comparação para entender os métodos e limites de cada pesquisa — não para calcular risco clínico."
              :"Escolha outra referência para comparar contextos científicos diferentes."}
          </p>
        </div>
      </div>
    </section>
  );
}
