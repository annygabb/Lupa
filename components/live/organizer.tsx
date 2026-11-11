"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {liveOptions} from "@/lib/live/content";
import type {LiveSnapshot} from "@/lib/live/db";
const phases:{[k:string]:string}={pre:"Abrir explicação",reveal:"Abrir segunda rodada",post:"Encerrar sessão"};
const nextPhase:{[k:string]:string}={pre:"reveal",reveal:"post",post:"closed"};
export function LiveOrganizer(){
 const [adminToken,setAdminToken]=useState("");
 const [claimId,setClaimId]=useState(liveOptions[0].id);
 const [code,setCode]=useState("");
 const [data,setData]=useState<LiveSnapshot|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [note,setNote]=useState("");
 useEffect(()=>{
  if(!code)return;
  let active=true;
  const load=async()=>{
   try{const r=await fetch("/api/live/"+code,{cache:"no-store",headers:{"x-lupa-admin-token":adminToken}});if(!r.ok)throw new Error("Falha ao atualizar o painel.");const d=await r.json() as LiveSnapshot;if(active)setData(d);}
   catch{if(active)setNote("A atualização automática falhou; confira a conexão.");}
  };
  void load();const timer=setInterval(()=>void load(),3500);
  return()=>{active=false;clearInterval(timer);};
 },[code,adminToken]);
 const create=async()=>{
  setBusy(true);setError("");setNote("");
  try{
   const r=await fetch("/api/live",{method:"POST",headers:{"Content-Type":"application/json","x-lupa-admin-token":adminToken},body:JSON.stringify({claimId})});
   const data=await r.json() as {code?:string;error?:string};
   if(!r.ok)throw new Error(r.status===503?"Banco de eventos ainda não configurado neste ambiente.":r.status===401?"Chave do organizador inválida.":"Falha ao criar a sessão.");
   if(data.code){setCode(data.code);setNote("Sessão criada. Abra o link no telão ou compartilhe com os participantes.");}
  }catch(e){setError(e instanceof Error?e.message:"Falha ao criar evento.");}
  finally{setBusy(false);}
 };
 const advance=async()=>{
  if(!data||busy||!nextPhase[data.phase])return;
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/live/"+code,{method:"PATCH",headers:{"Content-Type":"application/json","x-lupa-admin-token":adminToken},body:JSON.stringify({phase:nextPhase[data.phase]})});
   if(!r.ok)throw new Error("Não foi possível avançar: confirme a chave e a fase atual.");
   const snapshot=await fetch("/api/live/"+code,{cache:"no-store"});if(snapshot.ok)setData(await snapshot.json() as LiveSnapshot);
  }catch(e){setError(e instanceof Error?e.message:"Falha ao mudar fase.");}
  finally{setBusy(false);}
 };
 const remove=async()=>{
  if(!code||busy||!window.confirm("Excluir permanentemente a sessão e todos os votos? Esta ação não pode ser desfeita."))return;
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/live/"+code,{method:"DELETE",headers:{"x-lupa-admin-token":adminToken}});
   if(!r.ok)throw new Error("Não foi possível excluir a sessão.");
   setCode("");setData(null);setNote("Sessão e votos excluídos.");
  }catch(e){setError(e instanceof Error?e.message:"Erro na exclusão.");}
  finally{setBusy(false);}
 };
 const link=code?"/live/"+code:"";
 const phaseTotals=(phase:"pre"|"post")=>{
  return Array.from({length:3},(_,i)=>data?.counts.filter(c=>c.phase===phase&&c.optionIndex===i).reduce((sum,c)=>sum+c.count,0)??0);
 };
 const prior=phaseTotals("pre"),after=phaseTotals("post");
 const max=Math.max(1,...prior,...after);
 return <div className="lx"><div className="lx-main"><header className="lx-head"><p className="lx-kicker">Painel do organizador · PC primeiro</p><h1>Sua plateia participa. A ciência permanece verificável.</h1><p className="lx-lead">Crie uma sessão e acompanhe somente votos agregados. Este painel utiliza chave temporária de administração; futura versão multi-institucional precisará de login e papéis individuais.</p></header>
  <div className="lx-cols">
   <section className="lx-panel"><h2>Configuração da sessão</h2>
    <label className="lx-field">Chave do organizador<input type="password" autoComplete="off" value={adminToken} onChange={e=>setAdminToken(e.target.value)} placeholder="Chave fornecida pela equipe"/></label>
    <label className="lx-field">Pergunta científica<select value={claimId} onChange={e=>setClaimId(e.target.value)}>{liveOptions.map(o=><option key={o.id} value={o.id}>{o.title}</option>)}</select></label>
    <button className="lx-button" disabled={busy||adminToken.length<32} onClick={create}>{busy?"Processando…":"Criar sessão"}</button>
    {error&&<p role="alert" className="lx-warning">{error}</p>}
    {note&&<p role="status" className="lx-science">{note}</p>}
    {code&&<div className="lx-science"><strong>Código: {code}</strong><p><Link href={link} target="_blank" rel="noopener noreferrer">Abrir página de participação →</Link></p><p>Link: {typeof window!=="undefined"?window.location.origin+link:link}</p><p className="lx-muted">Compartilhe o link ou gere um QR Code a partir dele na ferramenta do evento. Não há código QR integrado nesta versão.</p></div>}
   </section>
   <section className="lx-panel"><h2>Resultados agregados</h2>
    {!data?<p>Crie uma sessão para acompanhar os votos. Não são exibidas estatísticas artificiais.</p>:<>
     <p className="lx-kicker">Fase: {data.phase}</p><h3>{data.question}</h3>
     <p className="lx-muted">Respostas coletadas: primeira rodada {prior.reduce((a,b)=>a+b,0)} · segunda rodada {after.reduce((a,b)=>a+b,0)}.</p>
     <div className="lx-table-wrap"><table className="lx-table"><caption>Votos agregados sem identificadores individuais</caption><thead><tr><th>Alternativa</th><th>Antes</th><th>Depois</th></tr></thead><tbody>
     {data.choices.map((choice,i)=><tr key={choice}><th>{String.fromCharCode(65+i)}. {choice}</th><td>{prior[i]}</td><td>{after[i]}</td></tr>)}
     </tbody></table></div>
     {prior.map((v,i)=><div key={i}><p className="lx-muted">{String.fromCharCode(65+i)} · {v} votos na primeira rodada</p><div className="lx-bar"><span style={{width:(v/max*100)+"%"}}/></div></div>)}
     {data.phase!=="pre"&&<div className="lx-science"><strong>Interpretação de referência:</strong> a resposta B explicita a limitação científica. <Link href={"/?afirmacao="+data.claimId+"#lupa"}>Abrir explicação e fontes →</Link></div>}
     {nextPhase[data.phase]&&<p style={{marginTop:20}}><button className="lx-button" type="button" disabled={busy||adminToken.length<32} onClick={advance}>{phases[data.phase]}</button></p>}<p style={{marginTop:14}}><button type="button" className="lx-button lx-button--line" disabled={busy||adminToken.length<32} onClick={remove}>Excluir sessão e votos</button></p>
     <div className="lx-warning">Não alegar que a mudança de votos prova aprendizado. Repetir a mesma pergunta pode produzir familiaridade; faça validação separada se desejar medir impacto educacional.</div>
    </>}
   </section>
  </div>
 </div></div>;
}
