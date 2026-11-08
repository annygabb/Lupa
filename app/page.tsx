import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { WeightComposition } from "@/components/home/weight-composition";
import { ClinicalChart } from "@/components/insights/clinical-chart";

const paths=[
 {n:"01",href:"/evidencias",title:"Uma manchete não conta o estudo inteiro",pain:"Um resultado impressiona, mas nem sempre diz em quem foi medido.",value:"Veja a população, o método e a fonte antes de usar a conclusão.",action:"Consultar estudos sobre medicamentos para emagrecimento"},
 {n:"02",href:"/comparar",title:"Números parecidos podem medir coisas diferentes",pain:"Massa magra, força e risco de morte não são a mesma medida.",value:"Compare dois estudos e entenda por que algumas conclusões não podem ser combinadas.",action:"Verificar uma comparação"},
 {n:"03",href:"/musculos-uti",title:"A balança não mostra toda a saúde muscular",pain:"A composição corporal merece atenção além dos quilos perdidos.",value:"Explore o que sabemos sobre massa magra e cuidados críticos, com as ligações ainda não demonstradas.",action:"Entender músculos e UTI"},
 {n:"04",href:"/projecoes",title:"O futuro depende de acesso e continuidade",pain:"Ter um medicamento disponível é diferente de manter o tratamento.",value:"Examine Brasil e EUA, identifique lacunas e teste cenários de acesso até 2041.",action:"Explorar Brasil × EUA"},
];

export default function Home(){
 return <div className="lupa-editorial">
  <section className="editorial-hero">
   <div className="hero-copy">
    <p className="eyebrow">LUPA Saúde · Ciência para cuidar melhor</p>
    <h1>Canetas para emagrecer.<br/><span>O que muda além do peso?</span></h1>
    <p className="hero-description">Pesquisas sobre semaglutida e tirzepatida, explicadas para entender <strong>benefícios, riscos e o que ainda não sabemos</strong>.</p>
    <p className="hero-audience">Para profissionais de saúde, estudantes e pessoas que querem compreender o tratamento.</p>
    <div className="hero-actions"><a className="editorial-button" href="#beneficios">Entender benefícios e cuidados <ArrowRight size={18} aria-hidden="true"/></a><Link className="text-link" href="/evidencias">Consultar estudos <ArrowUpRight size={16} aria-hidden="true"/></Link></div>
   </div>
   <figure className="injection-visual"><Image src="/images/canetas-3d-azul.webp" alt="Ilustração 3D de duas canetas injetoras genéricas, nas cores branco e azul" width={1200} height={800} priority sizes="(max-width: 600px) 100vw, 48vw"/><figcaption>O tratamento vai além da aplicação.<br/><span>Ilustração de canetas genéricas, sem marca.</span></figcaption></figure>
  </section>
  <div className="editorial-purpose"><p>Por que o LUPA existe</p><h2>Entre a promessa de emagrecer e a decisão de cuidar, falta contexto.</h2><p>Reunimos benefícios, cuidados e lacunas das pesquisas para apoiar uma conversa mais informada com a equipe de saúde.</p></div>
  <section className="composition-section" aria-label="Composição do peso perdido"><WeightComposition/><div><p className="eyebrow">Uma pergunta que a balança não responde</p><h2>Acompanhar vai além<br/>dos quilos perdidos.</h2><p>A balança mostra o peso. A composição corporal ajuda a entender o que mudou.</p><Link className="text-link" href="/musculos-uti">Entender a saúde muscular <ArrowRight size={18} aria-hidden="true"/></Link></div></section>
  <section id="beneficios" className="editorial-section" aria-labelledby="benefits-heading">
   <div className="section-intro"><div><p className="eyebrow">Benefícios e pontos de atenção</p><h2 id="benefits-heading">Tratamentos para emagrecer.<br/>Mais de uma dimensão de cuidado.</h2></div><p>Escolha uma pergunta. Veja o resultado, a população e a fonte.</p></div>
   <ClinicalChart/>
   <div className="benefit-balance"><div><h3>O que pode melhorar</h3><p>Há benefícios sobre peso e, em populações específicas, eventos cardiovasculares. O gráfico do SELECT mostra um desses resultados.</p></div><div><h3>O que pede atenção</h3><p>Perda de massa magra, reganho após retirada e tolerabilidade fazem parte da avaliação. Na revisão de doenças biliares, o RR foi 1,37 (IC95% 1,23–1,52).</p><a className="text-link" href="https://pubmed.ncbi.nlm.nih.gov/35344001/" target="_blank" rel="noopener noreferrer">76 ensaios · 103.371 participantes <ArrowUpRight size={16} aria-hidden="true"/></a></div><div><h3>O que o LUPA entrega</h3><p>Uma leitura que mostra benefício e cuidado juntos, distingue associação de causa e indica quando ainda não é possível concluir.</p><Link className="text-link" href="/metodologia">Como avaliamos as evidências <ArrowUpRight size={16} aria-hidden="true"/></Link></div></div>
  </section>
  <section className="editorial-section" aria-labelledby="paths-heading">
   <div className="section-intro"><div><p className="eyebrow">Da dúvida à fonte</p><h2 id="paths-heading">Qual pergunta trouxe você aqui?</h2></div><p>Comece pelo problema que precisa entender. As ferramentas ajudam a conferir a resposta.</p></div>
   <div className="research-paths">{paths.map(p=><article key={p.n}><span className="path-number">{p.n}</span><div><h3>{p.title}</h3><p>{p.value}</p><Link className="text-link" href={p.href}>{p.action}<ArrowRight size={18} aria-hidden="true"/></Link></div></article>)}</div>
  </section>
  <section className="mental-invitation"><p className="eyebrow">Corpo, emoções e contexto</p><h2>E como fica a saúde mental?</h2><p>Sintomas, bem-estar e relação com o corpo merecem uma leitura cuidadosa. Entenda o que os estudos mediram e quem participou.</p><Link className="editorial-button" href="/saude-mental">Entender as evidências de saúde mental <ArrowRight size={18} aria-hidden="true"/></Link></section>
  <section className="editorial-closing"><h2>Uma conclusão útil também sabe reconhecer uma lacuna.</h2><div><p>O objetivo é melhorar a compreensão das evidências. O LUPA não indica medicamentos, não diagnostica e não calcula risco individual.</p><details className="source-details"><summary>Acervo e revisão científica</summary><p>Acervo: 50 referências únicas em curadoria. Os registros e gráficos não passaram por revisão clínica independente.</p></details><Link className="text-link" href="/metodologia">Conhecer o método e os limites <ArrowUpRight size={16} aria-hidden="true"/></Link></div></section>
 </div>;
}
