"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity, ArrowRight, ArrowUpRight, BookOpenCheck, Brain, CircleAlert,
  Dna, FlaskConical, HeartPulse, Layers3, Network, ShieldCheck,
  Stethoscope, TrendingDown,
} from "lucide-react";
import { ClinicalChart } from "@/components/insights/clinical-chart";
import { MetricChart } from "@/components/comparison/metric-chart";
import { getReviewedMetric } from "@/features/comparison/reviewed-metrics";
import {
  evaluateMuscleIcuCausalChain, getResearchClaim, researchQuestions,
} from "@/features/muscle/evidence-map";

const colors={
  observed:"bg-[#edf2ff] text-[#365fd1] border-[#dbe5fa]",
  consensus:"bg-[#e9f8f3] text-[#0c776c] border-[#d0ece4]",
  association:"bg-[#f1f0ff] text-[#6858a1] border-[#e0dcf6]",
  unsupported:"bg-[#fff6eb] text-[#81521c] border-[#f1dfc8]",
} as const;

export function MuscleResearch() {
  const [question,setQuestion]=useState<(typeof researchQuestions)[number]["key"]>("causa");
  const current=useMemo(()=>{
    const item=researchQuestions.find(q=>q.key===question)!;
    return getResearchClaim(item.claimId)!;
  },[question]);
  const causal=evaluateMuscleIcuCausalChain();
  const dxa=getReviewedMetric("M03");
  if(!dxa)throw new Error("Indicador DXA revisado não encontrado");

  return (
    <div className="lupa-studio min-h-screen">
      <div className="mx-auto max-w-[1480px] px-4 pb-20 pt-6 sm:px-6 sm:pt-9 lg:px-9">
        <header className="lupa-dashboard-card overflow-hidden">
          <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(350px,.75fr)]">
            <div className="p-6 sm:p-10">
              <p className="lupa-premium-kicker">LUPA Saúde / Músculos e cuidados críticos</p>
              <h1 className="lupa-premium-text mt-4 max-w-3xl text-4xl font-extrabold leading-[1.07] sm:text-[56px]">
                Além do peso. <span className="text-[#315ff4]">O que podemos afirmar?</span>
              </h1>
              <p className="mt-6 max-w-3xl text-[15px] leading-8 text-[#60758d]">
                Investigamos como composição corporal, força muscular e desfechos em terapia
                intensiva são avaliados por pesquisas distintas. Sem transformar associações
                em causa, nem massa magra em diagnóstico.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#perguntas" className="lupa-premium-button lupa-premium-button-primary">
                  Investigar uma pergunta <ArrowRight size={17} aria-hidden="true"/>
                </a>
                <a href="#estudos" className="lupa-premium-button lupa-premium-button-outline">
                  Ver estudos originais <BookOpenCheck size={17} aria-hidden="true"/>
                </a>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4 bg-gradient-to-br from-[#162b54] via-[#1c4388] to-[#2455b3] p-6 text-white sm:p-9">
              <p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-[#bfd8ff]">Três perguntas científicas diferentes</p>
              {[
                {label:"Composição por DXA",icon:Dna},
                {label:"Força e função muscular",icon:Activity},
                {label:"Prognóstico em UTI",icon:HeartPulse},
              ].map((item,i)=>{
                const Icon=item.icon;
                return <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#acffec]"><Icon size={20} aria-hidden="true"/></span>
                  <div><p className="text-xs font-semibold text-[#a8c2e8]">Eixo {String(i+1).padStart(2,"0")}</p>
                    <p className="mt-1 text-sm font-extrabold">{item.label}</p></div>
                </div>;
              })}
              <p className="text-xs leading-6 text-[#d0e3ff]">Não há cálculo conjunto de mortalidade nem diagnóstico individual.</p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3" aria-label="Resumo de evidências">
          {[
            {number:"160",label:"Participantes no subestudo DXA",detail:"SURMOUNT-1 · 72 semanas",icon:TrendingDown},
            {number:"35",label:"Estudos na metanálise de UTI",detail:"9.366 pacientes críticos",icon:Layers3},
            {number:"0",label:"Efeitos causais medicamento → UTI estabelecidos",detail:"A lacuna permanece aberta",icon:ShieldCheck},
          ].map((item,i)=>{
            const Icon=item.icon;
            return <div key={item.label} className="lupa-dashboard-card flex items-center gap-4 p-5 sm:p-6">
              <span className={"flex size-12 shrink-0 items-center justify-center rounded-2xl "+(i===1?"bg-[#eaf9f3] text-[#0b9388]":"bg-[#eef3ff] text-[#315ff4]")}>
                <Icon size={23} aria-hidden="true"/>
              </span>
              <div>
                <p className="lupa-metric-ink text-3xl font-extrabold text-[#1d3653]">{item.number}</p>
                <p className="text-xs font-bold leading-5 text-[#3b526b]">{item.label}</p>
                <p className="mt-0.5 text-[11px] leading-5 text-[#52657b]">{item.detail}</p>
              </div>
            </div>;
          })}
        </section>

        <section className="icu-context" aria-labelledby="icu-observed-title">
          <div className="section-intro"><div><p className="eyebrow">Gravidade e perda muscular · observação real</p><h2 id="icu-observed-title">O músculo também importa quando a doença se agrava</h2></div><p>Uma coorte acompanhou pacientes críticos com falência de um ou de múltiplos órgãos. Esta comparação é observada, não uma projeção de quem usou medicamento para emagrecer.</p></div>
          <ClinicalChart initial="icu" only={["icu"]}/>
          <div className="gap-note mt-6"><strong>Por que não somamos as perdas?</strong> O SURMOUNT-1 mede massa magra corporal por DXA em 72 semanas. A coorte de UTI mede a área de um músculo por ultrassom em sete dias. Somar os percentuais produziria um resultado sem significado validado. A chance individual de recuperação não foi calculada.</div>
        </section>

        <section id="perguntas" className="mt-12 scroll-mt-28" aria-labelledby="muscle-questions-heading">
          <p className="lupa-premium-kicker">01 / Interpretação guiada</p>
          <h2 id="muscle-questions-heading" className="lupa-premium-text mt-2 text-3xl font-extrabold">
            Que pergunta você quer responder?
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[#53645b]">
            Selecione uma pergunta. O LUPA separa o que cada estudo mede do que ele não permite concluir.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(260px,.85fr)_minmax(0,1.15fr)]">
            <div className="lupa-dashboard-card p-4 sm:p-5" role="group" aria-label="Perguntas de pesquisa">
              <div className="grid gap-2">
                {researchQuestions.map((item,i)=>(
                  <button type="button" key={item.key} onClick={()=>setQuestion(item.key)}
                    aria-pressed={question===item.key}
                    className={"flex min-h-16 items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-colors "+
                      (question===item.key
                        ?"border-[#a9c1f7] bg-[#eff4ff] text-[#254fbb]"
                        :"border-[#e8edf5] bg-white text-[#445a74] hover:bg-[#f7f9fe]")}>
                    <span className={"flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold "+
                      (question===item.key?"bg-[#315ff4] text-white":"bg-[#f0f3f9] text-[#4c627d]")}>
                      {String(i+1).padStart(2,"0")}
                    </span>
                    <span className="text-[14px] font-bold leading-5">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
            <article aria-live="polite" className="lupa-dashboard-card min-w-0 p-5 sm:p-7">
              <span className={"inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold "+colors[current.strength]}>
                <FlaskConical size={15} aria-hidden="true"/>{current.readableLabel}
              </span>
              <h3 className="lupa-premium-text mt-5 text-2xl font-extrabold sm:text-3xl">{current.headline}</h3>
              <p className="mt-4 text-sm leading-7 text-[#586d85]">{current.summary}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#cde8df] bg-[#effaf6] p-4">
                  <p className="flex items-center gap-2 text-xs font-extrabold text-[#137c6e]"><ShieldCheck size={16} aria-hidden="true"/> O que é medido</p>
                  <p className="mt-2 text-[13px] leading-6 text-[#40675e]">{current.measured}</p>
                </div>
                <div className="rounded-2xl border border-[#efe0c9] bg-[#fff8ef] p-4">
                  <p className="flex items-center gap-2 text-xs font-extrabold text-[#95692c]"><CircleAlert size={16} aria-hidden="true"/> O que não se pode inferir</p>
                  <p className="mt-2 text-[13px] leading-6 text-[#77634b]">{current.notInferred}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#e8edf5] pt-5">
                <span className="text-xs font-semibold text-[#52667d]">Fontes catalogadas: {current.evidenceIds.join(", ")}</span>
                <a href={current.url} target="_blank" rel="noopener noreferrer"
                  className="lupa-premium-button lupa-premium-button-outline">
                  Abrir publicação <ArrowUpRight size={16} aria-hidden="true"/>
                </a>
              </div>
            </article>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="muscle-causal-heading">
          <p className="lupa-premium-kicker">02 / Limites entre estudos</p>
          <h2 id="muscle-causal-heading" className="lupa-premium-text mt-2 text-3xl font-extrabold">A lacuna causal do projeto</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[#53645b]">
            É possível estudar as partes separadamente. Isso não prova automaticamente a cadeia completa.
          </p>
          <div className="lupa-dashboard-card mt-5 p-5 sm:p-7">
            <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
              <div className="rounded-2xl bg-[#edf2ff] p-5">
                <span className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#4265b3]">E04</span>
                <h3 className="mt-2 text-base font-extrabold text-[#284884]">Tratamento e DXA</h3>
                <p className="mt-2 text-xs leading-6 text-[#3a587a]">Composição corporal observada no SURMOUNT-1.</p>
              </div>
              <div className="flex items-center justify-center text-[#bd9258]">
                <span className="rounded-full bg-[#fff6e7] p-2"><CircleAlert size={21} aria-label="Ligação ainda não demonstrada"/></span>
              </div>
              <div className="rounded-2xl bg-[#fff8ee] p-5">
                <span className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#845820]">Lacuna</span>
                <h3 className="mt-2 text-base font-extrabold text-[#6a543b]">Força, função e causalidade</h3>
                <p className="mt-2 text-xs leading-6 text-[#69543c]">Medições e seguimento necessários para ligar os desfechos.</p>
              </div>
              <div className="flex items-center justify-center text-[#bd9258]">
                <span className="rounded-full bg-[#fff6e7] p-2"><CircleAlert size={21} aria-label="Ligação ainda não demonstrada"/></span>
              </div>
              <div className="rounded-2xl bg-[#eaf8f4] p-5">
                <span className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#166c65]">E12</span>
                <h3 className="mt-2 text-base font-extrabold text-[#246b64]">UTI e mortalidade</h3>
                <p className="mt-2 text-xs leading-6 text-[#3d655e]">Associação de massa muscular por TC em pacientes críticos.</p>
              </div>
            </div>
            <div className="mt-5 flex gap-3 rounded-2xl border border-[#e5d9bb] bg-[#fffaef] p-4">
              <Network size={20} className="mt-0.5 shrink-0 text-[#986a30]" aria-hidden="true"/>
              <div>
                <p className="text-sm font-extrabold text-[#73542c]">{causal.message}</p>
                <p className="mt-2 text-xs leading-6 text-[#796952]">
                  Não somamos amostras, odds ratios ou frações de massa magra de publicações distintas.
                </p>
              </div>
            </div>
            <details className="mt-4 rounded-2xl border border-[#e5eaf3] bg-[#f8fafd] px-4 py-3">
              <summary className="min-h-10 cursor-pointer text-[13px] font-extrabold text-[#355da6]">O que seria necessário investigar?</summary>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[13px] leading-6 text-[#5e728c]">
                {causal.missing.map(item=><li key={item}>{item}</li>)}
              </ul>
            </details>
          </div>
        </section>

        <section id="estudos" className="mt-12 scroll-mt-28" aria-labelledby="evidence-muscle-heading">
          <p className="lupa-premium-kicker">03 / Evidências originais</p>
          <h2 id="evidence-muscle-heading" className="lupa-premium-text mt-2 text-3xl font-extrabold">O que os estudos registraram</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[#53645b]">
            O gráfico abaixo é exclusivamente do subestudo DXA (E04). As medidas em UTI são de uma população diferente.
          </p>
          <div className="mt-5">
            <MetricChart metric={dxa}/>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <article className="lupa-dashboard-card p-6 sm:p-7">
              <p className="lupa-premium-kicker">EWGSOP2 · PMID 30312372</p>
              <h3 className="mt-2 text-xl font-extrabold text-[#23405d]">Sarcopenia envolve função, não apenas massa</h3>
              <p className="mt-3 text-sm leading-7 text-[#61778c]">Baixa força muscular é central no consenso, com quantidade/qualidade e desempenho físico como dimensões complementares. Percentual de massa magra isolado não é diagnóstico.</p>
              <a href="https://pubmed.ncbi.nlm.nih.gov/30312372/" target="_blank" rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-[#315ed2] hover:underline">
                Consultar consenso <ArrowUpRight size={16} aria-hidden="true"/>
              </a>
            </article>
            <article className="lupa-dashboard-card p-6 sm:p-7">
              <p className="lupa-premium-kicker">UTI · PMID 40462133</p>
              <h3 className="mt-2 text-xl font-extrabold text-[#23405d]">Associação observada em pacientes críticos</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-xl bg-[#edf2ff] px-3 py-2 text-sm font-extrabold text-[#365cc1]">OR 2,33 · curto prazo</span>
                <span className="rounded-xl bg-[#e9f8f4] px-3 py-2 text-sm font-extrabold text-[#086b63]">OR 2,67 · longo prazo</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[#61778c]">Metanálise de 35 estudos e 9.366 pacientes. OR significa razão de chances, não porcentagem absoluta de mortalidade. A exposição a medicamentos para emagrecimento não foi o objeto deste estudo.</p>
              <a href="https://pubmed.ncbi.nlm.nih.gov/40462133/" target="_blank" rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-[#315ed2] hover:underline">
                Consultar metanálise <ArrowUpRight size={16} aria-hidden="true"/>
              </a>
            </article>
          </div>
        </section>

        <div className="mt-9 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dbe7f6] bg-[#eef4ff] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Stethoscope size={22} className="mt-0.5 shrink-0 text-[#315ed1]" aria-hidden="true"/>
            <div>
              <h3 className="text-sm font-extrabold text-[#2c4b7e]">Compare as publicações sem combinar resultados</h3>
              <p className="mt-1 text-xs leading-6 text-[#435f83]">O Comparador abre por padrão E04 e E12 e mostra as incompatibilidades.</p>
            </div>
          </div>
          <Link href="/comparar" className="lupa-premium-button lupa-premium-button-primary">
            Abrir Comparador <ArrowRight size={17} aria-hidden="true"/>
          </Link>
        </div>
        <p className="mt-8 flex items-center gap-2 text-xs leading-6 text-[#53645b]"><Brain size={16} aria-hidden="true"/> Ferramenta educacional e de pesquisa; não oferece diagnóstico ou previsão de risco individual.</p>
      </div>
    </div>
  );
}
