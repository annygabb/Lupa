import { describe, expect, it } from "vitest";
import {
  PASSPORT_DISCLAIMER, PASSPORT_MISSING, PASSPORT_SCHEMA_VERSION,
  buildEvidencePassport, evidencePassportSchema, parsePassportJSON,
  passportFileName, passportReviewSummary, passportToJSON, passportToMarkdown,
} from "@/features/evidence/passport";
import { listExactAliases, unifiedEvidenceCatalog } from "@/features/evidence/unified-catalog";

const fixedDate = new Date("2026-11-08T12:00:00.000Z");

describe("Passaporte da Evidência — identidade e aliases", () => {
  it("resolve alias para o registro canônico sem duplicar a evidência", () => {
    const viaAlias = buildEvidencePassport("P20", { exportedAt: fixedDate });
    const canonical = buildEvidencePassport("E04", { exportedAt: fixedDate });
    expect(viaAlias?.lupaId).toBe("E04");
    expect(viaAlias?.requestedId).toBe("P20");
    expect(viaAlias?.sourceIds).toEqual(canonical?.sourceIds);
    expect(viaAlias?.aliases).toContain("P20");
    expect(viaAlias?.aliases).not.toContain("E04");
    expect(new Set(viaAlias?.sourceIds).size).toBe(viaAlias?.sourceIds.length);
    // Mesmo conteúdo científico: só o identificador acessado muda.
    expect({ ...viaAlias, requestedId: "E04" }).toEqual(canonical);
  });

  it("todos os 55 identificadores geram passaporte válido de um dos 50 registros canônicos", () => {
    const ids = unifiedEvidenceCatalog.flatMap(r => r.sourceIds);
    expect(ids).toHaveLength(55);
    const canonical = new Set(ids.map(id => buildEvidencePassport(id, { exportedAt: fixedDate })!.lupaId));
    expect(canonical.size).toBe(50);
    for (const { canonicalId, aliasId } of listExactAliases()) {
      expect(buildEvidencePassport(aliasId)?.lupaId).toBe(canonicalId);
    }
  });

  it("aceita minúsculas e espaços, mas trata id inexistente ou inválido como null", () => {
    expect(buildEvidencePassport(" e04 ")?.lupaId).toBe("E04");
    expect(buildEvidencePassport("E99")).toBeNull();
    expect(buildEvidencePassport("")).toBeNull();
    expect(buildEvidencePassport("<script>")).toBeNull();
    expect(buildEvidencePassport("E04".repeat(10))).toBeNull();
    expect(buildEvidencePassport(undefined)).toBeNull();
    expect(buildEvidencePassport(42)).toBeNull();
  });
});

