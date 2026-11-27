import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockLive = vi.hoisted(() => ({
  snapshot: vi.fn(),
  enabled: vi.fn(() => true),
}));
vi.mock("@/lib/live/db", () => ({
  eventSnapshot: mockLive.snapshot,
  liveDatabaseEnabled: mockLive.enabled,
  advanceLivePhase: vi.fn(),
  deleteLiveEvent: vi.fn(),
  recordAuditAction: vi.fn(),
  consumeRateLimit: vi.fn(async () => ({ allowed: true, retryAfter: 0 })),
  sessionState: vi.fn(async () => ({ votedPre: false, votedPost: false, feedbackSent: false })),
}));
import { GET } from "@/app/api/live/[code]/route";

const code = "CAFE2026BEEF";
const ctx = { params: Promise.resolve({ code }) };
const request = new NextRequest("https://lupaa.vercel.app/api/live/" + code);
const snapshot = (phase: string) => ({
  code, claimId: "massa-magra-nao-equivale-a-musculos",
  title: "Sessão educacional", question: "Pergunta inicial?",
  choices: ["Opção 1", "Opção 2", "Opção 3"],
  phase, expiresAt: new Date(Date.now() + 3600000).toISOString(),
  counts: [
    { phase: "pre", optionIndex: 0, count: 3 },
    { phase: "post", optionIndex: 1, count: 5 },
  ],
});
describe("GET público do LUPA Live — proteção contra influência dos votos", () => {
  beforeEach(() => { mockLive.enabled.mockReturnValue(true); mockLive.snapshot.mockReset(); });
  for(const [phase, expected] of [["pre", 0], ["reveal", 1], ["post", 1], ["closed", 2]] as const) {
    it("não revela contagens futuras em fase " + phase, async () => {
      mockLive.snapshot.mockResolvedValue(snapshot(phase));
      const response = await GET(request, ctx);
      expect(response.status).toBe(200);
      const data = await response.json() as {counts:Array<{phase:string}>};
      expect(data.counts).toHaveLength(expected);
      if (phase === "post") expect(data.counts.every(v => v.phase === "pre")).toBe(true);
    });
  }
  it("não inventa resultados quando falta banco", async () => {
    mockLive.enabled.mockReturnValue(false);
    const response = await GET(request, ctx);
    expect(response.status).toBe(503);
  });
});
