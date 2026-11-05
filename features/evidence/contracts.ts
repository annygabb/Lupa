// Gerado a partir da proposta aprovada (20 entidades, 181 campos).
// Contratos de dados, NÃO migrações e NÃO modelos com dados reais de pacientes.
import { z } from "zod";

/** Princípios ativos, sem orientação de dose ao paciente. */
export const drugsSchema = z.strictObject({
  id: z.string().uuid(),
  inn: z.string().trim().min(1),
  class_name: z.string().trim().min(1),
  display_name: z.string().trim().min(1),
  regulatory_notes: z.string().trim().min(1),
  updated_at: z.string().datetime({ offset: true }),
});
export type Drugs = z.infer<typeof drugsSchema>;

/** Identifica famílias com subestudos ou publicações compartilhando pessoas. */
export const studySeriesSchema = z.strictObject({
  id: z.string().uuid(),
  series_code: z.string().trim().min(1),
  label: z.string().trim().min(1),
  overlap_warning: z.string().trim().min(1),
});
export type StudySeries = z.infer<typeof studySeriesSchema>;

/** Entidade de pesquisa; não confundir com um artigo/publicação. */
export const studiesSchema = z.strictObject({
  id: z.string().uuid(),
  series_id: z.string().uuid().nullable(),
  registry_id: z.string().nullable(),
  short_name: z.string().trim().min(1),
  design: z.string().trim().min(1),
  study_status: z.enum(["completed","recruiting","protocol","synthesis"]),
  clinical_population: z.string().trim().min(1),
  duration_weeks: z.number().finite().nonnegative().nullable(),
  independence_note: z.string().trim().min(1),
});
export type Studies = z.infer<typeof studiesSchema>;

/** Documentos com DOI/PMID/link e histórico de acesso. */
export const publicationsSchema = z.strictObject({
  id: z.string().uuid(),
  legacy_eid: z.string().regex(/^E\d{2}$/).nullable(),
  title: z.string().trim().min(1),
  pub_year: z.number().int().min(1900).max(2100),
  document_type: z.enum(["article","consensus","protocol","regulatory_label","regulatory_notice","systematic_review","dataset"]),
  doi: z.string().nullable(),
  pmid: z.string().nullable(),
  pmcid: z.string().nullable(),
  source_url: z.string().url().refine((url) => url.startsWith("https://"), "HTTPS obrigatório"),
  source_publisher: z.string().trim().min(1),
  licence_text: z.string().trim().min(1),
  source_checked_at: z.string().datetime({ offset: true }),
  curation_status: z.enum(["candidate","extracted","reviewed","published","rejected"]),
  source_hash: z.string().trim().min(1),
});
export type Publications = z.infer<typeof publicationsSchema>;

/** Relação N:N entre pesquisa e publicações da mesma pesquisa. */
export const studyPublicationsSchema = z.strictObject({
  study_id: z.string().uuid(),
  publication_id: z.string().uuid(),
  publication_role: z.enum(["primary","extension","substudy","posthoc","protocol"]),
  shared_participants: z.boolean(),
});
export type StudyPublications = z.infer<typeof studyPublicationsSchema>;

/** Estratos amostrais, inclusive subgrupos, com N e critérios. */
export const studyCohortsSchema = z.strictObject({
  id: z.string().uuid(),
  study_id: z.string().uuid(),
  parent_cohort_id: z.string().uuid().nullable(),
  label: z.string().trim().min(1),
  geography: z.string().trim().min(1),
  criteria_summary: z.string().trim().min(1),
  planned_n: z.number().int().nonnegative().nullable(),
  enrolled_n: z.number().int().nonnegative().nullable(),
  analyzed_n: z.number().int().nonnegative().nullable(),
  selection_note: z.string().trim().min(1),
});
export type StudyCohorts = z.infer<typeof studyCohortsSchema>;

