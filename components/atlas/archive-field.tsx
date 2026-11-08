import Link from "next/link";
import { unifiedEvidenceCatalog, type EvidenceTopic } from "@/features/evidence/unified-catalog";
import { designNames, topicNames } from "@/lib/evidence-presentation";

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
      <header className="at-sec-head at-sec-head--light">
        <p className="at-kicker">Prancha 00.4 · O acervo</p>
        <h2 id="archive-title">50 estudos.<br/>Nenhum lido pela metade.</h2>
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
                  <Link href={`/evidencias/${r.id}`} className="at-archive__spec" aria-label={`${r.id}: ${r.title} — ${designNames[r.design]}`}>
                    <i className={`at-spec at-spec--${shapeFor[r.design] ?? "other"}`} aria-hidden="true"/>
                    <span className="at-archive__tip" aria-hidden="true">
                      <b className="at-mono">{r.id} · {r.year ?? "s/ ano"}</b>
                      {r.title}
                      <em>{r.topics.slice(0, 2).map(t => topicNames[t]).join(" · ")}</em>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <dl className="at-archive__counts">
        <div><dt>Referências canônicas</dt><dd>50</dd></div>
        <div><dt>Indicadores conferidos na fonte</dt><dd>5</dd></div>
        <div><dt>Projeções clínicas autorizadas</dt><dd>0</dd></div>
      </dl>
      <Link className="at-btn at-btn--light" href="/evidencias">Abrir o explorador de evidências</Link>
    </section>
  );
}
