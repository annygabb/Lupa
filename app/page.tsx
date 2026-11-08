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

export default function Home() {
  return (
    <div className="at-home">
      <ChapterBar/>
      <AtlasHero/>
      <HeadlineMarquee/>

      <section className="at-purpose" aria-labelledby="purpose-title">
        <p className="at-kicker">Por que o LUPA existe</p>
        <h2 id="purpose-title">Entre a promessa de emagrecer e a decisão de cuidar, <span>falta contexto.</span></h2>
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
            <p className="at-kicker">Prancha 00.5 · Benefícios e pontos de atenção</p>
            <h2 id="benefits-title">Mais de uma dimensão de cuidado.</h2>
            <p>Escolha uma pergunta. Veja o resultado, a população e a fonte.</p>
          </header>
          <figure className="at-benefits__fig">
            <Image src="/assets/images/cianotipia/coracao.webp" alt="Cianotipia de um coração anatômico cujos vasos se ramificam como samambaias" fill sizes="(max-width: 900px) 60vw, 26vw"/>
          </figure>
        </div>
        <div className="at-benefits__chart"><ClinicalChart/></div>
        <div className="at-benefits__balance">
          <article><h3>O que pode melhorar</h3><p>Há benefícios sobre peso e, em populações específicas, sobre eventos cardiovasculares. O gráfico do SELECT mostra um desses resultados.</p></article>
          <article><div className="at-benefits__mini" aria-hidden="true"><Image src="/assets/images/cianotipia/orgaos-1.webp" alt="" fill sizes="120px"/></div><h3>O que pede atenção</h3><p>Perda de massa magra, reganho após a retirada e tolerabilidade fazem parte da avaliação. Na revisão de doenças biliares, o RR foi 1,37 (IC95% 1,23–1,52).</p>
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
        <div className="at-closing__copy">
          <h2 id="closing-title">Uma conclusão útil também sabe reconhecer uma lacuna.</h2>
          <p>O LUPA não indica medicamentos, não diagnostica e não calcula risco individual. Ele mostra o que os estudos mediram e onde a leitura precisa parar.</p>
          <div className="at-hero__actions">
            <Link className="at-btn at-btn--light" href="/comparar">Comparar dois estudos</Link>
            <Link className="at-btn at-btn--ghost" href="/metodologia">Conhecer o método e os limites</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
