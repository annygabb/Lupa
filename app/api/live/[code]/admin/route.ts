import { NextRequest } from "next/server";
import { eventSnapshot, liveDatabaseEnabled, liveDb } from "@/lib/live/db";
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
  const rows=await liveDb<Array<{correct_index:number;post_question:unknown}>>(
   "lupa_live_events?code=eq."+code+"&select=correct_index,post_question&limit=1"
  );
  if(!rows.length)return privateJson({error:"NOT_FOUND"},404);
  const publicSnapshot=await eventSnapshot(code,{isOrganizer:true});
  if(!publicSnapshot)return privateJson({error:"NOT_FOUND"},404);
  return privateJson({...publicSnapshot,
   correctIndex:rows[0].correct_index,
   postQuestion:rows[0].post_question || publicSnapshot.postQuestion,
  });
 }catch{return privateJson({error:"ADMIN_SNAPSHOT_FAILED"},503);}
}