/** Braços de tratamento/controle ou categorias observacionais. */
export const studyArmsSchema = z.strictObject({
  id: z.string().uuid(),
  cohort_id: z.string().uuid(),
  drug_id: z.string().uuid().nullable(),
  arm_label: z.string().trim().min(1),
  arm_kind: z.enum(["treatment","placebo","control","observation"]),
  intervention_description: z.string().trim().min(1),
  n_randomized: z.number().int().nonnegative().nullable(),
  n_analyzed: z.number().int().nonnegative().nullable(),
});
export type StudyArms = z.infer<typeof studyArmsSchema>;

/** Vocabulário controlado e tipo de medida; evita comparar kg com %. */
export const outcomesSchema = z.strictObject({
  id: z.string().uuid(),
  code: z.string().trim().min(1),
  label: z.string().trim().min(1),
  domain: z.enum(["metabolic","muscle","mental","icu","safety","policy"]),
  default_unit: z.string().trim().min(1),
  measurement_method: z.string().trim().min(1),
  direction_note: z.string().trim().min(1),
});
export type Outcomes = z.infer<typeof outcomesSchema>;

/** Estatísticas observadas por coorte/braço/desfecho/tempo. */
export const outcomeObservationsSchema = z.strictObject({
  id: z.string().uuid(),
  publication_id: z.string().uuid(),
  cohort_id: z.string().uuid(),
  arm_id: z.string().uuid().nullable(),
  outcome_id: z.string().uuid(),
  followup_weeks: z.number().finite().nonnegative().nullable(),
  measure_kind: z.enum(["count","proportion","mean","change","rate","textual"]),
  reported_value: z.number().finite(),
  reported_unit: z.string().trim().min(1),
  numerator: z.number().int().nonnegative().nullable(),
  denominator: z.number().int().positive().nullable(),
  sd_value: z.number().finite(),
  ci_lower: z.number().finite(),
  ci_upper: z.number().finite(),
  ci_level: z.number().finite().min(0).max(1),
  source_locator: z.string().trim().min(1),
  is_projection_eligible: z.boolean(),
  extraction_note: z.string().trim().min(1),
}).superRefine((value, ctx) => {
  if (value.numerator !== null && value.denominator !== null && value.numerator > value.denominator)
    ctx.addIssue({ code: "custom", path: ["numerator"], message: "Numerador maior que denominador" });
  if (value.ci_lower !== null && value.ci_upper !== null && value.ci_lower > value.ci_upper)
    ctx.addIssue({ code: "custom", path: ["ci_lower"], message: "Intervalo de confiança invertido" });
  if (value.measure_kind === "proportion" && value.reported_unit === "%" &&
      value.reported_value !== null && (value.reported_value < 0 || value.reported_value > 100))
    ctx.addIssue({ code: "custom", path: ["reported_value"], message: "Proporção fora de 0–100%" });
});
export type OutcomeObservations = z.infer<typeof outcomeObservationsSchema>;

/** Comparações entre braços ou associações, com tipo de estimativa explícito. */
export const effectEstimatesSchema = z.strictObject({
  id: z.string().uuid(),
  publication_id: z.string().uuid(),
  outcome_id: z.string().uuid(),
  comparison_label: z.string().trim().min(1),
  arm_exposed_id: z.string().uuid().nullable(),
  arm_reference_id: z.string().uuid().nullable(),
  effect_measure: z.enum(["RR","OR","HR","mean_difference","percentage_points"]),
  effect_value: z.number().finite(),
  ci_lower: z.number().finite(),
  ci_upper: z.number().finite(),
  ci_level: z.number().finite().min(0).max(1),
  p_value: z.number().finite().min(0).max(1),
  association_only: z.boolean(),
  source_locator: z.string().trim().min(1),
}).superRefine((value, ctx) => {
  if (value.ci_lower !== null && value.ci_upper !== null && value.ci_lower > value.ci_upper)
    ctx.addIssue({ code: "custom", path: ["ci_lower"], message: "Intervalo de confiança invertido" });
  if (["RR","OR","HR"].includes(value.effect_measure) && value.effect_value <= 0)
    ctx.addIssue({ code: "custom", path: ["effect_value"], message: "Razão de efeito deve ser positiva" });
});
export type EffectEstimates = z.infer<typeof effectEstimatesSchema>;

