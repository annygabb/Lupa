import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChapterHero, Section, Specimen, LimitNote, Reveal, Cutout } from "@/components/atlas/ui";
import { CountUp, DrawPath, Magnetic } from "@/components/atlas/motion";
import { ChapterBar } from "@/components/atlas/chapter-bar";
import { getReviewedMetric } from "@/features/comparison/reviewed-metrics";
import { evaluateMuscleIcuCausalChain } from "@/features/muscle/evidence-map";
import { GuidedInquiry } from "@/components/routes/musculos-uti/guided-inquiry";
import { CausalChain } from "@/components/routes/musculos-uti/causal-chain";
import { EvidenceBars } from "@/components/routes/musculos-uti/evidence-bars";
import { axes, icuMeta, pct, plot, summaryStats } from "@/components/routes/musculos-uti/data";
import "./musculos.css";

export const metadata: Metadata = {
  title: "Músculos, Sarcopenia e UTI",
  description: "Investigação contextualizada de composição corporal, força muscular e associações observacionais em UTI, sem inferência causal indevida.",
};

function metric(id: string) {
  const m = getReviewedMetric(id);
  if (!m) throw new Error("Indicador revisado não encontrado: " + id);
  return m;
}

export default function MusculosUtiPage() {
  const dxa = ["M01", "M02", "M03"].map(metric);
  const leanM = dxa[2];
  const causal = evaluateMuscleIcuCausalChain();
  const glp1 = plot("icu-glp1");
  const rf = plot("icu");

  return (
    <div className="mu-page">
      <ChapterBar/>

      <div data-chapter="Além do peso">
        <ChapterHero
          n="03"
          kicker="Prancha 03 · Músculos e cuidados críticos"
          title={["Além do peso.", "O que podemos afirmar?"]}
          lead={<p>Investigamos como composição corporal, força muscular e desfechos em terapia intensiva são avaliados por pesquisas distintas. Sem transformar associações em causa, nem massa magra em diagnóstico.</p>}
          image="/assets/images/cianotipia/musculo.webp"
          alt="Cianotipia de feixes de fibras musculares em estilo de gravura anatômica"
          cutouts={[
            { name: "samambaia-alta", className: "mu-cut mu-cut--hero-a", width: 200, depth: 0.6, rotate: -10 },
            { name: "folhas-soltas", className: "mu-cut mu-cut--hero-b", width: 150, depth: 0.9, rotate: 14 },
          ]}
        >
          <Magnetic><a className="at-btn at-btn--solid" href="#perguntas">Investigar uma pergunta <span aria-hidden="true">↓</span></a></Magnetic>
          <a className="at-btn at-btn--line" href="#estudos">Ver estudos originais</a>
        </ChapterHero>
      </div>

      {/* Três eixos e números de partida */}
      <section className="mu-axes" data-chapter="Três perguntas diferentes" aria-labelledby="mu-axes-title">
        <div className="mu-axes__inner">
          <div className="mu-axes__head">
            <p className="at-kicker">Três perguntas científicas diferentes</p>
            <h2 id="mu-axes-title" className="mu-axes__title">Massa, força e UTI <span>não são a mesma pergunta.</span></h2>
          </div>
          <Reveal as="ol" className="mu-axes__list">
            {axes.map(a => (
              <li key={a.n}>
                <span className="mu-axes__n at-mono">Eixo {a.n}</span>
                <strong>{a.label}</strong>
                <span>{a.text}</span>
              </li>
            ))}
          </Reveal>
          <dl className="mu-axes__stats">
            {summaryStats.map(s => (
              <div key={s.label}>
                <dt><span>{s.label}</span><small className="at-mono">{s.detail}</small></dt>
                <dd><CountUp value={s.value}/></dd>
              </div>
            ))}
          </dl>
          <p className="mu-axes__note">Não há cálculo conjunto de mortalidade nem diagnóstico individual.</p>
        </div>
        <Cutout name="ginkgo" className="mu-cut mu-cut--axes" width={170} depth={0.5} rotate={12}/>
      </section>

      {/* Investigação guiada */}
      <section id="perguntas" className="mu-inquiry" data-chapter="Investigação guiada" aria-labelledby="muscle-questions-heading">
        <header className="mu-inquiry__head">
          <p className="at-kicker">01 · Interpretação guiada</p>
          <h2 id="muscle-questions-heading" className="mu-h2">Que pergunta você quer responder?</h2>
          <p>Selecione uma pergunta. O LUPA separa o que cada estudo mede do que ele não permite concluir.</p>
        </header>
        <GuidedInquiry/>
      </section>

      {/* DXA: E04 · M01–M03 */}
      <Section id="estudos" chapter="O que a DXA registrou" tone="white" kicker="02 · Evidências originais · E04"
        title={["O que os estudos", "registraram."]}
        intro={<p>O gráfico abaixo é exclusivamente do subestudo DXA (E04). As medidas em UTI são de uma população diferente.</p>}>
        <div className="mu-specimens">
          {dxa.map(m => (
            <Specimen key={m.id} id={`${m.id} · ${m.evidenceId}`} label={`${m.outcome} · ${m.arms[0].label} (n=${m.arms[0].sampleN})`}
              value={pct(m.arms[0].value)}
              note={`${m.arms[1].label} (n=${m.arms[1].sampleN}): ${pct(m.arms[1].value)} · ${m.followupWeeks} semanas`}/>
          ))}
        </div>

        <div className="mu-dxa">
          <EvidenceBars
            title="Mudança relativa ao valor inicial de cada medida · SURMOUNT-1, subestudo DXA"
            axisLabel="Redução em relação ao valor inicial do próprio grupo (%)"
            domain={40}
            unit="% da medida inicial"
            period={leanM.timeWindow}
            design={`${leanM.design} · N total ${leanM.analyzedN}`}
            source={{ href: leanM.sourceUrl, label: "Artigo no PMC · E04" }}
            groups={dxa.map(m => ({
              label: `${m.id} · ${m.outcome}`,
              rows: m.arms.map(a => ({ label: a.label.replace(" (doses agrupadas)", ""), value: a.value, n: a.sampleN })),
            }))}
          >
            <p className="mu-bars__note">{dxa[0].description} {leanM.description} {leanM.estimator}. As doses de tirzepatida foram analisadas em conjunto.</p>
          </EvidenceBars>
          <div className="mu-dxa__side">
            <figure className="mu-dxa__fig">
              <Image src="/assets/images/cianotipia/corpo-composicao.webp" alt="Cianotipia de uma figura humana translúcida entre samambaias, sugerindo camadas de tecido" fill sizes="(max-width: 900px) 92vw, 30vw"/>
              <figcaption className="at-mono">Fig. 03.5 — Massa magra inclui água, órgãos e outros tecidos</figcaption>
            </figure>
            <p className="mu-dxa__pop">{leanM.population}</p>
            <LimitNote><p>{leanM.limitations}</p><p>Massa magra não é sinônimo de músculo; DXA não mede força nem sarcopenia.</p></LimitNote>
          </div>
        </div>

        {/* DXA ≠ sarcopenia */}
        <div className="mu-versus">
          <h3 id="mu-versus-title" className="mu-versus__title">Sarcopenia envolve função, não apenas massa</h3>
          <div className="mu-versus__cols">
            <div className="mu-versus__col">
              <p className="at-mono mu-versus__k">O que a DXA mede · E04</p>
              <ul><li>Massa gorda</li><li>Massa magra (inclui água e órgãos)</li></ul>
            </div>
            <span className="mu-versus__ne" aria-hidden="true">≠</span>
            <div className="mu-versus__col mu-versus__col--ink">
              <p className="at-mono mu-versus__k">O que o consenso EWGSOP2 avalia · E10</p>
              <ul><li><strong>Baixa força muscular</strong> — central</li><li>Quantidade/qualidade muscular — confirmação</li><li>Desempenho físico — gravidade</li></ul>
            </div>
          </div>
          <p className="mu-versus__body">Baixa força muscular é central no consenso, com quantidade/qualidade e desempenho físico como dimensões complementares. Percentual de massa magra isolado não é diagnóstico.</p>
          <a className="at-link mu-versus__link" href="https://pubmed.ncbi.nlm.nih.gov/30312372/" target="_blank" rel="noopener noreferrer">Consultar consenso EWGSOP2 · PMID 30312372 ↗</a>
        </div>
      </Section>

      {/* Cadeia com elos interrompidos */}
      <section className="mu-gap" data-chapter="A lacuna causal" aria-labelledby="muscle-causal-heading">
        <div className="mu-gap__inner">
          <header className="mu-gap__head">
            <p className="at-kicker">03 · Limites entre estudos</p>
            <h2 id="muscle-causal-heading" className="mu-h2">A lacuna causal do projeto.</h2>
            <p>É possível estudar as partes separadamente. Isso não prova automaticamente a cadeia completa. Uma manchete liga tudo numa linha só; a evidência mostra que só o primeiro elo foi medido no mesmo estudo.</p>
          </header>
          <CausalChain/>
          <div className="mu-gap__verdict">
            <DrawPath className="mu-gap__scribble" viewBox="0 0 600 40" d="M4 30 C 120 4, 240 40, 360 18 S 560 10, 596 24" dashed strokeWidth={2.5}/>
            <p className="mu-gap__message">{causal.message}</p>
            <p className="mu-gap__sub">Não somamos amostras, odds ratios ou frações de massa magra de publicações distintas.</p>
            <details className="mu-gap__details">
              <summary>O que seria necessário investigar?</summary>
              <ol>{causal.missing.map(item => <li key={item}>{item}</li>)}</ol>
            </details>
          </div>
        </div>
        <Cutout name="samambaia-curta" white className="mu-cut mu-cut--gap" width={210} depth={0.4} rotate={-8}/>
      </section>

      {/* UTI */}
      <Section id="uti" chapter="Na UTI" kicker="04 · Medicamentos e cuidados críticos"
        title={["Na UTI, outra", "população e outras perguntas."]}
        intro={<p>Três estudos, três desenhos e três medidas diferentes. Nenhum deles transforma perda de massa magra em risco de morte para quem usa um medicamento para emagrecer.</p>}>

        <article className="mu-study" aria-labelledby="mu-study-glp1">
          <div className="mu-study__head">
            <p className="at-mono mu-study__k">O medicamento foi avaliado? · {glp1.design}</p>
            <h3 id="mu-study-glp1" className="mu-study__title">GLP-1 antes da UTI: o que foi observado</h3>
            <p className="mu-study__lead">Uma comparação direta de pacientes com e sem prescrição anterior. A exposição não era exclusivamente para emagrecimento.</p>
          </div>
          <div className="mu-study__grid">
            <EvidenceBars title={glp1.title} axisLabel={glp1.axisLabel} domain={8} unit={glp1.unit} period={glp1.period} design={glp1.design}
              source={{ href: `https://pubmed.ncbi.nlm.nih.gov/${glp1.pmid}/`, label: `PubMed · PMID ${glp1.pmid}` }}
              groups={[{ rows: glp1.arms.map(a => ({ label: a.label, value: a.value, n: a.n })) }]}>
              <p className="mu-bars__note">{glp1.population}</p>
            </EvidenceBars>
            <div className="mu-study__side">
              <Specimen id="OR · mortalidade hospitalar" label="Razão de chances após pareamento (452 pares)" value="OR 1,05" note="IC95% 0,58–1,91 · p=0,88"/>
              <p className="mu-study__finding">{glp1.finding}</p>
              <LimitNote><p>{glp1.limitation}</p><p>OR não é risco absoluto: é uma razão de chances entre grupos. Sem nexo causal.</p></LimitNote>
            </div>
          </div>
        </article>

        <article className="mu-study" aria-labelledby="icu-observed-title">
          <div className="mu-study__head">
            <p className="at-mono mu-study__k">Gravidade e perda muscular · observação real</p>
            <h3 id="icu-observed-title" className="mu-study__title">O músculo também importa quando a doença se agrava</h3>
            <p className="mu-study__lead">Uma coorte acompanhou pacientes críticos com falência de um ou de múltiplos órgãos. Esta comparação é observada, não uma projeção de quem usou medicamento para emagrecer.</p>
          </div>
          <div className="mu-study__grid">
            <EvidenceBars title={rf.title} axisLabel={rf.axisLabel} domain={20} unit={rf.unit} period={rf.period} design={rf.design}
              source={{ href: `https://pubmed.ncbi.nlm.nih.gov/${rf.pmid}/`, label: `PubMed · PMID ${rf.pmid}` }}
              groups={[{ rows: rf.arms.map(a => ({ label: a.label, value: a.value, n: a.n, nNote: "n do subgrupo não informado; coorte total de 63" })) }]}>
              <p className="mu-bars__note">{rf.finding}</p>
            </EvidenceBars>
            <div className="mu-study__side">
              <LimitNote title="Por que não somamos as perdas?">
                <p>O SURMOUNT-1 mede massa magra corporal por DXA em 72 semanas. A coorte de UTI mede a área de um músculo por ultrassom em sete dias. Somar os percentuais produziria um resultado sem significado validado. A chance individual de recuperação não foi calculada.</p>
                <p>{rf.limitation}</p>
              </LimitNote>
            </div>
          </div>
        </article>

        <article className="mu-meta" aria-labelledby="mu-meta-title">
          <figure className="mu-meta__fig">
            <Image src="/assets/images/cianotipia/uti.webp" alt="Cianotipia de um leito hospitalar com suporte de soro e monitor" fill sizes="(max-width: 900px) 92vw, 40vw"/>
            <figcaption className="at-mono">Fig. 03.6 — Pacientes críticos na admissão</figcaption>
          </figure>
          <div className="mu-meta__copy">
            <p className="at-mono mu-study__k">UTI · E12 · PMID {icuMeta.pmid}</p>
            <h3 id="mu-meta-title" className="mu-study__title">Associação observada em pacientes críticos</h3>
            <p className="mu-study__lead">Metanálise de {icuMeta.studies} estudos e {icuMeta.patients.toLocaleString("pt-BR")} pacientes: baixa massa muscular medida por TC na admissão foi associada à mortalidade.</p>
            <div className="mu-meta__specimens">
              <Specimen id="E12 · curto prazo" label="Mortalidade de curto prazo" value={`OR ${icuMeta.shortTerm.or}`} note={`IC95% ${icuMeta.shortTerm.ci}`}/>
              <Specimen id="E12 · longo prazo" label="Mortalidade de longo prazo" value={`OR ${icuMeta.longTerm.or}`} note={`IC95% ${icuMeta.longTerm.ci}`}/>
            </div>
            <LimitNote><p>OR significa razão de chances, não porcentagem absoluta de mortalidade. Associação observacional em populações heterogêneas de UTI, sem nexo causal. A exposição a medicamentos para emagrecimento não foi o objeto deste estudo.</p></LimitNote>
            <a className="at-link" href={`https://pubmed.ncbi.nlm.nih.gov/${icuMeta.pmid}/`} target="_blank" rel="noopener noreferrer">Consultar metanálise · PMID {icuMeta.pmid} ↗</a>
          </div>
        </article>
      </Section>

      {/* Saída */}
      <section className="mu-exit" data-chapter="Comparar sem combinar" aria-labelledby="mu-exit-title">
        <div className="mu-exit__inner">
          <div className="mu-exit__art" aria-hidden="true">
            <Image src="/assets/images/cianotipia/comparar.webp" alt="" fill sizes="(max-width: 900px) 60vw, 26vw"/>
          </div>
          <div className="mu-exit__copy">
            <h2 id="mu-exit-title" className="mu-exit__title">Compare as publicações sem combinar resultados.</h2>
            <p>O Comparador abre por padrão E04 e E12 e mostra as incompatibilidades.</p>
            <Magnetic><Link href="/comparar" className="at-btn at-btn--light">Abrir Comparador</Link></Magnetic>
          </div>
        </div>
        <p className="mu-exit__fine">Ferramenta educacional e de pesquisa; não oferece diagnóstico ou previsão de risco individual.</p>
        <Cutout name="eucalipto" white className="mu-cut mu-cut--exit" width={190} depth={0.5} rotate={10}/>
      </section>
    </div>
  );
}
