import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChapterHero, Section, Specimen, LimitNote, Reveal, Cutout, SplitTitle } from "@/components/atlas/ui";
import { DrawPath, Magnetic } from "@/components/atlas/motion";
import { ChapterBar } from "@/components/atlas/chapter-bar";
import { clinicalPlots } from "@/features/insights/evidence";
import { getReviewedMetric } from "@/features/comparison/reviewed-metrics";
import { PhqChart } from "@/components/routes/saude-mental/phq-chart";
import { ScaleLens } from "@/components/routes/saude-mental/scale-lens";
import "./mental.css";

export const metadata: Metadata = {
  title: "Saúde mental e medicamentos para emagrecimento",
  description: "O que estudos sobre semaglutida e tirzepatida mediram sobre sintomas depressivos, bem-estar e limites da evidência.",
};

const pct = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";

const readings = [
  {
    n: "01", title: "Não é “depressão causada”", cutout: "lupa",
    text: "Mudar de categoria em um questionário de sintomas não equivale a receber diagnóstico de depressão causada pelo tratamento.",
  },
  {
    n: "02", title: "Não é uma taxa nacional", cutout: "globo",
    text: "O resultado internacional não informa quantas pessoas no Brasil ou nos EUA terão ansiedade ou depressão em 2031.",
  },
  {
    n: "03", title: "Não encerra o acompanhamento", cutout: "dente-de-leao",
    text: "A história de saúde mental continua relevante. Mudanças emocionais durante o tratamento merecem conversa com a equipe que acompanha a pessoa.",
  },
] as const;

