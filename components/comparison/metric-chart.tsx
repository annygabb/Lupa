import { ArrowUpRight, BarChart3, BookOpenCheck, CircleHelp, ShieldAlert } from "lucide-react";
import type { ReviewedMetric } from "@/features/comparison/reviewed-metrics";
import { formatMetricValue } from "@/features/comparison/reviewed-metrics";

function ChangeBar({value,bound,index}:{
  value:number;bound:number;index:number;
}) {
  const width=Math.min(100,Math.abs(value)/bound*100);
  const color=index===0?"bg-[#0f766e]":"bg-[#3266e8]";
  return (
    <div className="grid h-3 grid-cols-[1fr_2px_1fr] overflow-hidden rounded-full bg-[#edf1f7]"
      aria-hidden="true">
      <div className="flex justify-end">
        {value<0&&<span className={"h-full rounded-l-full "+color} style={{width:width+"%"}}/>}
      </div>
      <span className="bg-[#8190a4]"/>
      <div className="flex justify-start">
        {value>0&&<span className={"h-full rounded-r-full "+color} style={{width:width+"%"}}/>}
      </div>
    </div>
  );
}

export function MetricChart({metric}:{metric:ReviewedMetric}) {
  const isProportion=metric.measurementKind==="outcome_proportion";
  const maxChange=Math.max(20,Math.ceil(Math.max(...metric.arms.map(arm=>Math.abs(arm.value)))/5)*5);

  return (
    <section className="lupa-surface overflow-hidden" aria-labelledby="metric-chart-title">
      <div className="border-b border-border bg-gradient-to-br from-white to-[#f7faff] px-5 pb-6 pt-6 sm:px-8 sm:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
            <BarChart3 size={17} aria-hidden="true"/> Análise do estudo · {metric.id}
          </span>
          <span className="rounded-full border border-[#d1e7e2] bg-[#f0faf7] px-3 py-1.5 text-[11px] font-semibold text-[#17675f]">
            Fonte primária conferida
          </span>
        </div>
        <h3 id="metric-chart-title" className="mt-3 text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">
          {metric.title}
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{metric.description}</p>
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Contexto do indicador">
          <span className="rounded-lg border border-[#e0e9f2] bg-white px-3 py-2 text-xs font-semibold text-[#536575]">
            N total: <strong className="text-foreground">{metric.analyzedN.toLocaleString("pt-BR")}</strong>
          </span>
          <span className="rounded-lg border border-[#e0e9f2] bg-white px-3 py-2 text-xs font-semibold text-[#536575]">
            {metric.timeWindow}
          </span>
          <span className="rounded-lg border border-[#e0e9f2] bg-white px-3 py-2 text-xs font-semibold text-[#536575]">
            Unidade: %
          </span>
        </div>
      </div>

      <div className="px-5 pb-7 pt-6 sm:px-8 sm:pb-8">
        <div className="grid gap-3 sm:grid-cols-2">
          {metric.arms.map((arm,index)=>(
            <div key={arm.key} className="rounded-2xl border border-[#e5eaf1] bg-[#fafbfd] p-4 sm:p-5">
              <div className="flex min-h-10 items-start justify-between gap-3">
                <span className="text-sm font-semibold leading-5 text-[#3e5365]">{arm.label}</span>
                <span aria-hidden="true" className={"mt-1 size-3 shrink-0 rounded-full "+(index===0?"bg-[#0f766e]":"bg-[#3266e8]")}/>
              </div>
              <p className="mt-1 text-3xl font-extrabold tracking-[-0.04em] tabular-nums text-foreground sm:text-4xl">
                {formatMetricValue(arm.value,metric.unit)}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {arm.sampleN===null?"N por braço não conferido no resumo":"n="+arm.sampleN.toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>

        <figure className="mt-6 rounded-2xl border border-[#e5ebf3] bg-white p-4 sm:p-5">
          <figcaption className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-bold text-foreground">Leitura visual dos resultados</span>
            <span className="text-xs font-semibold text-muted-foreground">
              {isProportion?"Escala: 0–100%":"Eixo central: 0%"}
            </span>
          </figcaption>
          <div className="space-y-6" role="img" aria-label={
            metric.title+": "+metric.arms.map(arm=>arm.label+" "+formatMetricValue(arm.value,metric.unit)).join("; ")
          }>
            {metric.arms.map((arm,index)=>(
              <div key={arm.key}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-[#45586a]">{arm.label}</span>
                  <span className="font-bold tabular-nums">{formatMetricValue(arm.value,metric.unit)}</span>
                </div>
                {isProportion?(
                  <div className="h-3 overflow-hidden rounded-full bg-[#edf1f7]" aria-hidden="true">
                    <div className={"h-full rounded-full "+(index===0?"bg-[#0f766e]":"bg-[#3266e8]")}
                      style={{width:arm.value+"%"}}/>
                  </div>
                ):(
                  <ChangeBar value={arm.value} bound={maxChange} index={index}/>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            {isProportion
              ?"Barras indicam a proporção de participantes reportada em cada grupo; não correspondem à população brasileira."
              :"À esquerda do zero: redução. À direita: aumento. Cada resultado usa o próprio valor basal do grupo."}
          </p>
        </figure>

        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold">Tabela de dados</h4>
            <span className="text-xs text-muted-foreground">N, resultado e intervalo reportado</span>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[540px] border-collapse text-left text-sm">
              <caption className="sr-only">Resultados numéricos conferidos do indicador {metric.id}</caption>
              <thead className="bg-[#f6f8fb] text-xs font-bold text-[#44596b]">
                <tr>
                  <th scope="col" className="px-4 py-3">Grupo</th>
                  <th scope="col" className="px-4 py-3">N do grupo</th>
                  <th scope="col" className="px-4 py-3">Resultado</th>
                  <th scope="col" className="px-4 py-3">IC 95%</th>
                </tr>
              </thead>
              <tbody>
                {metric.arms.map(arm=>(
                  <tr key={arm.key} className="border-t border-border">
                    <td className="px-4 py-4 font-semibold">{arm.label}</td>
                    <td className="px-4 py-4 tabular-nums">{arm.sampleN??"Não conferido"}</td>
                    <td className="px-4 py-4 font-bold tabular-nums">{formatMetricValue(arm.value,"%")}</td>
                    <td className="px-4 py-4 tabular-nums">
                      {arm.ciLower===null||arm.ciUpper===null?"Não extraído":
                        formatMetricValue(arm.ciLower,"%")+" a "+formatMetricValue(arm.ciUpper,"%")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground sm:hidden">
            Deslize a tabela para os lados para visualizar todas as colunas.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-[#dbe7f9] bg-[#f2f6ff] p-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-[#1e56b0]">
              <CircleHelp size={17} aria-hidden="true"/> Como ler este dado
            </h4>
            <p className="mt-2 text-[13px] leading-6 text-[#425c75]">{metric.estimator}</p>
          </div>
          <div className="rounded-2xl border border-[#eee2ca] bg-[#fff9ef] p-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-[#8a5a15]">
              <ShieldAlert size={17} aria-hidden="true"/> Limites da interpretação
            </h4>
            <p className="mt-2 text-[13px] leading-6 text-[#665a47]">{metric.limitations}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-border pt-5 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-sm font-bold text-foreground">
              <BookOpenCheck size={17} className="text-primary" aria-hidden="true"/>
              Fonte e rastreabilidade
            </p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              {metric.sourceLocator}. Conferência documental em{" "}
              {new Date(metric.reviewedOn+"T12:00:00Z").toLocaleDateString("pt-BR",{timeZone:"UTC"})}.
              {" "}Não houve revisão clínica independente ou liberação para projeções populacionais.
            </p>
          </div>
          <a href={metric.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="lupa-button-secondary shrink-0 text-primary">
            Abrir fonte original <ArrowUpRight size={16} aria-hidden="true"/>
          </a>
        </div>
      </div>
    </section>
  );
}
