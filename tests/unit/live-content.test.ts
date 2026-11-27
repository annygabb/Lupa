import { describe, expect, it } from "vitest";
import { liveOptions, liveQuestion } from "@/lib/live/content";

describe("LUPA Live — integridade das perguntas", () => {
  it("publica seis objetivos e duas questões com gabarito válido", () => {
    expect(liveOptions).toHaveLength(6);
    for (const option of liveOptions) {
      const question = liveQuestion(option.id);
      expect(question).not.toBeNull();
      expect(question?.question.length).toBeGreaterThan(10);
      expect(question?.choices).toHaveLength(3);
      expect(question?.postQuestion?.choices).toHaveLength(3);
      expect(question?.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question?.correctIndex).toBeLessThanOrEqual(2);
      expect(question?.postQuestion?.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question?.postQuestion?.correctIndex).toBeLessThanOrEqual(2);
      expect(question?.evidenceId).toBeTruthy();
    }
  });
  it("distribui a posição correta entre A, B e C para pré e pós", () => {
    const pre = [0, 0, 0], post = [0, 0, 0];
    for (const item of liveOptions) {
      const question = liveQuestion(item.id);
      if (!question || !question.postQuestion) throw new Error("Objetivo incompleto");
      pre[question.correctIndex]++;
      post[question.postQuestion.correctIndex]++;
    }
    expect(pre).toEqual([2, 2, 2]);
    expect(post).toEqual([2, 2, 2]);
  });
  it("preserva a alternativa cientificamente adequada após a redistribuição", () => {
    for (const item of liveOptions) {
      const q = liveQuestion(item.id);
      if (!q?.postQuestion) throw new Error("Objetivo incompleto");
      expect(q.choices[q.correctIndex]).toMatch(/^(Não[.;]|2,0 kg|Uma exploração)/);
      expect(q.postQuestion.choices[q.postQuestion.correctIndex]).toMatch(/^(Não[;.]|2,0 kg|Uma exploração)/);
    }
  });
  it("rejeita identificadores fora da curadoria", () => {
    expect(liveQuestion("id-inventado")).toBeNull();
    expect(liveQuestion("<script>alert(1)</script>")).toBeNull();
  });
});