/** Aprovação editorial por publicação/desfecho, separada da extração. */
export const evidenceReviewsSchema = z.strictObject({
  id: z.string().uuid(),
  publication_id: z.string().uuid(),
  outcome_id: z.string().uuid().nullable(),
  status: z.enum(["candidate","extracted","reviewed","approved_for_display","approved_for_projection","rejected"]),
  reviewer_label: z.string().trim().min(1),
  reviewed_at: z.string().datetime({ offset: true }),
  denominator_checked: z.boolean(),
  population_checked: z.boolean(),
  time_checked: z.boolean(),
  overlap_checked: z.boolean(),
  limitation_note: z.string().trim().min(1),
});
export type EvidenceReviews = z.infer<typeof evidenceReviewsSchema>;

/** Perguntas de pesquisa, sem promessas clínicas nem incidência inventada. */
export const hypothesesSchema = z.strictObject({
  id: z.string().uuid(),
  code: z.string().trim().min(1),
  question: z.string().trim().min(1),
  scientific_status: z.enum(["supported","indirect","exploratory","insufficient"]),
  causal_projection_allowed: z.boolean(),
  reason: z.string().trim().min(1),
});
export type Hypotheses = z.infer<typeof hypothesesSchema>;

/** Mapa N:N da hipótese com referências e tipos de ligação. */
export const hypothesisEvidenceSchema = z.strictObject({
  hypothesis_id: z.string().uuid(),
  publication_id: z.string().uuid(),
  relation_kind: z.enum(["direct","indirect","context","contradicts","missing_link"]),
  rationale: z.string().trim().min(1),
});
export type HypothesisEvidence = z.infer<typeof hypothesisEvidenceSchema>;

/** Fontes agregadas do Brasil/EUA; guardam escopo amostral. */
export const populationDatasetsSchema = z.strictObject({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  provider: z.string().trim().min(1),
  source_url: z.string().url().refine((url) => url.startsWith("https://"), "HTTPS obrigatório"),
  reference_year: z.number().int().min(1900).max(2100),
  geo_scope: z.string().trim().min(1),
  measurement_mode: z.string().trim().min(1),
  sampling_warning: z.string().trim().min(1),
});
export type PopulationDatasets = z.infer<typeof populationDatasetsSchema>;

/** Indicadores nacionais/subgrupos sem dados pessoais. */
export const populationIndicatorsSchema = z.strictObject({
  id: z.string().uuid(),
  dataset_id: z.string().uuid(),
  outcome_id: z.string().uuid(),
  region_code: z.string().trim().min(1),
  reference_year: z.number().int().min(1900).max(2100),
  age_band: z.string().trim().min(1),
  sex_stratum: z.string().trim().min(1),
  numerator: z.number().int().nonnegative().nullable(),
  denominator: z.number().int().positive().nullable(),
  estimate_value: z.number().finite(),
  estimate_unit: z.string().trim().min(1),
  ci_lower: z.number().finite(),
  ci_upper: z.number().finite(),
  sampling_note: z.string().trim().min(1),
});
export type PopulationIndicators = z.infer<typeof populationIndicatorsSchema>;

/** Cabeçalho e versão imutável de um conjunto de hipóteses. */
export const scenarioVersionsSchema = z.strictObject({
  id: z.string().uuid(),
  scenario_code: z.string().trim().min(1),
  version_no: z.number().int().min(1),
  base_year: z.number().int().min(1900).max(2100),
  end_year: z.number().int().min(1900).max(2100),
  model_version: z.string().trim().min(1),
  data_snapshot_hash: z.string().trim().min(1),
  input_hash: z.string().trim().min(1),
  status: z.enum(["draft","reviewed","published"]),
  created_at: z.string().datetime({ offset: true }),
});
export type ScenarioVersions = z.infer<typeof scenarioVersionsSchema>;

