import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ArrowUpRight, BookOpenText, ExternalLink, FileCheck2,
  FlaskConical, Info, Layers3, ShieldAlert,
} from "lucide-react";
import { evidenceCatalog } from "@/features/evidence/catalog";
import { supplementalEvidenceCatalog } from "@/features/evidence/supplemental";
import {
  getUnifiedEvidence, unifiedEvidenceCatalog,
  type UnifiedEvidenceRecord,
} from "@/features/evidence/unified-catalog";
import {
  buildEvidenceHref, designNames, drugNames, priorityName, sourceKindName,
  topicNames, yearName,
} from "@/lib/evidence-presentation";

type EvidencePageProps = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export function generateStaticParams(): Array<{ id: string }> {
  return unifiedEvidenceCatalog.flatMap(item=>item.sourceIds.map(id=>({ id })));
}
export async function generateMetadata({ params }: EvidencePageProps): Promise<Metadata> {
  const {id}=await params;
  const record=getUnifiedEvidence(id);
  if(!record) return { title:"Referência não encontrada" };
  return {
    title:record.title,
    description:"Ficha científica em curadoria: "+record.id+
      ". Consulte a fonte, o contexto e as limitações antes de interpretar resultados.",
  };
}
function DetailSection({ title, children, description }: {
  title:string; children:React.ReactNode; description?:string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 sm:p-7">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      <div className="mt-4 text-sm leading-7 text-[#4e6570]">{children}</div>
    </section>
  );
}
function RelatedStudies({ record }: { record: UnifiedEvidenceRecord }) {
  if(!record.studyFamily || record.studyFamily === "META_ANALYSIS_OVERLAP_UNDETERMINED") return null;
  const related=unifiedEvidenceCatalog.filter(item=>
    item.id!==record.id && item.studyFamily===record.studyFamily
  );
  if(!related.length) return null;
  return (
    <DetailSection title="Publicações da mesma família"
      description="Podem compartilhar participantes ou protocolo; não representam necessariamente amostras independentes.">
      <div className="space-y-3">
        {related.map(item=>(
          <Link key={item.id} href={buildEvidenceHref(item.id)}
            className="flex items-start justify-between gap-4 rounded-xl border border-border p-3 transition-colors hover:border-[#9dc7c7] hover:bg-muted/40">
            <span>
              <span className="block text-xs font-semibold text-primary">{item.id}</span>
              <span className="mt-1 block text-sm font-medium text-foreground">{item.title}</span>
            </span>
            <ArrowUpRight aria-hidden="true" size={17} className="shrink-0 text-primary"/>
          </Link>
        ))}
      </div>
    </DetailSection>
  );
}

export default async function EvidenceDetailPage({params}:EvidencePageProps) {
  const {id}=await params;
  const record=getUnifiedEvidence(id);
  if(!record)notFound();

  const sourceVersions=supplementalEvidenceCatalog.filter(item=>record.sourceIds.includes(item.sourceId));
  const original=evidenceCatalog.find(item=>item.legacyId===record.id);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
      <Link href="/evidencias" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-primary underline-offset-4 hover:underline">
        <ArrowLeft size={17} aria-hidden="true"/> Voltar ao explorador
      </Link>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-[#17686b]">
          <BookOpenText aria-hidden="true" size={14}/> Ficha {record.id}
        </span>
        <span className="rounded-full border border-[#d6e3e5] bg-[#f4f7f8] px-3 py-1 text-xs font-medium text-[#526b75]">
          Em curadoria
        </span>
      </div>
      <h1 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
        {record.title}
      </h1>
      <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">
        Ficha descritiva do catálogo LUPA, preservando a proveniência e as limitações dos documentos
        enviados. Os números ainda aguardam revisão detalhada dos originais.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {record.topics.map(topic=><span key={topic} className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-[#17686b]">{topicNames[topic]}</span>)}
      </div>

      <section aria-label="Identificação da fonte"
        className="mt-8 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-white p-5 sm:grid-cols-4 sm:p-6">
        <div>
          <p className="text-xs text-muted-foreground">Ano</p>
          <p className="mt-1 text-sm font-semibold">{yearName(record.year)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Desenho / tipo</p>
          <p className="mt-1 text-sm font-semibold">{designNames[record.design]}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Origem</p>
          <p className="mt-1 text-sm font-semibold">{sourceKindName(record.sourceKind)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Identificador PubMed</p>
          <p className="mt-1 break-all text-sm font-semibold">{record.pmid??"Não informado"}</p>
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-[#cbdfe0] bg-[#edf6f6] px-4 py-4 sm:flex-row sm:items-start">
        <ShieldAlert size={21} aria-hidden="true" className="shrink-0 text-primary"/>
        <div>
          <h2 className="text-sm font-semibold">Aguardando revisão científica</h2>
          <p className="mt-1 text-xs leading-6 text-[#45626c]">
            Este registro não está autorizado a alimentar projeções epidemiológicas.
            Descrições, amostras e resultados são transcrições ou sínteses documentais;
            não são risco individual, aconselhamento médico nem indicação terapêutica.
            A prioridade editorial não mede a qualidade da evidência.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <DetailSection title="Resultado descrito no material de pesquisa"
            description="Síntese documental, ainda não aprovada como número clínico para gráficos ou projeções.">
            <p>{record.resultsSummary || "O material não apresenta resultado quantitativo detalhado para esta referência."}</p>
          </DetailSection>
          <DetailSection title="População, desenho ou contexto informado">
            <p>{record.populationSummary || "Metadados amostrais ainda não organizados no catálogo."}</p>
          </DetailSection>
          <DetailSection title="Limitações da evidência">
            <p>{record.limitations || "Limitações específicas ainda não revisadas; consulte a publicação original."}</p>
          </DetailSection>
          {sourceVersions.length>0 && (
            <DetailSection title="Notas da fonte complementar"
              description="Registros do documento enviado pela equipe, conservados para auditoria de versões.">
              <div className="space-y-4">
                {sourceVersions.map(item=>(
                  <div key={item.sourceId} className="rounded-xl border border-border p-4">
                    <p className="text-xs font-semibold text-primary">Origem {item.sourceId}</p>
                    <p className="mt-2"><strong className="font-semibold text-foreground">Resumo informado:</strong> {item.reportedResult}</p>
                    <p className="mt-2"><strong className="font-semibold text-foreground">Limite:</strong> {item.limitations}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{item.verificationNote}</p>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}
          <RelatedStudies record={record}/>
        </div>

        <aside className="space-y-5" aria-label="Rastreabilidade da referência">
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><FileCheck2 size={18} className="text-primary" aria-hidden="true"/> Fontes e identificadores</h2>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">Abra o documento original em outra aba para conferir os resultados e o contexto.</p>
            <ul className="mt-4 space-y-3">
              {record.references.map(ref=>(
                <li key={ref.sourceId}>
                  <a href={ref.url} target="_blank" rel="noopener noreferrer"
                    className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-border px-3 text-sm font-medium text-primary hover:border-[#99c9c7] hover:bg-muted/40">
                    <span>Fonte {ref.sourceId}</span>
                    <ExternalLink aria-hidden="true" size={16}/>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">Identificadores registrados: {record.sourceIds.join(", ")}</p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><FlaskConical aria-hidden="true" size={18} className="text-primary"/> Classificação</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Prioridade</dt>
                <dd className="mt-1 font-medium">{priorityName(record.priority)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Tratamento / contexto</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {record.drugs.map(drug=><span key={drug} className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-[#17686b]">{drugNames[drug]}</span>)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Projeção</dt>
                <dd className="mt-1 font-medium">Não autorizada</dd>
              </div>
            </dl>
          </div>

          {record.studyFamily && record.studyFamily!=="META_ANALYSIS_OVERLAP_UNDETERMINED" && (
            <div className="rounded-2xl border border-border bg-white p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold"><Layers3 aria-hidden="true" size={18} className="text-primary"/> Família do estudo</h2>
              <p className="mt-2 break-words text-sm font-medium">{record.studyFamily}</p>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">Outras publicações dessa família podem compartilhar participantes. Não some amostras automaticamente.</p>
            </div>
          )}
          {original && (
            <div className="rounded-2xl border border-border bg-white p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold"><Info aria-hidden="true" size={18} className="text-primary"/> Auditoria inicial</h2>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">{original.sourceVerificationNote}</p>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">{original.rateUseNote}</p>
            </div>
          )}
        </aside>
      </div>
      <p className="mt-10 text-center text-xs text-muted-foreground">
        <Link href="/metodologia" className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline">
          Conheça a metodologia e as limitações <ArrowUpRight size={14} aria-hidden="true"/>
        </Link>
      </p>
    </div>
  );
}
