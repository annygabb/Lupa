"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRight, ArrowUpRight, BookOpenText, CircleAlert, ClipboardList,
  FlaskConical, Info, Layers2, ShieldCheck,
} from "lucide-react";
import { MetricChart } from "@/components/comparison/metric-chart";
import { assessStudyComparison } from "@/features/comparison/compatibility";
import { getReviewedMetric, reviewedMetrics } from "@/features/comparison/reviewed-metrics";
import {
  getUnifiedEvidence, unifiedEvidenceCatalog,
  type UnifiedEvidenceRecord,
} from "@/features/evidence/unified-catalog";
import { designNames, drugNames, shortDescription, sourceKindName, topicNames } from "@/lib/evidence-presentation";

const options=[...unifiedEvidenceCatalog].sort((a,b)=>a.title.localeCompare(b.title,"pt-BR"));
function StudyColumn({record,side,onSelect}:{
  record:UnifiedEvidenceRecord;side:"a"|"b";onSelect:(id:string)=>void;
}){
  const inputId=side==="a"?"compare-left":"compare-right";
  return (
    <article className="min-w-0 rounded-2xl border border-border bg-white p-5 shadow-[0_8px_28px_rgba(18,49,61,0.035)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Estudo {side==="a"?"A":"B"}
        </span>
        <span className="rounded-full bg-[#f2f6f7] px-3 py-1 text-[11px] text-muted-foreground">
          Em curadoria
        </span>
      </div>
      <label htmlFor={inputId} className="mt-4 block text-sm font-semibold">
        Selecione uma referência
      </label>
      <select id={inputId} value={record.id}
        onChange={event=>onSelect(event.target.value)}
        className="mt-2 min-h-12 w-full rounded-xl border border-border bg-white px-3 text-sm text-foreground focus:border-primary focus:outline-2 focus:outline-offset-2 focus:outline-[#8bbfbd]">
        {options.map(item=><option key={item.id} value={item.id}>
          {item.id} · {item.title}
        </option>)}
      </select>
      <div className="mt-5 border-t border-border pt-5">
        <p className="text-xs font-semibold text-primary">{record.id} · {record.year??"Ano não informado"}</p>
        <h3 className="mt-2 text-lg font-semibold leading-snug">{record.title}</h3>
        <dl className="mt-5 space-y-3 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Desenho</dt>
            <dd className="mt-1">{designNames[record.design]} · {sourceKindName(record.sourceKind)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">População / amostra</dt>
            <dd className="mt-1 leading-6 text-[#4d6470]">{shortDescription(record.populationSummary,240)||"Não detalhada no catálogo"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resultado documental</dt>
            <dd className="mt-1 leading-6 text-[#4d6470]">{shortDescription(record.resultsSummary,270)||"Sem resumo quantitativo disponível"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Limitação</dt>
            <dd className="mt-1 leading-6 text-[#4d6470]">{shortDescription(record.limitations,205)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contexto</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {record.topics.slice(0,3).map(topic=><span key={topic} className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-[#17686b]">{topicNames[topic]}</span>)}
              {record.drugs.filter(x=>x!=="not_applicable").slice(0,2).map(drug=><span key={drug} className="rounded-md bg-[#f2f5f7] px-2 py-1 text-xs text-[#516873]">{drugNames[drug]}</span>)}
            </dd>
          </div>
        </dl>
      </div>
      <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-4">
        <Link href={"/evidencias/"+record.id}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-md text-sm font-semibold text-primary underline-offset-4 hover:underline">
          Abrir ficha <ArrowUpRight size={16} aria-hidden="true"/>
        </Link>
        <a href={record.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-md text-xs font-medium text-muted-foreground underline-offset-4 hover:underline">
          Fonte original <BookOpenText size={15} aria-hidden="true"/>
        </a>
      </div>
    </article>
  );
}

export function StudyComparator() {
  const [leftId,setLeftId]=useState("E04");
  const [rightId,setRightId]=useState("E12");
  const [metricId,setMetricId]=useState("M03");
  const left=getUnifiedEvidence(leftId);
  const right=getUnifiedEvidence(rightId);
  const metric=getReviewedMetric(metricId);
  if(!left||!right||!metric) throw new Error("Catálogo local ou indicador não disponível");

  const assessment=useMemo(()=>assessStudyComparison(left,right),[left,right]);
  const serious=assessment.warnings.filter(item=>item.code!=="BOTH_PENDING_CURATOR_REVIEW"
    && item.code!=="NO_DIRECT_CROSS_STUDY_POOLED_EFFECT");
  const swap=()=>{setLeftId(rightId);setRightId(leftId);};

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">LUPA Saúde / Leitura crítica</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Comparar com contexto. <span className="text-primary">Não apenas números.</span>
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
          Coloque duas referências lado a lado, investigue o que cada estudo realmente mediu
          e visualize indicadores conferidos dentro de suas próprias populações.
          Sem misturar resultados incompatíveis.
        </p>
      </header>

      <section aria-label="Estado da revisão" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
          <p className="text-2xl font-semibold tabular-nums">50</p>
          <p className="mt-1 text-xs text-muted-foreground">Referências para explorar</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
          <p className="text-2xl font-semibold tabular-nums">5</p>
          <p className="mt-1 text-xs text-muted-foreground">Indicadores de fonte primária conferidos</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-border bg-white p-4 sm:col-span-1 sm:p-5">
          <p className="text-2xl font-semibold tabular-nums">0</p>
          <p className="mt-1 text-xs text-muted-foreground">Indicadores liberados para projeção</p>
        </div>
      </section>

      <div role="note" className="mt-5 flex gap-3 rounded-xl border border-[#cfe3e2] bg-[#edf7f6] px-4 py-4">
        <Info aria-hidden="true" size={19} className="mt-0.5 shrink-0 text-primary"/>
        <p className="text-xs leading-6 text-[#425e69]">
          <strong>Modo de pesquisa e curadoria:</strong> a comparação entre publicações é descritiva.
          Os gráficos abaixo mostram medidas de três publicações cujos valores foram conferidos nas fontes
          primárias, mas não passaram por revisão clínica independente. Não são previsões sobre brasileiros.
        </p>
      </div>

      <section className="mt-10" aria-labelledby="cross-study-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="cross-study-heading" className="text-2xl font-semibold tracking-tight">1. Coloque dois estudos lado a lado</h2>
            <p className="mt-2 text-sm text-muted-foreground">Os campos mudam automaticamente conforme a sua seleção.</p>
          </div>
          <button type="button" onClick={swap} aria-label="Trocar posições dos estudos"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-medium text-primary hover:bg-muted">
            <ArrowLeftRight size={16} aria-hidden="true"/> Inverter estudos
          </button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <StudyColumn side="a" record={left} onSelect={setLeftId}/>
          <StudyColumn side="b" record={right} onSelect={setRightId}/>
        </div>
        <section className="mt-4 rounded-2xl border border-border bg-white p-5 sm:p-6"
          aria-labelledby="compatibility-heading" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 id="compatibility-heading" className="flex items-center gap-2 text-lg font-semibold">
                <ShieldCheck size={19} className="text-primary" aria-hidden="true"/> Verificação de compatibilidade
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {assessment.canShowSideBySide
                  ? "A comparação descritiva está disponível; a combinação numérica entre estudos está bloqueada."
                  : "Escolha duas referências distintas para comparar."}
              </p>
            </div>
            <span className="rounded-full border border-[#e7dabc] bg-[#faf5e8] px-3 py-1.5 text-xs font-medium text-[#86602a]">
              Não calcular efeito combinado
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {serious.map(item=>(
              <div key={item.code} className="rounded-xl border border-[#e3e9e9] bg-[#f8fafb] p-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CircleAlert aria-hidden="true" size={16} className="shrink-0 text-[#a07031]"/>
                  {item.label}
                </h4>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{item.explanation}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            {assessment.dataForWithinStudyChart.left} indicador(es) conferido(s) para A e
            {" "}{assessment.dataForWithinStudyChart.right} para B. Indicadores de estudos distintos
            não são sobrepostos em um mesmo gráfico.
          </p>
        </section>
      </section>

      <section className="mt-12" aria-labelledby="chart-section-heading">
        <div className="mb-5">
          <h2 id="chart-section-heading" className="text-2xl font-semibold tracking-tight">
            2. Explore um resultado verificado no estudo original
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Cada gráfico utiliza exclusivamente os dois grupos da mesma publicação.
            A lista inclui medidas de composição corporal, continuidade do tratamento e PHQ-9;
            elas não representam o mesmo desfecho e não são somadas.
          </p>
        </div>

        <div className="mb-4 rounded-2xl border border-border bg-white p-4 sm:p-5">
          <label htmlFor="reviewed-metric" className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <FlaskConical size={18} className="text-primary" aria-hidden="true"/>
            Escolha um indicador conferido
          </label>
          <select id="reviewed-metric" value={metricId} onChange={e=>setMetricId(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-border bg-white px-3 text-sm text-foreground focus:border-primary focus:outline-2 focus:outline-offset-2 focus:outline-[#8bbfbd]">
            {reviewedMetrics.map(item=><option key={item.id} value={item.id}>
              {item.studyLabel} · {item.title}
            </option>)}
          </select>
        </div>
        <MetricChart metric={metric}/>
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-white p-5 sm:p-7"
        aria-labelledby="reading-heading">
        <div className="flex items-center gap-2">
          <Layers2 size={20} className="text-primary" aria-hidden="true"/>
          <h2 id="reading-heading" className="text-lg font-semibold">3. O que o LUPA ainda não pode afirmar</h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-[#f6f9f9] p-4">
            <h3 className="text-sm font-semibold">Massa magra ≠ força muscular</h3>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Mudança de massa magra por DXA não é diagnóstico automático de sarcopenia nem prova de piora funcional.
            </p>
          </div>
          <div className="rounded-xl bg-[#f6f9f9] p-4">
            <h3 className="text-sm font-semibold">UTI ≠ efeito da medicação</h3>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Associações de massa muscular e desfechos críticos não provam que a tirzepatida altere a recuperação na UTI.
            </p>
          </div>
          <div className="rounded-xl bg-[#f6f9f9] p-4">
            <h3 className="text-sm font-semibold">Ensaios ≠ Brasil inteiro</h3>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Resultados de populações selecionadas não devem virar taxas nacionais sem modelagem e validação específicas.
            </p>
          </div>
        </div>
        <Link href="/evidencias"
          className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-md text-sm font-semibold text-primary underline-offset-4 hover:underline">
          <ClipboardList size={16} aria-hidden="true"/> Voltar ao catálogo de referências
        </Link>
      </section>
    </div>
  );
}
