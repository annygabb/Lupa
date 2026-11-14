import { NextRequest } from "next/server";
import { privateJson, sameSiteWrite } from "@/lib/live/institutional-auth";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function POST(request:NextRequest){
 if(!sameSiteWrite(request))return privateJson({error:"INVALID_ORIGIN"},403);
 if(!(request.headers.get("content-type")||"").startsWith("application/json"))
  return privateJson({error:"INVALID_MEDIA_TYPE"},415);
 let email:unknown;
 try{const raw=await request.text();
  if(raw.length>1024)return privateJson({error:"INVALID_INPUT"},400);
  email=(JSON.parse(raw) as {email?:unknown}).email;
 }catch{return privateJson({error:"INVALID_JSON"},400);}
 if(typeof email!=="string"||email.length>254||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
  return privateJson({error:"INVALID_INPUT"},400);
 const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.LUPA_SUPABASE_URL||"").replace(/\/+$/,"");
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 const app=process.env.LUPA_APP_BASE_URL;
 if(!/^https:\/\/[a-z0-9.-]+$/i.test(base)||!key||!app?.startsWith("https://"))
  return privateJson({error:"AUTH_UNCONFIGURED"},503);
 try{
  const redirect=new URL("/recuperar-acesso",app);
  await fetch(base+"/auth/v1/recover?redirect_to="+encodeURIComponent(redirect.toString()),{
   method:"POST",cache:"no-store",headers:{"apikey":key,"Content-Type":"application/json"},
   body:JSON.stringify({email}),
  });
  // Prevent user enumeration. Remote provider applies its own abuse controls.
  return privateJson({message:"Se o e-mail estiver cadastrado, enviaremos instruções."});
 }catch{return privateJson({error:"RECOVERY_UNAVAILABLE"},503);}
}
