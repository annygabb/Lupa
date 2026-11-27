/**
 * Ficha de uma referência (/evidencias/[id]) como prancha de herbário:
 * capa com o título (h1), etiqueta grande, seções numeradas e navegação entre fichas.
 * Conteúdo vem só do catálogo (features/evidence); campos internos de curadoria não aparecem.
 */
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { LimitNote, Parallax, Reveal, Specimen, SplitTitle, Cutout } from "@/components/atlas/ui";
import { Magnetic } from "@/components/atlas/motion";
import { CyanotypePlate } from "@/components/atlas/cyanotype-plate";
import type { SupplementalRecord } from "@/features/evidence/supplemental";
import { unifiedEvidenceCatalog, type UnifiedEvidenceRecord } from "@/features/evidence/unified-catalog";
import {
  buildEvidenceHref, designNames, drugNames, shortDescription, sourceKindName, topicNames, yearName,
} from "@/lib/evidence-presentation";
import {
  PASSPORT_MISSING, passportReviewSummary, type EvidencePassport,
} from "@/features/evidence/passport";
import { formatMetricValue } from "@/features/comparison/reviewed-metrics";
import { cutoutNameFor, plateFor, splitSummary } from "./data";
import { PassportActions } from "./passport-actions";

const toc = [
  { id: "passaporte", n: "01", label: "Passaporte da Evidência" },
  { id: "resultado", n: "02", label: "Resultado descrito" },
  { id: "populacao", n: "03", label: "População" },
  { id: "limites", n: "04", label: "Limitações" },
  { id: "fontes", n: "05", label: "Fonte e identificadores" },
  { id: "relacionados", n: "06", label: "Relacionados" },
];

function titleLines(title: string): string[] {
  const clean = title.replace(/\s+/g, " ").trim();
  const i = clean.indexOf(" — ");
  return i > 0 ? [clean.slice(0, i) + " —", clean.slice(i + 3)] : [clean];
}

function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "link externo"; }
}

/** Segmentos "Rótulo: valor" viram etiquetas; o resto, parágrafo. */
function labelled(segment: string): { label: string; value: string } | null {
  const m = /^([^:]{3,32}):\s+(.+)$/.exec(segment);
  return m ? { label: m[1].trim(), value: m[2].trim() } : null;
}

function SheetSection({ id, n, title, description, children }: {
  id: string; n: string; title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="ev-block" aria-labelledby={id + "-title"}>
      <p className="ev-block__n at-mono" aria-hidden="true">{n}</p>
      <div className="ev-block__body">
        <h2 id={id + "-title"} className="ev-block__title">{title}</h2>
        {description && <p className="ev-block__desc">{description}</p>}
        {children}
      </div>
    </section>
  );
}

function HerbariumLabel({ record, accessedAs }: { record: UnifiedEvidenceRecord; accessedAs: string }) {
  const aliases = record.sourceIds.filter(s => s !== record.id);
  return (
    <div className="ev-label">
      <span className="ev-label__tape" aria-hidden="true"/>
      <div className="ev-label__head at-mono">
        <h2 className="ev-label__h">Etiqueta de herbário</h2>
        <span aria-hidden="true">LUPA · Evidências</span>
      </div>
      <p className="ev-label__no"><span className="at-mono">N.º</span>{record.id}</p>
      <dl className="ev-label__rows">
        <div><dt className="at-mono">Desenho / tipo</dt><dd>{designNames[record.design]}</dd></div>
        <div><dt className="at-mono">Ano</dt><dd>{yearName(record.year)}</dd></div>
        <div><dt className="at-mono">Identificador PubMed</dt><dd className="at-mono">{record.pmid ?? "Não informado"}</dd></div>
        <div><dt className="at-mono">Origem</dt><dd>{sourceKindName(record.sourceKind)}</dd></div>
        <div>
          <dt className="at-mono">Também catalogado como</dt>
          <dd className="at-mono">{aliases.length ? aliases.join(", ") : "Sem outros identificadores"}</dd>
        </div>
      </dl>
      {accessedAs !== record.id && (
        <p className="ev-label__via">Você abriu esta ficha pelo identificador <b className="at-mono">{accessedAs}</b>, que aponta para o mesmo documento.</p>
      )}
    </div>
  );
}

