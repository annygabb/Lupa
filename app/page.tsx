import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BookOpen, BookOpenCheck, ChartNoAxesCombined,
  FlaskConical, HeartPulse, Layers3, LockKeyhole, ShieldCheck,
} from "lucide-react";
import { SourceSpotlight } from "@/components/home/source-spotlight";

const available=[
  {href:"/evidencias",title:"Explorar evidências",number:"01",icon:BookOpen,
   summary:"Estudos, fontes originais e limites de cada conclusão.",tag:"Biblioteca científica",
   color:"from-[#eef3ff] to-white",accent:"#315ff4"},
  {href:"/comparar",title:"Comparar estudos",number:"02",icon:Layers3,
   summary:"Contexto lado a lado e indicadores avaliados dentro de cada publicação.",tag:"Research Studio",
   color:"from-[#edfaf7] to-white",accent:"#087468"},
  {href:"/musculos-uti",title:"Músculos e UTI",number:"03",icon:HeartPulse,
   summary:"Investigação guiada de composição corporal, sarcopenia e lacunas de causalidade.",tag:"Investigação crítica",
   color:"from-[#fff8ec] to-white",accent:"#865419"},
  {href:"/projecoes",title:"Cenários para 2031 e 2036",number:"04",icon:ChartNoAxesCombined,
   summary:"Simule taxas hipotéticas de acesso e continuidade; exporte premissas e resultados.",tag:"Simulador reproduzível",
   color:"from-[#f2f0ff] to-white",accent:"#755abd"},
] as const;

export default function Home() {
  return (
    <div className="lupa-studio min-h-screen">
      <div className="mx-auto max-w-[1480px] px-4 pb-20 pt-6 sm:px-6 sm:pt-9 lg:px-9">
        <section className="lupa-dashboard-card overflow-hidden p-3 sm:p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(370px,.85fr)]">
            <div className="flex flex-col justify-center px-4 py-8 sm:px-8 sm:py-12">
              <p className="lupa-premium-kicker">LUPA Saúde / Evidence intelligence</p>
              <h1 className="lupa-premium-text mt-4 max-w-3xl text-[clamp(2.2rem,4.1vw,4rem)] font-extrabold leading-[1.04]">
                Evidência antes da conclusão.
                <span className="block text-[#315ff4]">Veja o que os estudos realmente mediram.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-[15px] leading-8 text-[#5f728a] sm:text-[16px]">
                Consulte 50 registros científicos em curadoria, compare métodos e examine cinco indicadores conferidos nas publicações. O LUPA separa resultados observados de hipóteses sobre o futuro.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/evidencias" className="lupa-premium-button lupa-premium-button-primary">
                  Explorar biblioteca <ArrowRight size={17} aria-hidden="true"/>
                </Link>
                <Link href="/comparar" className="lupa-premium-button lupa-premium-button-outline">
                  Abrir Research Studio <ArrowUpRight size={17} aria-hidden="true"/>
                </Link>
              </div>
              <p className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#4b647e]">
                <ShieldCheck size={16} className="text-[#0e998d]" aria-hidden="true"/>
                MVP científico · Sem diagnósticos ou extrapolações automáticas
              </p>
            </div>
            <SourceSpotlight/>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Panorama do acervo">
          {[
            {value:"50",label:"Referências únicas",icon:BookOpen,color:"bg-[#edf2ff] text-[#315ff4]"},
            {value:"55",label:"IDs de origem, incluindo aliases",icon:BookOpenCheck,color:"bg-[#e6f9f4] text-[#0b8f84]"},
            {value:"05",label:"Indicadores conferidos",icon:FlaskConical,color:"bg-[#f1efff] text-[#7654bc]"},
            {value:"00",label:"Projeções clínicas liberadas",icon:LockKeyhole,color:"bg-[#fff4e6] text-[#b77b35]"},
          ].map(card=>{
            const Icon=card.icon;
            return (
              <div key={card.label} className="lupa-dashboard-card lupa-dash-hover flex items-center gap-4 p-5">
                <span className={"flex size-12 shrink-0 items-center justify-center rounded-2xl "+card.color}>
                  <Icon size={22} aria-hidden="true"/>
                </span>
                <div>
                  <p className="lupa-metric-ink text-[31px] font-extrabold text-[#203653]">{card.value}</p>
                  <p className="text-xs font-semibold text-[#4f657e]">{card.label}</p>
                </div>
              </div>
            );
          })}
        </section>

        <section className="mt-13" aria-labelledby="modules-title">
          <p className="lupa-premium-kicker">Um espaço para investigar</p>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="modules-title" className="lupa-premium-text mt-2 text-[28px] font-extrabold sm:text-[36px]">
                Escolha como começar
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#687c94]">Os quatro módulos funcionais do MVP, com limites científicos identificados.</p>
            </div>
            <Link href="/metodologia" className="inline-flex min-h-11 items-center gap-2 text-[13px] font-bold text-[#315bd3] hover:underline">
              Nosso método <ArrowUpRight size={17} aria-hidden="true"/>
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {available.map(card=>{
              const Icon=card.icon;
              return (
                <Link href={card.href} key={card.href}
                  className={"lupa-dashboard-card lupa-dash-hover relative min-h-[230px] overflow-hidden bg-gradient-to-br p-6 sm:p-7 "+card.color}>
                  <span className="pointer-events-none absolute -right-10 -top-14 size-52 rounded-full border-[24px] border-[#7197ee]/10" aria-hidden="true"/>
                  <div className="relative flex items-center justify-between">
                    <span className="flex size-13 items-center justify-center rounded-2xl bg-white shadow-sm"
                      style={{color:card.accent}}>
                      <Icon size={26} aria-hidden="true"/>
                    </span>
                    <span className="text-xs font-extrabold tracking-[.1em] text-[#536780]">{card.number}</span>
                  </div>
                  <div className="relative mt-7">
                    <p className="text-[11px] font-extrabold uppercase tracking-[.13em]" style={{color:card.accent}}>{card.tag}</p>
                    <h3 className="mt-2 text-[24px] font-extrabold tracking-[-.04em] text-[#203653]">{card.title}</h3>
                    <p className="mt-2 max-w-lg text-[14px] leading-6 text-[#61768f]">{card.summary}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold" style={{color:card.accent}}>
                      Abrir ferramenta <ArrowRight size={17} aria-hidden="true"/>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

        </section>
      </div>
    </div>
  );
}