export default function MentalHealthPage() {
  const plot = clinicalPlots.find(p => p.id === "mental");
  const m05 = getReviewedMetric("M05");
  if (!plot || !m05) throw new Error("Dados de saúde mental não encontrados");
  const [tirz, placebo] = m05.arms;

  return (
    <div className="sm-page">
      <ChapterBar/>

      <div data-chapter="Emagrecer não resume">
        <ChapterHero
          n="04"
          kicker="Prancha 04 · Saúde mental · evidência e contexto"
          title={["Emagrecer não resume", "o que uma pessoa sente."]}
          lead={<p>Benefícios físicos, relação com o corpo e sintomas emocionais são perguntas diferentes. O LUPA ajuda a ler os resultados sem atribuir ao medicamento tudo o que acontece durante o tratamento.</p>}
          image="/assets/images/cianotipia/cerebro.webp"
          alt="Cianotipia de um cérebro humano com neurônios que crescem como raízes"
          cutouts={[
            { name: "dente-de-leao", className: "sm-cut sm-cut--hero-a", width: 170, depth: 0.7, rotate: -8 },
            { name: "semente-alada", className: "sm-cut sm-cut--hero-b", width: 120, depth: 1.1, rotate: 18 },
          ]}
        >
          <Magnetic><a className="at-btn at-btn--solid" href="#phq9">Ver o resultado do PHQ-9 <span aria-hidden="true">↓</span></a></Magnetic>
          <a className="at-btn at-btn--line" href="#leitura">Como ler na prática</a>
        </ChapterHero>
      </div>

      {/* Três perguntas, não uma */}
      <section className="sm-triad" data-chapter="Três perguntas" aria-labelledby="sm-triad-title">
        <h2 id="sm-triad-title" className="sr-only">Três perguntas diferentes</h2>
        <Reveal as="ol" className="sm-triad__list" stagger={0.12}>
          <li><span className="at-mono">Pergunta 1</span><strong>Benefícios físicos</strong></li>
          <li aria-hidden="true" className="sm-triad__ne">≠</li>
          <li><span className="at-mono">Pergunta 2</span><strong>Relação com o corpo</strong></li>
          <li aria-hidden="true" className="sm-triad__ne">≠</li>
          <li><span className="at-mono">Pergunta 3</span><strong>Sintomas emocionais</strong></li>
        </Reveal>
        <p className="sm-triad__note">Uma pesquisa pode responder bem a uma delas e não dizer nada sobre as outras.</p>
      </section>

      {/* O que os ensaios mostram + PHQ-9 */}
      <section id="phq9" className="sm-trials" data-chapter="O que os ensaios mostram" aria-labelledby="sm-trials-title">
        <div className="sm-trials__inner">
          <div className="sm-trials__head">
            <p className="at-kicker">01 · O que os ensaios mostram</p>
            <SplitTitle id="sm-trials-title" lines={["Nos grupos estudados,", "nenhum aumento identificado."]} className="sm-h2"/>
            <div className="sm-trials__intro">
              <p>As análises STEP e SURMOUNT não identificaram aumento de sintomas depressivos nos grupos estudados. Isso não garante o mesmo resultado em pessoas com condições psiquiátricas importantes, frequentemente excluídas dos ensaios.</p>
              <a className="sm-link" href="https://pubmed.ncbi.nlm.nih.gov/39226070/" target="_blank" rel="noopener noreferrer">Semaglutida · análise STEP <span aria-hidden="true">↗</span></a>
            </div>
          </div>

          <div className="sm-trials__specimens">
            <Specimen tone="ink" id={`${m05.id} · ${m05.evidenceId}`} label={`${tirz.label} · mudou para categoria PHQ-9 mais grave`} value={pct(tirz.value)} note="N por braço não informado no resumo"/>
            <Specimen tone="ink" id={`${m05.id} · ${m05.evidenceId}`} label={`${placebo.label} · mudou para categoria PHQ-9 mais grave`} value={pct(placebo.value)} note="N por braço não informado no resumo"/>
            <Specimen tone="ink" id="N total" label="Adultos em SURMOUNT-1/2/3" value={m05.analyzedN.toLocaleString("pt-BR")} note={m05.timeWindow}/>
          </div>

          <div className="sm-trials__grid">
            <PhqChart plot={plot} totalN={m05.analyzedN}/>
            <div className="sm-trials__side">
              <div className="sm-trials__finding">
                <p className="at-mono">O que isso mostra</p>
                <p>{plot.finding}</p>
              </div>
              <LimitNote>
                <p>{plot.limitation}</p>
                <p>Análise pós-hoc. O percentual não mede pressão estética, causalidade de transtornos psiquiátricos nem prevalência no Brasil.</p>
              </LimitNote>
              <details className="sm-trials__details">
                <summary>Quem foi estudado e de onde vem o número</summary>
                <p>{plot.population}</p>
                <p>{m05.description}</p>
              </details>
            </div>
          </div>
        </div>
        <Cutout name="ginkgo" white className="sm-cut sm-cut--trials" width={190} depth={0.5} rotate={12}/>
      </section>

      {/* Quem ficou de fora */}
      <Section id="fora" chapter="Quem ficou de fora" tone="white" kicker="02 · Quem participou"
        title={["Dentro do estudo,", "e fora dele."]}
        intro={<p>Um resultado vale, primeiro, para quem foi estudado. Ler quem ficou de fora é parte da leitura.</p>}>
        <div className="sm-frame">
          <figure className="sm-frame__fig">
            <Image src="/assets/images/cianotipia/sementes.webp" alt="Cianotipia de sementes e folhas dispostas em grade, como uma amostra organizada" fill sizes="(max-width: 900px) 92vw, 30vw"/>
            <figcaption className="at-mono">Fig. 04.1 — Uma amostra é sempre uma seleção</figcaption>
          </figure>
          <div className="sm-frame__cols">
            <div className="sm-frame__in">
              <p className="sm-frame__k at-mono">Dentro · SURMOUNT-1/2/3</p>
              <ul>
                <li>{m05.analyzedN.toLocaleString("pt-BR")} adultos com sobrepeso ou obesidade</li>
                <li>Sem psicopatologia importante conhecida</li>
                <li>Estudos internacionais, até 72 semanas</li>
              </ul>
            </div>
            <div className="sm-frame__line" aria-hidden="true">
              <DrawPath viewBox="0 0 20 400" d="M10 4 L10 396" dashed strokeWidth={2.5}/>
            </div>
            <div className="sm-frame__out">
              <p className="sm-frame__k at-mono">Fora · exclusões</p>
              <ul>
                <li>Pessoas com psicopatologia importante conhecida, excluídas dessa análise</li>
                <li>Pessoas com condições psiquiátricas importantes, frequentemente excluídas dos ensaios</li>
              </ul>
              <p className="sm-frame__note">Para elas, o resultado não garante o mesmo.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* O que exige outra investigação */}
      <Section id="investigar" chapter="O que exige outra investigação" kicker="03 · Estigma, corpo e contexto"
        title={["O que exige", "outra investigação."]}
        intro={<p>Pressão estética, estigma, alimentação emocional e transtornos alimentares não são medidos por uma única escala. Toque em cada dimensão para ver se ela cabe no alcance do PHQ-9.</p>}>
        <ScaleLens/>

        <article className="sm-brazil" aria-labelledby="sm-brazil-title">
          <figure className="sm-brazil__fig">
            <Image src="/assets/images/cianotipia/globo.webp" alt="Cianotipia de um globo terrestre antigo com folhas ao redor da base" fill sizes="(max-width: 900px) 92vw, 34vw"/>
            <figcaption className="at-mono">Fig. 04.2 — Contexto brasileiro</figcaption>
          </figure>
          <div className="sm-brazil__copy">
            <p className="at-kicker">Contexto brasileiro</p>
            <h3 id="sm-brazil-title" className="sm-h3">Explica o contexto social. Não prova o efeito de uma caneta.</h3>
            <p>Um estudo brasileiro sobre percepção do peso pode explicar contexto social, mas não provar efeito de uma caneta. Ele ajuda a entender a pressão em torno do corpo; não mede o que o medicamento faz.</p>
            <a className="sm-link" href="https://pubmed.ncbi.nlm.nih.gov/40197266/" target="_blank" rel="noopener noreferrer">Percepções e alimentação emocional no Brasil <span aria-hidden="true">↗</span></a>
          </div>
        </article>
        <Cutout name="samambaia-alta" className="sm-cut sm-cut--investigar" width={180} depth={0.45} rotate={-6}/>
      </Section>

      {/* Como ler na prática: cartões empilhados */}
      <section id="leitura" className="sm-read" data-chapter="Como ler na prática" aria-labelledby="sm-read-title">
        <div className="sm-read__inner">
          <header className="sm-read__head">
            <p className="at-kicker">04 · Como ler esse resultado na prática</p>
            <SplitTitle id="sm-read-title" lines={["Três coisas que", "o número não é."]} className="sm-h2"/>
          </header>
          <ol className="sm-read__stack">
            {readings.map((r, i) => (
              <li key={r.n} className={"sm-card sm-card--" + (i + 1)} style={{ ["--i" as string]: i }}>
                <div className="sm-card__body">
                  <span className="sm-card__n at-mono">{r.n} / 03</span>
                  <h3 className="sm-card__title">{r.title}</h3>
                  <p>{r.text}</p>
                </div>
                <span className="sm-card__x" aria-hidden="true">×</span>
                {r.cutout !== "globo"
                  ? <Cutout name={r.cutout} white={i === 1} className="sm-card__cut" width={150} depth={0.2} rotate={8}/>
                  : <div className="sm-card__globe" aria-hidden="true"><Image src="/assets/images/cianotipia/globo.webp" alt="" fill sizes="200px"/></div>}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Convite */}
      <section className="sm-invite" data-chapter="Uma conversa de cuidado" aria-labelledby="sm-invite-title">
        <div className="sm-invite__inner">
          <h2 id="sm-invite-title" className="sm-invite__title">Mais clareza para uma conversa de cuidado.</h2>
          <Reveal as="ul" className="sm-invite__qs" stagger={0.14}>
            <li>Que pessoas participaram do estudo?</li>
            <li>Quem ficou de fora?</li>
            <li>O instrumento mede sintomas, qualidade de vida ou diagnóstico?</li>
          </Reveal>
          <p className="sm-invite__p">Essas perguntas ajudam a evitar tanto o alarmismo quanto promessas de segurança irrestrita.</p>
          <Magnetic><Link className="at-btn at-btn--light" href="/projecoes">Investigar Brasil × EUA <span aria-hidden="true">→</span></Link></Magnetic>
          <p className="sm-invite__fine">Ferramenta educacional; não oferece diagnóstico.</p>
        </div>
        <Cutout name="eucalipto" white className="sm-cut sm-cut--invite" width={200} depth={0.5} rotate={10}/>
      </section>
    </div>
  );
}
