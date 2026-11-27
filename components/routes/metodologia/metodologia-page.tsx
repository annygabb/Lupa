import Image from "next/image";
import Link from "next/link";
import { ChapterHero, LimitNote, Reveal, Section, Specimen, StatRow } from "@/components/atlas/ui";
import { ChapterBar } from "@/components/atlas/chapter-bar";
import { Cutout, DrawPath, Magnetic } from "@/components/atlas/motion";
import { SCENARIO_PRESETS, runScenario } from "@/features/scenarios/engine";
import { reviewedMetrics } from "@/features/comparison/reviewed-metrics";
import { getCatalogAudit } from "@/features/evidence/unified-catalog";
import { ProtocolTimeline } from "./protocol-timeline";
import { claimLevels, formulas, glossary, principles, safeguards, sources, susContext } from "./data";
import { blockerCopy } from "@/features/interpretation/blocker-copy";
import { blockerCodes, e12Example } from "./blocker-example";

const audit = getCatalogAudit();
const modelVersion = runScenario(SCENARIO_PRESETS.intermediario.input).modelVersion;
const e12Fired = new Set(e12Example.assessment.blockers);

/** Prancha 06 — Metodologia: do artigo original ao gráfico, com os limites à vista. */
export function MetodologiaPage() {
  return (
    <div className="mt">
      <ChapterBar/>
      <div data-chapter="Cada conclusão precisa de um caminho">
        <ChapterHero
          n="06"
          kicker="LUPA Saúde · Transparência científica"
          title={["Cada conclusão precisa", "de um caminho."]}
          lead={<p>Da publicação original ao gráfico, do método ao limite de interpretação. Esta página documenta as fontes, regras, fórmulas e incertezas que sustentam o MVP.</p>}
          image="/assets/images/cianotipia/laboratorio-2.webp"
          alt="Cianotipia de vidrarias de laboratório e um microscópio antigo"
          cutouts={[
            { name: "samambaia-alta", className: "mt-cut mt-cut--a", depth: .5, width: 170, rotate: -8 },
            { name: "folhas-soltas", className: "mt-cut mt-cut--b", depth: .9, width: 130, rotate: 14 },
          ]}>
          <Magnetic><a className="at-btn at-btn--solid" href="#protocolo">Ver protocolo <span aria-hidden="true">↓</span></a></Magnetic>
          <Link className="at-btn at-btn--line" href="/projecoes#laboratorio">Abrir simulador</Link>
        </ChapterHero>
      </div>

      <section className="mt-status" aria-label="Situação real do catálogo" data-chapter="Situação do catálogo">
        <div className="mt-status__inner">
          <div className="mt-status__principles">
            <p className="mt-status__k">Princípios do LUPA</p>
            <Reveal className="mt-status__tags">
              {principles.map(p => <Specimen key={p.id} id={p.id} label={p.sub} value={p.title}/>)}
            </Reveal>
          </div>
          <StatRow items={[
            { value: audit.canonicalRecords, label: "Registros canônicos · candidatos à curadoria" },
            { value: reviewedMetrics.length, label: "Indicadores conferidos no original · sem revisão clínica independente" },
            { value: 0, label: "Indicadores aptos a projeção clínica · bloqueados por padrão" },
          ]}/>
        </div>
      </section>

      <Section id="protocolo" tone="paper" chapter="Protocolo" kicker="06.1 · Protocolo"
        title={["Como analisamos", "uma evidência"]}
        intro={<p>Cinco etapas, sempre na mesma ordem. Cada uma deixa um registro que pode ser conferido no artigo original.</p>}>
        <div className="mt-protocol">
          <ProtocolTimeline/>
          <aside className="mt-protocol__aside">
            <figure className="mt-protocol__fig">
              <div className="mt-protocol__img">
                <Image src="/assets/images/cianotipia/estudos-1.webp" alt="Cianotipia de um livro, folhas de pesquisa com um gráfico e uma lupa" fill sizes="(max-width: 900px) 70vw, 28vw"/>
              </div>
              <figcaption>Fig. 06.1 — Do artigo à ficha.</figcaption>
            </figure>
            <LimitNote title="Fonte não é aprovação">
              <p>Ter uma fonte e uma URL não significa aprovação para uso clínico. Os 50 registros gerais continuam candidatos à curadoria e os cinco indicadores descritos no Comparador só foram conferidos documentalmente.</p>
            </LimitNote>
          </aside>
        </div>
      </Section>

      <Section id="impede" tone="ink" chapter="O que o sistema impede" kicker="06.2 · Integridade científica"
        title={["O que o sistema", "impede"]}
        intro={<p>Seis leituras tentadoras que o LUPA bloqueia por padrão. Cada prancha diz qual atalho foi fechado e por quê.</p>}>
        <Cutout name="samambaia-curta" white className="mt-cut mt-cut--ink" depth={.7} width={200} rotate={-12}/>
        <Reveal className="mt-bans" stagger={.07}>
          {safeguards.map((s, i) => (
            <article key={s.title} className="mt-ban">
              <div className="mt-ban__img">
                <Image src={`/assets/images/cianotipia/${s.img}.webp`} alt={s.alt} fill sizes="(max-width: 900px) 40vw, 14vw"/>
                <span className="mt-ban__stamp" aria-hidden="true">×</span>
              </div>
              <div className="mt-ban__body">
                <p className="mt-ban__n">Interdição {String(i + 1).padStart(2, "0")}</p>
                <h3>{s.title}</h3>
                <LimitNote title="Por que é bloqueado"><p>{s.description}</p></LimitNote>
              </div>
            </article>
          ))}
        </Reveal>
      </Section>

      <Section id="tipos-de-afirmacao" tone="white" chapter="Quatro tipos de afirmação" kicker="06.3 · Observação · Associação · Hipótese · Previsão validada"
        title={["Quatro tipos", "de afirmação"]}
        intro={<p>Nem todo número diz a mesma coisa. Cada leitura do LUPA pertence a uma destas categorias, e só a última exige calibração e validação.</p>}>
        <ol className="mt-levels" aria-label="Categorias de afirmação, da observação à previsão validada">
          {claimLevels.map((l, i) => (
            <li key={l.id} className={"mt-level" + (l.validated ? " is-validated" : "")}>
              <span className="mt-level__id" aria-hidden="true">{l.id}</span>
              <p className="mt-level__n">{String(i + 1).padStart(2, "0")} de 04</p>
              <h3>{l.name}</h3>
              <p className="mt-level__ask">{l.asks}</p>
              <dl>
                <div><dt>Exemplo</dt><dd>{l.example}</dd></div>
                <div><dt>{l.validated ? "Exige calibração e validação" : "Exige"}</dt><dd>{l.needs}</dd></div>
              </dl>
              <p className="mt-level__status"><span>No LUPA</span> {l.status}</p>
            </li>
          ))}
        </ol>
        <LimitNote title="Nenhuma previsão validada">
          <p>Observação, associação e hipótese não precisam de calibração para serem mostradas, desde que rotuladas. Previsão validada precisa: um modelo ajustado a dados observados e testado em dados que não foram usados no ajuste. O LUPA ainda não tem nenhuma previsão validada; por isso os horizontes de 2031, 2036 e 2041 são cenários hipotéticos.</p>
        </LimitNote>
      </Section>

      <Section id="bloqueios" tone="paper" chapter="Por que o LUPA se recusa a projetar" kicker="06.4 · Regras do bloqueio de projeção"
        title={["Por que o LUPA", "se recusa a projetar"]}
        intro={<p>Antes de qualquer número virar projeção, uma ficha passa por {blockerCodes.length} verificações. Basta uma falhar para a projeção ser recusada. Abaixo, todos os códigos de bloqueio e um exemplo real do acervo.</p>}>
        <div className="mt-blockers">
          <ol className="mt-blockers__list" aria-label="Todos os códigos de bloqueio de projeção">
            {blockerCodes.map(code => (
              <li key={code} className={"mt-blocker" + (e12Fired.has(code) ? " is-fired" : "")}>
                <p className="mt-blocker__code at-mono">{code}</p>
                <h3>{blockerCopy[code].title}</h3>
                <p>{blockerCopy[code].why}</p>
                {e12Fired.has(code) && <p className="mt-blocker__tag">Dispara no exemplo E12</p>}
              </li>
            ))}
          </ol>
          <aside className="mt-example" aria-labelledby="exemplo-e12-title">
            <p className="mt-example__k">Exemplo · candidato curado</p>
            <h3 id="exemplo-e12-title">E12 tentando virar projeção de UTI</h3>
            <p className="mt-example__lead">Ficha montada com dados do catálogo para ilustrar o bloqueio. Não é registro aprovado nem estimativa.</p>
            <dl className="mt-example__fields">
              {e12Example.fields.map(f => (
                <div key={f.label}><dt>{f.label}</dt><dd>{f.value}<span className="mt-example__origin">{f.origin}</span></dd></div>
              ))}
            </dl>
            <p className="mt-example__verdict">
              {e12Example.assessment.allowed ? "Projeção permitida" : `Projeção recusada · ${e12Example.assessment.blockers.length} bloqueios`}
            </p>
            <ul className="mt-example__fired">
              {e12Example.assessment.blockers.map(code => (
                <li key={code}><span className="at-mono">{code}</span> {blockerCopy[code].title}</li>
              ))}
            </ul>
            <a className="at-link" href={e12Example.sourceUrl} target="_blank" rel="noopener noreferrer">Consultar a metanálise original <span aria-hidden="true">↗</span></a>
          </aside>
        </div>
      </Section>

      <Section id="motor" tone="white" chapter="Motor matemático" kicker="06.5 · Motor matemático"
        title={["Como funcionam", "os cenários de", "2031, 2036 e 2041"]}
        intro={<p>O simulador <strong>não estima efeitos clínicos</strong>. Ele aplica taxas hipotéticas a um grupo de referência editável e contabiliza entradas, continuidade e saídas por ano.</p>}>
        <div className="mt-engine">
          <div className="mt-formulas">
            <p className="mt-formulas__k">Regras determinísticas</p>
            <ol className="mt-formulas__list">
              {formulas.map(f => (
                <li key={f.id} className="mt-formula">
                  <span className="mt-formula__id" aria-hidden="true">{f.id}</span>
                  <p className="mt-formula__title">{f.title}</p>
                  <p className="mt-formula__eq"><code><span className="mt-formula__lhs">{f.parts[0]}</span> <span className="mt-formula__op">{f.parts[1]}</span> <span className="mt-formula__rhs">{f.parts[2]}</span></code></p>
                </li>
              ))}
            </ol>
            <p className="mt-formulas__foot">As taxas são fornecidas em porcentagem, convertidas em fração no cálculo. Saídas não significam evento adverso ou morte; entradas acumuladas são eventos e podem contar reinícios.</p>
          </div>
          <div className="mt-flow">
            <p className="mt-formulas__k">Um ano do modelo, em fluxo</p>
            <div className="mt-flow__diagram">
              <DrawPath className="mt-flow__wire" viewBox="0 0 320 420" strokeWidth={2.5}
                d="M80 50 C 80 120, 80 140, 80 190 M240 50 C 240 120, 240 140, 240 190 M80 250 C 80 300, 160 290, 160 340 M240 250 C 240 300, 160 290, 160 340"/>
              <span className="mt-flow__node mt-flow__node--a">ativos(t−1)</span>
              <span className="mt-flow__node mt-flow__node--b">vagas: N(t) − C(t)</span>
              <span className="mt-flow__op mt-flow__op--a">× retenção</span>
              <span className="mt-flow__op mt-flow__op--b">× taxa de início</span>
              <span className="mt-flow__node mt-flow__node--c">C(t)</span>
              <span className="mt-flow__node mt-flow__node--d">I(t)</span>
              <span className="mt-flow__node mt-flow__node--e">A(t) = C(t) + I(t)</span>
            </div>
            <p className="mt-flow__sr sr-only">Os ativos do ano anterior multiplicados pela retenção dão C(t), quem continua. As vagas restantes, N(t) menos C(t), multiplicadas pela taxa de início dão I(t), quem inicia. Ativos A(t) é a soma de C(t) e I(t).</p>
          </div>
          <div className="mt-presets">
            <p className="mt-formulas__k">Presets ilustrativos</p>
            <p className="mt-presets__lead">Nenhum preset é estimativa brasileira. São exemplos modificáveis.</p>
            <ul>
              {Object.values(SCENARIO_PRESETS).map(p => (
                <li key={p.label}>
                  <h3>{p.label}</h3>
                  <p>{p.note}</p>
                  <dl>
                    <div><dt>Início</dt><dd>{p.input.annualStartPct.toLocaleString("pt-BR")}%</dd></div>
                    <div><dt>Continuidade</dt><dd>{p.input.annualRetentionPct}%</dd></div>
                    <div><dt>Incremento</dt><dd>{p.input.annualAccessIncreasePp.toLocaleString("pt-BR")} p.p./ano</dd></div>
                  </dl>
                </li>
              ))}
            </ul>
            <Link href="/projecoes#laboratorio" className="at-btn at-btn--solid">Abrir simulador <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </Section>

      <Section id="sus" tone="paper" chapter="Brasil e SUS" kicker="06.6 · Contexto brasileiro"
        title={["Brasil e SUS:", "o que sabemos", "até esta versão"]}>
        <ol className="mt-sus">
          {susContext.map(c => (
            <li key={c.title} className="mt-sus__item">
              <p className="mt-sus__when">{c.when}</p>
              <p className="mt-sus__tag">{c.tag}</p>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </li>
          ))}
        </ol>
        <LimitNote title="Pedido não é incorporação">
          <p>Um pedido de análise à Conitec não equivale a incorporação, financiamento ou oferta pelo SUS. O LUPA não pressupõe data, cobertura nem elegibilidade nacional, e os cenários não estimam o que o SUS fará.</p>
        </LimitNote>
      </Section>

      <Section id="glossario" tone="white" chapter="Glossário" kicker="06.7 · Glossário científico"
        title={["Termos para", "interpretar", "com segurança"]}
        intro={<p>Um herbário de conceitos: cada termo preso à sua definição e ao que ele não significa.</p>}>
        <Reveal className="mt-herbarium" stagger={.06}>
          {glossary.map((g, i) => (
            <article key={g.term} className="mt-sheet">
              <div className="mt-sheet__plant" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/assets/images/recortes/${g.cut}.webp`} alt="" loading="lazy" decoding="async"/>
              </div>
              <div className="mt-sheet__label">
                <span className="mt-sheet__id">G-{String(i + 1).padStart(2, "0")}</span>
                <h3>{g.term}</h3>
                <p>{g.definition}</p>
              </div>
            </article>
          ))}
        </Reveal>
      </Section>

      <Section id="fontes" tone="ink" chapter="Fontes auditáveis" kicker="06.8 · Fontes auditáveis"
        title={["Publicações e", "documentos originais"]}>
        <ol className="mt-refs">
          {sources.map((s, i) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-ref">
                <span className="mt-ref__n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="mt-ref__body"><strong>{s.label}</strong><span>{s.role}</span></span>
                <span className="mt-ref__type">{s.type}</span>
                <span className="mt-ref__go" aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ol>
        <LimitNote title="Referência não é aprovação">
          <p>A lista reúne referências para auditoria, não aprovação científica integral. Informações regulatórias podem mudar; a versão e a data da fonte devem ser conferidas antes de qualquer uso real.</p>
        </LimitNote>
      </Section>

      <footer className="mt-closing">
        <p className="mt-closing__k">LUPA MVP · modelo de fluxos {modelVersion} · nenhuma inferência clínica individual</p>
        <Link href="/evidencias" className="at-btn at-btn--solid">Explorar catálogo <span aria-hidden="true">→</span></Link>
      </footer>
    </div>
  );
}
