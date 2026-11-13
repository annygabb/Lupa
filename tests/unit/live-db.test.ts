import { describe, expect, it } from "vitest";
import {
  createLiveEvent,
  eventSnapshot,
  castVote,
  advanceLivePhase,
  deleteLiveEvent,
  liveDatabaseEnabled,
} from "@/lib/live/db";

describe("LUPA Live: Motor Resiliente de Banco & Votos", () => {
  const testCode = "TESTUNITVOTE";

  it("informa banco habilitado e operacional", () => {
    expect(liveDatabaseEnabled()).toBe(true);
  });

  it("cria sessão de evento com integridade de dados", async () => {
    const res = await createLiveEvent({
      code: testCode,
      claimId: "massa-magra-nao-equivale-a-musculos",
      title: "Sessão de Teste Automatizado",
      question: "Cerca de 25% da perda foi massa magra. O que isso significa?",
      choices: ["Opção A", "Opção B correta", "Opção C"],
      correctIndex: 1,
    });
    expect(res.code).toBe(testCode);

    const snapshot = await eventSnapshot(testCode, { isOrganizer: true });
    expect(snapshot).not.toBeNull();
    expect(snapshot?.code).toBe(testCode);
    expect(snapshot?.phase).toBe("pre");
  });

  it("registra voto único por sessão e impede duplicatas (idempotência)", async () => {
    const sessionHash = "test_hash_participant_12345";

    const v1 = await castVote({
      code: testCode,
      phase: "pre",
      optionIndex: 1,
      sessionHash,
    });
    expect(v1.accepted).toBe(true);

    // Tentativa de votar novamente na mesma rodada com o mesmo hash deve ser rejeitada
    const v2 = await castVote({
      code: testCode,
      phase: "pre",
      optionIndex: 2,
      sessionHash,
    });
    expect(v2.accepted).toBe(false);
    expect(v2.reason).toBe("ALREADY_VOTED");
  });

  it("avança de fase e permite voto na segunda rodada", async () => {
    const sessionHash = "test_hash_participant_12345";

    const adv1 = await advanceLivePhase(testCode, "reveal");
    expect(adv1).toBe(true);

    const adv2 = await advanceLivePhase(testCode, "post");
    expect(adv2).toBe(true);

    // Na fase post, o participante pode votar uma vez
    const vPost = await castVote({
      code: testCode,
      phase: "post",
      optionIndex: 1,
      sessionHash,
    });
    expect(vPost.accepted).toBe(true);
  });

  it("exclui evento e realiza cascade nos votos", async () => {
    const deleted = await deleteLiveEvent(testCode);
    expect(deleted).toBe(true);

    const snapshot = await eventSnapshot(testCode);
    expect(snapshot).toBeNull();
  });
});
