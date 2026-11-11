import {createHash,createHmac,randomBytes,timingSafeEqual} from "node:crypto";
import type {NextRequest} from "next/server";
export const SID_COOKIE="lupa_live_sid";
export function newSessionId(){return randomBytes(24).toString("hex");}
function secret(){const s=process.env.LUPA_LIVE_SIGNING_SECRET;if(!s||s.length<32)throw new Error("LUPA_LIVE_SIGNING_SECRET ausente ou curto.");return s;}
export function sessionHash(sessionId:string){
 return createHmac("sha256",secret()).update(sessionId).digest("hex");
}
export function validSessionId(input:string|undefined):input is string {
 return Boolean(input&&/^[a-f0-9]{48}$/.test(input));
}
export function isOrganizerAuthorized(request:NextRequest){
 const expected=process.env.LUPA_LIVE_ADMIN_TOKEN;
 const got=request.headers.get("x-lupa-admin-token");
 if(!expected||expected.length<32||!got)return false;
 const a=createHash("sha256").update(got).digest();
 const b=createHash("sha256").update(expected).digest();
 return timingSafeEqual(a,b);
}
export function sameOrigin(request:NextRequest){
 const origin=request.headers.get("origin");
 if(!origin)return true;
 // A URL do NextRequest é a origem canônica, não aceitar origem arbitrária de terceiros.
 return origin===request.nextUrl.origin;
}
export function validCode(code:string){return /^[A-F0-9]{12}$/.test(code);}
