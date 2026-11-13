import {NextResponse} from "next/server";
import {eventSnapshot,liveDatabaseEnabled} from "@/lib/live/db";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 if(!liveDatabaseEnabled()||!process.env.LUPA_LIVE_SIGNING_SECRET||!process.env.LUPA_LIVE_ADMIN_TOKEN)
  return NextResponse.json({status:"unconfigured",database:"unconfigured"},{status:503,headers:{"Cache-Control":"no-store"}});
 try{
  await eventSnapshot("000000000000");
  return NextResponse.json({status:"ready",database:"connected"},{headers:{"Cache-Control":"no-store"}});
 }catch{
  return NextResponse.json({status:"unavailable",database:"error"},{status:503,headers:{"Cache-Control":"no-store"}});
 }
}
