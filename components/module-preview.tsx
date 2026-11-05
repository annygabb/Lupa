import Link from "next/link";
import { ArrowLeft, CircleDot, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export function ModulePreview({eyebrow,title,description,objectives}:{
  eyebrow:string;title:string;description:string;objectives:string[]
}) {
  return <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs text-muted-foreground"><CircleDot size={12} className="text-primary"/> Etapa 1 — estrutura inicial</div>
    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
    <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
    <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">{description}</p>
    <Card className="mt-10 max-w-3xl"><CardContent>
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><Info size={18} className="text-primary"/> O que será implementado nesta seção</div>
      <ul className="space-y-3">{objectives.map(text=><li key={text} className="flex gap-3 text-sm leading-6 text-muted-foreground"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"/>{text}</li>)}</ul>
      <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">Nenhuma informação clínica é calculada ou simulada nesta etapa. Os módulos são estruturas de navegação, não funcionalidades concluídas.</p>
    </CardContent></Card>
    <div className="mt-8"><Button asChild variant="outline"><Link href="/"><ArrowLeft size={16}/> Voltar ao início</Link></Button></div>
  </div>;
}
