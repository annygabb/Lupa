import { ArrowUpRight, BarChart3, BookOpenCheck, Info, ShieldAlert, Sparkles } from "lucide-react";
import { ComparisonBarPlot } from "@/components/comparison/comparison-bar-plot";
import type { ReviewedMetric } from "@/features/comparison/reviewed-metrics";
import { formatMetricValue } from "@/features/comparison/reviewed-metrics";

export function MetricChart({metric}:{metric:ReviewedMetric}) {
  const proportion=metric.measurementKind==="outcome_proportion";
  const date=new Date(metric.reviewedOn+"T12:00:00Z").toLocaleDateString("pt-BR",{timeZone:"UTC"});
  return (
    <section className="lupa-dashboard-card overflow-hidden" aria-labelledby="metric-chart-title">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e7ecf4] px-5 py-6 sm:px-8 sm:py-7">
        <div className="max-w-[760px]">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.14em] text-[#416ce5]">
            <BarChart3 size={17} aria-hidden="true"/> ANÁLISE DO ESTUDO · {metric.id}
          </p>
          <h3 id="metric-chart-title" className="mt-2 text-[25px] font-extrabold tracking-[-.04em] text-[#182944] sm:text-[31px]">
            {metric.title}
          </h3>
          <p className="mt-2 text-sm leading-7 text-[#53677f]">{metric.description}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cde9e0] bg-[#ebfaf5] px-3 py-2 text-xs font-bold text-[#0b7466]">
          <BookOpenCheck size={14} aria-hidden="true"/> Fonte primária conferida
        </span>
      </div>

      <div className="px-5 pb-7 pt-6 sm:px-8 sm:pb-8">
        <div className="mb-5 flex flex-wrap gap-2" aria-label="Metadados do indicador">
          <span className="rounded-xl border border-[#e1e8f2] bg-[#f8fafd] px-3.5 py-2 text-xs font-semibold text-[#5b7189]">
            N total: <strong className="text-[#1d3659]">{metric.analyzedN.toLocaleString("pt-BR")}</strong>
          </span>
          <span className="rounded-xl border border-[#e1e8f2] bg-[#f8fafd] px-3.5 py-2 text-xs font-semibold text-[#5b7189]">{metric.timeWindow}</span>
          <span className="rounded-xl border border-[#e1e8f2] bg-[#f8fafd] px-3.5 py-2 text-xs font-semibold text-[#5b7189]">Unidade: %</span>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]">
          <figure className="flex min-w-0 flex-col overflow-hidden rounded-[23px] border border-[#dce6f3] bg-gradient-to-br from-white to-[#f5f8ff] p-4 sm:p-5">
            <figcaption className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#53645b]">Visualização comparativa</p>
                <h4 className="mt-1 text-lg font-extrabold text-[#203656]">Leitura dos resultados</h4>
              </div>
              <span className="rounded-full bg-[#eaf0ff] px-2.5 py-1.5 text-[11px] font-bold text-[#4267bf]">
                {proportion?"Escala 0–100%":"Eixo central: 0%"}
              </span>
            </figcaption>
            <div className="mt-4 flex-1">
              <ComparisonBarPlot metric={metric}/>
            </div>
            <p className="border-t border-[#e2e9f4] pt-3 text-[12px] leading-5 text-[#53645b]">
              {proportion
                ?"Cada barra mostra uma proporção reportada no estudo. Não é uma estimativa para toda a população."
                :"À esquerda/abaixo do zero: redução; acima: aumento. Valores relativos ao próprio basal de cada grupo."}
            </p>
          </figure>

          <div className="grid min-w-0 content-stretch gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {metric.arms.map((arm,i)=>(
              <article key={arm.key}
                className={"relative isolate flex min-h-[145px] flex-col justify-between overflow-hidden rounded-[22px] p-5 "+
                  (i===0
                    ?"bg-gradient-to-br from-[#2d59e3] via-[#305fec] to-[#1a4fc4] text-white shadow-[0_16px_32px_rgba(47,96,218,.18)]"
                    :"border border-[#bdebe4] bg-gradient-to-br from-[#e6faf4] to-[#edf8ff] text-[#124c55]")}>
                <div className={"pointer-events-none absolute -right-10 -top-14 size-40 rounded-full border-[22px] "+
                  (i===0?"border-white/10":"border-[#49c9b7]/10")} aria-hidden="true"/>
                <div className="relative flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className={"text-[11px] font-extrabold uppercase tracking-[.12em] "+(i===0?"text-[#c8d9ff]":"text-[#53645b]")}>
                      Grupo {i+1}
                    </p>
                    <h5 className="mt-1 text-sm font-bold leading-5">{arm.label}</h5>
                  </div>
                  <span className={"flex size-9 items-center justify-center rounded-xl "+
                    (i===0?"bg-white/15":"bg-[#d2f3eb]")} aria-hidden="true">
                    <Sparkles size={17}/>
                  </span>
                </div>
                <div className="relative mt-4">
                  <p className="lupa-metric-ink text-[40px] font-extrabold leading-none sm:text-[46px]">
                    {formatMetricValue(arm.value,metric.unit)}
                  </p>
                  <p className={"mt-2 text-[12px] font-medium "+(i===0?"text-[#d8e5ff]":"text-[#53645b]")}>
                    {arm.sampleN===null?"N por braço não conferido no resumo":"n="+arm.sampleN.toLocaleString("pt-BR")}
                    {arm.ciLower!==null&&arm.ciUpper!==null?
                      " · IC 95%: "+formatMetricValue(arm.ciLower,"%")+" a "+formatMetricValue(arm.ciUpper,"%"):""}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <section className="mt-6" aria-labelledby="data-table-title">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <h4 id="data-table-title" className="text-base font-extrabold text-[#233955]">Tabela de dados</h4>
            <p className="text-xs text-[#50647c]">Base observada: resultado, n e IC 95%</p>
          </div>
          <div className="overflow-x-auto rounded-[18px] border border-[#dce5f0] focus-visible:outline-3 focus-visible:outline-offset-2" tabIndex={0} role="region" aria-label={"Tabela de dados do indicador "+metric.id+"; use as setas para rolar horizontalmente"}>
            <table className="w-full min-w-[570px] border-collapse text-left text-sm">
              <caption className="sr-only">Resultados numéricos conferidos do indicador {metric.id}</caption>
              <thead className="bg-[#f2f5fb]">
                <tr className="text-[11px] font-extrabold uppercase tracking-[.08em] text-[#516882]">
                  <th scope="col" className="px-4 py-3.5">Grupo</th>
                  <th scope="col" className="px-4 py-3.5">N do grupo</th>
                  <th scope="col" className="px-4 py-3.5">Resultado</th>
                  <th scope="col" className="px-4 py-3.5">IC 95%</th>
                </tr>
              </thead>
              <tbody>
                {metric.arms.map(arm=>(
                  <tr key={arm.key} className="border-t border-[#e9edf4] text-[#425875]">
                    <td className="px-4 py-4 font-bold text-[#263c59]">{arm.label}</td>
                    <td className="px-4 py-4 tabular-nums">{arm.sampleN??"Não conferido"}</td>
                    <td className="px-4 py-4 font-extrabold tabular-nums text-[#1f3c6e]">{formatMetricValue(arm.value,"%")}</td>
                    <td className="px-4 py-4 tabular-nums">{arm.ciLower===null||arm.ciUpper===null?"Não extraído":
                      formatMetricValue(arm.ciLower,"%")+" a "+formatMetricValue(arm.ciUpper,"%")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-[#4b6279] sm:hidden">
            Deslize a tabela horizontalmente para visualizar todas as colunas.
          </p>
        </section>

        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <div className="rounded-[18px] border border-[#dbe6fc] bg-[#f2f6ff] p-4 sm:p-5">
            <h4 className="flex items-center gap-2 text-[13px] font-extrabold text-[#315abb]">
              <Info size={17} aria-hidden="true"/> Como ler este dado
            </h4>
            <p className="mt-2 text-[13px] leading-6 text-[#4e6482]">{metric.estimator}</p>
          </div>
          <div className="rounded-[18px] border border-[#eee2cd] bg-[#fff8ee] p-4 sm:p-5">
            <h4 className="flex items-center gap-2 text-[13px] font-extrabold text-[#936521]">
              <ShieldAlert size={17} aria-hidden="true"/> Limites da interpretação
            </h4>
            <p className="mt-2 text-[13px] leading-6 text-[#74634b]">{metric.limitations}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-[#e9edf4] pt-6 sm:flex-row sm:items-center">
          <div className="max-w-[800px]">
            <p className="flex items-center gap-2 text-sm font-extrabold text-[#2a4465]">
              <BookOpenCheck size={18} className="text-[#3564d8]" aria-hidden="true"/>
              Fonte e rastreabilidade
            </p>
            <p className="mt-1 text-[12px] leading-6 text-[#4d647f]">
              {metric.sourceLocator}. Conferência documental em {date}.
              {" "}Não houve revisão clínica independente ou liberação para projeções populacionais.
            </p>
          </div>
          <a href={metric.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="lupa-premium-button lupa-premium-button-outline shrink-0">
            Abrir fonte original <ArrowUpRight size={16} aria-hidden="true"/>
          </a>
        </div>
      </div>
    </section>
  );
}
