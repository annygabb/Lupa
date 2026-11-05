import { ExternalLink, Info, ShieldAlert } from "lucide-react";
import type { ReviewedMetric } from "@/features/comparison/reviewed-metrics";
import { formatMetricValue } from "@/features/comparison/reviewed-metrics";

export function MetricChart({metric}:{metric:ReviewedMetric}) {
  const isProportion=metric.measurementKind==="outcome_proportion";
  const bound=Math.max(20,Math.ceil(Math.max(...metric.arms.map(a=>Math.abs(a.value)))/5)*5);
  return (
    <section aria-labelledby="metric-chart-title" className="rounded-2xl border border-border bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
          Gráfico interno ao estudo · {metric.id}
        </p>
        <span className="rounded-full bg-[#edf6f5] px-3 py-1 text-[11px] font-medium text-[#17686b]">
          Fonte primária conferida
        </span>
      </div>
      <h3 id="metric-chart-title" className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
        {metric.title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{metric.description}</p>
      <div className="mt-5 grid gap-3 border-b border-border pb-5 text-xs text-muted-foreground sm:grid-cols-3">
        <span><strong className="text-foreground">Participantes:</strong> N={metric.analyzedN}</span>
        <span><strong className="text-foreground">Período:</strong> {metric.timeWindow}</span>
        <span><strong className="text-foreground">Unidade:</strong> porcentagem (%)</span>
      </div>

      <div className="mt-6 space-y-5" role="img" aria-label={
        metric.title+": "+metric.arms.map(a=>a.label+" "+formatMetricValue(a.value,"%")).join("; ")
      }>
        {metric.arms.map((arm,i)=>(
          <div key={arm.key}>
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{arm.label}</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatMetricValue(arm.value,metric.unit)}
              </span>
            </div>
            {isProportion ? (
              <div className="h-4 overflow-hidden rounded-full bg-[#ebf0f1]">
                <div className={"h-full rounded-full "+(i===0?"bg-[#087f83]":"bg-[#92a4ae]")}
                  style={{width:arm.value+"%"}} />
              </div>
            ) : (
              <div className="grid h-5 grid-cols-[1fr_2px_1fr] overflow-hidden rounded-sm bg-[#f0f4f5]">
                <div className="flex justify-end">
                  {arm.value<0&&<div className={"h-full rounded-l-sm "+(i===0?"bg-[#087f83]":"bg-[#92a4ae]")}
                    style={{width:Math.abs(arm.value)/bound*100+"%"}}/>}
                </div>
                <div className="bg-[#70878f]"/>
                <div className="flex justify-start">
                  {arm.value>0&&<div className={"h-full rounded-r-sm "+(i===0?"bg-[#087f83]":"bg-[#92a4ae]")}
                    style={{width:arm.value/bound*100+"%"}}/>}
                </div>
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {arm.sampleN===null?"N por braço não conferido no resumo":"n="+arm.sampleN}
              {arm.ciLower!==null&&arm.ciUpper!==null?
                " · IC 95%: "+arm.ciLower.toLocaleString("pt-BR")+"% a "+arm.ciUpper.toLocaleString("pt-BR")+"%":
                " · IC não incluído na extração conferida"}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#087f83]"/> Primeira série</span>
        <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#92a4ae]"/> Segunda série</span>
        <span>{isProportion?"Escala: 0 a 100%":"Eixo central = 0%; à esquerda, redução; à direita, aumento"}</span>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[510px] border-collapse text-left text-sm">
          <caption className="sr-only">Resultados numéricos conferidos do indicador {metric.id}</caption>
          <thead className="bg-[#f4f8f8] text-xs text-[#4a626c]">
            <tr><th scope="col" className="px-3 py-3">Grupo</th><th scope="col" className="px-3 py-3">N do grupo</th>
              <th scope="col" className="px-3 py-3">Resultado</th><th scope="col" className="px-3 py-3">IC 95%</th></tr>
          </thead>
          <tbody>
            {metric.arms.map(arm=>(
              <tr key={arm.key} className="border-t border-border">
                <td className="px-3 py-3 font-medium">{arm.label}</td>
                <td className="px-3 py-3 tabular-nums">{arm.sampleN??"Não conferido"}</td>
                <td className="px-3 py-3 font-semibold tabular-nums">{formatMetricValue(arm.value,"%")}</td>
                <td className="px-3 py-3 tabular-nums">{arm.ciLower===null||arm.ciUpper===null?"Não extraído":
                  formatMetricValue(arm.ciLower,"%")+" a "+formatMetricValue(arm.ciUpper,"%")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#d5e4e4] bg-[#f3f9f9] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#17686b]">
            <Info aria-hidden="true" size={16}/> Como ler este dado
          </div>
          <p className="mt-2 text-xs leading-6 text-[#4b626d]">{metric.estimator}</p>
        </div>
        <div className="rounded-xl border border-[#eadfc9] bg-[#fbf8f2] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#83602e]">
            <ShieldAlert aria-hidden="true" size={16}/> Limites
          </div>
          <p className="mt-2 text-xs leading-6 text-[#5a6266]">{metric.limitations}</p>
        </div>
      </div>
      <p className="mt-5 text-xs leading-6 text-muted-foreground">
        <strong>Referência dentro do documento:</strong> {metric.sourceLocator}.
        Conferência documental em {new Date(metric.reviewedOn+"T12:00:00Z").toLocaleDateString("pt-BR",{timeZone:"UTC"})}.
        Não houve revisão clínica independente ou liberação para projeções populacionais.
      </p>
      <a href={metric.sourceUrl} target="_blank" rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#b4d3d1] px-4 text-sm font-semibold text-primary hover:bg-muted">
        Abrir fonte original <ExternalLink aria-hidden="true" size={15}/>
      </a>
    </section>
  );
}
