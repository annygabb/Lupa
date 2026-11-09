import { getEvidenceById } from "@/features/evidence/catalog";
import {
  assessProjectionEligibility, type EvidenceBlockCode, type ProjectionCandidate,
} from "@/features/evidence/projection-guard";
import { blockerCopy } from "@/features/interpretation/blocker-copy";

/**
 * Prancha 06 — "Por que o LUPA se recusa a projetar".
 * Todos os códigos vêm de `blockerCopy` (Record exaustivo sobre EvidenceBlockCode) e o
 * exemplo E12 é avaliado pelo próprio guard — nada de lista ou resultado escrito à mão.
 */
export const blockerCodes = Object.keys(blockerCopy) as EvidenceBlockCode[];

const e12 = getEvidenceById("E12");
if (!e12) throw new Error("Registro E12 ausente do catálogo");

const toInt = (s: string | undefined) => s ? Number(s.replace(/\./g, "")) : NaN;
const studies = toInt(e12.populationAndArms.match(/(\d[\d.]*)\s+estudos/)?.[1]);
const participants = toInt(e12.populationAndArms.match(/(\d[\d.]*)\s+participantes/)?.[1]);
if (!Number.isInteger(studies) || !Number.isInteger(participants)) throw new Error("E12 sem estudos/participantes legíveis");
const reportsOR = /\bOR\b/.test(e12.resultsSummary);

/**
 * EXEMPLO curado para a metodologia, não registro aprovado. Campos vindos do catálogo:
 * status de revisão, tipo de fonte, nº de participantes e medida de efeito (OR).
 * Campos que a curadoria ainda não registrou ficam null/false — não são inventados.
 * O uso hipotético simulado é ligar o medicamento ao desfecho na UTI.
 */
export const e12Candidate: ProjectionCandidate = {
  reviewStatus: e12.curationStatus,
  sourceType: e12.sourceType,
  publicationId: e12.legacyId,
  cohortId: `${e12.legacyId}-metanalise-${studies}-estudos`,
  outcomeCode: "icu_mortality_short_term",
  measureKind: "proportion",
  sourceLocator: null,
  reportedUnit: reportsOR ? "OR" : null,
  followupWeeks: null,
  analyzedN: participants,
  numerator: null,
  denominator: null,
  personTimeDenominator: null,
  populationCompatibilityReviewed: false,
  timeCompatibilityReviewed: false,
  overlapChecked: false,
  associationOnly: true,
  hypotheticalDrugIcuLink: true,
  effectMeasure: reportsOR ? "OR" : null,
  baselineRiskReviewed: false,
};

export const e12Example = {
  isExample: true as const,
  recordId: e12.legacyId,
  title: e12.title,
  sourceUrl: e12.sourceUrl,
  studies,
  participants,
  effectMeasure: e12Candidate.effectMeasure,
  candidate: e12Candidate,
  assessment: assessProjectionEligibility(e12Candidate),
  /** Ficha legível: de onde veio cada campo do candidato. */
  fields: [
    { label: "Registro", value: `${e12.legacyId} · ${e12.title}`, origin: "catálogo" },
    { label: "Tamanho", value: `${studies} estudos · ${participants.toLocaleString("pt-BR")} participantes`, origin: "catálogo" },
    { label: "Medida de efeito", value: reportsOR ? "OR (razão de chances)" : "não informada", origin: "catálogo" },
    { label: "Status de revisão", value: "candidato · sem revisão clínica independente", origin: "catálogo" },
    { label: "Natureza do achado", value: "associação observacional", origin: "catálogo" },
    { label: "Uso pretendido no exemplo", value: "ligar medicamento → mortalidade na UTI", origin: "premissa hipotética do exemplo" },
    { label: "Localizador, seguimento, contagens e risco basal", value: "não registrados na curadoria", origin: "ausente · não inventado" },
  ],
};
