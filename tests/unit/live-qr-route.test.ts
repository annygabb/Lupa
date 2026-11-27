import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mockDb = vi.hoisted(() => ({ snapshot: vi.fn(), enabled: vi.fn(() => true) }));
vi.mock("@/lib/live/db", () => ({
  eventSnapshot: mockDb.snapshot,
  liveDatabaseEnabled: mockDb.enabled,
}));
import { GET } from "@/app/api/live/[code]/qr/route";
const code="CAFE2026BEEF";
const ctx={params:Promise.resolve({code})};
const req=(query="")=>new NextRequest("https://lupaa.vercel.app/api/live/"+code+"/qr"+query);
describe("QR deve apontar para uma sessão existente e ativa", () => {
  beforeEach(() => {
    mockDb.enabled.mockReturnValue(true);
    mockDb.snapshot.mockReset();
  });
  it("recusa código bem formado que não existe",async()=>{
    mockDb.snapshot.mockResolvedValue(null);
    const response=await GET(req(),ctx);
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("recusa evento encerrado",async()=>{
    mockDb.snapshot.mockResolvedValue({phase:"closed",expiresAt:new Date(Date.now()+60000).toISOString()});
    expect((await GET(req(),ctx)).status).toBe(410);
  });
  it("recusa evento expirado ainda não encerrado no banco",async()=>{
    mockDb.snapshot.mockResolvedValue({phase:"pre",expiresAt:new Date(Date.now()-60000).toISOString()});
    expect((await GET(req(),ctx)).status).toBe(410);
  });
  it("permite SVG apenas para sessão ativa",async()=>{
    mockDb.snapshot.mockResolvedValue({phase:"pre",expiresAt:new Date(Date.now()+60000).toISOString()});
    const response=await GET(req(),ctx);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/svg+xml");
    expect(await response.text()).toContain("<svg");
  });
  it("bloqueia formatos inesperados",async()=>{
    mockDb.snapshot.mockResolvedValue({phase:"pre",expiresAt:new Date(Date.now()+60000).toISOString()});
    expect((await GET(req("?format=html"),ctx)).status).toBe(400);
  });
  it("indica indisponibilidade, sem entregar QR fictício",async()=>{
    mockDb.enabled.mockReturnValue(false);
    expect((await GET(req(),ctx)).status).toBe(503);
  });
});