/** Hipóteses editáveis, indicando o que é observado e o que é simulação. */
export const scenarioParametersSchema = z.strictObject({
  id: z.string().uuid(),
  scenario_version_id: z.string().uuid(),
  year: z.number().int().min(1900).max(2100),
  param_code: z.string().trim().min(1),
  numeric_value: z.number().finite(),
  unit: z.string().trim().min(1),
  is_hypothetical: z.boolean(),
  population_indicator_id: z.string().uuid().nullable(),
  publication_id: z.string().uuid().nullable(),
  lower_assumption: z.number().finite(),
  upper_assumption: z.number().finite(),
  rationale: z.string().trim().min(1),
});
export type ScenarioParameters = z.infer<typeof scenarioParametersSchema>;

/** Série temporal agregada com incerteza e nenhuma pessoa identificada. */
export const scenarioYearlyResultsSchema = z.strictObject({
  id: z.string().uuid(),
  scenario_version_id: z.string().uuid(),
  year: z.number().int().min(1900).max(2100),
  metric_code: z.string().trim().min(1),
  estimate_value: z.number().finite(),
  unit: z.string().trim().min(1),
  ci_lower: z.number().finite(),
  ci_upper: z.number().finite(),
  calculation_status: z.enum(["calculated","insufficient_evidence"]),
  calculation_note: z.string().trim().min(1),
});
export type ScenarioYearlyResults = z.infer<typeof scenarioYearlyResultsSchema>;

/** Trilha de quais documentos sustentam determinada versão de cenário. */
export const scenarioEvidenceSchema = z.strictObject({
  scenario_version_id: z.string().uuid(),
  publication_id: z.string().uuid(),
  usage_kind: z.string().trim().min(1),
});
export type ScenarioEvidence = z.infer<typeof scenarioEvidenceSchema>;

/** Histórico mínimo de alterações, sem informações pessoais de pacientes. */
export const curationAuditLogSchema = z.strictObject({
  id: z.string().uuid(),
  entity_name: z.string().trim().min(1),
  entity_id: z.string().uuid(),
  operation: z.string().trim().min(1),
  actor_label: z.string().trim().min(1),
  change_reason: z.string().trim().min(1),
  before_sha256: z.string().trim().min(1),
  after_sha256: z.string().trim().min(1),
  occurred_at: z.string().datetime({ offset: true }),
});
export type CurationAuditLog = z.infer<typeof curationAuditLogSchema>;

export const dataModelSchemas = {
  drugs: drugsSchema,
  study_series: studySeriesSchema,
  studies: studiesSchema,
  publications: publicationsSchema,
  study_publications: studyPublicationsSchema,
  study_cohorts: studyCohortsSchema,
  study_arms: studyArmsSchema,
  outcomes: outcomesSchema,
  outcome_observations: outcomeObservationsSchema,
  effect_estimates: effectEstimatesSchema,
  evidence_reviews: evidenceReviewsSchema,
  hypotheses: hypothesesSchema,
  hypothesis_evidence: hypothesisEvidenceSchema,
  population_datasets: populationDatasetsSchema,
  population_indicators: populationIndicatorsSchema,
  scenario_versions: scenarioVersionsSchema,
  scenario_parameters: scenarioParametersSchema,
  scenario_yearly_results: scenarioYearlyResultsSchema,
  scenario_evidence: scenarioEvidenceSchema,
  curation_audit_log: curationAuditLogSchema,
} as const;
export type DataModelTable = keyof typeof dataModelSchemas;
export type ModelRecord<T extends DataModelTable> = z.infer<(typeof dataModelSchemas)[T]>;
