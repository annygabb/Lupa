"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity, ArrowLeftRight, ArrowRight, ArrowUpRight, BarChart3, BookOpen,
  Brain, ChartNoAxesCombined, CheckCircle2, ChevronDown, FlaskConical,
  HeartPulse, Layers3, LockKeyhole, ShieldCheck, Sparkles,
} from "lucide-react";
import { EvidenceOrbit } from "@/components/comparison/evidence-orbit";
import { StudioStudyCard } from "@/components/comparison/studio-study-card";
import { CompatibilityPanel } from "@/components/comparison/compatibility-panel";
import { MetricChart } from "@/components/comparison/metric-chart";
import { assessStudyComparison } from "@/features/comparison/compatibility";
import { reviewedMetrics, getReviewedMetric } from "@/features/comparison/reviewed-metrics";
import { getUnifiedEvidence, unifiedEvidenceCatalog } from "@/features/evidence/unified-catalog";

const references=[...unifiedEvidenceCatalog].sort((a,b)=>a.title.localeCompare(b.title,"pt-BR"));
const metricGroups=[
  {key:"composition",label:"Composição corporal",detail:"Peso, gordura e massa magra",items:["M01","M02","M03"],icon:Activity},
  {key:"maintenance",label:"Continuidade",detail:"Manutenção e retirada",items:["M04"],icon:HeartPulse},
  {key:"psychological",label:"Saúde mental",detail:"Categorias PHQ-9",items:["M05"],icon:Brain},
] as const;

