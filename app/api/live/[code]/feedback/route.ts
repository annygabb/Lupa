import { NextRequest } from "next/server";
import { liveDatabaseEnabled, liveDb } from "@/lib/live/db";
import { validCode, validSessionId, newSessionId, sessionHash, SID_COOKIE } from "@/lib/live/security";
import { privateJson, sameSiteWrite } from "@/lib/live/institutional-auth";

export const runtime="nodejs"; export const dynamic="force-dynamic";
type Context={params:Promise<{code:string}>};

export async function POST(request:NextRequest,{params}:Context){
 const {code}=await params;
 if(!validCode(code))return privateJson({error:"INVALID_CODE"},400);
 if(!liveDatabaseEnabled())return privateJson({error:"LIVE_UNCONFIGURED"},503);
 if(!sameSiteWrite(request))return privateJson({error:"INVALID_ORIGIN"},403);
 if(!(request.headers.get("content-type")||"").startsWith("application/json"))
  return privateJson({error:"UNSUPPORTED_MEDIA_TYPE"},415);
 let input:{clarity?:unknown;usefulness?:unknown;purposeAccepted?:unknown};
 try{const raw=await request.text();
  if(raw.length>512)return privateJson({error:"PAYLOAD_TOO_LARGE"},413);
  input=JSON.parse(raw) as typeof input;
 }catch{return privateJson({error:"INVALID_JSON"},400);}
 if(!Number.isInteger(input.clarity)||!Number.isInteger(input.usefulness)||
  Number(input.clarity)<1||Number(input.clarity)>5||
  Number(input.usefulness)<1||Number(input.usefulness)>5||
  input.purposeAccepted!==true)
   return privateJson({error:"INVALID_FEEDBACK_OR_PURPOSE"},400);
 try{
  const rows=await liveDb<Array<{id:string;phase:string;expires_at:string}>>(
   "lupa_live_events?code=eq."+code+"&select=id,phase,expires_at&limit=1"
  );
  if(!rows.length)return privateJson({error:"NOT_FOUND"},404);
  if(rows[0].phase!=="closed"||Date.parse(rows[0].expires_at)<=Date.now())
   return privateJson({error:"FEEDBACK_NOT_OPEN"},409);
  const rawId=request.cookies.get(SID_COOKIE)?.value;
  // This participant pseudonym is never sent to the browser or a dashboard.
  const sid=validSessionId(rawId)?rawId:newSessionId();
  const hash=sessionHash(sid);
  const existing=await liveDb<Array<{id:number}>>(
   "lupa_event_feedback?event_id=eq."+rows[0].id+"&session_hash=eq."+hash+"&select=id&limit=1"
  );
  if(existing.length)return privateJson({error:"ALREADY_SENT"},409);
  const inserted=await liveDb<Array<{id:number}>>("lupa_event_feedback?select=id",{
   method:"POST",headers:{Prefer:"return=representation"},
   body:JSON.stringify({event_id:rows[0].id,session_hash:hash,
    clarity:Number(input.clarity),usefulness:Number(input.usefulness),
    purpose_version:"experience-feedback-v1"}),
  });
  if(!Array.isArray(inserted)||inserted.length!==1)
   return privateJson({error:"FEEDBACK_WRITE_UNCONFIRMED"},503);
  const res=privateJson({saved:true},201);
  res.cookies.set(SID_COOKIE,sid,{httpOnly:true,secure:process.env.NODE_ENV==="production",
    sameSite:"lax",path:"/api/live/"+code, maxAge:4*3600});
  return res;
 }catch{return privateJson({error:"FEEDBACK_SAVE_FAILED"},503);}
}
