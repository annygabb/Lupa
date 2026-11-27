import { describe, expect, it } from "vitest";
import {
  DEFAULT_COMPARE_PAIR, buildCompareHref, buildCompareQuery, parseCompareParams, resolveCompareId,
} from "@/features/comparison/params";
import { assessStudyComparison } from "@/features/comparison/compatibility";
import { getUnifiedEvidence } from "@/features/evidence/unified-catalog";

const qs = (query: string) => parseCompareParams(new URLSearchParams(query));

describe("Comparador — pré-seleção por URL", () => {
  it("sem parâmetros usa o par padrão E04/E12", () => {
    expect(DEFAULT_COMPARE_PAIR).toEqual({ a: "E04", b: "E12" });
    expect(qs("")).toMatchObject({ a: "E04", b: "E12", ignored: [] });
    expect(parseCompareParams(null)).toMatchObject({ a: "E04", b: "E12" });
    expect(parseCompareParams(undefined)).toMatchObject({ a: "E04", b: "E12" });
  });

  it("aceita ids canônicos e resolve aliases para o canônico", () => {
    expect(qs("a=E16&b=E21")).toMatchObject({ a: "E16", b: "E21" });
    expect(qs("a=P20&b=E12")).toMatchObject({ a: "E04", b: "E12", requested: { a: "P20", b: "E12" } });
    expect(qs("a=p03&b=e04")).toMatchObject({ a: "E21", b: "E04" });
    expect(qs("a=%20E16%20")).toMatchObject({ a: "E16" });
  });

  it("ignora valores inválidos com fallback E04/E12", () => {
    expect(qs("a=E99&b=E12")).toMatchObject({ a: "E04", b: "E12", ignored: ["a"] });
    expect(qs("a=E16&b=<script>")).toMatchObject({ a: "E16", b: "E12", ignored: ["b"] });
    expect(qs("a=../../etc&b=")).toMatchObject({ a: "E04", b: "E12", ignored: ["a"] });
    expect(qs("a=X01&b=E1")).toMatchObject({ a: "E04", b: "E12", ignored: ["a", "b"] });
  });

  it("um único lado informado não colide com o padrão do outro lado", () => {
    expect(qs("a=E04")).toMatchObject({ a: "E04", b: "E12" });
    expect(qs("a=E12")).toMatchObject({ a: "E12", b: "E04" });
    expect(qs("b=E04")).toMatchObject({ a: "E12", b: "E04" });
    expect(qs("b=E16")).toMatchObject({ a: "E04", b: "E16" });
    expect(qs("a=E99&b=E04")).toMatchObject({ a: "E12", b: "E04" });
  });

  it("mesmo estudo explícito (ou alias dele) em A e B continua como seleção duplicada", () => {
    for (const query of ["a=E04&b=E04", "a=E04&b=P20", "a=P20&b=e04"]) {
      const pair = qs(query);
      expect(pair).toMatchObject({ a: "E04", b: "E04" });
      const assessment = assessStudyComparison(getUnifiedEvidence(pair.a)!, getUnifiedEvidence(pair.b)!);
      expect(assessment.canShowSideBySide).toBe(false);
      expect(assessment.canPoolNumericalEstimates).toBe(false);
    }
  });

  it("aceita objeto de searchParams do Next com valores repetidos", () => {
    expect(parseCompareParams({ a: ["E16", "E21"], b: undefined })).toMatchObject({ a: "E16", b: "E12" });
    expect(parseCompareParams({ a: "P20", b: "E13" })).toMatchObject({ a: "E04", b: "E13" });
  });

  it("monta links canônicos e recusa ids fora do catálogo", () => {
    expect(resolveCompareId("P20")).toBe("E04");
    expect(resolveCompareId("E99")).toBeNull();
    expect(resolveCompareId(null)).toBeNull();
    expect(buildCompareQuery("E04", "E12")).toBe("a=E04&b=E12");
    expect(buildCompareHref("P20")).toBe("/comparar?a=E04");
    expect(buildCompareHref("e16", "p03")).toBe("/comparar?a=E16&b=E21");
    expect(() => buildCompareHref("E99")).toThrow();
    expect(() => buildCompareQuery("E04", "zzz")).toThrow();
  });
});
