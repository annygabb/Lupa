import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supplementalEvidenceCatalog } from "@/features/evidence/supplemental";
import { getUnifiedEvidence, unifiedEvidenceCatalog } from "@/features/evidence/unified-catalog";
import { EvidenceSheet } from "@/components/routes/evidencias/sheet";
import "../evidencias.css";

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

export default async function EvidenceDetailPage({params}:EvidencePageProps) {
  const {id}=await params;
  const record=getUnifiedEvidence(id);
  if(!record)notFound();

  // Transcrições de outras fontes que apontam para o mesmo documento (aliases), sem campos internos.
  const complementary=supplementalEvidenceCatalog.filter(item=>
    item.sourceId!==record.id && record.sourceIds.includes(item.sourceId));

  return <EvidenceSheet record={record} accessedAs={id.trim().toUpperCase()} complementary={complementary}/>;
}
