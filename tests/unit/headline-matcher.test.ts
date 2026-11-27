import { describe, expect, it } from "vitest";
import { matchHeadlineToClaim } from "@/features/interpretation/headline-matcher";
import { POST } from "@/app/api/interpretar/route";

describe("Raio-X determinístico de manchetes", () => {
  it("identifica manchete sobre 25% dos músculos e massa magra com sinais sensacionalistas", () => {
    const res = matchHeadlineToClaim("Mounjaro derrete 25% dos músculos do corpo?");
    expect(res.matched).toBe(true);
    expect(res.claimId).toBe("massa-magra-nao-equivale-a-musculos");
    expect(res.sensationalSignals.length).toBeGreaterThan(0);
    expect(res.interpretation?.evidence.some((e) => e.id === "E04")).toBe(true);
  });

  it("identifica confusão causal sobre UTI e retorna classificação not_comparable", () => {
    const res = matchHeadlineToClaim("Caneta emagrecedora causa risco de morte na UTI?");
    expect(res.matched).toBe(true);
    expect(res.claimId).toBe("uti-mortalidade-nao-e-efeito-do-medicamento");
    expect(res.interpretation?.classification).toBe("not_comparable");
  });

  it("devolve out_of_scope quando o texto está fora do acervo curado (sem inventar resposta)", () => {
    const res = matchHeadlineToClaim("Qual a cotação do dólar amanhã?");
    expect(res.matched).toBe(false);
    expect(res.status).toBe("out_of_scope");
    expect(res.interpretation).toBeNull();
  });

  it("POST /api/interpretar aceita { text } em texto livre e devolve análise determinística", async () => {
    const response = await POST(
      new Request("http://localhost/api/interpretar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "Se parar a tirzepatida o peso volta?" }),
      })
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.mode).toBe("headline-xray");
    expect(body.matched).toBe(true);
    expect(body.claimId).toBe("interromper-tratamento-reganho");
  });
});
