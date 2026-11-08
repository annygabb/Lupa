import {
  AlertTriangle, ArrowUpRight, BookOpenCheck, Check, ChevronDown, CircleHelp,
  LockKeyhole, ShieldCheck, ShieldX,
} from "lucide-react";
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
  const featured=warnings[0];
  const rest=warnings.slice(1,4);
  return (
    <section className="lupa-dashboard-card mt-5 overflow-hidden" aria-labelledby="compatibility-heading">
      <div className="relative overflow-hidden bg-[#162647] px-5 py-6 text-white sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full border-[30px] border-white/[.045]" aria-hidden="true"/>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#a1e3f2]">
                {verdict.type==="contextual"
                  ? <ShieldCheck size={23} aria-hidden="true"/>
                  : <AlertTriangle size={23} aria-hidden="true"/>}
              </span>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-[#9ebce9]">Análise de compatibilidade</p>
                <h3 id="compatibility-heading" className="mt-1 text-[23px] font-extrabold leading-tight tracking-[-.035em] sm:text-[28px]">
                  {verdict.title}
                </h3>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-[14px] leading-7 text-[#c7d8f1]">
              {verdict.subtitle}
            </p>
          </div>
          <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[#7fa4d4]/45 bg-white/10 px-3.5 py-2 text-[12px] font-bold text-[#e9f4ff]">
            <span className={"size-2 rounded-full "+(verdict.type==="contextual"?"bg-[#5fdfbc]":"bg-[#ffc48f]")}/>
            {verdict.statusLabel}
          </span>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-8 sm:py-7">
        <div className="grid gap-2.5 sm:grid-cols-3" aria-label="Permissões da comparação">
          <div className="flex items-center gap-3 rounded-2xl border border-[#d5eae6] bg-[#f2fbf8] p-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#078b7c] shadow-sm">
              {assessment.canShowSideBySide?<Check size={19} aria-hidden="true"/>:<ShieldX size={19} aria-hidden="true"/>}
            </span>
            <div>
              <p className="text-xs font-medium text-[#536b79]">Lado a lado</p>
              <p className="mt-0.5 text-sm font-extrabold text-[#152d46]">{assessment.canShowSideBySide?"Disponível":"Indisponível"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#ede4da] bg-[#fff9ef] p-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#aa762e] shadow-sm">
              <LockKeyhole size={18} aria-hidden="true"/>
            </span>
            <div>
              <p className="text-xs font-medium text-[#77664e]">Cálculo combinado</p>
              <p className="mt-0.5 text-sm font-extrabold text-[#152d46]">Bloqueado</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#e1e6f5] bg-[#f3f6ff] p-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#4b6acb] shadow-sm">
              <CircleHelp size={18} aria-hidden="true"/>
            </span>
            <div>
              <p className="text-xs font-medium text-[#62718f]">Projeções</p>
              <p className="mt-0.5 text-sm font-extrabold text-[#152d46]">Indisponíveis</p>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-extrabold text-[#233751]">Pontos de atenção</h4>
          <span className="text-[12px] font-semibold text-[#52667d]">{warnings.length} observações</span>
        </div>

        {featured ? (
          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_.95fr]">
            <div className="relative overflow-hidden rounded-[18px] border border-[#eadbc5] bg-gradient-to-r from-[#fff7eb] to-[#fffdf8] p-5">
              <span className="absolute left-0 top-0 h-full w-1 bg-[#e2a64d]" aria-hidden="true"/>
              <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#785024]">Principal ponto de atenção</p>
              <h5 className="mt-2 flex items-center gap-2 text-[16px] font-extrabold tracking-[-.015em] text-[#4b3a2b]">
                <AlertTriangle size={18} className="shrink-0 text-[#c28a3b]" aria-hidden="true"/>
                {featured.title}
              </h5>
              <p className="mt-2 text-[13px] leading-6 text-[#685849]">{featured.summary}</p>
            </div>
            <div className="grid gap-2">
              {rest.map(item=>(
                <div key={item.code} className="flex items-center gap-3 rounded-xl border border-[#e8ecf4] bg-[#f8fafd] px-4 py-3">
                  <span className="size-2 shrink-0 rounded-full bg-[#6f8fe9]"/>
                  <div>
                    <p className="text-[13px] font-bold text-[#334761]">{item.title}</p>
                    <p className="mt-0.5 text-[12px] leading-5 text-[#4c6076]">{item.summary}</p>
                  </div>
                </div>
              ))}
              {rest.length===0&&(
                <p className="rounded-xl bg-[#f6f9fe] p-4 text-[13px] text-[#4c6076]">
                  Nenhuma outra divergência temática foi identificada. A combinação numérica permanece bloqueada.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-3 rounded-xl bg-[#f6f9fe] p-4 text-sm text-[#4c6076]">
            Nenhum conflito temático adicional foi identificado. Isso não habilita cálculos combinados.
          </p>
        )}

        {warnings.length>4&&(
          <p className="mt-2 text-xs text-[#6a7d90]">Existem {warnings.length-4} observações adicionais no detalhamento.</p>
        )}
        <details className="group mt-5 overflow-hidden rounded-[14px] border border-[#e5eaf2] bg-[#fbfcff]">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-[13px] font-bold text-[#3b5e93] marker:hidden hover:bg-[#f3f6fc]">
            <span className="flex items-center gap-2"><BookOpenCheck size={17} aria-hidden="true"/> Ver justificativas científicas completas</span>
            <ChevronDown size={17} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true"/>
          </summary>
          <div className="grid gap-4 border-t border-[#e7edf5] px-4 py-5 sm:grid-cols-2">
            {assessment.warnings.map(item=>(
              <div key={item.code}>
                <h5 className="text-[13px] font-extrabold text-[#2c405b]">{item.label}</h5>
                <p className="mt-1 text-[13px] leading-6 text-[#607186]">{item.explanation}</p>
              </div>
            ))}
          </div>
        </details>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#d9e6fb] bg-[#f1f6ff] px-4 py-4">
          <ArrowUpRight size={18} className="mt-0.5 shrink-0 text-[#3665d5]" aria-hidden="true"/>
          <p className="text-[13px] leading-6 text-[#405877]">
            <strong className="text-[#274b89]">Como usar esta análise:</strong>{" "}
            {assessment.canShowSideBySide
              ?"Use a comparação para entender os métodos e limites de cada pesquisa — não para calcular risco clínico."
              :"Escolha outra referência antes de continuar a análise descritiva."}
          </p>
        </div>
      </div>
    </section>
  );
}
