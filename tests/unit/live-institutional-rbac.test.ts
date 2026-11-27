import {describe,expect,it,vi,beforeEach} from "vitest";
import {readFileSync} from "node:fs";
import {liveDb} from "@/lib/live/db";
import {
  mayManage, requireOrganizationManager, requireEventManager,
} from "@/lib/live/institutional-auth";

vi.mock("@/lib/live/db",()=>({liveDb:vi.fn()}));
const db=vi.mocked(liveDb);
const userId="a0000000-0000-4000-8000-000000000001";
const orgA="a0000000-0000-4000-8000-000000000002";
const orgB="b0000000-0000-4000-8000-000000000003";

describe("LUPA institutional RBAC — deny cross-tenant operations",()=>{
 beforeEach(()=>db.mockReset());
 it("rejects viewer, curator and untrusted role names",()=>{
  for(const role of ["viewer","curator","unknown","anonymous",""])
   expect(mayManage(role)).toBe(false);
  for(const role of ["owner","admin","organizer"])expect(mayManage(role)).toBe(true);
 });
 it("allows only the user's own managing membership",async()=>{
  db.mockResolvedValueOnce([{organization_id:orgA,role:"organizer"}] as never);
  expect(await requireOrganizationManager(userId,orgA)).toBe(true);
  db.mockResolvedValueOnce([{organization_id:orgA,role:"organizer"}] as never);
  expect(await requireOrganizationManager(userId,orgB)).toBe(false);
 });
 it("denies unrelated event org, even if caller knows the exact code",async()=>{
  db.mockResolvedValueOnce([{organization_id:orgB}] as never);
  db.mockResolvedValueOnce([{organization_id:orgA,role:"owner"}] as never);
  expect(await requireEventManager(userId,"A1B2C3D4E5F6")).toBe(false);
 });
 it("denies malformed org/event IDs without reaching the database",async()=>{
  expect(await requireOrganizationManager(userId,"invalid")).toBe(false);
  expect(await requireEventManager(userId,"../../etc")).toBe(false);
  expect(db).not.toHaveBeenCalled();
 });
 it("migration defines RLS + constraints; does not imply applied production DB",()=>{
  const sql=readFileSync("supabase/migrations/20261113215500_lupa_institutions_feedback_broadcast.sql","utf8");
  for(const object of ["lupa_organizations","lupa_organization_members","lupa_event_feedback","lupa_live_audit"])
   expect(sql).toContain("create table if not exists public."+object);
  expect(sql).toContain("enable row level security");
  expect(sql).toContain("unique(event_id,session_hash)");
  expect(sql).toContain("realtime.send");
 });
});
