import Link from "next/link";
import { ArrowRight, BookOpenText, ChartNoAxesCombined, HeartPulse, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
const modules = [
  {href:"/evidencias",title:"Explorador de evidências",body:"Estudos, amostras, resultados, comparadores e fontes verificáveis.",icon:BookOpenText},
  {href:"/projecoes",title:"Cenários populacionais",body:"Hipóteses transparentes para o Brasil em 2031 e 2036.",icon:ChartNoAxesCombined},
  {href:"/musculos-uti",title:"Músculos e UTI",body:"Composição corporal, reserva muscular e limites da evidência.",icon:HeartPulse},
];
export default function Home() {
  return <div className="mx-auto max-w-6xl px-4 sm:px-6">
    <section className="relative py-16 sm:py-24">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#b8dcd9] bg-muted px-3 py-1 text-xs font-semibold text-primary"><ShieldCheck size={14} aria-hidden="true"/> Ciência com rastreabilidade</div>
      <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Evidências para entender a saúde. <span className="text-primary">Cenários para enxergar o futuro.</span></h1>
      <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">O LUPA Saúde organiza estudos sobre medicamentos para emagrecimento, composição corporal e cuidados intensivos. Separa resultados observados de hipóteses e mostra os limites de cada conclusão.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg"><Link href="/evidencias">Conhecer o explorador <ArrowRight size={17}/></Link></Button>
        <Button asChild variant="outline" size="lg"><Link href="/metodologia">Entender a metodologia</Link></Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Fundação técnica em desenvolvimento. Sem dados clínicos individuais e sem diagnósticos automatizados.</p>
    </section>
    <section className="border-t border-border py-12 sm:py-16" aria-labelledby="modulos">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Jornada científica</p><h2 id="modulos" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Três frentes, uma mesma evidência</h2></div>
        <span className="text-xs text-muted-foreground">Módulos planejados · Etapa 1</span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">{modules.map(({href,title,body,icon:Icon})=>
        <Link key={href} href={href} className="group rounded-2xl focus-visible:outline-2">
          <Card className="h-full transition-colors group-hover:border-[#9acac8]"><CardContent>
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-muted text-primary"><Icon size={22}/></span>
            <h3 className="mt-5 text-lg font-semibold">{title}</h3>
            <p className="mt-3 min-h-16 text-sm leading-6 text-muted-foreground">{body}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">Ver escopo <ArrowRight size={16}/></span>
          </CardContent></Card>
        </Link>
      )}</div>
    </section>
  </div>;
}
