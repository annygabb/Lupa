/**
 * Dados de apresentação do herbário de evidências (/evidencias e /evidencias/[id]).
 * Só reorganiza o catálogo de features/evidence; não cria conteúdo científico.
 */
import type {
  DrugFilter, EvidenceDesign, EvidenceTopic, UnifiedEvidenceRecord,
} from "@/features/evidence/unified-catalog";

export const PAGE_SIZE = 9;

/** Temas em destaque (chips). Os rótulos são o contrato dos testes e2e. */
export const highlightedTopics: Array<{ label: string; topic: EvidenceTopic }> = [
  { label: "Saúde mental", topic: "mental" },
  { label: "Músculos", topic: "muscle" },
  { label: "Sarcopenia", topic: "sarcopenia" },
  { label: "UTI", topic: "icu" },
  { label: "Segurança", topic: "safety" },
  { label: "Brasil", topic: "brazil" },
];

export const allDrugs: DrugFilter[] = ["tirzepatide", "semaglutide", "liraglutide", "glp1_class", "not_applicable"];
export const allDesigns: EvidenceDesign[] = [
  "clinical_trial", "post_hoc", "meta_analysis", "systematic_review",
  "observational", "narrative_review", "pooled_analysis", "pharmacovigilance",
  "regulatory", "consensus", "other",
];
export const years: number[] = Array.from({ length: 2026 - 2000 + 1 }, (_, i) => 2026 - i);

export type SortKey = "priority" | "newest" | "oldest" | "title";
export const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "priority", label: "Prioridade editorial" },
  { value: "newest", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
  { value: "title", label: "Título A–Z" },
];

/** Recorte botânico que "prensa" cada tipo de documento no herbário (decorativo). */
const cutoutByDesign: Record<EvidenceDesign, string> = {
  clinical_trial: "samambaia-curta",
  post_hoc: "folhas-soltas",
  meta_analysis: "ginkgo",
  systematic_review: "ginkgo",
  pooled_analysis: "ginkgo",
  observational: "eucalipto",
  narrative_review: "semente-alada",
  consensus: "semente-alada",
  pharmacovigilance: "dente-de-leao",
  regulatory: "dente-de-leao",
  other: "samambaia-alta",
};
export function cutoutNameFor(design: EvidenceDesign): string {
  return cutoutByDesign[design];
}
export function cutoutFor(design: EvidenceDesign, white = false): string {
  return `/assets/images/recortes/${cutoutByDesign[design]}${white ? "-branco" : ""}.webp`;
}

/** Prancha ilustrada da ficha, escolhida pelo primeiro tema do registro. */
const plates = {
  muscle: { src: "musculo", alt: "Cianotipia de feixes de fibras musculares em estilo de gravura anatômica" },
  composition: { src: "corpo-composicao", alt: "Cianotipia de um estudo anatômico translúcido de uma figura humana, com camadas de gordura e músculo" },
  icu: { src: "uti", alt: "Cianotipia de um leito hospitalar com monitor cardíaco" },
  mental: { src: "cerebro", alt: "Cianotipia de um cérebro humano com neurônios que crescem como raízes" },
  organs: { src: "orgaos-1", alt: "Cianotipia anatômica de fígado, vesícula, estômago e pâncreas" },
  globe: { src: "globo", alt: "Cianotipia de um globo terrestre antigo com folhas ao redor da base" },
  scale: { src: "balanca-1", alt: "Cianotipia de uma balança de banheiro antiga vista de cima, entre folhas e comprimidos" },
  studies: { src: "estudos-1", alt: "Cianotipia de um livro, folhas de pesquisa com um gráfico e uma lupa" },
} as const;
const plateByTopic: Partial<{ [K in EvidenceTopic]: keyof typeof plates }> = {
  muscle: "muscle", sarcopenia: "composition", icu: "icu",
  mental: "mental", quality_of_life: "mental",
  safety: "organs", gastrointestinal: "organs", pancreas: "organs", biliary: "organs",
  kidney: "organs", liver: "organs", eyes: "organs", misuse: "organs",
  brazil: "globe", regulation: "globe",
  weight: "scale", treatment: "scale", appetite: "scale",
};
export function plateFor(topics: readonly EvidenceTopic[]): { src: string; alt: string } {
  const key = topics.map(t => plateByTopic[t]).find(Boolean) ?? "studies";
  const p = plates[key];
  return { src: `/assets/images/cianotipia/${p.src}.webp`, alt: p.alt };
}

/** Os resumos usam " | " e "•" como separadores; viram listas legíveis. */
export function splitSummary(text: string): string[] {
  return text.split(/\s*[|•]\s*/).map(s => s.replace(/\s+/g, " ").trim())
    // "Prioridade: P0" é um campo interno da fila de curadoria, não conteúdo para o público.
    .filter(s => s && !/^prioridade\s*:/i.test(s));
}

export function filterSignature(parts: ReadonlyArray<string | number>): string {
  return parts.join("¦");
}

export type { UnifiedEvidenceRecord };
