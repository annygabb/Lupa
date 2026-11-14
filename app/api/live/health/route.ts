import { NextResponse } from "next/server";
import { liveDb, isSupabaseConfigured } from "@/lib/live/db";
import { authConfigured } from "@/lib/live/institutional-auth";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 if(!isSupabaseConfigured()||!authConfigured()||!process.env.LUPA_LIVE_SIGNING_SECRET)
  return NextResponse.json({status:"unconfigured"},{status:503,headers:{"Cache-Control":"no-store"}});
 try{
  // Checks actual required relations, not a fallback Map or an optional demo event.
  await Promise.all([
    liveDb("lupa_organizations?select=id&limit=0"),
    liveDb("lupa_organization_members?select=user_id&limit=0"),
    liveDb("lupa_live_events?select=id&limit=0"),
    liveDb("lupa_event_feedback?select=id&limit=0"),
  ]);
  return NextResponse.json({status:"ready",database:"connected"},
    {headers:{"Cache-Control":"no-store"}});
 }catch{
  return NextResponse.json({status:"unavailable",database:"error"},
    {status:503,headers:{"Cache-Control":"no-store"}});
 }
}
