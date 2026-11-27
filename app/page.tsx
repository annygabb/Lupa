import Image from "next/image";
import Link from "next/link";
import { AtlasHero } from "@/components/atlas/hero";
import { HeadlineMarquee } from "@/components/atlas/headline-marquee";
import { LensHeadlines } from "@/components/atlas/lens-headlines";
import { CompositionScrolly } from "@/components/atlas/composition-scrolly";
import { ConclusionChain } from "@/components/atlas/conclusion-chain";
import { ArchiveField } from "@/components/atlas/archive-field";
import { PlatesIndex } from "@/components/atlas/plates-index";
import { ChapterBar } from "@/components/atlas/chapter-bar";
import { ClinicalChart } from "@/components/insights/clinical-chart";
import { Cutout, Magnetic, SplitTitle } from "@/components/atlas/motion";

export default function Home() {
  return (
    <div className="at-home">
      <ChapterBar/>
      <AtlasHero/>
      <HeadlineMarquee/>

      <section className="at-purpose" aria-labelledby="purpose-title">
        <Cutout name="ginkgo" depth={0.7} rotate={12} width={150} className="at-purpose__cut"/>
        <p className="at-kicker">Por que o LUPA existe</p>
        <SplitTitle id="purpose-title" lines={["Entre a promessa de emagrecer", "e a decisão de cuidar,", <span key="c" className="at-purpose__accent">falta contexto.</span>]}/>
        <figure className="at-purpose__fig">
          <Image src="/assets/images/cianotipia/balanca-1.webp" alt="Cianotipia de uma balança de banheiro antiga vista de cima, entre folhas e comprimidos" fill sizes="(max-width: 900px) 70vw, 28vw"/>
          <figcaption className="at-mono">Fig. 2 — A balança mostra o peso. Não mostra o resto.</figcaption>
        </figure>
        <p>Reunimos benefícios, cuidados e lacunas das pesquisas para apoiar uma conversa mais informada com a equipe de saúde. Cada número traz quem foi estudado, por quanto tempo e de onde ele vem.</p>
      </section>

      <LensHeadlines/>
      <CompositionScrolly/>

      <section id="beneficios" className="at-benefits" data-chapter="Benefícios e cuidados" aria-labelledby="benefits-title">
        <div className="at-benefits__head">
          <header className="at-sec-head">
            <p className="at-kicker">Capítulo III · Benefícios e pontos de atenção</p>
            <SplitTitle id="benefits-title" lines={["Mais de uma", "dimensão de cuidado."]}/>
            <p>Escolha uma pergunta. Veja o resultado, a população e a fonte.</p>
          </header>
          <figure className="at-benefits__fig">
            <Image src="/assets/images/cianotipia/coracao.webp" alt="Cianotipia de um coração anatômico cujos vasos se ramificam como samambaias" fill sizes="(max-width: 900px) 60vw, 26vw"/>
          </figure>
        </div>
        <div className="at-benefits__chart"><ClinicalChart/></div>
        <div className="at-benefits__balance">
          <article><h3>O que pode melhorar</h3><p>Há benefícios sobre peso e, em populações específicas, sobre eventos cardiovasculares. O gráfico do SELECT mostra um desses resultados.</p></article>
          <article><h3>O que pede atenção</h3><p>Perda de massa magra, reganho após a retirada e tolerabilidade fazem parte da avaliação. Na revisão de doenças biliares, o RR foi 1,37 (IC95% 1,23–1,52).</p>
            <a className="at-link at-mono" href="https://pubmed.ncbi.nlm.nih.gov/35344001/" target="_blank" rel="noopener noreferrer">76 ensaios · 103.371 participantes ↗</a></article>
          <article><h3>O que o LUPA entrega</h3><p>Benefício e cuidado lidos juntos, associação separada de causa, e um aviso claro quando ainda não é possível concluir.</p>
            <Link className="at-link at-mono" href="/metodologia">Como avaliamos as evidências →</Link></article>
        </div>
      </section>

      <ConclusionChain/>
      <ArchiveField/>
      <PlatesIndex/>

      <section className="at-closing" data-chapter="Uma lacuna também é resposta" aria-labelledby="closing-title">
        <div className="at-closing__art" aria-hidden="true">
          <Image src="/assets/images/cianotipia/sementes.webp" alt="" fill sizes="100vw"/>
        </div>
        <Cutout name="samambaia-alta" white depth={0.8} rotate={-8} width={190} className="at-closing__cut"/>
        <div className="at-closing__copy">
          <SplitTitle id="closing-title" lines={["Uma conclusão útil", "também sabe", "reconhecer uma lacuna."]}/>
          <p>O LUPA não indica medicamentos, não diagnostica e não calcula risco individual. Ele mostra o que os estudos mediram e onde a leitura precisa parar.</p>
          <div className="at-hero__actions">
            <Magnetic><Link className="at-btn at-btn--light" href="/comparar">Comparar dois estudos</Link></Magnetic>
            <Magnetic><Link className="at-btn at-btn--line" href="/experiencias">Experimentar o LUPA →</Link></Magnetic>
            <Magnetic><Link className="at-btn at-btn--ghost" href="/metodologia">Conhecer o método e os limites</Link></Magnetic>
          </div>
        </div>
      </section>
    </div>
  );
}
