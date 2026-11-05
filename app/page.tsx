import Link from "next/link";
import {
  Activity, ArrowRight, ArrowUpRight, BookOpenText, ChartNoAxesCombined,
  CheckCircle2, CircleDashed, HeartPulse, Layers3, ShieldCheck,
} from "lucide-react";

const modules=[
  {
    href:"/evidencias",title:"Explorador científico",tag:"Disponível",ready:true,
    body:"Pesquise 50 referências consolidadas, com fontes originais, limites e curadoria identificada.",
    icon:BookOpenText,number:"01",accent:"bg-[#e8f5f2] text-[#0f766e]",
  },
  {
    href:"/comparar",title:"Comparador de estudos",tag:"Disponível",ready:true,
    body:"Analise estudos lado a lado e consulte cinco indicadores de fontes conferidas, sem combinar efeitos indevidos.",
    icon:Layers3,number:"02",accent:"bg-[#edf3ff] text-[#2563eb]",
  },
  {
    href:"/musculos-uti",title:"Músculos e UTI",tag:"Em planejamento",ready:false,
    body:"Investigue reserva muscular, sarcopenia e relações científicas ainda não demonstradas.",
    icon:HeartPulse,number:"03",accent:"bg-[#fff7ed] text-[#a66d17]",
  },
  {
    href:"/projecoes",title:"Cenários populacionais",tag:"Em planejamento",ready:false,
    body:"Conheça a proposta de cenários transparentes para 2031 e 2036, ainda sem simulações liberadas.",
    icon:ChartNoAxesCombined,number:"04",accent:"bg-[#f2f1ff] text-[#6651b5]",
  },
] as const;

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <section className="relative mt-7 overflow-hidden rounded-[30px] border border-[#e0e8f1] bg-gradient-to-br from-white via-white to-[#f0f6ff] px-6 py-10 shadow-[0_16px_48px_rgba(20,47,76,.045)] sm:mt-10 sm:px-10 sm:py-14">
        <span className="pointer-events-none absolute -right-24 -top-32 size-96 rounded-full border-[44px] border-[#edf3ff]/75" aria-hidden="true"/>
        <div className="relative grid items-center gap-9 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#d5e8e4] bg-[#f5faf9] px-3 py-2 text-xs font-bold text-primary">
              <ShieldCheck size={16} aria-hidden="true"/> Evidência com rastreabilidade
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-[-.05em] sm:text-6xl">
              Ciência em saúde,{" "}
              <span className="text-primary">sem perder o contexto.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
              O LUPA organiza pesquisas sobre medicamentos para emagrecimento, saúde mental
              e composição muscular. Cada resultado vem acompanhado de origem, limitações
              e avisos sobre o que ainda não pode ser concluído.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/evidencias" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0b625c]">
                Explorar evidências <ArrowRight size={18} aria-hidden="true"/>
              </Link>
              <Link href="/comparar" className="lupa-button-secondary min-h-12">
                Comparar pesquisas <ArrowUpRight size={16} aria-hidden="true"/>
              </Link>
            </div>
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              MVP de investigação científica · Não oferece diagnóstico, prescrição ou projeções clínicas automatizadas.
            </p>
          </div>

          <aside className="lupa-surface relative p-5 sm:p-6" aria-label="Painel de evolução científica">
            <div className="flex items-center justify-between">
              <div>
                <p className="lupa-section-kicker">Visão geral</p>
                <h2 className="mt-1 text-lg font-extrabold">Biblioteca LUPA</h2>
              </div>
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[#edf5ff] text-[#2563eb]">
                <Activity size={21} aria-hidden="true"/>
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="lupa-inner-surface p-4">
                <p className="text-3xl font-extrabold tracking-tight tabular-nums">50</p>
                <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">Referências canônicas</p>
              </div>
              <div className="lupa-inner-surface p-4">
                <p className="text-3xl font-extrabold tracking-tight tabular-nums">5</p>
                <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">Indicadores documentais</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[#42576b]">Catálogo local</span>
                <span className="flex items-center gap-1 font-bold text-primary">
                  <CheckCircle2 size={14} aria-hidden="true"/> Implementado
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#e5ecf3]"><div className="h-full w-full rounded-full bg-[#0f766e]"/></div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[#42576b]">Projeções populacionais</span>
                <span className="flex items-center gap-1 font-bold text-[#8b6c3c]">
                  <CircleDashed size={14} aria-hidden="true"/> Não liberadas
                </span>
              </div>
              <p className="border-t border-border pt-3 text-xs leading-6 text-muted-foreground">
                A revisão clínica independente dos resultados ainda é necessária antes de qualquer projeção.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-14 sm:mt-18" aria-labelledby="modules-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="lupa-section-kicker">Áreas de pesquisa</p>
            <h2 id="modules-heading" className="mt-2 text-2xl font-extrabold tracking-[-.03em] sm:text-3xl">
              Explore a plataforma
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ferramentas disponíveis e módulos ainda em desenvolvimento.
            </p>
          </div>
          <Link href="/metodologia" className="inline-flex min-h-10 items-center gap-1 text-sm font-bold text-primary underline-offset-4 hover:underline">
            Ver metodologia <ArrowUpRight size={16} aria-hidden="true"/>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map(module=>{
            const Icon=module.icon;
            return (
              <Link key={module.href} href={module.href}
                className="group lupa-surface flex min-h-[285px] flex-col p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#c9d5e2] sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className={"flex size-11 items-center justify-center rounded-2xl "+module.accent}>
                    <Icon size={21} aria-hidden="true"/>
                  </span>
                  <span className="text-xs font-bold text-[#9aa5b3]">{module.number}</span>
                </div>
                <span className={"mt-5 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold "+
                  (module.ready?"bg-[#e9f7f2] text-[#126f5f]":"bg-[#f2f5f8] text-[#687785]")}>
                  {module.ready?<CheckCircle2 size={13} aria-hidden="true"/>:<CircleDashed size={13} aria-hidden="true"/>}
                  {module.tag}
                </span>
                <h3 className="mt-3 text-lg font-extrabold tracking-[-.02em]">{module.title}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-6 text-muted-foreground">{module.body}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  {module.ready?"Abrir módulo":"Ver proposta"} <ArrowRight size={16} aria-hidden="true"/>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
