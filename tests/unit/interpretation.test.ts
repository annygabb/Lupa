import { describe, expect, it } from "vitest";
import { evidenceLensClaims, evidenceLensClaimSchema, claimIds, type EvidenceLensClaim } from "@/features/interpretation/claims";
import { interpretClaim, listClaims, ENGINE_METHOD } from "@/features/interpretation/interpret-claim";
import { blockerCopy } from "@/features/interpretation/blocker-copy";
import { getUnifiedEvidence } from "@/features/evidence/unified-catalog";

const base = evidenceLensClaims[0];

describe("Evidence Lens — afirmações curadas", () => {
  it("tem de 3 a 6 afirmações válidas, com ids únicos", () => {
    expect(evidenceLensClaims.length).toBeGreaterThanOrEqual(3);
    expect(evidenceLensClaims.length).toBeLessThanOrEqual(6);
    expect(new Set(claimIds).size).toBe(claimIds.length);
  });

  it("toda evidência citada existe no catálogo", () => {
    for (const claim of evidenceLensClaims) {
      for (const id of claim.evidenceIds) expect(getUnifiedEvidence(id), `${claim.id} → ${id}`).toBeDefined();
    }
  });

  it("nenhuma afirmação se declara revisada clinicamente sem registro documentado", () => {
    for (const claim of evidenceLensClaims) expect(claim.reviewStatus).not.toBe("independently_reviewed");
    const fake = { ...base, reviewStatus: "independently_reviewed" as const };
    expect(evidenceLensClaimSchema.safeParse(fake).success).toBe(false);
  });

  it("todas as afirmações listam ao menos uma extrapolação proibida", () => {
    for (const claim of evidenceLensClaims) expect(claim.prohibitedExtrapolations.length).toBeGreaterThan(0);
  });
});

describe("Evidence Engine — interpretação determinística", () => {
  it("id inexistente devolve null", () => {
    expect(interpretClaim("nao-existe")).toBeNull();
  });

  it("é determinística: mesma entrada, mesma saída", () => {
    for (const id of claimIds) expect(interpretClaim(id)).toEqual(interpretClaim(id));
  });

  it("massa magra: parcialmente sustentada, com E04 e EWGSOP2 e revisão clínica pendente", () => {
    const r = interpretClaim("massa-magra-nao-equivale-a-musculos")!;
    expect(r.classification).toBe("partially_supported");
    expect(r.evidence.map(e => e.id)).toEqual(["E04", "E10"]);
    expect(r.clinicalReviewPending).toBe(true);
    expect(r.prohibitedExtrapolations.join(" ")).toMatch(/25% dos músculos/);
    expect(r.method).toBe(ENGINE_METHOD);
  });

  it("UTI: regras de compatibilidade bloqueiam a ponte causal E04 → E12", () => {
    const r = interpretClaim("uti-mortalidade-nao-e-efeito-do-medicamento")!;
    expect(r.classification).toBe("not_comparable");
    expect(r.comparison?.canPoolNumericalEstimates).toBe(false);
    expect(r.comparison?.warnings.map(w => w.code)).toContain("MUSCLE_ICU_INDIRECT_LINK");
    expect(r.comparison?.compareHref).toBe("/comparar?a=E04&b=E12");
    const codes = r.projection?.blockers.map(b => b.code) ?? [];
    expect(r.projection?.allowed).toBe(false);
    for (const code of ["NOT_APPROVED", "ASSOCIATION_NOT_CAUSAL", "ICU_LINK_UNPROVEN", "OR_WITHOUT_BASELINE_RISK"]) expect(codes).toContain(code);
  });

  it("cenário: projeção bloqueada e classificação não sobe acima de 'insuficiente'", () => {
    const r = interpretClaim("cenario-2036-nao-e-previsao-sus")!;
    expect(r.projection?.allowed).toBe(false);
    expect(r.projection?.blockers.map(b => b.code)).toEqual(expect.arrayContaining(["NOT_APPROVED", "SOURCE_NOT_SUITABLE", "NOT_NUMERIC"]));
    expect(r.classification).toBe("insufficient_evidence");
  });

  it("alias é resolvido para o registro canônico e não conta duas vezes", () => {
    const claim: EvidenceLensClaim = { ...base, id: "teste-alias", evidenceIds: ["P20", "E04"] };
    const r = interpretClaim("teste-alias", [claim])!;
    expect(r.evidence).toHaveLength(1);
    expect(r.evidence[0]).toMatchObject({ requestedId: "P20", id: "E04", aliasResolved: true, passportHref: "/evidencias/E04" });
  });

  it("evidência ausente endurece a classificação para 'insuficiente' (abstenção)", () => {
    const claim: EvidenceLensClaim = { ...base, id: "teste-fonte-ausente", classification: "supported_in_context", evidenceIds: ["E99"] };
    const r = interpretClaim("teste-fonte-ausente", [claim])!;
    expect(r.missingEvidenceIds).toEqual(["E99"]);
    expect(r.classification).toBe("insufficient_evidence");
    expect(r.tightenedByRules).toBe(true);
  });

  it("regras vencem a curadoria: um texto otimista não passa por cima de estudos incomparáveis", () => {
    const claim: EvidenceLensClaim = { ...base, id: "teste-otimista", classification: "supported_in_context", comparePair: ["E04", "E12"], evidenceIds: ["E04", "E12"] };
    const r = interpretClaim("teste-otimista", [claim])!;
    expect(r.classification).toBe("not_comparable");
    expect(r.tightenedByRules).toBe(true);
  });

  it("informa a situação real do catálogo sem inventar versão", () => {
    const r = interpretClaim(claimIds[0])!;
    expect(r.catalog).toEqual({ canonicalRecords: 50, sourceIds: 55, readyForProjection: 0 });
    expect(r).not.toHaveProperty("catalogVersion");
  });

  it("lista pública expõe só id, título, pergunta e tipo", () => {
    for (const item of listClaims()) expect(Object.keys(item).sort()).toEqual(["id", "kind", "question", "title"]);
  });

  it("todo código de bloqueio tem explicação humana", () => {
    for (const [code, copy] of Object.entries(blockerCopy)) {
      expect(copy.title.length, code).toBeGreaterThan(3);
      expect(copy.why.length, code).toBeGreaterThan(10);
    }
  });
});
