import { describe, expect, it, beforeEach } from "vitest";
import { recordAuditAction, getLocalAudits, cleanupExpiredLocalRecords, createLiveEvent } from "@/lib/live/db";

describe("LUPA Live Audit and Retention", () => {
  const orgId = "11111111-1111-4111-8111-111111111111";
  const actorId = "22222222-2222-4222-8222-222222222222";
  const code = "BEEFCAFE2026";

  beforeEach(() => {
    process.env.LUPA_LIVE_ALLOW_LOCAL_DEMO = "true";
  });

  it("records event_created, phase_advanced and event_deleted in audit ledger", async () => {
    const created = await recordAuditAction({
      organizationId: orgId,
      eventCode: code,
      actorId,
      action: "event_created",
    });
    expect(created).toBe(true);

    const advanced = await recordAuditAction({
      organizationId: orgId,
      eventCode: code,
      actorId,
      action: "phase_advanced",
    });
    expect(advanced).toBe(true);

    const deleted = await recordAuditAction({
      organizationId: orgId,
      eventCode: code,
      actorId,
      action: "event_deleted",
    });
    expect(deleted).toBe(true);

    const audits = getLocalAudits();
    const eventAudits = audits.filter((a) => a.eventCode === code);
    expect(eventAudits.length).toBeGreaterThanOrEqual(3);

    const actions = eventAudits.map((a) => a.action);
    expect(actions).toContain("event_created");
    expect(actions).toContain("phase_advanced");
    expect(actions).toContain("event_deleted");
  });

  it("cleans up expired local events without deleting valid events", async () => {
    await createLiveEvent({
      code: "ACTIVE202601",
      claimId: "massa-magra-nao-equivale-a-musculos",
      title: "Sessão Ativa",
      question: "Questão teste?",
      choices: ["A", "B", "C"],
      correctIndex: 1,
    });

    const result = cleanupExpiredLocalRecords();
    expect(typeof result.eventsDeleted).toBe("number");
    expect(typeof result.rateLimitsDeleted).toBe("number");
  });
});
