import Link from "next/link";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { ArrowUpRight } from "lucide-react";

export function WeightComposition(){
  return <aside className="composition" aria-label="Do que foi composto o peso perdido no SURMOUNT-1">
    <div className="composition-top"><span>Em foco / composição corporal</span><span>SURMOUNT-1</span></div>
    <h2>O peso caiu.<br/>O que foi perdido?</h2>
    <p>De cada 100 partes do peso perdido, aproximadamente:</p>
    <div className="composition-values"><div><strong><AnimatedNumber value={75}/><span>%</span></strong><span>eram gordura</span></div><div><strong><AnimatedNumber value={25}/><span>%</span></strong><span>eram massa magra</span></div></div>
    <div className="composition-bar" role="img" aria-label="Aproximadamente 75% do peso perdido foi gordura e 25% foi massa magra"><span/><span/></div>
    <p className="composition-note">25% do <strong>peso perdido</strong>, não 25% dos músculos. Massa magra também inclui água, órgãos e outros tecidos.</p>
    <div className="composition-source"><span>160 participantes · DXA · 72 semanas<br/>Proporção aproximada em ambos os grupos</span><Link href="/evidencias/E04" aria-label="Ver estudo de composição corporal"><ArrowUpRight size={24} aria-hidden="true"/></Link></div>
  </aside>;
}