function fmtInt(n: number): string {
  return n.toLocaleString("pt-BR");
}

/**
 * Passaporte da Evidência: o resumo exportável da ficha. Status em texto (não só cor),
 * leitura permitida e limites registrados; campos ausentes ficam explícitos, nunca inferidos.
 */
function EvidencePassportBlock({ passport }: { passport: EvidencePassport }) {
  const s = passport.reviewStatus;
  const n = passport.sampleSize;
  const family = passport.studyFamily;
  const review = [
    { key: "catalogacao", label: "Catalogação", value: "Candidato em curadoria", done: true,
      note: "Registro do catálogo LUPA, ainda não aprovado para projeções." },
    { key: "documental", label: "Conferência documental", value: s.documentaryCheck.checked ? "Conferida" : "Pendente",
      done: s.documentaryCheck.checked,
      note: s.documentaryCheck.basis ?? "Sem indicador conferido nem nota de conferência registrada para esta ficha." },
    { key: "clinica", label: "Revisão clínica independente", value: "Pendente", done: false,
      note: "Nenhum revisor clínico independente avaliou esta ficha." },
  ];
  const facts: Array<{ label: string; value: string; mono?: boolean }> = [
    { label: "ID LUPA", value: passport.lupaId, mono: true },
    { label: "Identificadores de origem", value: passport.sourceIds.join(", "), mono: true },
    { label: "PMID", value: passport.pmid ?? PASSPORT_MISSING, mono: passport.pmid !== null },
    { label: "Tipo de fonte / desenho",
      value: (passport.sourceKind === "regulatory" ? "Documento oficial" : "Publicação científica") + " · " + passport.design.label },
    { label: "Medicamento / exposição",
      value: passport.exposure ? passport.exposure.map(e => e.label).join(" · ") : PASSPORT_MISSING },
    { label: "N (campo conferido)", value: n
      ? fmtInt(n.total) +
        (n.byArm ? " (" + n.byArm.map(a => a.label + ": " + fmtInt(a.n)).join("; ") + ")" : " · N por braço " + PASSPORT_MISSING) +
        " · " + n.sourceMetricId
      : PASSPORT_MISSING },
    { label: "Família / coorte", value: family
      ? (family.overlapUndetermined
        ? "Sobreposição de participantes não determinada"
        : family.code + (family.relatedIds.length ? " · também " + family.relatedIds.join(", ") : ""))
      : PASSPORT_MISSING },
    { label: "Versão do esquema", value: passport.schemaVersion, mono: true },
  ];
  const notProven = [
    passport.limitations ?? PASSPORT_MISSING,
    ...passport.checkedMetrics.map(m => m.id + ": " + m.limitations),
  ];

  return (
    <div className="ev-pass">
      <p className="ev-pass__status">
        <span className="ev-pass__status-k at-mono">Status</span>
        <span>{passportReviewSummary(passport)}</span>
      </p>
      <dl className="ev-pass__review" aria-label="Status de revisão">
        {review.map(r => (
          <div key={r.key} className={r.done ? "is-done" : "is-pending"}>
            <dt className="at-mono">{r.label}</dt>
            <dd>
              <strong><span aria-hidden="true">{r.done ? "✓ " : "○ "}</span>{r.value}</strong>
              <span>{r.note}</span>
            </dd>
          </div>
        ))}
      </dl>

      <dl className="ev-pass__facts">
        {facts.map(f => (
          <div key={f.label}>
            <dt className="at-mono">{f.label}</dt>
            <dd className={f.mono ? "at-mono" : undefined}>{f.value}</dd>
          </div>
        ))}
      </dl>

      <div className="ev-pass__reading">
        <div className="ev-pass__col">
          <h3>O que o estudo observou</h3>
          {passport.reportedResult ? (
            <ul>{passport.reportedResult.map((r, i) => <li key={i}>{r}</li>)}</ul>
          ) : <p>{PASSPORT_MISSING}</p>}
        </div>
        <div className="ev-pass__col ev-pass__col--limit">
          <h3>O que o estudo <span className="ev-pass__not">não</span> prova</h3>
          <ul>{notProven.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      </div>

      <div className="ev-pass__metrics">
        <h3>Indicadores conferidos vinculados</h3>
        {passport.checkedMetrics.length ? (
          <ul>
            {passport.checkedMetrics.map(m => (
              <li key={m.id}>
                <span className="at-mono">{m.id}</span>{" "}
                <strong>{m.title}</strong>{" — "}
                {m.arms.map(a => a.label + " " + formatMetricValue(a.value, m.unit)).join(" · ")}
                <span className="ev-pass__meta at-mono"> · conferido na fonte em {m.reviewedOn}</span>
              </li>
            ))}
          </ul>
        ) : <p>Nenhum indicador numérico conferido para esta ficha.</p>}
      </div>

      <PassportActions passport={passport}/>
      <p className="ev-pass__disclaimer">{passport.disclaimer}</p>
    </div>
  );
}


export function EvidenceSheet({ record, accessedAs, complementary, passport }: {
  record: UnifiedEvidenceRecord; accessedAs: string; complementary: readonly SupplementalRecord[];
  passport: EvidencePassport;
}) {
  const plate = plateFor(record.topics);
  const results = splitSummary(record.resultsSummary);
  const population = splitSummary(record.populationSummary);
  const index = unifiedEvidenceCatalog.findIndex(r => r.id === record.id);
  const prev = index > 0 ? unifiedEvidenceCatalog[index - 1] : null;
  const next = index < unifiedEvidenceCatalog.length - 1 ? unifiedEvidenceCatalog[index + 1] : null;
  const hasFamily = Boolean(record.studyFamily && record.studyFamily !== "META_ANALYSIS_OVERLAP_UNDETERMINED");
  const family = hasFamily ? unifiedEvidenceCatalog.filter(r => r.id !== record.id && r.studyFamily === record.studyFamily) : [];
  const mainTopic = record.topics[0];
  const sameTopic = mainTopic
    ? unifiedEvidenceCatalog.filter(r => r.id !== record.id && !family.includes(r) && r.topics.includes(mainTopic)).slice(0, 3)
    : [];
  const aliases = record.sourceIds.filter(s => s !== record.id);

  return (
    <div className="ev-page ev-sheet">
      <header className="ev-cover">
        <div className="ev-cover__meta at-mono" aria-hidden="true">
          <span>Prancha 01 · Ficha {record.id}</span><span>Herbário de evidências · LUPA</span>
        </div>
        <div className="ev-cover__copy">
          <Link href="/evidencias" className="ev-back"><ArrowLeft size={17} aria-hidden="true"/> Voltar ao explorador</Link>
          <p className="at-kicker">Ficha {record.id} · {designNames[record.design]}</p>
          <SplitTitle as="h1" lines={titleLines(record.title)} immediate className="ev-cover__title"/>
          <p className="ev-cover__lead">
            Ficha descritiva do catálogo LUPA, preservando a proveniência e as limitações dos documentos
            enviados. Os números ainda aguardam revisão detalhada dos originais.
          </p>
          {record.topics.length > 0 && (
            <ul className="ev-cover__topics" aria-label="Temas da referência">
              {record.topics.map(t => <li key={t}>{topicNames[t]}</li>)}
            </ul>
          )}
          <div className="ev-cover__actions">
            <Magnetic>
              <a href={record.url} target="_blank" rel="noopener noreferrer" className="at-btn at-btn--solid">
                Abrir a fonte original<span className="sr-only"> (abre em nova aba)</span> <ArrowUpRight size={18} aria-hidden="true"/>
              </a>
            </Magnetic>
            <a href="#resultado" className="at-btn at-btn--line">Ler a ficha</a>
          </div>
        </div>
        <div className="ev-cover__stage">
          <Parallax depth={0.22} rotate={1.2} className="ev-cover__fig">
            <figure>
              <CyanotypePlate src={plate.src} alt={plate.alt} priority sizes="(max-width: 900px) 80vw, 34vw"/>
              <figcaption className="at-mono">Fig. {record.id} — cianotipia</figcaption>
            </figure>
          </Parallax>
          <HerbariumLabel record={record} accessedAs={accessedAs}/>
          <Cutout name={cutoutNameFor(record.design)} className="ev-cut ev-cut--cover" depth={0.7} width={190} rotate={-10}/>
        </div>
      </header>

      <div className="ev-notice ev-notice--sheet" role="note">
        <span className="ev-notice__stamp at-mono" aria-hidden="true">Em curadoria</span>
        <p>
          <strong>Em curadoria · sem revisão clínica independente.</strong> Descrições, amostras e resultados são
          transcrições ou sínteses documentais; não são risco individual, aconselhamento médico nem indicação terapêutica.
          Este registro não está autorizado a alimentar projeções epidemiológicas.
        </p>
      </div>

      <div className="ev-sheet__body">
        <nav className="ev-toc" aria-label="Seções da ficha">
          <p className="ev-toc__id at-mono" aria-hidden="true">{record.id}</p>
          <ol>
            {toc.map(t => (
              <li key={t.id}><a href={"#" + t.id}><span className="at-mono" aria-hidden="true">{t.n}</span>{t.label}</a></li>
            ))}
          </ol>
        </nav>

        <div className="ev-sheet__main">
          <SheetSection id="passaporte" n="01" title="Passaporte da Evidência"
            description={"Resumo exportável desta ficha, com fonte, status de revisão e limites. Campos ausentes aparecem como “" + PASSPORT_MISSING + "”."}>
            <EvidencePassportBlock passport={passport}/>
          </SheetSection>

          <SheetSection id="resultado" n="02" title="Resultado descrito no material de pesquisa"
            description="Síntese documental, ainda não aprovada como número clínico para gráficos ou projeções.">
            {results.length ? (
              <Reveal as="ol" className="ev-obs">
                {results.map((r, i) => (
                  <li key={i}><span className="at-mono" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><p>{r}</p></li>
                ))}
              </Reveal>
            ) : (
              <p className="ev-prose">O material não apresenta resultado quantitativo detalhado para esta referência.</p>
            )}
            {complementary.length > 0 && (
              <div className="ev-versions">
                <h3>Outra transcrição do mesmo documento</h3>
                <p className="ev-block__desc">Registros do documento enviado pela equipe, conservados para auditoria de versões.</p>
                {complementary.map(item => (
                  <div key={item.sourceId} className="ev-versions__item">
                    <p><strong>Resumo informado:</strong> {item.reportedResult}</p>
                    <p><strong>Limite:</strong> {item.limitations}</p>
                  </div>
                ))}
              </div>
            )}
          </SheetSection>

          <SheetSection id="populacao" n="03" title="População, desenho ou contexto informado">
            {population.length ? (
              <Reveal className="ev-pop">
                {population.map((seg, i) => {
                  const l = labelled(seg);
                  return l
                    ? <Specimen key={i} id={record.id} label={l.label} value={l.value}/>
                    : <p key={i} className="ev-pop__text">{seg}</p>;
                })}
              </Reveal>
            ) : (
              <p className="ev-prose">Metadados amostrais ainda não organizados no catálogo.</p>
            )}
          </SheetSection>

          <SheetSection id="limites" n="04" title="Limitações da evidência">
            <LimitNote>
              <p>{record.limitations || "Limitações específicas ainda não revisadas; consulte a publicação original."}</p>
            </LimitNote>
            {hasFamily && (
              <div className="ev-family">
                <h3>Família do estudo</h3>
                <p className="ev-family__name at-mono">{record.studyFamily}</p>
                <p>Outras publicações dessa família podem compartilhar participantes. Não some amostras automaticamente.</p>
              </div>
            )}
          </SheetSection>

          <SheetSection id="fontes" n="05" title="Fonte original e identificadores"
            description="Abra o documento original em outra aba para conferir os resultados e o contexto.">
            <ul className="ev-sources">
              {record.references.map((ref, i) => (
                <li key={ref.sourceId}>
                  <a href={ref.url} target="_blank" rel="noopener noreferrer">
                    <span className="ev-sources__n at-mono" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    <span className="ev-sources__txt">Documento original <span className="at-mono">{hostOf(ref.url)}</span></span>
                    <span className="sr-only"> (abre em nova aba)</span>
                    <ArrowUpRight size={18} aria-hidden="true"/>
                  </a>
                </li>
              ))}
            </ul>
            <div className="ev-class">
              <Specimen id={record.id} label="Tratamento / contexto" value={record.drugs.map(d => drugNames[d]).join(" · ") || "Não informado"}/>
              <Specimen id={record.id} label="Natureza da fonte" value={sourceKindName(record.sourceKind)}/>
              <Specimen id={record.id} label="Projeção" value="Não autorizada"/>
            </div>
            <div className="ev-aliases">
              <h3>Aliases</h3>
              <p>Identificadores registrados: <span className="at-mono">{record.sourceIds.join(", ")}</span></p>
              {aliases.length > 0 ? (
                <p>
                  <span className="at-mono">{aliases.join(", ")}</span> {aliases.length > 1 ? "apontam" : "aponta"} para o mesmo documento que{" "}
                  <span className="at-mono">{record.id}</span>. Uma referência citada em mais de uma fonte da curadoria vira uma única ficha, para não ser contada duas vezes.
                </p>
              ) : (
                <p>Esta referência aparece com um único identificador no catálogo.</p>
              )}
            </div>
          </SheetSection>

          <SheetSection id="relacionados" n="06" title="Estudos relacionados">
            {family.length > 0 && (
              <div className="ev-rel">
                <h3>Publicações da mesma família</h3>
                <p className="ev-block__desc">Podem compartilhar participantes ou protocolo; não representam necessariamente amostras independentes.</p>
                <Reveal className="ev-rel__grid">
                  {family.map(item => (
                    <Specimen key={item.id} id={item.id} href={buildEvidenceHref(item.id)}
                      label={designNames[item.design] + " · " + yearName(item.year)} value={shortDescription(item.title, 80)}/>
                  ))}
                </Reveal>
              </div>
            )}
            {sameTopic.length > 0 && mainTopic && (
              <div className="ev-rel">
                <h3>Outras fichas com o tema {topicNames[mainTopic]}</h3>
                <p className="ev-block__desc">Compartilham um tema do catálogo; não medem necessariamente a mesma coisa.</p>
                <Reveal className="ev-rel__grid">
                  {sameTopic.map(item => (
                    <Specimen key={item.id} id={item.id} href={buildEvidenceHref(item.id)}
                      label={designNames[item.design] + " · " + yearName(item.year)} value={shortDescription(item.title, 80)}/>
                  ))}
                </Reveal>
              </div>
            )}
            <nav className="ev-step" aria-label="Navegação entre fichas">
              {prev ? (
                <Link href={buildEvidenceHref(prev.id)} className="ev-step__link ev-step__link--prev">
                  <span className="ev-step__dir at-mono"><ArrowLeft size={16} aria-hidden="true"/> Ficha anterior · {prev.id}</span>
                  <span className="ev-step__title">{shortDescription(prev.title, 90)}</span>
                </Link>
              ) : <span/>}
              {next && (
                <Link href={buildEvidenceHref(next.id)} className="ev-step__link ev-step__link--next">
                  <span className="ev-step__dir at-mono">Próxima ficha · {next.id} <ArrowRight size={16} aria-hidden="true"/></span>
                  <span className="ev-step__title">{shortDescription(next.title, 90)}</span>
                </Link>
              )}
            </nav>
          </SheetSection>

          <p className="ev-sheet__end">
            <Link href="/metodologia" className="ev-anatomy__more ev-anatomy__more--dark">
              Conheça a metodologia e as limitações <ArrowUpRight size={16} aria-hidden="true"/>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
