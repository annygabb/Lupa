import Link from "next/link";
import { unifiedEvidenceCatalog, type EvidenceTopic } from "@/features/evidence/unified-catalog";
import { designNames, topicNames } from "@/lib/evidence-presentation";
import { Cutout, SplitTitle, CountUp } from "./motion";

/** Grupos editoriais: cada estudo entra uma vez, pelo primeiro tema que se encaixa. */
const groups: { key: string; label: string; topics: EvidenceTopic[] }[] = [
  { key: "muscle", label: "Músculo e UTI", topics: ["muscle", "sarcopenia", "icu"] },
  { key: "mental", label: "Saúde mental", topics: ["mental", "quality_of_life"] },
  { key: "safety", label: "Segurança e órgãos", topics: ["safety", "gastrointestinal", "pancreas", "biliary", "kidney", "liver", "eyes", "misuse"] },
  { key: "weight", label: "Peso e continuidade", topics: ["weight", "treatment", "appetite"] },
  { key: "brazil", label: "Brasil e regulação", topics: ["brazil", "regulation"] },
];

const shapeFor: Record<string, string> = {
  clinical_trial: "trial", meta_analysis: "meta", systematic_review: "meta", pooled_analysis: "meta",
  post_hoc: "posthoc", observational: "obs", regulatory: "reg", pharmacovigilance: "reg",
};

export function ArchiveField() {
  const placed = new Set<string>();
  const columns = groups.map(g => {
    const items = unifiedEvidenceCatalog.filter(r => !placed.has(r.id) && r.topics.some(t => g.topics.includes(t)));
    items.forEach(r => placed.add(r.id));
    return { ...g, items };
  });
  const rest = unifiedEvidenceCatalog.filter(r => !placed.has(r.id));
  if (rest.length) columns[columns.length - 1].items.push(...rest);

  return (
    <section className="at-archive" data-chapter="O acervo" aria-labelledby="archive-title">
      <Cutout name="dente-de-leao" white depth={0.8} rotate={6} width={170} className="at-archive__cut"/>
      <Cutout name="semente-alada" white depth={1.1} rotate={-20} width={120} className="at-archive__cut2"/>
      <header className="at-sec-head at-sec-head--light">
        <p className="at-kicker">Capítulo V · O acervo</p>
        <SplitTitle id="archive-title" lines={["50 estudos.", "Cada um com população,", "método e limite."]}/>
        <p>Cada marca é uma das 50 referências únicas em curadoria do catálogo, agrupada por tema. A forma indica o tipo de estudo. Todas seguem em curadoria, sem revisão clínica independente.</p>
      </header>

      <div className="at-archive__legend at-mono" aria-hidden="true">
        <span><i className="at-spec at-spec--trial"/>Ensaio clínico</span>
        <span><i className="at-spec at-spec--meta"/>Metanálise / revisão</span>
        <span><i className="at-spec at-spec--posthoc"/>Análise pós-hoc</span>
        <span><i className="at-spec at-spec--obs"/>Observacional</span>
        <span><i className="at-spec at-spec--reg"/>Documento regulatório</span>
        <span><i className="at-spec at-spec--other"/>Outros</span>
      </div>

      <div className="at-archive__field">
        {columns.map(col => (
          <div key={col.key} className="at-archive__col">
            <h3><span className="at-mono">{String(col.items.length).padStart(2, "0")}</span>{col.label}</h3>
            <ul>
              {col.items.map(r => (
                <li key={r.id}>
                  <Link href={`/evidencias/${r.id}`} className="at-archive__spec">
                    <i className={`at-spec at-spec--${shapeFor[r.design] ?? "other"}`} aria-hidden="true"/>
                    <span className="at-archive__tip">
                      <b className="at-mono">{r.id} · {r.year ?? "s/ ano"}</b>
                      {r.title}
                      <em>{designNames[r.design]} · {r.topics.slice(0, 2).map(t => topicNames[t]).join(" · ")}</em>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <dl className="at-archive__counts">
        <div><dt>Referências únicas no acervo</dt><dd><CountUp value={50}/></dd></div>
        <div><dt>Indicadores conferidos no artigo original</dt><dd><CountUp value={5}/></dd></div>
        <div><dt>Projeções clínicas feitas pelo LUPA</dt><dd>0</dd></div>
      </dl>
      <Link className="at-btn at-btn--light" href="/evidencias">Abrir o explorador de evidências</Link>
    </section>
  );
}