describe("Passaporte da Evidência — política de ausência e status", () => {
  it("campos ausentes ficam null, sem inferir N a partir do texto livre", () => {
    const p = buildEvidencePassport("E01", { exportedAt: fixedDate })!;
    // E01 tem população em texto, mas nenhum indicador estruturado conferido.
    expect(p.population?.join(" ")).toContain("2.539");
    expect(p.sampleSize).toBeNull();
    expect(p.checkedMetrics).toEqual([]);
    const regulatory = buildEvidencePassport("R01", { exportedAt: fixedDate })!;
    expect(regulatory.pmid).toBeNull();
    for (const record of unifiedEvidenceCatalog) {
      const item = buildEvidencePassport(record.id, { exportedAt: fixedDate })!;
      expect(item.pmid).toBe(record.pmid);
      if (!record.drugs.length) expect(item.exposure).toBeNull();
      if (!record.limitations.trim()) expect(item.limitations).toBeNull();
      if (!record.resultsSummary.trim()) expect(item.reportedResult).toBeNull();
      if (!record.studyFamily) expect(item.studyFamily).toBeNull();
    }
  });

  it("N só vem dos indicadores conferidos e preserva o denominador publicado", () => {
    const dxa = buildEvidencePassport("E04", { exportedAt: fixedDate })!;
    expect(dxa.sampleSize).toEqual({
      total: 160,
      byArm: [{ label: "Tirzepatida (doses agrupadas)", n: 124 }, { label: "Placebo", n: 36 }],
      sourceMetricId: "M01",
    });
    const phq = buildEvidencePassport("E21", { exportedAt: fixedDate })!;
    expect(phq.sampleSize).toEqual({ total: 4056, byArm: null, sourceMetricId: "M05" });
    expect(phq.checkedMetrics[0].arms.every(a => a.sampleN === null)).toBe(true);
  });

  it("revisão clínica independente é sempre pendente e o esquema rejeita qualquer aprovação", () => {
    for (const record of unifiedEvidenceCatalog) {
      const p = buildEvidencePassport(record.id, { exportedAt: fixedDate })!;
      expect(p.reviewStatus.cataloguing).toBe("candidate");
      expect(p.reviewStatus.independentClinicalReview).toEqual({ done: false, label: "pendente" });
      expect(p.projectionApproved).toBe(false);
      expect(passportReviewSummary(p)).toContain("revisão clínica independente pendente");
    }
    const p = buildEvidencePassport("E04", { exportedAt: fixedDate })!;
    const forged = { ...p, reviewStatus: { ...p.reviewStatus, independentClinicalReview: { done: true, label: "concluída" } } };
    expect(evidencePassportSchema.safeParse(forged).success).toBe(false);
    expect(evidencePassportSchema.safeParse({ ...p, projectionApproved: true }).success).toBe(false);
  });

  it("conferência documental só com indicador M01–M05 ou nota explícita de conferência", () => {
    const withMetric = buildEvidencePassport("E16", { exportedAt: fixedDate })!;
    expect(withMetric.reviewStatus.documentaryCheck.checked).toBe(true);
    expect(withMetric.reviewStatus.documentaryCheck.basis).toContain("M04");
    const withNote = buildEvidencePassport("E12", { exportedAt: fixedDate })!;
    expect(withNote.checkedMetrics).toEqual([]);
    expect(withNote.reviewStatus.documentaryCheck).toMatchObject({ checked: true, label: "conferida" });
    const pendingNote = buildEvidencePassport("E01", { exportedAt: fixedDate })!;
    expect(pendingNote.reviewStatus.documentaryCheck).toEqual({ checked: false, label: "pendente", basis: null });
    const supplemental = buildEvidencePassport("P01", { exportedAt: fixedDate })!;
    expect(supplemental.reviewStatus.documentaryCheck.checked).toBe(false);
  });

  it("não expõe o campo interno de prioridade editorial", () => {
    const p = buildEvidencePassport("P01", { exportedAt: fixedDate })!;
    expect(JSON.stringify(p.population)).not.toMatch(/Prioridade/i);
  });
});

describe("Passaporte da Evidência — exportação", () => {
  it("JSON faz roundtrip pelo esquema Zod com versão e data de exportação", () => {
    for (const id of ["E04", "P20", "E21", "R01", "P25"]) {
      const p = buildEvidencePassport(id, { exportedAt: fixedDate })!;
      const text = passportToJSON(p);
      const reopened = parsePassportJSON(text);
      expect(reopened).toEqual(p);
      expect(reopened.schemaVersion).toBe(PASSPORT_SCHEMA_VERSION);
      expect(reopened.exportedAt).toBe("2026-11-08T12:00:00.000Z");
    }
    expect(() => parsePassportJSON("{}")).toThrow();
    expect(() => parsePassportJSON("não é json")).toThrow();
  });

  it("Markdown contém aviso, fonte, status e política de ausência", () => {
    const p = buildEvidencePassport("E04", { exportedAt: fixedDate })!;
    const text = passportToMarkdown(p);
    expect(text).toContain("# Passaporte da Evidência — E04");
    expect(text).toContain(PASSPORT_DISCLAIMER);
    expect(text).toMatch(/ferramenta educacional; sem revisão clínica independente; não é recomendação individual/i);
    expect(text).toContain("<" + p.primaryUrl + ">");
    expect(text).toContain("https://pubmed.ncbi.nlm.nih.gov/39996356/");
    expect(text).toContain("**Revisão clínica independente:** pendente");
    expect(text).toContain("## O que o estudo não prova");
    expect(text).toContain("M03");
    expect(text).toContain("passport-v1");
    const missing = passportToMarkdown(buildEvidencePassport("R01", { exportedAt: fixedDate })!);
    expect(missing).toContain("**PMID:** " + PASSPORT_MISSING);
  });

  it("Markdown neutraliza marcação vinda do texto do catálogo", () => {
    const p = buildEvidencePassport("E04", { exportedAt: fixedDate })!;
    const text = passportToMarkdown({ ...p, originalTitle: "Título <img src=x onerror=alert(1)> *x*" });
    expect(text).not.toMatch(/(^|[^\\])<img/);
    expect(text).toContain("Título \\<img src=x onerror=alert(1)\\> \\*x\\*");
  });

  it("nome de arquivo usa o ID canônico", () => {
    const p = buildEvidencePassport("P20", { exportedAt: fixedDate })!;
    expect(passportFileName(p, "json")).toBe("lupa-passaporte-E04.json");
    expect(passportFileName(p, "md")).toBe("lupa-passaporte-E04.md");
  });
});
