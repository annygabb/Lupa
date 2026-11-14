import { NextRequest } from "next/server";
import { liveDb, liveDatabaseEnabled } from "@/lib/live/db";
import { validCode } from "@/lib/live/security";
import { getInstitutionalUser, requireEventManager, privateJson } from "@/lib/live/institutional-auth";

export const runtime="nodejs"; export const dynamic="force-dynamic";
type Context={params:Promise<{code:string}>};
export async function GET(_request:NextRequest,{params}:Context){
 const {code}=await params;
 if(!validCode(code))return privateJson({error:"INVALID_CODE"},400);
 if(!liveDatabaseEnabled())return privateJson({error:"LIVE_UNCONFIGURED"},503);
 const user=await getInstitutionalUser();
 if(!user)return privateJson({error:"UNAUTHENTICATED"},401);
 try{
  if(!await requireEventManager(user.id,code))return privateJson({error:"FORBIDDEN"},403);
  const data=await liveDb<{total:number;suppressed:boolean;averageClarity:number|null;averageUsefulness:number|null}>(
   "rpc/lupa_feedback_summary",{method:"POST",body:JSON.stringify({p_code:code})}
  );
  return privateJson(data);
 }catch{return privateJson({error:"FEEDBACK_READ_FAILED"},503);}
}
