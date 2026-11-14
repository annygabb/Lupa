import { NextRequest } from "next/server";
import { privateJson, sameSiteWrite } from "@/lib/live/institutional-auth";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function POST(request:NextRequest){
 if(!sameSiteWrite(request))return privateJson({error:"INVALID_ORIGIN"},403);
 if(!(request.headers.get("content-type")||"").startsWith("application/json"))
  return privateJson({error:"INVALID_MEDIA_TYPE"},415);
 let input:{accessToken?:unknown;password?:unknown};
 try{const raw=await request.text();
  if(raw.length>6000)return privateJson({error:"INVALID_INPUT"},400);
  input=JSON.parse(raw) as typeof input;
 }catch{return privateJson({error:"INVALID_JSON"},400);}
 if(typeof input.accessToken!=="string"||input.accessToken.length>5000||
  typeof input.password!=="string"||input.password.length<12||input.password.length>128)
  return privateJson({error:"INVALID_INPUT"},400);
 const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.LUPA_SUPABASE_URL||"").replace(/\/+$/,"");
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!/^https:\/\/[a-z0-9.-]+$/i.test(base)||!key)
  return privateJson({error:"AUTH_UNCONFIGURED"},503);
 try{
  // Supabase validates the password-recovery access token.
  const response=await fetch(base+"/auth/v1/user",{
   method:"PUT",cache:"no-store",
   headers:{apikey:key,Authorization:"Bearer "+input.accessToken,
    "Content-Type":"application/json"},
   body:JSON.stringify({password:input.password}),
  });
  if(!response.ok)return privateJson({error:"INVALID_OR_EXPIRED_RECOVERY_LINK"},401);
  return privateJson({updated:true});
 }catch{return privateJson({error:"PASSWORD_UPDATE_UNAVAILABLE"},503);}
}
