import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getEvidenceById } from "../../features/evidence/catalog";
import { assessProjectionEligibility, type EvidenceBlockCode } from "../../features/evidence/projection-guard";
import { blockerCopy, explainBlockers } from "../../features/interpretation/blocker-copy";
import { blockerCodes, e12Candidate, e12Example } from "../../components/routes/metodologia/blocker-example";
import { MetodologiaPage } from "../../components/routes/metodologia/metodologia-page";

// Lista escrita à parte para checar exaustividade em tempo de compilação E de execução.
const allCodes = [
  "INVALID_INPUT", "NOT_APPROVED", "SOURCE_NOT_SUITABLE", "MISSING_SOURCE_LOCATOR",
  "MISSING_FOLLOWUP", "MISSING_UNIT", "MISSING_SAMPLE", "MISSING_DENOMINATOR",
  "INVALID_FRACTION", "MISSING_PERSON_TIME", "NOT_NUMERIC",
  "POPULATION_UNREVIEWED", "TIME_UNREVIEWED", "OVERLAP_UNREVIEWED",
  "ASSOCIATION_NOT_CAUSAL", "ICU_LINK_UNPROVEN", "OR_WITHOUT_BASELINE_RISK",
] as const satisfies readonly EvidenceBlockCode[];
type Missing = Exclude<EvidenceBlockCode, (typeof allCodes)[number]>;
const exhaustive: [Missing] extends [never] ? true : false = true;

describe("Cópia humana dos bloqueios de projeção", () => {
  it("todo EvidenceBlockCode tem título e explicação", () => {
    expect(exhaustive).toBe(true);
    expect(Object.keys(blockerCopy).sort()).toEqual([...allCodes].sort());
    for (const code of allCodes) {
      expect(blockerCopy[code].title.trim().length).toBeGreaterThan(3);
      expect(blockerCopy[code].why.trim().length).toBeGreaterThan(10);
    }
    expect(new Set(allCodes.map(c => blockerCopy[c].title)).size).toBe(allCodes.length);
    expect([...blockerCodes].sort()).toEqual([...allCodes].sort());
  });

  it("todo código que o guard emite de fato tem cópia", () => {
    const emitted = new Set<EvidenceBlockCode>(assessProjectionEligibility({}).blockers);
    const worst = {
      ...e12Candidate, reviewStatus: "candidate", sourceType: "pharmacovigilance", reportedUnit: null,
      analyzedN: null, measureKind: "rate", personTimeDenominator: null,
    };
    for (const variant of [worst, { ...worst, measureKind: "textual" }, { ...worst, measureKind: "count", numerator: 5, denominator: 2 }, e12Candidate])
      for (const code of assessProjectionEligibility(variant).blockers) emitted.add(code);
    expect([...emitted].sort()).toEqual([...allCodes].sort());
    for (const code of emitted) expect(blockerCopy[code]).toBeDefined();
  });

  it("exemplo E12 usa dados do catálogo e é marcado como exemplo", () => {
    const record = getEvidenceById("E12")!;
    expect(e12Example.isExample).toBe(true);
    expect(record.populationAndArms).toContain("35 estudos");
    expect(record.populationAndArms).toContain("9.366 participantes");
    expect(e12Example.studies).toBe(35);
    expect(e12Example.participants).toBe(9366);
    expect(e12Candidate.analyzedN).toBe(9366);
    expect(e12Candidate.effectMeasure).toBe("OR");
    expect(e12Candidate.sourceType).toBe(record.sourceType);
    expect(e12Candidate.reviewStatus).toBe(record.curationStatus);
    expect(e12Candidate.associationOnly).toBe(true);
    expect(e12Candidate.hypotheticalDrugIcuLink).toBe(true);
  });

  it("exemplo E12 dispara associação, ligação UTI, falta de aprovação e OR sem risco basal", () => {
    const a = assessProjectionEligibility(e12Candidate);
    expect(a.allowed).toBe(false);
    for (const code of ["ASSOCIATION_NOT_CAUSAL", "ICU_LINK_UNPROVEN", "NOT_APPROVED", "OR_WITHOUT_BASELINE_RISK"] as const)
      expect(a.blockers).toContain(code);
    expect(a.blockers).not.toContain("SOURCE_NOT_SUITABLE");
    expect(a.blockers).not.toContain("MISSING_SAMPLE");
    expect(e12Example.assessment).toEqual(a);
    expect(explainBlockers(a.blockers).every(b => b.title === blockerCopy[b.code].title)).toBe(true);
  });

  it("a metodologia lista todos os bloqueios com a cópia única e o exemplo E12", () => {
    const html = renderToStaticMarkup(createElement(MetodologiaPage));
    expect(html).toContain("Por que o LUPA");
    expect(html).toContain("se recusa a projetar");
    for (const code of allCodes) {
      expect(html).toContain(code);
      expect(html).toContain(blockerCopy[code].title);
    }
    expect(html).toContain("Exemplo · candidato curado");
    expect(html).toContain("9.366 participantes");
    expect(html).toContain("Previsão validada");
    expect(html).toContain("ainda não tem nenhuma previsão validada");
  });
});
