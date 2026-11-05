"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity, ArrowLeftRight, ArrowRight, ArrowUpRight, BarChart3,
  BookOpenText, Brain, ChevronDown, ClipboardList, FlaskConical,
  HeartPulse, Info, Layers3, ShieldCheck, Sparkles,
} from "lucide-react";
import { CompatibilityPanel } from "@/components/comparison/compatibility-panel";
import { MetricChart } from "@/components/comparison/metric-chart";
import { assessStudyComparison } from "@/features/comparison/compatibility";
import { getReviewedMetric, reviewedMetrics } from "@/features/comparison/reviewed-metrics";
import {
  getUnifiedEvidence, unifiedEvidenceCatalog,
  type UnifiedEvidenceRecord,
} from "@/features/evidence/unified-catalog";
import {
  designNames, drugNames, shortDescription, sourceKindName, topicNames,
} from "@/lib/evidence-presentation";

const referenceOptions=[...unifiedEvidenceCatalog].sort((a,b)=>
  a.title.localeCompare(b.title,"pt-BR")
);
const metricGroups=[
  {key:"composition",label:"Composição corporal",description:"Peso, gordura e massa magra",items:["M01","M02","M03"],icon:Activity},
  {key:"treatment",label:"Continuidade",description:"Manutenção e retirada",items:["M04"],icon:HeartPulse},
  {key:"mental",label:"Saúde mental",description:"Categorias PHQ-9",items:["M05"],icon:Brain},
] as const;

