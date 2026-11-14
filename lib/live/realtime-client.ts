/**
 * Browser-only Supabase Realtime Broadcast subscriber.
 * Uses documented Phoenix WebSocket protocol v1.0.0. No npm dependency.
 * Payload contains ONLY an invalidation hint. Snapshot is always fetched
 * separately from role-filtered Next.js API.
 *
 * This public channel is used because the event carries no sensitive values.
 * DO NOT broadcast votes, feedback, session hashes, gabaritos or health reports.
 */
export interface RealtimeConnection {
  disconnect(): void;
}

export function validLiveInvalidation(
  message: unknown, expectedCode: string
): boolean {
  if (!message || typeof message !== "object") return false;
  const msg=message as {event?:unknown;topic?:unknown;payload?:unknown};
  if (msg.event!=="broadcast" || msg.topic!=="realtime:live:"+expectedCode) return false;
  const wrapper=msg.payload as {event?:unknown;payload?:unknown}|null;
  const data=wrapper?.payload as {code?:unknown;kind?:unknown}|null;
  return wrapper?.event==="invalidate" &&
    data?.code===expectedCode && data?.kind==="snapshot_updated";
}

export function subscribeLiveInvalidations(
  code:string,onInvalidate:()=>void
):RealtimeConnection {
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const isValid=/^[A-F0-9]{12}$/.test(code);
  if(!base||!key||!isValid||typeof WebSocket==="undefined")
    return {disconnect(){}};

  let current:WebSocket|null=null;
  let stopped=false;
  let heartbeat:ReturnType<typeof setInterval>|null=null;
  let retry:ReturnType<typeof setTimeout>|null=null;
  let attempt=0;
  const topic="realtime:live:"+code;
  const send=(ws:WebSocket,event:string,payload:object,ref:string)=>{
    if(ws.readyState!==WebSocket.OPEN)return;
    ws.send(JSON.stringify({topic:event==="heartbeat"?"phoenix":topic,
      event,payload,ref,join_ref:event==="heartbeat"?undefined:"1"}));
  };
  const connect=()=>{
    if(stopped)return;
    let url:string;
    try{
      const u=new URL(base);
      if(u.protocol!=="https:")return;
      u.protocol="wss:";
      u.pathname="/realtime/v1/websocket";
      u.search="";
      u.searchParams.set("apikey",key);
      u.searchParams.set("vsn","1.0.0");
      url=u.toString();
    }catch{return;}
    const ws=new WebSocket(url);
    current=ws;
    ws.onopen=()=>{
      attempt=0;
      send(ws,"phx_join",{config:{
        broadcast:{ack:false,self:false},private:false
      }},"1");
      heartbeat=setInterval(()=>send(ws,"heartbeat",{},"heartbeat"),25_000);
    };
    ws.onmessage=(event)=>{
      try{
        const data=JSON.parse(String(event.data));
        if(validLiveInvalidation(data,code))onInvalidate();
      }catch{/* Malformed incoming realtime message is ignored. */}
    };
    ws.onerror=()=>ws.close();
    ws.onclose=()=>{
      if(heartbeat){clearInterval(heartbeat);heartbeat=null;}
      if(stopped)return;
      attempt++;
      const delay=Math.min(30_000,2_000*Math.pow(2,Math.min(attempt-1,4)));
      retry=setTimeout(connect,delay);
    };
  };
  connect();
  return {disconnect(){
    stopped=true;
    if(retry)clearTimeout(retry);
    if(heartbeat)clearInterval(heartbeat);
    if(current){current.onclose=null;current.close();}
  }};
}
