import type {
  DrugFilter, EvidenceDesign, EvidenceTopic,
  UnifiedEvidenceRecord,
} from "@/features/evidence/unified-catalog";

export const topicNames: Record<EvidenceTopic, string> = {
  mental: "Saúde mental", quality_of_life: "Qualidade de vida",
  muscle: "Composição muscular", sarcopenia: "Sarcopenia",
  icu: "UTI e recuperação", safety: "Segurança",
  gastrointestinal: "Sistema gastrointestinal", pancreas: "Pâncreas",
  biliary: "Vesícula", kidney: "Rins", liver: "Fígado",
  eyes: "Visão", brazil: "Brasil", regulation: "Regulação",
  appetite: "Apetite", weight: "Emagrecimento",
  treatment: "Continuidade", misuse: "Uso inadequado",
};

export const drugNames: Record<DrugFilter, string> = {
  tirzepatide: "Tirzepatida", semaglutide: "Semaglutida",
  liraglutide: "Liraglutida", glp1_class: "Classe GLP-1",
  not_applicable: "Sem fármaco específico",
};

export const designNames: Record<EvidenceDesign, string> = {
  clinical_trial: "Ensaio clínico",
  post_hoc: "Análise secundária",
  meta_analysis: "Metanálise",
  systematic_review: "Revisão sistemática",
  observational: "Estudo observacional",
  narrative_review: "Revisão narrativa",
  pooled_analysis: "Análise agrupada",
  pharmacovigilance: "Farmacovigilância",
  regulatory: "Fonte regulatória",
  consensus: "Consenso científico",
  other: "Outro documento",
};

export function sourceKindName(value: UnifiedEvidenceRecord["sourceKind"]): string {
  return value === "regulatory" ? "Documento oficial" : "Publicação científica";
}

export function priorityName(value: UnifiedEvidenceRecord["priority"]): string {
  return value ? "Fila editorial " + value : "Sem prioridade editorial";
}

export function yearName(year: number | null): string {
  return year === null ? "Ano não informado" : String(year);
}

export function buildEvidenceHref(id: string): string {
  if (!/^[EPR]\d{2}$/.test(id)) throw new Error("Identificador inválido");
  return "/evidencias/" + encodeURIComponent(id);
}

export function shortDescription(text: string, limit = 190): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= limit) return compact;
  const slice = compact.slice(0, limit - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return slice.slice(0, lastSpace > limit / 2 ? lastSpace : slice.length).trimEnd() + "…";
}

export function isSourceApproved(record: UnifiedEvidenceRecord): boolean {
  return record.curationStatus !== "candidate" && record.projectionApproved;
}