function StudyColumn({record,side,onSelect}:{
  record:UnifiedEvidenceRecord;side:"a"|"b";onSelect:(id:string)=>void;
}) {
  const isA=side==="a";
  const id=isA?"compare-left":"compare-right";
  const accent=isA?"#2563eb":"#0f766e";
  return (
    <article className="lupa-surface relative min-w-0 overflow-hidden">
      <div className={"absolute inset-x-0 top-0 h-1 "+(isA?"bg-[#2563eb]":"bg-[#0f766e]")} aria-hidden="true"/>
      <div className="p-5 sm:p-6 lg:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={"flex size-11 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold "+
              (isA?"bg-[#eef3ff] text-[#245ac5]":"bg-[#e9f7f3] text-[#0c6d65]")}>
              {isA?"A":"B"}
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.14em] text-muted-foreground">
                Referência selecionada
              </p>
              <p className="mt-0.5 text-sm font-bold text-foreground">Estudo {isA?"A":"B"}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e3e9ef] bg-[#f8fafc] px-2.5 py-1.5 text-[11px] font-semibold text-[#536575]">
            <span className="size-1.5 rounded-full bg-[#c18d47]"/> Em curadoria
          </span>
        </div>

        <label htmlFor={id} className="mt-6 block text-sm font-bold text-foreground">
          Selecione uma referência
        </label>
        <select id={id} value={record.id} onChange={e=>onSelect(e.target.value)}
          className="lupa-input mt-2">
          {referenceOptions.map(item=>
            <option key={item.id} value={item.id}>{item.id} · {item.title}</option>
          )}
        </select>

        <div className="mt-6 border-t border-border pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg px-2.5 py-1 text-xs font-bold"
              style={{color:accent,backgroundColor:isA?"#eef3ff":"#e9f7f3"}}>
              {record.id}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {record.year??"Ano não informado"} · {sourceKindName(record.sourceKind)}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-extrabold leading-snug tracking-[-.02em] text-foreground sm:text-xl">
            {record.title}
          </h3>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="lupa-inner-surface p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-[.09em] text-muted-foreground">Tipo de estudo</p>
              <p className="mt-1.5 text-[13px] font-semibold leading-5 text-foreground">
                {designNames[record.design]}
              </p>
            </div>
            <div className="lupa-inner-surface p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-[.09em] text-muted-foreground">Grupo ou amostra</p>
              <p className="mt-1.5 text-[13px] font-semibold leading-5 text-foreground">
                {shortDescription(record.populationSummary,115)||"Não detalhada"}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[.09em] text-[#506273]">
              O que o documento descreve
            </p>
            <p className="mt-2 text-sm leading-6 text-[#495d70]">
              {shortDescription(record.resultsSummary,175)||"Sem resumo quantitativo disponível"}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-[#e6edf3] bg-[#f8fafc] px-4 py-3">
            <p className="flex items-center gap-2 text-xs font-bold text-[#59616a]">
              <Info size={15} aria-hidden="true" className="text-[#a3773d]"/> Principal limitação
            </p>
            <p className="mt-1.5 text-[13px] leading-5 text-[#596778]">
              {shortDescription(record.limitations,155)}
            </p>
          </div>

          <details className="group mt-3 rounded-xl border border-transparent hover:border-border">
            <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 px-2 text-[13px] font-bold text-primary marker:hidden">
              Ver todos os dados e limitações
              <ChevronDown size={16} className="transition-transform group-open:rotate-180" aria-hidden="true"/>
            </summary>
            <div className="space-y-3 border-t border-border px-2 py-3 text-[13px] leading-6 text-muted-foreground">
              <p><strong className="text-foreground">População:</strong> {record.populationSummary||"Não descrita no catálogo"}</p>
              <p><strong className="text-foreground">Resultado:</strong> {record.resultsSummary||"Não descrito"}</p>
              <p><strong className="text-foreground">Limitações:</strong> {record.limitations}</p>
            </div>
          </details>

          <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Temas e tratamentos">
            {record.topics.slice(0,3).map(topic=>(
              <span key={topic} className="rounded-lg bg-[#edf6f4] px-2.5 py-1.5 text-[11px] font-bold text-[#17675f]">
                {topicNames[topic]}
              </span>
            ))}
            {record.drugs.filter(drug=>drug!=="not_applicable").slice(0,2).map(drug=>(
              <span key={drug} className="rounded-lg bg-[#eef3ff] px-2.5 py-1.5 text-[11px] font-bold text-[#345fb3]">
                {drugNames[drug]}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
          <Link href={"/evidencias/"+record.id}
            className="lupa-button-secondary text-primary">
            Abrir ficha completa <ArrowUpRight size={16} aria-hidden="true"/>
          </Link>
          <a href={record.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold text-[#536575] underline-offset-4 hover:text-primary hover:underline">
            Fonte original <BookOpenText size={16} aria-hidden="true"/>
          </a>
        </div>
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
  if(!left||!right||!metric)throw new Error("Referência ou indicador não disponível");

  const assessment=useMemo(()=>assessStudyComparison(left,right),[left,right]);
  const currentGroup=metricGroups.find(group=>group.items.some(item=>item===metric.id))??metricGroups[0];
  const swap=()=>{setLeftId(rightId);setRightId(leftId);};

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-7 sm:px-6 sm:pt-10 lg:px-8">
      <header className="lupa-surface relative overflow-hidden bg-gradient-to-br from-white via-white to-[#f0f5ff] px-6 py-8 sm:px-9 sm:py-10">
        <span className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full border-[32px] border-[#e9f1fc]/70" aria-hidden="true"/>
        <div className="relative grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="lupa-section-kicker">LUPA Saúde / Comparador científico</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-[1.12] tracking-[-.045em] text-foreground sm:text-[44px]">
              Compare evidências.{" "}
              <span className="text-primary">Entenda os limites.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Uma leitura científica mais clara: veja os estudos lado a lado, identifique
              diferenças metodológicas e explore resultados conferidos na fonte original.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#d5e7e3] bg-white px-3.5 py-2 text-xs font-semibold text-[#235f5b]">
              <ShieldCheck size={16} aria-hidden="true"/> Interpretação responsável de dados
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3" aria-label="Resumo do catálogo">
            <div className="rounded-2xl border border-[#e3eaf2] bg-white/90 p-4 sm:p-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#eef3ff] text-[#2563eb]">
                <Layers3 size={20} aria-hidden="true"/>
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-[-.03em] tabular-nums">50</p>
              <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">Referências no catálogo</p>
            </div>
            <div className="rounded-2xl border border-[#e3eaf2] bg-white/90 p-4 sm:p-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf5f3] text-primary">
                <BarChart3 size={20} aria-hidden="true"/>
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-[-.03em] tabular-nums">{reviewedMetrics.length}</p>
              <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">Indicadores de fonte conferida</p>
            </div>
            <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-[#e4eaf3] bg-[#f8fafc]/95 p-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff2e0] text-[#966319]">
                <ShieldCheck size={19} aria-hidden="true"/>
              </span>
              <p className="text-xs leading-5 text-[#526575]">
                <strong className="text-foreground">0 indicadores liberados para projeções.</strong>{" "}
                Os resultados ainda não passaram por revisão clínica independente.
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-11 sm:mt-14" aria-labelledby="cross-study-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="lupa-section-kicker">Etapa 01 · Contexto</p>
            <h2 id="cross-study-heading" className="mt-1.5 text-2xl font-extrabold tracking-[-.025em] sm:text-3xl">
              Estudos lado a lado
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Selecione referências diferentes para conhecer semelhanças e limites metodológicos.
            </p>
          </div>
          <button type="button" onClick={swap} aria-label="Trocar posições dos estudos"
            className="lupa-button-secondary">
            <ArrowLeftRight size={17} aria-hidden="true"/> Inverter estudos
          </button>
        </div>
        <div className="grid items-stretch gap-4 lg:grid-cols-2">
          <StudyColumn side="a" record={left} onSelect={setLeftId}/>
          <StudyColumn side="b" record={right} onSelect={setRightId}/>
        </div>
        <CompatibilityPanel assessment={assessment}/>
      </section>

      <section className="mt-12 sm:mt-16" aria-labelledby="chart-section-heading">
        <div>
          <p className="lupa-section-kicker">Etapa 02 · Resultados observados</p>
          <h2 id="chart-section-heading" className="mt-1.5 text-2xl font-extrabold tracking-[-.025em] sm:text-3xl">
            Explore os resultados dos estudos
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Os gráficos mostram apenas grupos internos de uma mesma publicação. A seleção
            do gráfico é <strong>independente dos estudos A e B</strong> acima.
          </p>
        </div>

        <div className="lupa-surface mb-4 mt-5 p-5 sm:p-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-extrabold">
            <FlaskConical size={18} className="text-primary" aria-hidden="true"/>
            Selecione um tema de análise
          </p>

          <div className="hidden flex-wrap gap-2 md:flex" role="group" aria-label="Categorias dos indicadores">
            {metricGroups.map(group=>{
              const Icon=group.icon;
              const isActive=currentGroup.key===group.key;
              return (
                <button key={group.key} type="button" aria-pressed={isActive}
                  onClick={()=>setMetricId(group.items[0])}
                  className={"flex min-h-12 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors "+
                    (isActive
                      ?"border-primary bg-primary text-white shadow-[0_6px_13px_rgba(15,118,110,.14)]"
                      :"border-[#dfe7ee] bg-[#fafbfd] text-[#40576a] hover:bg-[#eef3f8]")}>
                  <Icon size={17} aria-hidden="true"/>{group.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 hidden flex-wrap gap-2 md:flex" role="group" aria-label="Indicadores do tema selecionado">
            {currentGroup.items.map(id=>{
              const item=getReviewedMetric(id);
              if(!item)return null;
              const active=metricId===id;
              return (
                <button key={id} type="button" aria-pressed={active}
                  onClick={()=>setMetricId(id)}
                  className={"min-h-10 rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition-colors "+
                    (active
                      ?"border-[#c4dad7] bg-[#eaf5f3] text-[#0d6e66]"
                      :"border-[#e1e7ee] bg-white text-[#546477] hover:bg-[#f8fafc]")}>
                  {item.title}
                </button>
              );
            })}
          </div>

          <div className="md:hidden">
            <label htmlFor="reviewed-metric" className="mb-2 block text-sm font-semibold text-[#42586b]">
              Indicador
            </label>
            <select id="reviewed-metric" className="lupa-input" value={metricId}
              onChange={event=>setMetricId(event.target.value)}>
              {metricGroups.map(group=>(
                <optgroup key={group.key} label={group.label}>
                  {group.items.map(id=>{
                    const item=getReviewedMetric(id);
                    return item?<option key={id} value={id}>{item.title}</option>:null;
                  })}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#f5f8fc] px-3.5 py-3">
            <Info size={16} className="mt-0.5 shrink-0 text-[#2563eb]" aria-hidden="true"/>
            <p className="text-xs leading-5 text-[#506578]">
              <strong>{currentGroup.label}:</strong> {currentGroup.description}.
              {" "}Os valores foram conferidos na fonte, mas não estão aprovados para projeções clínicas.
            </p>
          </div>
        </div>
        <MetricChart metric={metric}/>
      </section>

      <section className="mt-12 sm:mt-16" aria-labelledby="reading-heading">
        <div className="mb-5">
          <p className="lupa-section-kicker">Etapa 03 · Leitura responsável</p>
          <h2 id="reading-heading" className="mt-1.5 text-2xl font-extrabold tracking-[-.025em] sm:text-3xl">
            O que esses dados não demonstram
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {title:"Massa magra não é força muscular",detail:"Medidas de DXA não diagnosticam, isoladamente, sarcopenia ou perda de função."},
            {title:"UTI não é efeito da medicação",detail:"Estudos independentes não comprovam que a tirzepatida altere prognósticos em UTI."},
            {title:"Estudo não é projeção nacional",detail:"Resultados de grupos selecionados não são taxas aplicáveis automaticamente ao Brasil."},
          ].map((card,index)=>(
            <article key={card.title} className="lupa-surface p-5 sm:p-6">
              <div className={"flex size-11 items-center justify-center rounded-2xl "+
                (index===1?"bg-[#fff6ea] text-[#946019]":"bg-[#eef3ff] text-[#2563eb]")}>
                {index===1?<HeartPulse size={20} aria-hidden="true"/>:
                  index===0?<Activity size={20} aria-hidden="true"/>:<Brain size={20} aria-hidden="true"/>}
              </div>
              <h3 className="mt-4 text-sm font-extrabold leading-6 text-foreground">{card.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{card.detail}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d7e8e5] bg-[#eef7f5] px-5 py-5 sm:px-6">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[#165d57]">
              <Sparkles size={17} aria-hidden="true"/> Explore as fontes completas
            </p>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-[#526575]">
              Consulte artigos, notas de curadoria e referências originais antes de interpretar os resultados.
            </p>
          </div>
          <Link href="/evidencias"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0c625c]">
            <ClipboardList size={17} aria-hidden="true"/> Abrir biblioteca <ArrowRight size={17} aria-hidden="true"/>
          </Link>
        </div>
      </section>
    </div>
  );
}
