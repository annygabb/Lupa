import Link from "next/link";
import { ArrowUpRight, BookOpenCheck, CircleHelp } from "lucide-react";
import { getReviewedMetric, formatMetricValue } from "@/features/comparison/reviewed-metrics";

/**
 * Resumo de uma única publicação: não agrega estudos, não estima risco
 * e não significa revisão clínica independente.
 */
export function SourceSpotlight() {
  const metric=getReviewedMetric("M03");
  if(!metric)throw new Error("M03 não disponível");
  const maxScale=15;
  return (
    <aside className="lupa-spotlight relative isolate flex min-h-[340px] flex-col overflow-hidden rounded-[24px] p-6 text-white sm:p-8"
      aria-label="Estudo em destaque — composição corporal por DXA">
      <div className="pointer-events-none absolute inset-0 lupa-paper-grid opacity-[.20]" aria-hidden="true"/>
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[.17em] text-[#c7d9ff]">
              Um dado. Uma fonte. Seu contexto.
            </p>
            <p className="mt-1 text-xs font-semibold text-[#aac0e7]">E04 · SURMOUNT-1 · subestudo DXA</p>
          </div>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white">
            72 semanas
          </span>
        </div>
        <h2 className="mt-7 max-w-[430px] text-[clamp(1.6rem,2.5vw,2.3rem)] font-extrabold leading-[1.16] tracking-[-.045em]">
          Quanto variou a massa magra?
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-[#d5e1f5]">
          Mudança percentual medida por DXA, calculada sobre o valor inicial de cada grupo.
        </p>

        <div className="mt-7 space-y-5">
          {metric.arms.map((arm,i)=>{
            const width=Math.min(100,100*Math.abs(arm.value)/maxScale);
            return (
              <div key={arm.key}>
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-[13px] font-semibold text-[#f0f6ff]">{arm.label}</span>
                  <span className="lupa-metric-ink text-[29px] font-extrabold leading-none text-white">
                    {formatMetricValue(arm.value,"%")}
                  </span>
                </div>
                <div className="h-[11px] overflow-hidden rounded-full bg-white/15" role="img"
                  aria-label={arm.label+": "+formatMetricValue(arm.value,"%")}>
                  <div className={"h-full rounded-full "+(i===0?"bg-[#a5bdff]":"bg-[#67dfce]")}
                    style={{width:width+"%"}}/>
                </div>
                <p className="mt-1.5 text-[11px] text-[#ccdbf3]">n = {arm.sampleN?.toLocaleString("pt-BR")}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-5">
        <div className="flex max-w-[320px] items-start gap-2">
          <CircleHelp size={17} className="mt-0.5 shrink-0 text-[#9be6e0]" aria-hidden="true"/>
          <p className="text-[11px] leading-5 text-[#d2e2f8]">
            Massa magra não é força muscular. Dado conferido na fonte, sem revisão clínica independente.
          </p>
        </div>
        <Link href="/evidencias/E04" className="lupa-premium-button border border-white/30 bg-white text-[#173867] hover:bg-[#ebf3ff]">
          <BookOpenCheck size={16} aria-hidden="true"/> Ver publicação
          <ArrowUpRight size={16} aria-hidden="true"/>
        </Link>
      </div>
    </aside>
  );
}
