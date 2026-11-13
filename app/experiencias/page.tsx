import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "../experiencias.css";
export const metadata:Metadata={title:"Explore o LUPA | experiências científicas",description:"Aprenda a interpretar evidências, investigue cenários e monte um dossiê científico."};
const destinations=[
 {href:"/corpo-evidencia",title:"Corpo & Evidência",description:"Entenda o que significa perder massa gorda e massa magra — e onde a hipótese sobre UTI precisa parar.",image:"/assets/images/cianotipia/corpo-composicao.webp"},
 {href:"/relatos",title:"Reflexão voluntária",description:"Você utiliza medicamentos para emagrecimento? Quais sintomas percebe ou conhece? Demonstração privada, sem envio das respostas.",image:"/assets/images/cianotipia/cerebro.webp"},
 {href:"/desafio",title:"Desafio LUPA",description:"Responda perguntas e compare o que você sabe antes e depois de ler as evidências.",image:"/assets/images/cianotipia/cerebro.webp"},
 {href:"/impacto",title:"Laboratório de Impacto",description:"Compare cenários fictícios de acesso e continuidade até 2041, sem confundir com previsão.",image:"/assets/images/cianotipia/globo.webp"},
 {href:"/dossie",title:"Dossiê LUPA",description:"Organize uma investigação e exporte conclusões e fontes em um arquivo Markdown.",image:"/assets/images/cianotipia/estudos-1.webp"},
 {href:"/live",title:"LUPA Live",description:"Participe de uma investigação coletiva no celular com um código de evento.",image:"/assets/images/cianotipia/laboratorio-2.webp"},
] as const;
export default function Experiencias() {
 return <div className="lx"><div className="lx-main"><header className="lx-head">
  <p className="lx-kicker">Experimente · investigue · compreenda</p><h1>A ciência fica mais clara quando você participa.</h1>
  <p className="lx-lead">Escolha uma experiência. Cada resultado traz premissas, limites e fontes — não diagnósticos ou promessas sobre o seu corpo.</p>
 </header><div className="lx-cols-3">{destinations.map(d=><Link key={d.href} href={d.href} className="lx-panel lx-grid-card">
  <Image src={d.image} width={600} height={340} alt="" sizes="(max-width:640px) 100vw, (max-width:930px) 50vw, 32vw"/>
  <h2>{d.title}</h2><p>{d.description}</p><span className="lx-button">Explorar →</span>
 </Link>)}</div></div></div>;
}
