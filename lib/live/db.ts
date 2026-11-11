/**
 * REST PostgREST exclusivamente servidor. Não importar em componentes client.
 * Sem SDK novo: preserva pnpm-lock.yaml do projeto.
 */
const url=()=>process.env.LUPA_SUPABASE_URL?.replace(/\/+$/,"");
const secret=()=>process.env.LUPA_SUPABASE_SERVICE_ROLE_KEY;
export class LiveDatabaseUnavailable extends Error {
 constructor(){super("Banco do LUPA Live não configurado.");this.name="LiveDatabaseUnavailable";}
}
export function liveDatabaseEnabled(){return Boolean(url()&&secret());}
export async function liveDb<T>(path:string,init:RequestInit={}):Promise<T> {
 const base=url(),key=secret();
 if(!base||!key)throw new LiveDatabaseUnavailable();
 if(!path.startsWith("rpc/")&&!path.startsWith("lupa_live_events?")&&path!=="lupa_live_events")throw new Error("Caminho de banco não permitido.");
 const res=await fetch(base+"/rest/v1/"+path,{
  ...init,cache:"no-store",
  headers:{
   "apikey":key,
   "Authorization":"Bearer "+key,
   "Content-Type":"application/json",
   "Accept":"application/json",
   ...init.headers,
  },
 });
 if(!res.ok){throw new Error("Falha no acesso ao armazenamento do evento (HTTP "+res.status+").");}
 if(res.status===204)return null as T;
 return await res.json() as T;
}
export interface LiveCount { phase:"pre"|"post";optionIndex:number;count:number }
export interface LiveSnapshot {
 code:string;claimId:string;title:string;question:string;choices:string[];
 phase:"pre"|"reveal"|"post"|"closed";expiresAt:string;counts:LiveCount[];
}
export async function eventSnapshot(code:string):Promise<LiveSnapshot|null> {
 const data=await liveDb<LiveSnapshot|null>("rpc/lupa_event_snapshot",{
  method:"POST",body:JSON.stringify({p_code:code})
 });
 return data;
}