export function StudyComparator() {
  const [leftId,setLeftId]=useState("E04");
  const [rightId,setRightId]=useState("E12");
  const [metricId,setMetricId]=useState("M03");
  const left=getUnifiedEvidence(leftId);
  const right=getUnifiedEvidence(rightId);
  const metric=getReviewedMetric(metricId);
  if(!left||!right||!metric)throw new Error("Referência ou indicador não disponível");
  const assessment=useMemo(()=>assessStudyComparison(left,right),[left,right]);
  const activeGroup=metricGroups.find(g=>g.items.some(id=>id===metric.id))??metricGroups[0];
  const swap=()=>{setLeftId(rightId);setRightId(leftId);};

  return (
    <div className="lupa-studio min-h-screen">
      <div className="mx-auto max-w-[1480px] px-4 pb-20 pt-6 sm:px-6 sm:pt-9 lg:px-9">
        <header className="lupa-dashboard-card lupa-fade-up overflow-hidden p-3 sm:p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(370px,.85fr)]">
            <div className="flex min-w-0 flex-col justify-center px-4 py-7 sm:px-8 sm:py-10 lg:py-12">
              <p className="lupa-premium-kicker">LUPA Saúde / Comparador científico</p>
              <h1 className="lupa-premium-text mt-4 max-w-[720px] text-[clamp(2.25rem,4.4vw,4.25rem)] font-extrabold leading-[1.04]">
                Compare estudos.
                <span className="block text-[#315ff4]">Enxergue além dos números.</span>
              </h1>
              <p className="mt-6 max-w-[580px] text-[15px] leading-[1.85] text-[#5a6f89] sm:text-[16px]">
                Um espaço para investigar evidências científicas, confrontar métodos e entender
                o que os resultados mostram — e o que ainda não demonstram.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a href="#comparacao" className="lupa-premium-button lupa-premium-button-primary">
                  Iniciar comparação <ArrowRight size={17} aria-hidden="true"/>
                </a>
                <a href="#indicadores" className="lupa-premium-button lupa-premium-button-outline">
                  Explorar indicadores <ChartNoAxesCombined size={17} aria-hidden="true"/>
                </a>
              </div>
              <p className="mt-6 flex items-center gap-2 text-[12px] font-semibold text-[#69829e]">
                <ShieldCheck size={16} className="text-[#0d9488]" aria-hidden="true"/>
                Resultados rastreáveis. Sem diagnósticos ou projeções não validadas.
              </p>
            </div>
            <EvidenceOrbit leftId={left.id} rightId={right.id}/>
          </div>
        </header>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo do catálogo">
          <div className="lupa-dashboard-card lupa-dash-hover flex items-center gap-4 p-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf2ff] text-[#315ff4]">
              <BookOpen size={22} aria-hidden="true"/>
            </span>
            <div>
              <p className="lupa-metric-ink text-3xl font-extrabold text-[#213755]">50</p>
              <p className="text-[12px] font-semibold text-[#71839a]">Referências catalogadas</p>
            </div>
          </div>
          <div className="lupa-dashboard-card lupa-dash-hover flex items-center gap-4 p-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#e5faf5] text-[#0d9488]">
              <BarChart3 size={22} aria-hidden="true"/>
            </span>
            <div>
              <p className="lupa-metric-ink text-3xl font-extrabold text-[#213755]">{reviewedMetrics.length}</p>
              <p className="text-[12px] font-semibold text-[#71839a]">Indicadores conferidos</p>
            </div>
          </div>
          <div className="lupa-dashboard-card lupa-dash-hover flex items-center gap-4 p-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff4e6] text-[#ad7b34]">
              <LockKeyhole size={21} aria-hidden="true"/>
            </span>
            <div>
              <p className="lupa-metric-ink text-3xl font-extrabold text-[#213755]">0</p>
              <p className="text-[12px] font-semibold text-[#71839a]">Projeções autorizadas</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#1b2a51] to-[#263d78] p-5 text-white shadow-[0_12px_32px_rgba(22,42,81,.13)]">
            <div className="absolute -right-8 -top-8 size-24 rounded-full border-[15px] border-white/10" aria-hidden="true"/>
            <div className="relative flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles size={20} className="text-[#9ff9ea]" aria-hidden="true"/>
              </span>
              <div>
                <p className="text-[13px] font-extrabold">Rigor científico</p>
                <p className="mt-1 text-[12px] leading-5 text-[#ccd9ef]">Cada dado no contexto original.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-9 grid gap-5 xl:grid-cols-[68px_minmax(0,1fr)]">
          <aside className="hidden xl:block" aria-label="Navegação da análise">
            <nav className="lupa-studio-rail sticky top-[94px] flex flex-col items-center gap-3 rounded-[22px] px-2.5 py-4 text-[#aac0e1]">
              <a href="#comparacao" aria-label="Ir para comparação dos estudos" title="Comparação"
                className="lupa-focusable flex size-11 items-center justify-center rounded-2xl bg-white/15 text-white hover:bg-white/25">
                <Layers3 size={19} aria-hidden="true"/>
              </a>
              <a href="#indicadores" aria-label="Ir para indicadores" title="Indicadores"
                className="lupa-focusable flex size-11 items-center justify-center rounded-2xl hover:bg-white/15 hover:text-white">
                <BarChart3 size={19} aria-hidden="true"/>
              </a>
              <a href="#limites" aria-label="Ir para limites da evidência" title="Limites"
                className="lupa-focusable flex size-11 items-center justify-center rounded-2xl hover:bg-white/15 hover:text-white">
                <ShieldCheck size={19} aria-hidden="true"/>
              </a>
              <div className="my-2 h-px w-7 bg-white/15" aria-hidden="true"/>
              <Link href="/evidencias" aria-label="Abrir explorador de evidências" title="Explorador"
                className="lupa-focusable flex size-11 items-center justify-center rounded-2xl hover:bg-white/15 hover:text-white">
                <BookOpen size={19} aria-hidden="true"/>
              </Link>
            </nav>
          </aside>

          <div className="min-w-0 space-y-13">
            <section id="comparacao" className="scroll-mt-28">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="lupa-section-number">01</span>
                    <p className="lupa-premium-kicker">Comparação contextual</p>
                  </div>
                  <h2 className="lupa-premium-text mt-2 text-[27px] font-extrabold sm:text-[34px]">
                    Estudos lado a lado
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#657993]">
                    Comece selecionando duas referências. O LUPA explica o que pode e o que não pode ser comparado.
                  </p>
                </div>
                <p className="inline-flex items-center gap-2 rounded-full bg-[#e7f6f0] px-3 py-2 text-[12px] font-bold text-[#117366]">
                  <CheckCircle2 size={15} aria-hidden="true"/> Biblioteca local
                </p>
              </div>

              <div className="lupa-dashboard-card mb-4 p-4 sm:p-5">
                <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_54px_minmax(0,1fr)]">
                  <div className="min-w-0">
                    <label htmlFor="compare-left" className="mb-2 flex items-center gap-2 text-[13px] font-extrabold text-[#3e5674]">
                      <span className="flex size-6 items-center justify-center rounded-lg bg-[#e9efff] text-[12px] text-[#315ff4]">A</span>
                      Referência A
                    </label>
                    <select id="compare-left" className="lupa-input !min-h-[54px] !text-[13px]" value={left.id}
                      onChange={e=>setLeftId(e.target.value)}>
                      {references.map(item=><option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={swap} aria-label="Trocar posições dos estudos"
                    className="lupa-focusable mx-auto flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#d6e1f4] bg-[#f2f6ff] text-[#315bd4] transition hover:rotate-180 hover:bg-[#e6eeff]"
                    title="Inverter estudos">
                    <ArrowLeftRight size={20} aria-hidden="true"/>
                  </button>
                  <div className="min-w-0">
                    <label htmlFor="compare-right" className="mb-2 flex items-center gap-2 text-[13px] font-extrabold text-[#3e5674]">
                      <span className="flex size-6 items-center justify-center rounded-lg bg-[#dff9f2] text-[12px] text-[#0d887f]">B</span>
                      Referência B
                    </label>
                    <select id="compare-right" className="lupa-input !min-h-[54px] !text-[13px]" value={right.id}
                      onChange={e=>setRightId(e.target.value)}>
                      {references.map(item=><option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid items-stretch gap-4 lg:grid-cols-2">
                <StudioStudyCard record={left} side="a"/>
                <StudioStudyCard record={right} side="b"/>
              </div>

              <CompatibilityPanel assessment={assessment}/>
            </section>

            <section id="indicadores" className="scroll-mt-28">
              <div className="mb-5">
                <div className="flex items-center gap-3">
                  <span className="lupa-section-number">02</span>
                  <p className="lupa-premium-kicker">Resultados observados</p>
                </div>
                <h2 className="lupa-premium-text mt-2 text-[27px] font-extrabold sm:text-[34px]">
                  Evidência em perspectiva
                </h2>
                <p className="mt-2 max-w-[820px] text-sm leading-7 text-[#657993]">
                  Explore cinco indicadores extraídos de fontes primárias. Cada gráfico representa
                  somente os grupos internos do próprio estudo e é <strong>independente dos estudos A e B</strong> acima.
                </p>
              </div>

              <div className="lupa-dashboard-card mb-4 p-5 sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-[14px] font-extrabold text-[#283e5b]">
                    <FlaskConical size={18} className="text-[#315ff4]" aria-hidden="true"/>
                    Selecione um tema de análise
                  </p>
                  <span className="rounded-full bg-[#edf4ff] px-2.5 py-1.5 text-[11px] font-bold text-[#3562c5]">
                    {reviewedMetrics.length} indicadores
                  </span>
                </div>

                <div className="hidden flex-wrap gap-2 md:flex" role="group" aria-label="Categorias dos indicadores">
                  {metricGroups.map(group=>{
                    const Icon=group.icon;
                    const active=activeGroup.key===group.key;
                    return (
                      <button key={group.key} type="button" aria-pressed={active}
                        onClick={()=>setMetricId(group.items[0])}
                        className={"lupa-focusable flex min-h-12 items-center gap-2 rounded-[13px] border px-4 text-[13px] font-bold transition-colors "+
                          (active?"border-[#315ff4] bg-[#315ff4] text-white shadow-[0_7px_15px_rgba(49,95,244,.16)]":"border-[#dce5f2] bg-[#f7f9fd] text-[#556e8a] hover:bg-[#ecf2fc]")}>
                        <Icon size={18} aria-hidden="true"/>{group.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 hidden flex-wrap gap-2 md:flex" role="group" aria-label="Indicadores do tema selecionado">
                  {activeGroup.items.map(id=>{
                    const item=getReviewedMetric(id);
                    if(!item)return null;
                    const active=item.id===metricId;
                    return (
                      <button key={item.id} type="button" aria-pressed={active} onClick={()=>setMetricId(id)}
                        className={"lupa-focusable min-h-10 rounded-xl border px-3.5 py-2 text-[13px] font-bold "+
                          (active?"border-[#b8d0ff] bg-[#eaf1ff] text-[#2957c4]":"border-[#e3e9f2] bg-white text-[#59718c] hover:bg-[#f4f7fc]")}>
                        {item.title}
                      </button>
                    );
                  })}
                </div>

                <div className="md:hidden">
                  <label htmlFor="reviewed-metric" className="mb-2 block text-[13px] font-bold text-[#3e5674]">Indicador</label>
                  <select id="reviewed-metric" value={metricId} className="lupa-input"
                    onChange={e=>setMetricId(e.target.value)}>
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

                <p className="mt-4 flex items-start gap-2 rounded-[13px] bg-[#f3f6fc] px-4 py-3 text-[12px] leading-6 text-[#627891]">
                  <ShieldCheck size={16} className="mt-1 shrink-0 text-[#3768de]" aria-hidden="true"/>
                  <span><strong>{activeGroup.label}:</strong> {activeGroup.detail}. Dados conferidos na publicação, mas ainda sem revisão clínica independente.</span>
                </p>
              </div>
              <MetricChart metric={metric}/>
            </section>

            <section id="limites" className="scroll-mt-28">
              <div className="mb-5 flex items-center gap-3">
                <span className="lupa-section-number">03</span>
                <div>
                  <p className="lupa-premium-kicker">Interpretação responsável</p>
                  <h2 className="lupa-premium-text mt-1 text-[27px] font-extrabold sm:text-[34px]">
                    O que esses dados não demonstram
                  </h2>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <article className="relative overflow-hidden rounded-[25px] bg-gradient-to-br from-[#172c55] to-[#254996] p-6 text-white shadow-[0_14px_32px_rgba(22,45,89,.13)]">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-white/10 text-[#a8e7ff]">
                    <Activity size={22} aria-hidden="true"/>
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold">Massa magra não é força muscular</h3>
                  <p className="mt-3 text-[13px] leading-6 text-[#cfddf2]">
                    Medidas por DXA não diagnosticam sozinhas sarcopenia ou perda funcional.
                  </p>
                </article>
                <article className="lupa-dashboard-card p-6">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#fff3e7] text-[#ba7c35]">
                    <HeartPulse size={22} aria-hidden="true"/>
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold text-[#273e5a]">UTI não é efeito da medicação</h3>
                  <p className="mt-3 text-[13px] leading-6 text-[#62778c]">
                    Pesquisas independentes não provam que a tirzepatida altere a recuperação em UTI.
                  </p>
                </article>
                <article className="lupa-dashboard-card p-6">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#e7f6f3] text-[#0f958a]">
                    <Brain size={22} aria-hidden="true"/>
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold text-[#273e5a]">Estudo não é projeção nacional</h3>
                  <p className="mt-3 text-[13px] leading-6 text-[#62778c]">
                    Resultados de grupos selecionados não são taxas aplicáveis automaticamente ao Brasil.
                  </p>
                </article>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[23px] border border-[#d9e6f1] bg-gradient-to-r from-[#eef4ff] to-[#e9f8f5] px-5 py-5 sm:px-7">
                <div>
                  <p className="flex items-center gap-2 text-sm font-extrabold text-[#294c85]">
                    <Sparkles size={18} aria-hidden="true"/> A fonte importa tanto quanto o dado.
                  </p>
                  <p className="mt-1 text-[13px] leading-6 text-[#627891]">
                    Consulte os artigos, a população e as limitações antes de interpretar qualquer número.
                  </p>
                </div>
                <Link href="/evidencias" className="lupa-premium-button lupa-premium-button-primary">
                  Abrir biblioteca <ArrowUpRight size={17} aria-hidden="true"/>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
